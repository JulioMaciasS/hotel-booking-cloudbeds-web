import { publicConfig } from "@/lib/config";

export const VAT_RATE = publicConfig.vatRate;

export const VAT_PREFERENCE_STORAGE_KEY = "hotel-vat-from-argentina";
export const VAT_CHANGE_EVENT = "hotel-vat-change";

export type VatChangeDetail = { fromArgentina: boolean };

/**
 * Best-effort detection of whether the visitor is in Argentina, used only to
 * pick the toggle's default. Privacy-friendly: relies on the browser timezone
 * and locale, no IP lookup. Always overridable by the user.
 */
export function isArgentinaByLocale(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";

    if (/^America\/Argentina\//i.test(timeZone)) {
      return true;
    }
  } catch {
    // Intl can throw in very old/locked-down environments; fall through.
  }

  const languages =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];

  return languages.some((language) => /-AR\b/i.test(language ?? ""));
}

export function readVatPreference(): boolean | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(VAT_PREFERENCE_STORAGE_KEY);

    if (stored === "true") {
      return true;
    }

    if (stored === "false") {
      return false;
    }
  } catch {
    // localStorage can be unavailable (private mode); fall back to detection.
  }

  return null;
}

/**
 * Resolves the effective "from Argentina" state: the user's stored choice when
 * present, otherwise the locale-based default. Defaults to `false` on the
 * server so the IVA-exempt (foreign) view renders until hydration.
 */
export function getFromArgentina(): boolean {
  const stored = readVatPreference();

  if (stored !== null) {
    return stored;
  }

  return isArgentinaByLocale();
}

export function writeVatPreference(fromArgentina: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      VAT_PREFERENCE_STORAGE_KEY,
      String(fromArgentina),
    );
  } catch {
    // Ignore persistence failures; still emit the event below.
  }

  window.dispatchEvent(
    new CustomEvent<VatChangeDetail>(VAT_CHANGE_EVENT, {
      detail: { fromArgentina },
    }),
  );
}
