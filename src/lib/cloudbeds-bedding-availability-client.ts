import type { CloudbedsBeddingAvailability } from "@/lib/cloudbeds-bedding-selector";

type BeddingAvailabilityApiResponse = CloudbedsBeddingAvailability & {
  checkin: string;
  checkout: string;
  source: "cloudbeds:getRooms";
};

function isAvailabilityResponse(
  value: unknown,
): value is BeddingAvailabilityApiResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    response.source === "cloudbeds:getRooms" &&
    typeof response.mappingComplete === "boolean" &&
    !!response.roomTypes &&
    typeof response.roomTypes === "object"
  );
}

export async function fetchCloudbedsBeddingAvailability(
  signal?: AbortSignal,
  locationUrl: string = window.location.href,
): Promise<BeddingAvailabilityApiResponse | null> {
  const currentUrl = new URL(locationUrl);
  const checkin = currentUrl.searchParams.get("checkin");
  const checkout = currentUrl.searchParams.get("checkout");

  if (!checkin || !checkout) {
    return null;
  }

  const endpoint = new URL("/api/bedding-availability", currentUrl.origin);
  endpoint.searchParams.set("checkin", checkin);
  endpoint.searchParams.set("checkout", checkout);

  const response = await fetch(endpoint, {
    cache: "no-store",
    headers: { accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Bedding availability returned HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as unknown;

  if (!isAvailabilityResponse(payload)) {
    throw new Error("Bedding availability returned an invalid response.");
  }

  return payload;
}
