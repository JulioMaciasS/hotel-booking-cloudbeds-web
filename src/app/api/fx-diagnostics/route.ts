import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VALID_TYPES = new Set([
  "rate-unavailable",
  "rate-stale",
  "rate-fallback-used",
  "price-parse-anomaly",
  "vat-not-applied",
  "custom-field-missing",
  "summary-snapshot",
]);

const MAX_BODY_BYTES = 4096;

/**
 * Sink for the client-side FX diagnostics beacon. Writes one structured log
 * line per event so hosting log search/alerts can pick them up. Intentionally
 * fire-and-forget: always answers 204 so a misbehaving client can't probe it.
 */
export async function POST(request: Request) {
  try {
    const raw = await request.text();

    if (raw.length === 0 || raw.length > MAX_BODY_BYTES) {
      return new NextResponse(null, { status: 204 });
    }

    const event = JSON.parse(raw) as {
      type?: unknown;
      detail?: unknown;
      url?: unknown;
      ts?: unknown;
    };

    if (typeof event.type !== "string" || !VALID_TYPES.has(event.type)) {
      return new NextResponse(null, { status: 204 });
    }

    console.warn(
      JSON.stringify({
        tag: "fx-diagnostics",
        type: event.type,
        detail: event.detail ?? {},
        url: typeof event.url === "string" ? event.url.slice(0, 200) : "",
        clientTs: typeof event.ts === "string" ? event.ts : "",
        serverTs: new Date().toISOString(),
      }),
    );
  } catch {
    // Malformed body — ignore.
  }

  return new NextResponse(null, { status: 204 });
}
