import type { CloudbedsRoom } from "@/lib/cloudbeds-bedding-inventory";

const CLOUDBEDS_GET_ROOMS_URL =
  "https://api.cloudbeds.com/api/v1.3/getRooms";
const PAGE_SIZE = 100;
const MAX_PAGES = 20;

type CloudbedsRoomsPage = {
  success?: unknown;
  data?: unknown;
  total?: unknown;
};

type CloudbedsPropertyRooms = {
  propertyID?: unknown;
  rooms?: unknown;
};

export class CloudbedsConfigurationError extends Error {}
export class CloudbedsUpstreamError extends Error {}

function isCloudbedsRoom(value: unknown): value is CloudbedsRoom {
  if (!value || typeof value !== "object") {
    return false;
  }

  const room = value as Record<string, unknown>;

  return (
    typeof room.roomID === "string" &&
    typeof room.roomTypeID === "string" &&
    (room.isVirtual === undefined || typeof room.isVirtual === "boolean") &&
    (room.roomBlocked === undefined || typeof room.roomBlocked === "boolean")
  );
}

function roomsForProperty(
  payload: CloudbedsRoomsPage,
  propertyID: string,
): CloudbedsRoom[] {
  if (payload.success !== true || !Array.isArray(payload.data)) {
    throw new CloudbedsUpstreamError("Cloudbeds returned an invalid response.");
  }

  const property = (payload.data as CloudbedsPropertyRooms[]).find(
    (entry) => String(entry.propertyID) === propertyID,
  );

  if (!property || !Array.isArray(property.rooms)) {
    return [];
  }

  return property.rooms.filter(isCloudbedsRoom);
}

function positiveInteger(value: unknown): number | null {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

export type GetCloudbedsRoomsOptions = {
  checkin: string;
  checkout: string;
  apiKey?: string;
  propertyID?: string;
  fetchImpl?: typeof fetch;
};

/** Fetches every dated page of unassigned physical rooms from Cloudbeds. */
export async function getCloudbedsRooms({
  checkin,
  checkout,
  apiKey = process.env.CLOUDBEDS_API_KEY,
  propertyID = process.env.CLOUDBEDS_PROPERTY_ID,
  fetchImpl = fetch,
}: GetCloudbedsRoomsOptions): Promise<CloudbedsRoom[]> {
  if (!apiKey || !propertyID) {
    throw new CloudbedsConfigurationError(
      "CLOUDBEDS_API_KEY and CLOUDBEDS_PROPERTY_ID must be configured.",
    );
  }

  const roomsByID = new Map<string, CloudbedsRoom>();

  for (let pageNumber = 1; pageNumber <= MAX_PAGES; pageNumber += 1) {
    const url = new URL(CLOUDBEDS_GET_ROOMS_URL);
    url.searchParams.set("propertyIDs", propertyID);
    url.searchParams.set("startDate", checkin);
    url.searchParams.set("endDate", checkout);
    url.searchParams.set("pageNumber", String(pageNumber));
    url.searchParams.set("pageSize", String(PAGE_SIZE));

    let response: Response;

    try {
      response = await fetchImpl(url, {
        cache: "no-store",
        headers: {
          accept: "application/json",
          "x-api-key": apiKey,
        },
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      throw new CloudbedsUpstreamError(
        `Cloudbeds getRooms request failed: ${(error as Error).message}`,
      );
    }

    if (!response.ok) {
      throw new CloudbedsUpstreamError(
        `Cloudbeds getRooms returned HTTP ${response.status}.`,
      );
    }

    let payload: CloudbedsRoomsPage;

    try {
      payload = (await response.json()) as CloudbedsRoomsPage;
    } catch {
      throw new CloudbedsUpstreamError(
        "Cloudbeds getRooms returned invalid JSON.",
      );
    }

    const pageRooms = roomsForProperty(payload, propertyID);

    for (const room of pageRooms) {
      roomsByID.set(room.roomID, room);
    }

    const total = positiveInteger(payload.total);

    if (
      pageRooms.length < PAGE_SIZE ||
      (total !== null && roomsByID.size >= total)
    ) {
      return Array.from(roomsByID.values());
    }
  }

  throw new CloudbedsUpstreamError(
    `Cloudbeds getRooms exceeded ${MAX_PAGES} pages.`,
  );
}
