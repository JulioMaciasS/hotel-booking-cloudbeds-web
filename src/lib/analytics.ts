/**
 * Lightweight analytics layer that fans out to PostHog and/or Google Analytics.
 *
 * Each tracker is independent and gated by its own env var — run either, both,
 * or neither:
 *   - `NEXT_PUBLIC_POSTHOG_KEY` → PostHog (product analytics, session replay)
 *   - `NEXT_PUBLIC_GA_ID`       → Google Analytics 4 (acquisition / SEO / ads)
 *
 * PostHog loads via its CDN snippet and GA via gtag.js (see Analytics.tsx), so
 * there is no build dependency. Nothing loads or fires until a key/ID is set.
 *
 * PostHog host defaults to US Cloud; set `NEXT_PUBLIC_POSTHOG_HOST` to
 * `https://eu.i.posthog.com` for EU data residency or to a self-hosted URL.
 */
export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
export const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export const posthogEnabled = Boolean(POSTHOG_KEY);
export const gaEnabled = Boolean(GA_ID);
export const analyticsEnabled = posthogEnabled || gaEnabled;

type EventParams = Record<string, string | number | boolean | undefined>;

/** Minimal shape of the global PostHog instance created by the snippet. */
type PostHog = {
  init: (key: string, options: Record<string, unknown>) => void;
  capture: (event: string, params?: Record<string, unknown>) => void;
  __loaded?: boolean;
};

declare global {
  interface Window {
    posthog?: PostHog;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Record a custom event, fanning out to every enabled tracker. Safe to call
 * anywhere on the client — a no-op on the server or when a tracker is absent.
 *
 * The core funnel:
 *   book_click → book_intent → (Cloudbeds engine) → conversion
 * plus lead-intent signals: contact_click (whatsapp / phone / email).
 */
export function track(event: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  window.posthog?.capture(event, params);
  window.gtag?.("event", event, params);
}
