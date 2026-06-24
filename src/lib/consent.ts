/**
 * Cookie-consent state for the analytics trackers (Google Analytics 4 + PostHog).
 *
 * Mirrors the VAT-preference pattern (see `vat.ts`): one localStorage key, a
 * custom event so any component reacts instantly, and the `storage` event for
 * cross-tab sync. Read it through `useSyncExternalStore` for SSR-safe rendering.
 *
 * Only one non-essential category exists on this site — analytics — so consent
 * is a single boolean. Strictly-necessary cookies (locale, the booking engine,
 * this very preference) are never gated. Nothing analytics-related loads until
 * `analytics` is explicitly `true`, satisfying the prior-consent rule under
 * Argentina's Ley 25.326 (and GDPR/ePrivacy for international visitors).
 */

export const CONSENT_STORAGE_KEY = "hotel:cookie-consent";
export const CONSENT_CHANGE_EVENT = "hotel:cookie-consent-change";
export const CONSENT_SETTINGS_EVENT = "hotel:cookie-settings-open";

/**
 * Bump when the cookie categories or providers change in a way that requires
 * re-asking. A stored record written under a different version is treated as
 * "no choice yet", so the banner reappears and consent is collected afresh.
 */
export const CONSENT_VERSION = 1;

export type ConsentState = {
  /** Consent for analytics cookies (GA4 + PostHog). */
  analytics: boolean;
  /** Schema version this record was written under. */
  version: number;
  /** Unix ms when the choice was made — a basic consent audit trail. */
  updatedAt: number;
};

export type ConsentChangeDetail = { analytics: boolean };

function parse(raw: string | null): ConsentState | null {
  if (!raw) {
    return null;
  }

  try {
    const value = JSON.parse(raw) as Partial<ConsentState>;

    if (
      typeof value.analytics === "boolean" &&
      value.version === CONSENT_VERSION
    ) {
      return {
        analytics: value.analytics,
        version: CONSENT_VERSION,
        updatedAt: typeof value.updatedAt === "number" ? value.updatedAt : 0,
      };
    }
  } catch {
    // Corrupt or legacy value — treat as no decision so we re-prompt.
  }

  return null;
}

/** The stored consent record, or `null` when the visitor hasn't chosen yet. */
export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return parse(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    // localStorage can be unavailable (private mode); treat as no decision.
    return null;
  }
}

/** Whether analytics may load right now — explicit opt-in only. */
export function analyticsConsentGranted(): boolean {
  return readConsent()?.analytics === true;
}

/** Persist the visitor's choice and notify listeners (this tab + others). */
export function writeConsent(analytics: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  const record: ConsentState = {
    analytics,
    version: CONSENT_VERSION,
    updatedAt: Date.now(),
  };

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Persistence may fail (private mode); still emit so the UI updates.
  }

  window.dispatchEvent(
    new CustomEvent<ConsentChangeDetail>(CONSENT_CHANGE_EVENT, {
      detail: { analytics },
    }),
  );
}

/** Subscribe to consent changes (custom event + cross-tab `storage`). */
export function subscribeConsent(onChange: () => void): () => void {
  window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Reopen the banner so a visitor can review or change a previous choice. */
export function openCookieSettings(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(CONSENT_SETTINGS_EVENT));
}

/** Subscribe to "reopen settings" requests (e.g. the footer link). */
export function subscribeCookieSettings(onOpen: () => void): () => void {
  window.addEventListener(CONSENT_SETTINGS_EVENT, onOpen);

  return () => window.removeEventListener(CONSENT_SETTINGS_EVENT, onOpen);
}
