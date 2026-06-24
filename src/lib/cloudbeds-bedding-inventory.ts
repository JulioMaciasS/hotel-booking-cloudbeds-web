export type BeddingKey =
  | "matrimonial"
  | "dos_camas_separadas"
  | "matrimonial_cama_individual"
  | "tres_camas_individuales";

export type CloudbedsRoom = {
  roomID: string;
  roomTypeID: string;
  isVirtual?: boolean;
  roomBlocked?: boolean;
};

export type RoomTypeBeddingAvailability = {
  totalAvailable: number;
  options: Partial<Record<BeddingKey, number>>;
};

export type BeddingAvailability = {
  mappingComplete: boolean;
  unmappedRoomCount: number;
  roomTypes: Record<string, RoomTypeBeddingAvailability>;
};

type RoomCapability = {
  roomTypeID: string;
  bedding: readonly BeddingKey[];
};

const DOUBLE_STANDARD = "227179928547456";
const TRIPLE_STANDARD_TWIN = "229741180768384";
const DOUBLE_SUPERIOR = "229741541683392";
const TRIPLE_SUPERIOR = "229741711368385";
const TRIPLE_STANDARD_MATRIMONIAL = "239441314484352";

/**
 * Stable physical-room inventory. This is intentionally keyed by Cloudbeds'
 * roomID and never by roomName: names are presentation data and can be edited.
 *
 * Flexible rooms list both layouts. They therefore contribute to both option
 * counters, which is correct because the UI permits only one layout at a time
 * for a room type. This does not reserve the room in both layouts.
 */
export const ROOM_BEDDING_CAPABILITIES: Readonly<
  Record<string, RoomCapability>
> = {
  // Doble Estándar: HAB 01 and 03 are flexible; HAB 04 and 11 are twin-only.
  // Confirm these suffixes once with an undated getRooms response before
  // production; the supplied dated sample omitted this room type entirely.
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

  // Triple Estándar Twin: HAB 02 and 05.
  [`${TRIPLE_STANDARD_TWIN}-0`]: {
    roomTypeID: TRIPLE_STANDARD_TWIN,
    bedding: ["tres_camas_individuales"],
  },
  [`${TRIPLE_STANDARD_TWIN}-1`]: {
    roomTypeID: TRIPLE_STANDARD_TWIN,
    bedding: ["tres_camas_individuales"],
  },

  // Doble Superior: HAB 10/16 matrimonial; HAB 12/14/15 flexible.
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

  // Triple Superior: HAB 13 is flexible.
  [`${TRIPLE_SUPERIOR}-0`]: {
    roomTypeID: TRIPLE_SUPERIOR,
    bedding: ["matrimonial_cama_individual", "tres_camas_individuales"],
  },

  // Triple Estándar Matrimonial: HAB 06 and 07.
  [`${TRIPLE_STANDARD_MATRIMONIAL}-0`]: {
    roomTypeID: TRIPLE_STANDARD_MATRIMONIAL,
    bedding: ["matrimonial_cama_individual"],
  },
  [`${TRIPLE_STANDARD_MATRIMONIAL}-1`]: {
    roomTypeID: TRIPLE_STANDARD_MATRIMONIAL,
    bedding: ["matrimonial_cama_individual"],
  },
};

const ROOM_TYPE_OPTIONS: Readonly<
  Record<string, readonly BeddingKey[]>
> = {
  [DOUBLE_STANDARD]: ["matrimonial", "dos_camas_separadas"],
  [TRIPLE_STANDARD_TWIN]: ["tres_camas_individuales"],
  [DOUBLE_SUPERIOR]: ["matrimonial", "dos_camas_separadas"],
  [TRIPLE_SUPERIOR]: [
    "matrimonial_cama_individual",
    "tres_camas_individuales",
  ],
  [TRIPLE_STANDARD_MATRIMONIAL]: ["matrimonial_cama_individual"],
};

function emptyAvailability(): BeddingAvailability {
  const roomTypes: Record<string, RoomTypeBeddingAvailability> = {};

  for (const [roomTypeID, beddingOptions] of Object.entries(
    ROOM_TYPE_OPTIONS,
  )) {
    roomTypes[roomTypeID] = {
      totalAvailable: 0,
      options: Object.fromEntries(
        beddingOptions.map((option) => [option, 0]),
      ) as Partial<Record<BeddingKey, number>>,
    };
  }

  return {
    mappingComplete: true,
    unmappedRoomCount: 0,
    roomTypes,
  };
}

/**
 * Converts dated getRooms results into simple public counters. Physical IDs
 * are consumed here and never included in the returned object.
 */
export function calculateBeddingAvailability(
  rooms: readonly CloudbedsRoom[],
): BeddingAvailability {
  const result = emptyAvailability();

  for (const room of rooms) {
    if (room.roomBlocked === true || room.isVirtual === true) {
      continue;
    }

    const capability = ROOM_BEDDING_CAPABILITIES[room.roomID];

    if (!capability || capability.roomTypeID !== room.roomTypeID) {
      result.mappingComplete = false;
      result.unmappedRoomCount += 1;
      continue;
    }

    const roomType = result.roomTypes[capability.roomTypeID];

    if (!roomType) {
      result.mappingComplete = false;
      result.unmappedRoomCount += 1;
      continue;
    }

    roomType.totalAvailable += 1;

    for (const bedding of capability.bedding) {
      roomType.options[bedding] = (roomType.options[bedding] ?? 0) + 1;
    }
  }

  return result;
}

/** Static fallback used only when live Cloudbeds availability cannot be read. */
export function calculateStaticBeddingAvailability(): BeddingAvailability {
  return calculateBeddingAvailability(
    Object.entries(ROOM_BEDDING_CAPABILITIES).map(
      ([roomID, capability]) =>
        ({
          roomID,
          roomTypeID: capability.roomTypeID,
          isVirtual: false,
          roomBlocked: false,
        }) satisfies CloudbedsRoom,
    ),
  );
}
