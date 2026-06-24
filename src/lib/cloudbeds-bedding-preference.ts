import type { BeddingKey } from "@/lib/cloudbeds-bedding-inventory";

export type BeddingPreference = Record<
  string,
  Partial<Record<BeddingKey, number>>
>;

const BEDDING_KEYS = new Set<BeddingKey>([
  "matrimonial",
  "dos_camas_separadas",
  "matrimonial_cama_individual",
  "tres_camas_individuales",
]);

function isBeddingKey(value: string): value is BeddingKey {
  return BEDDING_KEYS.has(value as BeddingKey);
}

function normalizeCount(value: unknown) {
  const count = Number(value);

  return Number.isInteger(count) && count > 0 ? count : 0;
}

export function serializeBeddingPreference(
  preference: BeddingPreference,
): string {
  return Object.entries(preference)
    .map(([roomTypeID, counts]) => {
      const serializedCounts = Object.entries(counts)
        .map(([key, count]) => [key, normalizeCount(count)] as const)
        .filter(([key, count]) => isBeddingKey(key) && count > 0)
        .map(([key, count]) => `${key}:${count}`)
        .join(",");

      return serializedCounts ? `${roomTypeID}=${serializedCounts}` : "";
    })
    .filter(Boolean)
    .join("|");
}

export function parseBeddingPreference(value: string): BeddingPreference {
  const preference: BeddingPreference = {};
  const normalized = value.trim().replace(/^v1\|/, "");

  if (!normalized) {
    return preference;
  }

  for (const roomTypeEntry of normalized.split("|")) {
    const [roomTypeID, serializedCounts] = roomTypeEntry.split("=");

    if (!roomTypeID || !serializedCounts) {
      continue;
    }

    for (const countEntry of serializedCounts.split(",")) {
      const [key, countValue] = countEntry.split(":");

      if (!key || !isBeddingKey(key)) {
        continue;
      }

      const count = normalizeCount(countValue);

      if (count < 1) {
        continue;
      }

      preference[roomTypeID] ??= {};
      preference[roomTypeID][key] =
        (preference[roomTypeID][key] ?? 0) + count;
    }
  }

  return preference;
}

export function beddingPreferenceRoomCount(preference: BeddingPreference) {
  return Object.values(preference).reduce(
    (roomTypeTotal, counts) =>
      roomTypeTotal +
      Object.values(counts).reduce(
        (optionTotal, count) => optionTotal + normalizeCount(count),
        0,
      ),
    0,
  );
}
