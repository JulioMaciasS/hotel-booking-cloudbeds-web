import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      baseCurrency: process.env.NEXT_PUBLIC_BASE_CURRENCY ?? "ARS",
      displayCurrency: process.env.NEXT_PUBLIC_DISPLAY_CURRENCY ?? "USD",
      arsPerUsd: 1400,
      active: true,
      source: "mocked-hotel-manual-rate",
      updatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
