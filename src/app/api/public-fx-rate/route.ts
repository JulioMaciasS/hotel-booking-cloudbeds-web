import { NextResponse } from "next/server";

/**
 * Upstream source of the live USD↔ARS rate (Supabase Edge Function). It returns
 * `{ status: "ok", usdArsRate: <number>, ... }`. Overridable via env.
 */
const FX_URL =
  process.env.FX_RATE_URL ??
  "https://bvdlrnvwjzizrjvimisa.supabase.co/functions/v1/latest-confirmed-fx-rate";

// Cache the resolved rate for 2 minutes, aligned with the upstream's max-age,
// so we make at most one upstream call every couple of minutes.
const TTL_SECONDS = 120;
export const revalidate = 120;

export async function GET() {
  const baseCurrency = process.env.NEXT_PUBLIC_BASE_CURRENCY ?? "ARS";
  const displayCurrency = process.env.NEXT_PUBLIC_DISPLAY_CURRENCY ?? "USD";

  try {
    const res = await fetch(FX_URL, { next: { revalidate: TTL_SECONDS } });

    if (res.ok) {
      const data = (await res.json()) as {
        status?: string;
        usdArsRate?: number;
        confirmedAt?: string;
        updatedAt?: string;
      };
      const arsPerUsd = Number(data.usdArsRate);

      if (data.status === "ok" && Number.isFinite(arsPerUsd) && arsPerUsd > 0) {
        return NextResponse.json(
          {
            baseCurrency,
            displayCurrency,
            arsPerUsd,
            active: true,
            source: "supabase-latest-confirmed-fx-rate",
            updatedAt:
              data.confirmedAt ?? data.updatedAt ?? new Date().toISOString(),
          },
          {
            headers: {
              "Cache-Control": `public, max-age=${TTL_SECONDS}, s-maxage=${TTL_SECONDS}`,
            },
          },
        );
      }
    }
  } catch {
    // Network/parse error — fall through to the inactive response below so the
    // client keeps prices in their original currency instead of using a stale
    // hard-coded rate.
  }

  return NextResponse.json(
    {
      baseCurrency,
      displayCurrency,
      arsPerUsd: 0,
      active: false,
      source: "supabase-latest-confirmed-fx-rate",
      updatedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
