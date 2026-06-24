import { NextRequest, NextResponse } from "next/server";
import { validateStayDates } from "@/lib/booking-dates";
import {
  calculateBeddingAvailability,
  calculateStaticBeddingAvailability,
} from "@/lib/cloudbeds-bedding-inventory";
import {
  CloudbedsConfigurationError,
  CloudbedsUpstreamError,
  getCloudbedsRooms,
} from "@/lib/cloudbeds-rooms";

export const dynamic = "force-dynamic";

function fallbackResponse({
  checkin,
  checkout,
  reason,
}: {
  checkin: string;
  checkout: string;
  reason: "cloudbeds_not_configured" | "cloudbeds_unavailable";
}) {
  return NextResponse.json(
    {
      checkin,
      checkout,
      fallbackReason: reason,
      generatedAt: new Date().toISOString(),
      source: `static:fallback:${reason}`,
      ...calculateStaticBeddingAvailability(),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function GET(request: NextRequest) {
  const dates = validateStayDates(
    request.nextUrl.searchParams.get("checkin"),
    request.nextUrl.searchParams.get("checkout"),
  );

  if (!dates.ok) {
    return NextResponse.json(
      { error: "invalid_dates", message: dates.error },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const rooms = await getCloudbedsRooms(dates);
    const availability = calculateBeddingAvailability(rooms);

    return NextResponse.json(
      {
        checkin: dates.checkin,
        checkout: dates.checkout,
        generatedAt: new Date().toISOString(),
        source: "cloudbeds:getRooms",
        ...availability,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    if (error instanceof CloudbedsConfigurationError) {
      return fallbackResponse({
        checkin: dates.checkin,
        checkout: dates.checkout,
        reason: "cloudbeds_not_configured",
      });
    }

    if (error instanceof CloudbedsUpstreamError) {
      console.error("Cloudbeds bedding availability failed.", {
        message: error.message,
      });

      return fallbackResponse({
        checkin: dates.checkin,
        checkout: dates.checkout,
        reason: "cloudbeds_unavailable",
      });
    }

    throw error;
  }
}
