import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

type JsonRecord = Record<string, unknown>;

type BeddingKey =
  | "matrimonial"
  | "dos_camas_separadas"
  | "matrimonial_cama_individual"
  | "tres_camas_individuales";

type BeddingPreference = Record<string, Partial<Record<BeddingKey, number>>>;

type CloudbedsRoom = {
  roomID: string;
  roomTypeID: string;
  isVirtual?: boolean;
  roomBlocked?: boolean;
};

type ReservationRoomForAssignment = {
  subReservationID: string;
  roomTypeID: string;
  oldRoomID?: string;
  reservationRoomID?: string;
};

type PlannedRoomAssignment = {
  bedding: BeddingKey;
  newRoomID: string;
  oldRoomID?: string;
  roomTypeID: string;
  status: "already_compatible" | "planned";
  subReservationID: string;
};

type RoomAssignmentIssue = {
  bedding?: BeddingKey;
  count?: number;
  reason:
    | "missing_bedding_preference"
    | "missing_reservation_room"
    | "missing_compatible_room"
    | "unknown_room_type";
  roomTypeID?: string;
};

type AssignmentResult = {
  assigned: Array<PlannedRoomAssignment & { response?: unknown }>;
  dryRun: boolean;
  issues: RoomAssignmentIssue[];
  planned: PlannedRoomAssignment[];
  preference: BeddingPreference;
  reservationID: string;
  reservationRooms: ReservationRoomForAssignment[];
  availableRooms: CloudbedsRoom[];
  skipped: boolean;
};

type Settings = {
  apiBaseUrl: string;
  apiKey?: string;
  dryRun: boolean;
  propertyID?: string;
  retryAttempts: number;
  retryDelayMs: number;
  webhookSecret?: string;
};

type AssignmentClaim = {
  completedAt?: string;
  event?: string | null;
  reason?: string;
  reservationID: string;
  runID: string;
  status: "processing" | "complete" | "retryable" | "failed";
  updatedAt: string;
};

type AssignmentClaimResult =
  | {
      acquired: true;
      key: string;
      runID: string;
    }
  | {
      acquired: false;
      key: string;
      reason: "already_complete" | "already_processing" | "claim_race";
      state?: AssignmentClaim;
    };

const DEFAULT_API_BASE_URL = "https://api.cloudbeds.com/api/v1.3";
const PAGE_SIZE = 100;
const MAX_PAGES = 20;
const REQUEST_TIMEOUT_MS = 12_000;
const PROCESSING_CLAIM_TTL_MS = 60_000;
const DEFAULT_RETRY_ATTEMPTS = 8;
const DEFAULT_RETRY_DELAY_MS = 2_500;

const DOUBLE_STANDARD = "227179928547456";
const TRIPLE_STANDARD_TWIN = "229741180768384";
const DOUBLE_SUPERIOR = "229741541683392";
const TRIPLE_SUPERIOR = "229741711368385";
const TRIPLE_STANDARD_MATRIMONIAL = "239441314484352";

const ROOM_BEDDING_CAPABILITIES: Readonly<
  Record<string, { roomTypeID: string; bedding: readonly BeddingKey[] }>
> = {
  [`${DOUBLE_STANDARD}-0`]: {
    roomTypeID: DOUBLE_STANDARD,
    bedding: ["matrimonial", "dos_camas_separadas"],
  },
  [`${DOUBLE_STANDARD}-1`]: {
    roomTypeID: DOUBLE_STANDARD,
    bedding: ["matrimonial", "dos_camas_separadas"],
  },
  [`${DOUBLE_STANDARD}-2`]: {
    roomTypeID: DOUBLE_STANDARD,
    bedding: ["dos_camas_separadas"],
  },
  [`${DOUBLE_STANDARD}-3`]: {
    roomTypeID: DOUBLE_STANDARD,
    bedding: ["dos_camas_separadas"],
  },
  [`${TRIPLE_STANDARD_TWIN}-0`]: {
    roomTypeID: TRIPLE_STANDARD_TWIN,
    bedding: ["tres_camas_individuales"],
  },
  [`${TRIPLE_STANDARD_TWIN}-1`]: {
    roomTypeID: TRIPLE_STANDARD_TWIN,
    bedding: ["tres_camas_individuales"],
  },
  [`${DOUBLE_SUPERIOR}-0`]: {
    roomTypeID: DOUBLE_SUPERIOR,
    bedding: ["matrimonial"],
  },
  [`${DOUBLE_SUPERIOR}-1`]: {
    roomTypeID: DOUBLE_SUPERIOR,
    bedding: ["matrimonial", "dos_camas_separadas"],
  },
  [`${DOUBLE_SUPERIOR}-2`]: {
    roomTypeID: DOUBLE_SUPERIOR,
    bedding: ["matrimonial", "dos_camas_separadas"],
  },
  [`${DOUBLE_SUPERIOR}-3`]: {
    roomTypeID: DOUBLE_SUPERIOR,
    bedding: ["matrimonial", "dos_camas_separadas"],
  },
  [`${DOUBLE_SUPERIOR}-4`]: {
    roomTypeID: DOUBLE_SUPERIOR,
    bedding: ["matrimonial"],
  },
  [`${TRIPLE_SUPERIOR}-0`]: {
    roomTypeID: TRIPLE_SUPERIOR,
    bedding: ["matrimonial_cama_individual", "tres_camas_individuales"],
  },
  [`${TRIPLE_STANDARD_MATRIMONIAL}-0`]: {
    roomTypeID: TRIPLE_STANDARD_MATRIMONIAL,
    bedding: ["matrimonial_cama_individual"],
  },
  [`${TRIPLE_STANDARD_MATRIMONIAL}-1`]: {
    roomTypeID: TRIPLE_STANDARD_MATRIMONIAL,
    bedding: ["matrimonial_cama_individual"],
  },
};

const BEDDING_KEYS = new Set<BeddingKey>([
  "matrimonial",
  "dos_camas_separadas",
  "matrimonial_cama_individual",
  "tres_camas_individuales",
]);

const BEDDING_CUSTOM_FIELD_ALIASES = [
  "cf_bedding_preference",
  "cf_cf_bedding_preferenc",
  "cf_bedding_preferenc",
  "bedding_preference",
];

const RETRYABLE_ISSUE_REASONS = new Set<RoomAssignmentIssue["reason"]>([
  "missing_bedding_preference",
  "missing_reservation_room",
]);

const corsHeaders = {
  "access-control-allow-headers":
    "authorization, content-type, x-client-info, x-hotel-webhook-secret, x-webhook-secret",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-origin": "*",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: {
      ...corsHeaders,
      "content-type": "application/json",
    },
    status,
  });
}

function serviceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !key) {
    throw new Error("Supabase service credentials are not configured.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeCount(value: unknown) {
  const count = Number(value);

  return Number.isInteger(count) && count > 0 ? count : 0;
}

function positiveInteger(value: unknown, fallback: number) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function booleanSetting(value: unknown, fallback: boolean) {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;

  return fallback;
}

function findFirstString(payload: unknown, keys: string[]) {
  const stack = [payload];
  const seen = new Set<unknown>();

  while (stack.length > 0) {
    const current = stack.pop();

    if (!current || seen.has(current)) {
      continue;
    }

    seen.add(current);

    if (Array.isArray(current)) {
      stack.push(...current);
      continue;
    }

    const record = asRecord(current);

    if (!record) {
      continue;
    }

    for (const key of keys) {
      const found = stringValue(record[key]);

      if (found) {
        return found;
      }
    }

    stack.push(...Object.values(record));
  }

  return null;
}

function pickString(record: JsonRecord, keys: string[]) {
  for (const key of keys) {
    const value = stringValue(record[key]);

    if (value) {
      return value;
    }
  }

  return null;
}

function customFieldLookupNames(fieldName: string) {
  const trimmed = fieldName.trim();
  const names = new Set<string>();
  let current = trimmed;

  while (current) {
    names.add(current.toLowerCase());

    if (!/^cf_/i.test(current)) {
      break;
    }

    current = current.replace(/^cf_/i, "");
  }

  return names;
}

function customFieldNameMatches(candidate: unknown, fieldName: string) {
  const value = stringValue(candidate);

  if (!value) {
    return false;
  }

  const lookupNames = customFieldLookupNames(fieldName);

  return [...customFieldLookupNames(value)].some((candidateName) =>
    lookupNames.has(candidateName)
  );
}

function extractCustomFieldValue(payload: unknown, fieldName: string) {
  const stack = [payload];
  const seen = new Set<unknown>();
  const lookupNames = customFieldLookupNames(fieldName);

  while (stack.length > 0) {
    const current = stack.pop();

    if (!current || seen.has(current)) {
      continue;
    }

    seen.add(current);

    if (Array.isArray(current)) {
      stack.push(...current);
      continue;
    }

    const record = asRecord(current);

    if (!record) {
      continue;
    }

    const direct = [...lookupNames]
      .map((lookupName) => stringValue(record[lookupName]))
      .find(Boolean);

    if (direct) {
      return direct;
    }

    const fieldIdentifiers = [
      "internalName",
      "fieldName",
      "name",
      "key",
      "code",
      "customFieldName",
      "shortcode",
      "shortCode",
    ]
      .map((key) => stringValue(record[key]))
      .filter(Boolean);

    if (
      fieldIdentifiers.some((identifier) =>
        customFieldNameMatches(identifier, fieldName)
      )
    ) {
      const value = pickString(record, [
        "value",
        "fieldValue",
        "text",
        "customFieldValue",
        "answer",
      ]);

      if (value) {
        return value;
      }
    }

    stack.push(...Object.values(record));
  }

  return null;
}

function findChangedCustomFields(payload: unknown) {
  const fields: Array<{
    identifiers: string[];
    value: string;
    valueProvided: boolean;
  }> = [];
  const stack = [payload];
  const seen = new Set<unknown>();

  while (stack.length > 0) {
    const current = stack.pop();

    if (!current || seen.has(current)) {
      continue;
    }

    seen.add(current);

    if (Array.isArray(current)) {
      stack.push(...current);
      continue;
    }

    const record = asRecord(current);

    if (!record) {
      continue;
    }

    for (const [key, value] of Object.entries(record)) {
      const normalizedKey = key.replace(/[^a-z]/gi, "").toLowerCase();

      if (
        !["createdcustomfields", "updatedcustomfields"].includes(
          normalizedKey,
        ) ||
        !Array.isArray(value)
      ) {
        continue;
      }

      for (const entry of value) {
        const field = asRecord(entry);

        if (!field) {
          continue;
        }

        const identifiers = [
          "id",
          "customFieldID",
          "customFieldId",
          "internalName",
          "name",
          "fieldName",
          "customFieldName",
          "shortcode",
          "shortCode",
          "key",
          "code",
        ]
          .map((fieldKey) => field[fieldKey])
          .filter((identifier) => identifier !== undefined && identifier !== null)
          .map(String);
        const rawValue =
          field.value ??
          field.newValue ??
          field.new_value ??
          field.fieldValue ??
          field.field_value ??
          field.customFieldValue ??
          field.custom_field_value;

        fields.push({
          identifiers,
          value: rawValue === undefined || rawValue === null
            ? ""
            : String(rawValue),
          valueProvided: rawValue !== undefined,
        });
      }
    }

    stack.push(...Object.values(record));
  }

  return fields;
}

function fieldMatchesAnyBeddingAlias(field: { identifiers: string[] }) {
  return BEDDING_CUSTOM_FIELD_ALIASES.some((alias) =>
    field.identifiers.some((identifier) =>
      customFieldNameMatches(identifier, alias)
    )
  );
}

function extractChangedBeddingPreference(payload: unknown) {
  const changedField = findChangedCustomFields(payload).find((field) =>
    field.valueProvided && fieldMatchesAnyBeddingAlias(field)
  );

  if (changedField?.value) {
    return changedField.value;
  }

  return BEDDING_CUSTOM_FIELD_ALIASES
    .map((fieldName) => extractCustomFieldValue(payload, fieldName))
    .find(Boolean) ?? null;
}

function isBeddingKey(value: string): value is BeddingKey {
  return BEDDING_KEYS.has(value as BeddingKey);
}

function parseBeddingPreference(value: string): BeddingPreference {
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

function beddingPreferenceRoomCount(preference: BeddingPreference) {
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

function getRoomBeddingCapability(roomID: string) {
  return ROOM_BEDDING_CAPABILITIES[roomID] ?? null;
}

function isCloudbedsRoom(value: unknown): value is CloudbedsRoom {
  const record = asRecord(value);

  return Boolean(
    record &&
      typeof record.roomID === "string" &&
      typeof record.roomTypeID === "string" &&
      (record.isVirtual === undefined ||
        typeof record.isVirtual === "boolean") &&
      (record.roomBlocked === undefined ||
        typeof record.roomBlocked === "boolean"),
  );
}

function roomsForProperty(payload: unknown, propertyID: string) {
  const record = asRecord(payload);

  if (!record || record.success !== true || !Array.isArray(record.data)) {
    throw new Error("Cloudbeds getRooms returned an invalid response.");
  }

  const property = (record.data as unknown[])
    .map(asRecord)
    .find((entry) => String(entry?.propertyID) === propertyID);

  if (!property || !Array.isArray(property.rooms)) {
    return [];
  }

  return property.rooms.filter(isCloudbedsRoom);
}

function findReservationInPayload(payload: unknown, reservationID: string) {
  const stack = [payload];
  const seen = new Set<unknown>();

  while (stack.length > 0) {
    const current = stack.pop();

    if (!current || seen.has(current)) {
      continue;
    }

    seen.add(current);

    if (Array.isArray(current)) {
      stack.push(...current);
      continue;
    }

    const record = asRecord(current);

    if (!record) {
      continue;
    }

    if (
      stringValue(record.reservationID) === reservationID ||
      stringValue(record.reservationId) === reservationID ||
      stringValue(record.reservation_id) === reservationID
    ) {
      return record;
    }

    stack.push(...Object.values(record));
  }

  return null;
}

function extractReservationRooms(
  payloads: unknown[],
  reservationID: string,
): ReservationRoomForAssignment[] {
  const rooms: ReservationRoomForAssignment[] = [];
  const seen = new Set<string>();

  for (const payload of payloads) {
    const stack = [payload];
    const visited = new Set<unknown>();

    while (stack.length > 0) {
      const current = stack.pop();

      if (!current || visited.has(current)) {
        continue;
      }

      visited.add(current);

      if (Array.isArray(current)) {
        stack.push(...current);
        continue;
      }

      const record = asRecord(current);

      if (!record) {
        continue;
      }

      const roomTypeID = pickString(record, [
        "roomTypeID",
        "roomTypeId",
        "room_type_id",
      ]);
      const explicitSubReservationID = pickString(record, [
        "subReservationID",
        "subReservationId",
        "sub_reservation_id",
      ]);
      const oldRoomID =
        pickString(record, [
          "roomID",
          "roomId",
          "room_id",
          "assignedRoomID",
          "assignedRoomId",
        ]) ?? undefined;
      const reservationRoomID =
        pickString(record, [
          "reservationRoomID",
          "reservationRoomId",
          "reservation_room_id",
        ]) ?? undefined;
      const linkedReservationID = pickString(record, [
        "reservationID",
        "reservationId",
        "reservation_id",
      ]);
      const explicitSubReservationBelongsToReservation =
        explicitSubReservationID === reservationID ||
        explicitSubReservationID?.startsWith(`${reservationID}-`);
      const subReservationID =
        explicitSubReservationID ??
          (linkedReservationID === reservationID ? reservationID : null);

      if (
        roomTypeID &&
        subReservationID &&
        (linkedReservationID === reservationID ||
          explicitSubReservationBelongsToReservation)
      ) {
        const key = `${subReservationID}:${roomTypeID}:${oldRoomID ?? ""}`;

        if (!seen.has(key)) {
          seen.add(key);
          rooms.push({
            oldRoomID,
            reservationRoomID,
            roomTypeID,
            subReservationID,
          });
        }
      }

      stack.push(...Object.values(record));
    }
  }

  return rooms;
}

function compatibleRoomIDs(
  rooms: readonly CloudbedsRoom[],
  roomTypeID: string,
  bedding: BeddingKey,
  usedRoomIDs: Set<string>,
) {
  return rooms
    .filter((room) => {
      const capability = getRoomBeddingCapability(room.roomID);

      return (
        room.roomTypeID === roomTypeID &&
        room.roomBlocked !== true &&
        room.isVirtual !== true &&
        !usedRoomIDs.has(room.roomID) &&
        capability?.roomTypeID === roomTypeID &&
        capability.bedding.includes(bedding)
      );
    })
    .sort((left, right) => {
      const leftCapability = getRoomBeddingCapability(left.roomID);
      const rightCapability = getRoomBeddingCapability(right.roomID);

      return (
        (leftCapability?.bedding.length ?? 0) -
          (rightCapability?.bedding.length ?? 0) ||
        left.roomID.localeCompare(right.roomID)
      );
    });
}

function currentRoomSupportsBedding(
  room: ReservationRoomForAssignment,
  bedding: BeddingKey,
) {
  if (!room.oldRoomID) {
    return false;
  }

  const capability = getRoomBeddingCapability(room.oldRoomID);

  return (
    capability?.roomTypeID === room.roomTypeID &&
    capability.bedding.includes(bedding)
  );
}

function countCompatibleCandidates(
  rooms: readonly CloudbedsRoom[],
  roomTypeID: string,
  bedding: BeddingKey,
) {
  return rooms.filter((room) => {
    const capability = getRoomBeddingCapability(room.roomID);

    return (
      room.roomTypeID === roomTypeID &&
      room.roomBlocked !== true &&
      room.isVirtual !== true &&
      capability?.roomTypeID === roomTypeID &&
      capability.bedding.includes(bedding)
    );
  }).length;
}

function planBeddingRoomAssignments({
  availableRooms,
  preference,
  reservationRooms,
}: {
  availableRooms: readonly CloudbedsRoom[];
  preference: BeddingPreference;
  reservationRooms: readonly ReservationRoomForAssignment[];
}) {
  const planned: PlannedRoomAssignment[] = [];
  const issues: RoomAssignmentIssue[] = [];
  const usedRoomIDs = new Set<string>();
  const usedSubReservations = new Set<string>();

  for (const [roomTypeID, counts] of Object.entries(preference)) {
    const roomTypeReservationRooms = reservationRooms
      .filter((room) => room.roomTypeID === roomTypeID)
      .sort((left, right) =>
        left.subReservationID.localeCompare(right.subReservationID)
      );
    const requests = Object.entries(counts)
      .flatMap(([bedding, count]) =>
        Array.from({ length: count ?? 0 }, () => bedding as BeddingKey)
      )
      .sort(
        (left, right) =>
          (counts[left] ?? 0) - (counts[right] ?? 0) ||
          countCompatibleCandidates(availableRooms, roomTypeID, left) -
            countCompatibleCandidates(availableRooms, roomTypeID, right) ||
          left.localeCompare(right),
      );

    if (requests.length === 0) {
      issues.push({ reason: "unknown_room_type", roomTypeID });
      continue;
    }

    for (const bedding of requests) {
      const alreadyCompatible = roomTypeReservationRooms.find(
        (room) =>
          !usedSubReservations.has(room.subReservationID) &&
          currentRoomSupportsBedding(room, bedding),
      );

      if (alreadyCompatible?.oldRoomID) {
        usedSubReservations.add(alreadyCompatible.subReservationID);
        usedRoomIDs.add(alreadyCompatible.oldRoomID);
        planned.push({
          bedding,
          newRoomID: alreadyCompatible.oldRoomID,
          oldRoomID: alreadyCompatible.oldRoomID,
          roomTypeID,
          status: "already_compatible",
          subReservationID: alreadyCompatible.subReservationID,
        });
        continue;
      }

      const targetReservationRoom = roomTypeReservationRooms.find(
        (room) => !usedSubReservations.has(room.subReservationID),
      );

      if (!targetReservationRoom) {
        issues.push({
          bedding,
          reason: "missing_reservation_room",
          roomTypeID,
        });
        continue;
      }

      const room = compatibleRoomIDs(
        availableRooms,
        roomTypeID,
        bedding,
        usedRoomIDs,
      )[0];

      if (!room) {
        issues.push({
          bedding,
          reason: "missing_compatible_room",
          roomTypeID,
        });
        continue;
      }

      usedSubReservations.add(targetReservationRoom.subReservationID);
      usedRoomIDs.add(room.roomID);
      planned.push({
        bedding,
        newRoomID: room.roomID,
        oldRoomID: targetReservationRoom.oldRoomID,
        roomTypeID,
        status: "planned",
        subReservationID: targetReservationRoom.subReservationID,
      });
    }
  }

  return { issues, planned };
}

async function loadSettings(supabase: ReturnType<typeof createClient>) {
  const { data } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", [
      "cloudbeds_api_base_url",
      "cloudbeds_assignment_dry_run",
      "cloudbeds_assignment_retry_attempts",
      "cloudbeds_assignment_retry_delay_ms",
      "cloudbeds_property_id",
      "secret_cloudbeds_api_key",
      "secret_reservation_webhook",
    ]);

  const settings = new Map(
    (data ?? []).map((row: { key: string; value: unknown }) => [
      row.key,
      row.value,
    ]),
  );
  const stringSetting = (key: string, fallback = "") => {
    const value = settings.get(key);
    const str =
      value === undefined || value === null ? "" : String(value).trim();

    return str || fallback;
  };

  return {
    apiBaseUrl:
      Deno.env.get("CLOUDBEDS_API_BASE_URL") ||
      stringSetting("cloudbeds_api_base_url", DEFAULT_API_BASE_URL),
    apiKey:
      Deno.env.get("CLOUDBEDS_API_KEY2") ||
      Deno.env.get("CLOUDBEDS_API_KEY") ||
      Deno.env.get("CLOUDBEDS_API_TOKEN") ||
      stringSetting("secret_cloudbeds_api_key") ||
      undefined,
    dryRun: booleanSetting(
      Deno.env.get("CLOUDBEDS_ASSIGNMENT_DRY_RUN") ??
        settings.get("cloudbeds_assignment_dry_run"),
      false,
    ),
    propertyID:
      Deno.env.get("CLOUDBEDS_PROPERTY_ID") ||
      stringSetting("cloudbeds_property_id") ||
      undefined,
    retryAttempts: positiveInteger(
      Deno.env.get("CLOUDBEDS_ASSIGNMENT_RETRY_ATTEMPTS") ??
        settings.get("cloudbeds_assignment_retry_attempts"),
      DEFAULT_RETRY_ATTEMPTS,
    ),
    retryDelayMs: positiveInteger(
      Deno.env.get("CLOUDBEDS_ASSIGNMENT_RETRY_DELAY_MS") ??
        settings.get("cloudbeds_assignment_retry_delay_ms"),
      DEFAULT_RETRY_DELAY_MS,
    ),
    webhookSecret:
      Deno.env.get("CLOUDBEDS_WEBHOOK_SECRET") ||
      stringSetting("secret_reservation_webhook") ||
      undefined,
  } satisfies Settings;
}

function getWebhookSecretFromRequest(req: Request) {
  const url = new URL(req.url);

  return (
    req.headers.get("x-webhook-secret") ||
    req.headers.get("x-hotel-webhook-secret") ||
    url.searchParams.get("s") ||
    url.searchParams.get("secret") ||
    ""
  );
}

function requireCloudbedsConfig(settings: Settings) {
  if (!settings.apiKey || !settings.propertyID) {
    throw new Error(
      "Cloudbeds API key or property ID is not configured in Supabase app_settings.",
    );
  }
}

function endpoint(settings: Settings, path: string) {
  return `${settings.apiBaseUrl.replace(/\/$/, "")}/${path}`;
}

async function cloudbedsGetJson(
  settings: Settings,
  path: string,
  params: Record<string, string>,
) {
  requireCloudbedsConfig(settings);

  const url = new URL(endpoint(settings, path));

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      accept: "application/json",
      "x-api-key": settings.apiKey!,
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Cloudbeds ${path} returned HTTP ${response.status}: ${text.slice(0, 500)}`,
    );
  }

  const payload = await response.json();
  const record = asRecord(payload);

  if (record?.success === false) {
    throw new Error(
      `Cloudbeds ${path} returned success=false: ${JSON.stringify(payload).slice(0, 500)}`,
    );
  }

  return payload;
}

async function getReservationPayload(
  settings: Settings,
  reservationID: string,
) {
  return cloudbedsGetJson(settings, "getReservation", {
    propertyID: settings.propertyID!,
    reservationID,
  });
}

async function findReservationListPayload(
  settings: Settings,
  {
    checkin,
    checkout,
    reservationID,
  }: { checkin: string; checkout: string; reservationID: string },
) {
  const payload = await cloudbedsGetJson(settings, "getReservations", {
    checkInFrom: checkin,
    checkInTo: checkin,
    checkOutFrom: checkout,
    checkOutTo: checkout,
    includeAllRooms: "true",
    includeCustomFields: "true",
    pageNumber: "1",
    pageSize: "100",
    propertyID: settings.propertyID!,
  });

  return findReservationInPayload(payload, reservationID);
}

async function resolveStayDates(
  settings: Settings,
  {
    checkin,
    checkout,
    reservationID,
  }: {
    checkin?: string | null;
    checkout?: string | null;
    reservationID: string;
  },
) {
  if (checkin && checkout) {
    return { checkin, checkout };
  }

  const reservationPayload = await getReservationPayload(settings, reservationID);
  const resolvedCheckin =
    checkin ||
    findFirstString(reservationPayload, [
      "startDate",
      "checkin",
      "checkIn",
      "check_in",
      "dateStart",
      "arrivalDate",
    ]);
  const resolvedCheckout =
    checkout ||
    findFirstString(reservationPayload, [
      "endDate",
      "checkout",
      "checkOut",
      "check_out",
      "dateEnd",
      "departureDate",
    ]);

  return {
    checkin: resolvedCheckin,
    checkout: resolvedCheckout,
  };
}

async function getCloudbedsRooms(
  settings: Settings,
  { checkin, checkout }: { checkin: string; checkout: string },
) {
  requireCloudbedsConfig(settings);

  const roomsByID = new Map<string, CloudbedsRoom>();

  for (let pageNumber = 1; pageNumber <= MAX_PAGES; pageNumber += 1) {
    const payload = await cloudbedsGetJson(settings, "getRooms", {
      endDate: checkout,
      pageNumber: String(pageNumber),
      pageSize: String(PAGE_SIZE),
      propertyIDs: settings.propertyID!,
      startDate: checkin,
    });
    const pageRooms = roomsForProperty(payload, settings.propertyID!);

    for (const room of pageRooms) {
      roomsByID.set(room.roomID, room);
    }

    const total = normalizeCount(asRecord(payload)?.total);

    if (
      pageRooms.length < PAGE_SIZE ||
      (total > 0 && roomsByID.size >= total)
    ) {
      return Array.from(roomsByID.values());
    }
  }

  throw new Error(`Cloudbeds getRooms exceeded ${MAX_PAGES} pages.`);
}

async function postRoomAssign({
  assignment,
  reservationID,
  settings,
}: {
  assignment: PlannedRoomAssignment;
  reservationID: string;
  settings: Settings;
}) {
  requireCloudbedsConfig(settings);

  const body = new URLSearchParams();
  body.set("adjustPrice", "false");
  body.set("newRoomID", assignment.newRoomID);
  body.set("propertyID", settings.propertyID!);
  body.set("reservationID", reservationID);
  body.set("roomTypeID", assignment.roomTypeID);
  body.set("subReservationID", assignment.subReservationID);

  if (assignment.oldRoomID) {
    body.set("oldRoomID", assignment.oldRoomID);
  }

  const response = await fetch(endpoint(settings, "postRoomAssign"), {
    body,
    cache: "no-store",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
      "x-api-key": settings.apiKey!,
    },
    method: "POST",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Cloudbeds postRoomAssign returned HTTP ${response.status}: ${text.slice(0, 500)}`,
    );
  }

  const payload = await response.json();
  const record = asRecord(payload);

  if (record?.success === false) {
    throw new Error(
      `Cloudbeds postRoomAssign returned success=false: ${JSON.stringify(payload).slice(0, 500)}`,
    );
  }

  return payload;
}

async function assignReservationBedding({
  beddingPreference,
  checkin,
  checkout,
  dryRun,
  reservationID,
  settings,
}: {
  beddingPreference?: string;
  checkin: string;
  checkout: string;
  dryRun: boolean;
  reservationID: string;
  settings: Settings;
}): Promise<AssignmentResult> {
  const reservationPayload = await getReservationPayload(
    settings,
    reservationID,
  );
  const reservationListPayload = await findReservationListPayload(settings, {
    checkin,
    checkout,
    reservationID,
  });
  const storedPreference =
    beddingPreference ||
    BEDDING_CUSTOM_FIELD_ALIASES.map(
      (fieldName) =>
        extractCustomFieldValue(reservationListPayload, fieldName) ||
        extractCustomFieldValue(reservationPayload, fieldName),
    ).find(Boolean) ||
    "";
  const preference = parseBeddingPreference(storedPreference);

  if (beddingPreferenceRoomCount(preference) === 0) {
    return {
      assigned: [],
      availableRooms: [],
      dryRun,
      issues: [{ reason: "missing_bedding_preference" }],
      planned: [],
      preference,
      reservationID,
      reservationRooms: [],
      skipped: true,
    };
  }

  const reservationRooms = extractReservationRooms(
    [reservationPayload, reservationListPayload],
    reservationID,
  );
  const availableRooms = await getCloudbedsRooms(settings, {
    checkin,
    checkout,
  });
  const { issues, planned } = planBeddingRoomAssignments({
    availableRooms,
    preference,
    reservationRooms,
  });
  const assignmentsToExecute = planned.filter(
    (assignment) => assignment.status === "planned",
  );
  const assigned: Array<PlannedRoomAssignment & { response?: unknown }> = [];

  if (!dryRun) {
    for (const assignment of assignmentsToExecute) {
      assigned.push({
        ...assignment,
        response: await postRoomAssign({
          assignment,
          reservationID,
          settings,
        }),
      });
    }
  }

  return {
    assigned,
    availableRooms,
    dryRun,
    issues,
    planned,
    preference,
    reservationID,
    reservationRooms,
    skipped: assignmentsToExecute.length === 0,
  };
}

function shouldRetryAssignment(result: AssignmentResult) {
  return result.issues.some((issue) =>
    ["missing_bedding_preference", "missing_reservation_room"].includes(
      issue.reason,
    )
  );
}

function wait(delayMs: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, delayMs));
}

async function assignReservationBeddingWithRetry(args: {
  beddingPreference?: string;
  checkin: string;
  checkout: string;
  reservationID: string;
  settings: Settings;
}) {
  let lastResult: AssignmentResult | null = null;

  for (let attempt = 1; attempt <= args.settings.retryAttempts; attempt += 1) {
    lastResult = await assignReservationBedding({
      ...args,
      dryRun: args.settings.dryRun,
    });

    if (
      !shouldRetryAssignment(lastResult) ||
      attempt === args.settings.retryAttempts
    ) {
      return { attemptCount: attempt, result: lastResult };
    }

    await wait(args.settings.retryDelayMs);
  }

  return {
    attemptCount: args.settings.retryAttempts,
    result: lastResult as AssignmentResult,
  };
}

async function insertCloudbedsLog(
  supabase: ReturnType<typeof createClient>,
  record: {
    requestPayload?: unknown;
    reservationID?: string | null;
  },
) {
  const { data, error } = await supabase
    .from("cloudbeds_logs")
    .insert({
      action: "room_assignment",
      job_reference_id: record.reservationID ?? null,
      request_payload: record.requestPayload ?? null,
      response_payload: null,
      status: "pending",
    })
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to insert room-assignment cloudbeds log.", error);
    return null;
  }

  return (data as { id?: string } | null)?.id ?? null;
}

async function updateCloudbedsLog(
  supabase: ReturnType<typeof createClient>,
  id: string | null,
  record: {
    errorMessage?: string;
    responsePayload?: unknown;
    status: "success" | "failed";
  },
) {
  if (!id) {
    return;
  }

  const { error } = await supabase
    .from("cloudbeds_logs")
    .update({
      error_message: record.errorMessage ?? null,
      response_payload: record.responsePayload ?? null,
      status: record.status,
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update room-assignment cloudbeds log.", error);
  }
}

async function insertAssignmentEvent(
  supabase: ReturnType<typeof createClient>,
  record: {
    checkin?: string | null;
    checkout?: string | null;
    event?: string | null;
    requestPayload?: unknown;
    reservationID?: string | null;
  },
) {
  const { data, error } = await supabase
    .from("cloudbeds_room_assignment_events")
    .insert({
      checkin: record.checkin ?? null,
      checkout: record.checkout ?? null,
      event: record.event ?? null,
      request_payload: record.requestPayload ?? null,
      reservation_id: record.reservationID ?? null,
      status: "processing",
    })
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Detailed room-assignment audit insert skipped.", {
      code: error.code,
      message: error.message,
    });
    return null;
  }

  return (data as { id?: number } | null)?.id ?? null;
}

async function updateAssignmentEvent(
  supabase: ReturnType<typeof createClient>,
  id: number | null,
  record: {
    attemptCount?: number;
    availableRooms?: unknown;
    beddingPreference?: string;
    errorMessage?: string;
    executedAssignments?: unknown;
    issues?: unknown;
    plannedAssignments?: unknown;
    preference?: unknown;
    reservationRooms?: unknown;
    responsePayload?: unknown;
    status:
      | "success"
      | "noop"
      | "ignored"
      | "failed"
      | "unauthorized"
      | "misconfigured";
  },
) {
  if (!id) {
    return;
  }

  const { error } = await supabase
    .from("cloudbeds_room_assignment_events")
    .update({
      attempt_count: record.attemptCount ?? 0,
      available_rooms: record.availableRooms ?? [],
      bedding_preference: record.beddingPreference ?? null,
      completed_at: new Date().toISOString(),
      error_message: record.errorMessage ?? null,
      executed_assignments: record.executedAssignments ?? [],
      issues: record.issues ?? [],
      planned_assignments: record.plannedAssignments ?? [],
      preference: record.preference ?? {},
      reservation_rooms: record.reservationRooms ?? [],
      response_payload: record.responsePayload ?? null,
      status: record.status,
    })
    .eq("id", id);

  if (error) {
    console.error("Detailed room-assignment audit update skipped.", {
      code: error.code,
      message: error.message,
    });
  }
}

function assignmentClaimKey(reservationID: string) {
  return `cloudbeds_room_assignment_claim:${reservationID}`;
}

function parseAssignmentClaim(value: unknown): AssignmentClaim | null {
  const record = asRecord(value);

  if (!record) {
    return null;
  }

  const reservationID = stringValue(record.reservationID);
  const runID = stringValue(record.runID);
  const status = stringValue(record.status) as AssignmentClaim["status"] | null;
  const updatedAt = stringValue(record.updatedAt);

  if (
    !reservationID ||
    !runID ||
    !updatedAt ||
    !["processing", "complete", "retryable", "failed"].includes(status ?? "")
  ) {
    return null;
  }

  return {
    completedAt: stringValue(record.completedAt) ?? undefined,
    event: stringValue(record.event),
    reason: stringValue(record.reason) ?? undefined,
    reservationID,
    runID,
    status,
    updatedAt,
  };
}

function isProcessingClaimFresh(claim: AssignmentClaim) {
  if (claim.status !== "processing") {
    return false;
  }

  const updatedAtMs = Date.parse(claim.updatedAt);

  return Number.isFinite(updatedAtMs)
    ? Date.now() - updatedAtMs < PROCESSING_CLAIM_TTL_MS
    : false;
}

async function acquireAssignmentClaim(
  supabase: ReturnType<typeof createClient>,
  {
    event,
    reservationID,
  }: {
    event?: string | null;
    reservationID: string;
  },
): Promise<AssignmentClaimResult> {
  const key = assignmentClaimKey(reservationID);
  const now = new Date().toISOString();
  const runID = crypto.randomUUID();
  const nextValue: AssignmentClaim = {
    event,
    reservationID,
    runID,
    status: "processing",
    updatedAt: now,
  };
  const insert = await supabase
    .from("app_settings")
    .insert({
      key,
      updated_at: now,
      value: nextValue,
    })
    .select("key")
    .maybeSingle();

  if (!insert.error) {
    return { acquired: true, key, runID };
  }

  if (insert.error.code !== "23505") {
    throw insert.error;
  }

  const { data, error } = await supabase
    .from("app_settings")
    .select("value, updated_at")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const currentUpdatedAt =
    typeof data?.updated_at === "string" ? data.updated_at : null;
  const currentClaim = parseAssignmentClaim(data?.value);

  if (currentClaim?.status === "complete") {
    return {
      acquired: false,
      key,
      reason: "already_complete",
      state: currentClaim,
    };
  }

  if (currentClaim && isProcessingClaimFresh(currentClaim)) {
    return {
      acquired: false,
      key,
      reason: "already_processing",
      state: currentClaim,
    };
  }

  let update = supabase
    .from("app_settings")
    .update({
      updated_at: now,
      value: nextValue,
    })
    .eq("key", key);

  if (currentUpdatedAt) {
    update = update.eq("updated_at", currentUpdatedAt);
  }

  const { data: updated, error: updateError } = await update
    .select("key")
    .maybeSingle();

  if (updateError) {
    throw updateError;
  }

  if (!updated) {
    return {
      acquired: false,
      key,
      reason: "claim_race",
      state: currentClaim ?? undefined,
    };
  }

  return { acquired: true, key, runID };
}

async function completeAssignmentClaim(
  supabase: ReturnType<typeof createClient>,
  {
    claim,
    reason,
    status,
  }: {
    claim: Extract<AssignmentClaimResult, { acquired: true }>;
    reason?: string;
    status: AssignmentClaim["status"];
  },
) {
  const now = new Date().toISOString();
  const value: AssignmentClaim = {
    reservationID: claim.key.replace("cloudbeds_room_assignment_claim:", ""),
    runID: claim.runID,
    status,
    updatedAt: now,
    ...(reason ? { reason } : {}),
    ...(status === "complete" || status === "failed"
      ? { completedAt: now }
      : {}),
  };
  const { error } = await supabase
    .from("app_settings")
    .update({
      updated_at: now,
      value,
    })
    .eq("key", claim.key)
    .filter("value->>runID", "eq", claim.runID);

  if (error) {
    console.error("Failed to complete room-assignment claim.", error);
  }
}

function eventStatus(result: AssignmentResult): "success" | "noop" | "failed" {
  if (result.issues.length > 0) {
    return "failed";
  }

  return result.assigned.length > 0 ? "success" : "noop";
}

function isRetryableAssignmentResult(result: AssignmentResult) {
  return result.issues.some((issue) => RETRYABLE_ISSUE_REASONS.has(issue.reason));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  if (req.method === "GET") {
    return jsonResponse({
      ok: true,
      route: "cloudbeds-room-assignment",
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const supabase = serviceClient();
  const settings = await loadSettings(supabase);

  if (!settings.webhookSecret) {
    return jsonResponse(
      { error: "Webhook secret is not configured in Supabase." },
      503,
    );
  }

  if (getWebhookSecretFromRequest(req) !== settings.webhookSecret) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400);
  }

  const event = findFirstString(payload, ["event"]);
  const reservationID = findFirstString(payload, [
    "reservationID",
    "reservationId",
    "reservation_id",
  ]);
  const checkin = findFirstString(payload, [
    "startDate",
    "checkin",
    "checkIn",
    "check_in",
  ]);
  const checkout = findFirstString(payload, [
    "endDate",
    "checkout",
    "checkOut",
    "check_out",
  ]);
  const propertyID = findFirstString(payload, [
    "propertyID",
    "propertyID_str",
    "propertyId",
    "propertyId_str",
    "property_id",
  ]);
  const changedBeddingPreference = extractChangedBeddingPreference(payload);
  const beddingPreference =
    changedBeddingPreference ??
    BEDDING_CUSTOM_FIELD_ALIASES
      .map((fieldName) => extractCustomFieldValue(payload, fieldName))
      .find(Boolean) ??
    undefined;
  const logID = await insertCloudbedsLog(supabase, {
    requestPayload: payload,
    reservationID,
  });
  const auditID = await insertAssignmentEvent(supabase, {
    checkin,
    checkout,
    event,
    requestPayload: payload,
    reservationID,
  });
  const isReservationCreated = event === "reservation/created";
  const isReservationCustomFieldsChanged =
    event === "reservation/custom_fields_changed";

  if (!isReservationCreated && !isReservationCustomFieldsChanged) {
    const responsePayload = { ok: true, skipped: "unsupported_event", event };
    await updateCloudbedsLog(supabase, logID, {
      responsePayload,
      status: "success",
    });
    await updateAssignmentEvent(supabase, auditID, {
      responsePayload,
      status: "ignored",
    });

    return jsonResponse(responsePayload);
  }

  if (isReservationCustomFieldsChanged && !changedBeddingPreference) {
    const responsePayload = {
      ok: true,
      skipped: "unrelated_custom_field_change",
      event,
    };
    await updateCloudbedsLog(supabase, logID, {
      responsePayload,
      status: "success",
    });
    await updateAssignmentEvent(supabase, auditID, {
      responsePayload,
      status: "ignored",
    });

    return jsonResponse(responsePayload);
  }

  if (
    settings.propertyID &&
    propertyID &&
    String(propertyID) !== String(settings.propertyID)
  ) {
    const responsePayload = { ok: true, skipped: "other_property" };
    await updateCloudbedsLog(supabase, logID, {
      responsePayload,
      status: "success",
    });
    await updateAssignmentEvent(supabase, auditID, {
      responsePayload,
      status: "ignored",
    });

    return jsonResponse(responsePayload);
  }

  if (!reservationID) {
    const responsePayload = {
      error:
        "Cloudbeds reservation webhook payload is missing reservationID.",
    };
    await updateCloudbedsLog(supabase, logID, {
      errorMessage: responsePayload.error,
      responsePayload,
      status: "failed",
    });
    await updateAssignmentEvent(supabase, auditID, {
      errorMessage: responsePayload.error,
      responsePayload,
      status: "failed",
    });

    return jsonResponse(responsePayload, 400);
  }

  let resolvedCheckin = checkin;
  let resolvedCheckout = checkout;

  if (!resolvedCheckin || !resolvedCheckout) {
    try {
      const resolvedDates = await resolveStayDates(settings, {
        checkin,
        checkout,
        reservationID,
      });

      resolvedCheckin = resolvedDates.checkin;
      resolvedCheckout = resolvedDates.checkout;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const responsePayload = {
        error: `Could not resolve reservation stay dates: ${message}`,
        ok: false,
        reservationID,
      };
      await updateCloudbedsLog(supabase, logID, {
        errorMessage: responsePayload.error,
        responsePayload,
        status: "failed",
      });
      await updateAssignmentEvent(supabase, auditID, {
        errorMessage: responsePayload.error,
        responsePayload,
        status: "failed",
      });

      return jsonResponse(responsePayload, 502);
    }
  }

  if (!resolvedCheckin || !resolvedCheckout) {
    const responsePayload = {
      error:
        "Cloudbeds reservation webhook payload is missing startDate/endDate and they could not be resolved from getReservation.",
      ok: false,
      reservationID,
    };
    await updateCloudbedsLog(supabase, logID, {
      errorMessage: responsePayload.error,
      responsePayload,
      status: "failed",
    });
    await updateAssignmentEvent(supabase, auditID, {
      errorMessage: responsePayload.error,
      responsePayload,
      status: "failed",
    });

    return jsonResponse(responsePayload, 400);
  }

  let claim: AssignmentClaimResult;

  try {
    claim = await acquireAssignmentClaim(supabase, {
      event,
      reservationID,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const responsePayload = {
      error: `Could not acquire room-assignment claim: ${message}`,
      ok: false,
      reservationID,
    };
    await updateCloudbedsLog(supabase, logID, {
      errorMessage: responsePayload.error,
      responsePayload,
      status: "failed",
    });
    await updateAssignmentEvent(supabase, auditID, {
      errorMessage: responsePayload.error,
      responsePayload,
      status: "failed",
    });

    return jsonResponse(responsePayload, 503);
  }

  if (!claim.acquired) {
    const responsePayload = {
      ok: true,
      reservationID,
      skipped: claim.reason,
      state: claim.state
        ? {
            reason: claim.state.reason,
            status: claim.state.status,
            updatedAt: claim.state.updatedAt,
          }
        : null,
    };
    await updateCloudbedsLog(supabase, logID, {
      responsePayload,
      status: "success",
    });
    await updateAssignmentEvent(supabase, auditID, {
      responsePayload,
      status: "ignored",
    });

    return jsonResponse(responsePayload);
  }

  try {
    const { attemptCount, result } = await assignReservationBeddingWithRetry({
      beddingPreference,
      checkin: resolvedCheckin,
      checkout: resolvedCheckout,
      reservationID,
      settings,
    });
    const status = eventStatus(result);
    const retryable = status === "failed" && isRetryableAssignmentResult(result);
    const responsePayload = {
      ok: status !== "failed",
      result: {
        assigned: result.assigned,
        dryRun: result.dryRun,
        issues: result.issues,
        planned: result.planned,
        preference: result.preference,
        reservationID: result.reservationID,
        skipped: result.skipped,
      },
      status,
    };

    await updateCloudbedsLog(supabase, logID, {
      errorMessage: status === "failed" ? JSON.stringify(result.issues) : "",
      responsePayload,
      status: status === "failed" ? "failed" : "success",
    });
    await updateAssignmentEvent(supabase, auditID, {
      attemptCount,
      availableRooms: result.availableRooms,
      beddingPreference,
      errorMessage: status === "failed" ? JSON.stringify(result.issues) : "",
      executedAssignments: result.assigned,
      issues: result.issues,
      plannedAssignments: result.planned,
      preference: result.preference,
      reservationRooms: result.reservationRooms,
      responsePayload,
      status,
    });
    await completeAssignmentClaim(supabase, {
      claim,
      reason: status === "failed" ? JSON.stringify(result.issues) : undefined,
      status: status === "failed" ? (retryable ? "retryable" : "failed") : "complete",
    });

    return jsonResponse(responsePayload);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const responsePayload = {
      error: message,
      ok: false,
      reservationID,
    };

    await updateCloudbedsLog(supabase, logID, {
      errorMessage: message,
      responsePayload,
      status: "failed",
    });
    await updateAssignmentEvent(supabase, auditID, {
      errorMessage: message,
      responsePayload,
      status: message.includes("not configured") ? "misconfigured" : "failed",
    });
    await completeAssignmentClaim(supabase, {
      claim,
      reason: message,
      status: message.includes("not configured") ? "failed" : "retryable",
    });

    return jsonResponse(responsePayload, message.includes("not configured") ? 503 : 502);
  }
});
