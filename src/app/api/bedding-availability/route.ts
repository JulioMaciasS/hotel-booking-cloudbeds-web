import { NextRequest, NextResponse } from "next/server";
import { validateStayDates } from "@/lib/booking-dates";
import { calculateBeddingAvailability } from "@/lib/cloudbeds-bedding-inventory";
import {
  CloudbedsConfigurationError,
  CloudbedsUpstreamError,
  getCloudbedsRooms,
} from "@/lib/cloudbeds-rooms";

export const dynamic = "force-dynamic";

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
      return NextResponse.json(
        { error: "cloudbeds_not_configured" },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    if (error instanceof CloudbedsUpstreamError) {
      console.error("Cloudbeds bedding availability failed.", {
        message: error.message,
      });

      return NextResponse.json(
        { error: "cloudbeds_unavailable" },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    throw error;
  }
}
