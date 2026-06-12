import { NextResponse } from "next/server";
import {
  evaluateFxUpstream,
  fxConfigFromEnv,
  type FxEvaluation,
} from "@/lib/fx-rate";

/**
 * Upstream source of the live USD↔ARS rate (Supabase Edge Function). It returns
 * `{ status: "ok", usdArsRate: <number>, confirmedAt, ... }`. Overridable via env.
 */
const FX_URL =
  process.env.FX_RATE_URL ??
  "https://bvdlrnvwjzizrjvimisa.supabase.co/functions/v1/latest-confirmed-fx-rate";

// The upstream fetch is cached for 2 minutes (aligned with the upstream's own
// max-age) via the Next data cache, so at most one upstream call every couple
// of minutes. The handler itself runs per-request (force-dynamic) so an
// upstream failure is never pinned into a route-level cache.
const UPSTREAM_TTL_SECONDS = 120;
export const dynamic = "force-dynamic";

/**
 * Last accepted rate, kept per server instance. Served (flagged stale) when the
 * upstream fails or returns an invalid value, so a transient outage degrades to
 * "slightly old rate" instead of "no conversion for everyone for 2 minutes".
 * The hard age ceiling still applies. Clients keep their own last-known-good
 * copy in localStorage as a second layer.
 */
let lastGood: { arsPerUsd: number; asOf: string | null; savedAt: number } | null =
  null;

type FxApiBody = {
  baseCurrency: string;
  displayCurrency: string;
  arsPerUsd: number;
  active: boolean;
  stale: boolean;
  asOf: string | null;
  ageHours: number | null;
  source: string;
  updatedAt: string;
};

function buildBody(overrides: Partial<FxApiBody>): FxApiBody {
  return {
    baseCurrency: process.env.NEXT_PUBLIC_BASE_CURRENCY ?? "ARS",
    displayCurrency: process.env.NEXT_PUBLIC_DISPLAY_CURRENCY ?? "USD",
    arsPerUsd: 0,
    active: false,
    stale: false,
    asOf: null,
    ageHours: null,
    source: "supabase-latest-confirmed-fx-rate",
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function lastGoodFallback(now: Date): NextResponse | null {
  if (!lastGood) {
    return null;
  }

  const config = fxConfigFromEnv();
  const referenceMs = lastGood.asOf ? Date.parse(lastGood.asOf) : lastGood.savedAt;
  const ageHours = (now.getTime() - referenceMs) / 3_600_000;

  if (ageHours > config.inactiveAfterHours) {
    lastGood = null;
    return null;
  }

  return NextResponse.json(
    buildBody({
      arsPerUsd: lastGood.arsPerUsd,
      active: true,
      stale: true,
      asOf: lastGood.asOf,
      ageHours: Math.round(ageHours * 10) / 10,
      source: "last-known-good",
      updatedAt: lastGood.asOf ?? new Date(lastGood.savedAt).toISOString(),
    }),
    // Short cache: keep retrying upstream soon while serving the fallback.
    { headers: { "Cache-Control": "public, max-age=30, s-maxage=30" } },
  );
}

export async function GET() {
  const now = new Date();
  let evaluation: FxEvaluation | null = null;

  try {
    const res = await fetch(FX_URL, {
      next: { revalidate: UPSTREAM_TTL_SECONDS },
    });

    if (res.ok) {
      evaluation = evaluateFxUpstream(await res.json(), now, fxConfigFromEnv());
    }
  } catch {
    // Network/parse error — handled by the fallback chain below.
  }

  if (evaluation?.ok) {
    lastGood = {
      arsPerUsd: evaluation.arsPerUsd,
      asOf: evaluation.asOf,
      savedAt: now.getTime(),
    };

    return NextResponse.json(
      buildBody({
        arsPerUsd: evaluation.arsPerUsd,
        active: true,
        stale: evaluation.stale,
        asOf: evaluation.asOf,
        ageHours:
          evaluation.ageHours === null
            ? null
            : Math.round(evaluation.ageHours * 10) / 10,
        updatedAt: evaluation.asOf ?? now.toISOString(),
      }),
      {
        headers: {
          "Cache-Control": `public, max-age=${UPSTREAM_TTL_SECONDS}, s-maxage=${UPSTREAM_TTL_SECONDS}`,
        },
      },
    );
  }

  const fallback = lastGoodFallback(now);

  if (fallback) {
    return fallback;
  }

  // No usable rate at all. `active: false` tells the client to leave prices in
  // their original currency rather than convert with a guessed/hard-coded rate.
  return NextResponse.json(
    buildBody({
      source: evaluation ? `rejected:${evaluation.reason}` : "upstream-unavailable",
    }),
    { headers: { "Cache-Control": "no-store" } },
  );
}
