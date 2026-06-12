/**
 * Lightweight client-side diagnostics for the ARS→USD layer. Every event that
 * previously failed silently (no rate, fallback used, custom field missing,
 * VAT skipped…) funnels through here so problems become visible.
 *
 * Behaviour:
 *  - Always logs a structured console.warn (visible in dev tools).
 *  - When NEXT_PUBLIC_FX_DIAGNOSTICS="on", also beacons the event to
 *    /api/fx-diagnostics so it lands in the server logs.
 *  - Rate-limited per event type per page load so a MutationObserver loop can
 *    never flood the console or the endpoint.
 */

export type FxDiagnosticType =
  | "rate-unavailable"
  | "rate-stale"
  | "rate-fallback-used"
  | "price-parse-anomaly"
  | "vat-not-applied"
  | "custom-field-missing"
  | "summary-snapshot";

const MAX_REPORTS_PER_TYPE = 3;
const reportCounts = new Map<FxDiagnosticType, number>();

function beaconEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FX_DIAGNOSTICS === "on";
}

export function reportFxDiagnostic(
  type: FxDiagnosticType,
  detail: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") {
    return;
  }

  const count = reportCounts.get(type) ?? 0;

  if (count >= MAX_REPORTS_PER_TYPE) {
    return;
  }

  reportCounts.set(type, count + 1);

  const event = {
    type,
    detail,
    url: window.location.pathname,
    ts: new Date().toISOString(),
  };

  console.warn(`[fx-diagnostics] ${type}`, detail);

  if (!beaconEnabled()) {
    return;
  }

  try {
    const payload = JSON.stringify(event);

    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/fx-diagnostics", payload);
    } else {
      void fetch("/api/fx-diagnostics", {
        method: "POST",
        body: payload,
        keepalive: true,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch {
    // Diagnostics must never break the page.
  }
}

/** Test-only: reset the per-type rate limiter. */
export function resetFxDiagnosticsForTests(): void {
  reportCounts.clear();
}
