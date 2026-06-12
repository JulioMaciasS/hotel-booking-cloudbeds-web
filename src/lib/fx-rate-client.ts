import { reportFxDiagnostic } from "@/lib/fx-diagnostics";

/**
 * Client-side resolution of the ARS→USD rate, layered for resilience:
 *
 *  1. `/api/public-fx-rate`, retried with a short backoff (covers blips).
 *  2. The last rate this browser successfully used, kept in localStorage and
 *     trusted for up to 72 h (covers longer API outages mid-session/return
 *     visits). The server keeps its own last-known-good too; this is the
 *     second layer.
 *
 * Returns null only when no usable rate exists anywhere — the caller then
 * leaves prices in the original currency (never converts with a guess).
 */

export type ResolvedFxRate = {
  arsPerUsd: number;
  stale: boolean;
  source: "api" | "client-last-known-good";
};

type FxApiResponse = {
  arsPerUsd?: unknown;
  active?: unknown;
  stale?: unknown;
  asOf?: unknown;
};

type StoredFxRate = {
  arsPerUsd: number;
  asOf: string | null;
  savedAt: number;
};

const STORAGE_KEY = "hotel-fx-last-known-rate";
const CLIENT_MAX_AGE_HOURS = 72;
const RETRY_DELAYS_MS = [1000, 3000];

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

export function readStoredFxRate(now: number = Date.now()): StoredFxRate | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<StoredFxRate>;

    if (
      typeof parsed.arsPerUsd !== "number" ||
      !Number.isFinite(parsed.arsPerUsd) ||
      parsed.arsPerUsd <= 0 ||
      typeof parsed.savedAt !== "number"
    ) {
      return null;
    }

    const ageHours = (now - parsed.savedAt) / 3_600_000;

    if (ageHours < 0 || ageHours > CLIENT_MAX_AGE_HOURS) {
      return null;
    }

    return {
      arsPerUsd: parsed.arsPerUsd,
      asOf: typeof parsed.asOf === "string" ? parsed.asOf : null,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

export function writeStoredFxRate(
  rate: { arsPerUsd: number; asOf: string | null },
  now: number = Date.now(),
): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...rate, savedAt: now } satisfies StoredFxRate),
    );
  } catch {
    // localStorage unavailable (private mode) — the API layer still covers us.
  }
}

async function fetchFxRateOnce(
  signal: AbortSignal | undefined,
): Promise<{ arsPerUsd: number; stale: boolean; asOf: string | null } | null> {
  const response = await fetch("/api/public-fx-rate", {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as FxApiResponse;
  const arsPerUsd = Number(body.arsPerUsd);

  if (body.active !== true || !Number.isFinite(arsPerUsd) || arsPerUsd <= 0) {
    return null;
  }

  return {
    arsPerUsd,
    stale: body.stale === true,
    asOf: typeof body.asOf === "string" ? body.asOf : null,
  };
}

export async function resolveFxRate(
  signal?: AbortSignal,
): Promise<ResolvedFxRate | null> {
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const rate = await fetchFxRateOnce(signal);

      if (rate) {
        writeStoredFxRate({ arsPerUsd: rate.arsPerUsd, asOf: rate.asOf });

        if (rate.stale) {
          reportFxDiagnostic("rate-stale", {
            arsPerUsd: rate.arsPerUsd,
            asOf: rate.asOf,
          });
        }

        return { arsPerUsd: rate.arsPerUsd, stale: rate.stale, source: "api" };
      }

      // The API answered but with no usable rate: no point hammering it.
      break;
    } catch (error) {
      if ((error as Error | undefined)?.name === "AbortError") {
        throw error;
      }

      if (attempt < RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt], signal);
      }
    }
  }

  const stored = readStoredFxRate();

  if (stored) {
    reportFxDiagnostic("rate-fallback-used", {
      arsPerUsd: stored.arsPerUsd,
      savedAt: new Date(stored.savedAt).toISOString(),
    });

    return {
      arsPerUsd: stored.arsPerUsd,
      stale: true,
      source: "client-last-known-good",
    };
  }

  reportFxDiagnostic("rate-unavailable", {});

  return null;
}
