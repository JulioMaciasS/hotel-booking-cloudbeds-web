import { cloudbedsBookingCustomFields } from "@/lib/config";
import {
  type BeddingKey,
  type CloudbedsRoom,
  getRoomBeddingCapability,
} from "@/lib/cloudbeds-bedding-inventory";
import {
  beddingPreferenceRoomCount,
  parseBeddingPreference,
  type BeddingPreference,
} from "@/lib/cloudbeds-bedding-preference";
import {
  CloudbedsConfigurationError,
  CloudbedsUpstreamError,
  getCloudbedsRooms,
} from "@/lib/cloudbeds-rooms";

const CLOUDBEDS_API_BASE = "https://api.cloudbeds.com/api/v1.3";
const CLOUDBEDS_GET_RESERVATION_URL = `${CLOUDBEDS_API_BASE}/getReservation`;
const CLOUDBEDS_GET_RESERVATIONS_URL = `${CLOUDBEDS_API_BASE}/getReservations`;
const CLOUDBEDS_POST_ROOM_ASSIGN_URL = `${CLOUDBEDS_API_BASE}/postRoomAssign`;
const REQUEST_TIMEOUT_MS = 12_000;

type CloudbedsApiOptions = {
  apiKey?: string;
  propertyID?: string;
  fetchImpl?: typeof fetch;
};

export type ReservationRoomForAssignment = {
  subReservationID: string;
  roomTypeID: string;
  oldRoomID?: string;
  reservationRoomID?: string;
};

export type PlannedRoomAssignment = {
  bedding: BeddingKey;
  newRoomID: string;
  oldRoomID?: string;
  roomTypeID: string;
  status: "already_compatible" | "planned";
  subReservationID: string;
};

export type RoomAssignmentIssue = {
  bedding?: BeddingKey;
  count?: number;
  reason:
    | "missing_bedding_preference"
    | "missing_reservation_room"
    | "missing_compatible_room"
    | "unknown_room_type";
  roomTypeID?: string;
};

export type AssignReservationBeddingResult = {
  assigned: Array<PlannedRoomAssignment & { response?: unknown }>;
  dryRun: boolean;
  issues: RoomAssignmentIssue[];
  planned: PlannedRoomAssignment[];
  preference: BeddingPreference;
  reservationID: string;
  skipped: boolean;
};

type AssignReservationBeddingOptions = CloudbedsApiOptions & {
  beddingPreference?: string;
  checkin: string;
  checkout: string;
  dryRun?: boolean;
  reservationID: string;
};

type PostRoomAssignOptions = CloudbedsApiOptions & {
  assignment: PlannedRoomAssignment;
  reservationID: string;
};

function getCloudbedsCredentials({
  apiKey = process.env.CLOUDBEDS_API_KEY,
  propertyID = process.env.CLOUDBEDS_PROPERTY_ID,
}: CloudbedsApiOptions) {
  if (!apiKey || !propertyID) {
    throw new CloudbedsConfigurationError(
      "CLOUDBEDS_API_KEY and CLOUDBEDS_PROPERTY_ID must be configured.",
    );
  }

  return { apiKey, propertyID };
}

async function cloudbedsGetJson(
  endpoint: string,
  params: Record<string, string>,
  options: CloudbedsApiOptions,
) {
  const { apiKey, propertyID } = getCloudbedsCredentials(options);
  const url = new URL(endpoint);

  url.searchParams.set("propertyID", propertyID);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await (options.fetchImpl ?? fetch)(url, {
    cache: "no-store",
    headers: {
      accept: "application/json",
      "x-api-key": apiKey,
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new CloudbedsUpstreamError(
      `Cloudbeds ${url.pathname} returned HTTP ${response.status}.`,
    );
  }

  return response.json() as Promise<unknown>;
}

async function getReservationPayload(
  reservationID: string,
  options: CloudbedsApiOptions,
) {
  return cloudbedsGetJson(
    CLOUDBEDS_GET_RESERVATION_URL,
    {
      reservationID,
    },
    options,
  );
}

async function findReservationListPayload(
  {
    checkin,
    checkout,
    reservationID,
  }: Pick<
    AssignReservationBeddingOptions,
    "checkin" | "checkout" | "reservationID"
  >,
  options: CloudbedsApiOptions,
) {
  const payload = await cloudbedsGetJson(
    CLOUDBEDS_GET_RESERVATIONS_URL,
    {
      checkInFrom: checkin,
      checkInTo: checkin,
      checkOutFrom: checkout,
      checkOutTo: checkout,
      includeAllRooms: "true",
      includeCustomFields: "true",
      pageNumber: "1",
      pageSize: "100",
    },
    options,
  );

  return findReservationInPayload(payload, reservationID);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function pickString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = stringValue(record[key]);

    if (value) {
      return value;
    }
  }

  return null;
}

function findReservationInPayload(
  payload: unknown,
  reservationID: string,
): unknown | null {
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
      stringValue(record.reservationId) === reservationID
    ) {
      return record;
    }

    stack.push(...Object.values(record));
  }

  return null;
}

function extractCustomFieldValue(payload: unknown, fieldName: string) {
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

    const direct = stringValue(record[fieldName]);

    if (direct) {
      return direct;
    }

    const internalName = pickString(record, [
      "internalName",
      "fieldName",
      "name",
      "key",
      "code",
    ]);

    if (internalName === fieldName) {
      const value = pickString(record, ["value", "fieldValue", "text"]);

      if (value) {
        return value;
      }
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
      const subReservationID =
        explicitSubReservationID ??
        (linkedReservationID === reservationID || reservationRoomID
          ? reservationID
          : null);

      if (roomTypeID && subReservationID) {
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

export function planBeddingRoomAssignments({
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
        left.subReservationID.localeCompare(right.subReservationID),
      );
    const requests = Object.entries(counts)
      .flatMap(([bedding, count]) =>
        Array.from({ length: count ?? 0 }, () => bedding as BeddingKey),
      )
      .sort(
        (left, right) =>
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

async function postRoomAssign({
  assignment,
  reservationID,
  ...options
}: PostRoomAssignOptions) {
  const { apiKey, propertyID } = getCloudbedsCredentials(options);
  const body = new URLSearchParams();

  body.set("propertyID", propertyID);
  body.set("reservationID", reservationID);
  body.set("subReservationID", assignment.subReservationID);
  body.set("newRoomID", assignment.newRoomID);
  body.set("roomTypeID", assignment.roomTypeID);
  body.set("adjustPrice", "false");

  if (assignment.oldRoomID) {
    body.set("oldRoomID", assignment.oldRoomID);
  }

  const response = await (options.fetchImpl ?? fetch)(
    CLOUDBEDS_POST_ROOM_ASSIGN_URL,
    {
      body,
      cache: "no-store",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
        "x-api-key": apiKey,
      },
      method: "POST",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    },
  );

  if (!response.ok) {
    throw new CloudbedsUpstreamError(
      `Cloudbeds postRoomAssign returned HTTP ${response.status}.`,
    );
  }

  return response.json() as Promise<unknown>;
}

export async function assignReservationBedding({
  beddingPreference,
  checkin,
  checkout,
  dryRun = false,
  reservationID,
  ...options
}: AssignReservationBeddingOptions): Promise<AssignReservationBeddingResult> {
  const reservationPayload = await getReservationPayload(reservationID, options);
  const reservationListPayload = await findReservationListPayload(
    {
      checkin,
      checkout,
      reservationID,
    },
    options,
  );
  const storedPreference =
    beddingPreference ||
    extractCustomFieldValue(
      reservationListPayload,
      cloudbedsBookingCustomFields.beddingPreference,
    ) ||
    extractCustomFieldValue(
      reservationPayload,
      cloudbedsBookingCustomFields.beddingPreference,
    ) ||
    "";
  const preference = parseBeddingPreference(storedPreference);

  if (beddingPreferenceRoomCount(preference) === 0) {
    return {
      assigned: [],
      dryRun,
      issues: [{ reason: "missing_bedding_preference" }],
      planned: [],
      preference,
      reservationID,
      skipped: true,
    };
  }

  const reservationRooms = extractReservationRooms(
    [reservationPayload, reservationListPayload],
    reservationID,
  );
  const availableRooms = await getCloudbedsRooms({
    checkin,
    checkout,
    ...options,
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
          ...options,
        }),
      });
    }
  }

  return {
    assigned,
    dryRun,
    issues,
    planned,
    preference,
    reservationID,
    skipped: assignmentsToExecute.length === 0,
  };
}
