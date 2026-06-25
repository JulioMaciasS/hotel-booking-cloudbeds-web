import { NextResponse } from "next/server";
import { assignReservationBeddingWithRetry } from "@/lib/cloudbeds-room-assignment";
import {
  CloudbedsConfigurationError,
  CloudbedsUpstreamError,
} from "@/lib/cloudbeds-rooms";
import {
  getCloudbedsServerApiKey,
  getCloudbedsServerPropertyID,
  getCloudbedsWebhookSecret,
} from "@/lib/cloudbeds-server-env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CloudbedsReservationWebhookPayload = {
  endDate?: unknown;
  event?: unknown;
  propertyID?: unknown;
  propertyID_str?: unknown;
  propertyId?: unknown;
  propertyId_str?: unknown;
  reservationID?: unknown;
  reservationId?: unknown;
  startDate?: unknown;
};

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isAuthorized(request: Request) {
  const secret = getCloudbedsWebhookSecret();

  if (!secret) {
    return false;
  }

  const url = new URL(request.url);
  const provided =
    request.headers.get("x-hotel-webhook-secret") ??
    url.searchParams.get("secret");

  return provided === secret;
}

function getPropertyID(payload: CloudbedsReservationWebhookPayload) {
  return (
    stringValue(payload.propertyID) ??
    stringValue(payload.propertyID_str) ??
    stringValue(payload.propertyId) ??
    stringValue(payload.propertyId_str)
  );
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "cloudbeds/reservation-created",
    serverEnv: {
      apiKeyConfigured: Boolean(getCloudbedsServerApiKey()),
      propertyIDConfigured: Boolean(getCloudbedsServerPropertyID()),
      webhookSecretConfigured: Boolean(getCloudbedsWebhookSecret()),
    },
  });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error: "Unauthorized Cloudbeds webhook request.",
        webhookSecretConfigured: Boolean(getCloudbedsWebhookSecret()),
      },
      { status: 401 },
    );
  }

  let payload: CloudbedsReservationWebhookPayload;

  try {
    payload = (await request.json()) as CloudbedsReservationWebhookPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid Cloudbeds webhook JSON." },
      { status: 400 },
    );
  }

  if (payload.event !== "reservation/created") {
    return NextResponse.json({ ok: true, skipped: "unsupported_event" });
  }

  const propertyID = getPropertyID(payload);
  const expectedPropertyID = getCloudbedsServerPropertyID();

  if (
    expectedPropertyID &&
    propertyID &&
    String(propertyID) !== String(expectedPropertyID)
  ) {
    return NextResponse.json({ ok: true, skipped: "other_property" });
  }

  const reservationID =
    stringValue(payload.reservationID) ?? stringValue(payload.reservationId);
  const checkin = stringValue(payload.startDate);
  const checkout = stringValue(payload.endDate);

  if (!reservationID || !checkin || !checkout) {
    return NextResponse.json(
      {
        error:
          "Cloudbeds reservation/created webhook payload is missing reservationID, startDate or endDate.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await assignReservationBeddingWithRetry({
      checkin,
      checkout,
      reservationID,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    if (error instanceof CloudbedsConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    if (error instanceof CloudbedsUpstreamError) {
      console.error("Cloudbeds bedding room assignment upstream failure.", {
        error: error.message,
        reservationID,
      });

      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    console.error("Cloudbeds bedding room assignment failed.", {
      error,
      reservationID,
    });

    return NextResponse.json(
      { error: "Cloudbeds bedding room assignment failed." },
      { status: 500 },
    );
  }
}
