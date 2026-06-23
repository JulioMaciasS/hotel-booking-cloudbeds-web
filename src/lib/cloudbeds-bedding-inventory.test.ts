import { describe, expect, it } from "vitest";
import {
  calculateBeddingAvailability,
  type CloudbedsRoom,
} from "./cloudbeds-bedding-inventory";

const DOUBLE_STANDARD = "227179928547456";
const DOUBLE_SUPERIOR = "229741541683392";

function room(
  roomTypeID: string,
  index: number,
  overrides: Partial<CloudbedsRoom> = {},
): CloudbedsRoom {
  return {
    roomID: `${roomTypeID}-${index}`,
    roomTypeID,
    roomBlocked: false,
    isVirtual: false,
    ...overrides,
  };
}

describe("calculateBeddingAvailability", () => {
  it("counts flexible rooms in both layouts", () => {
    const result = calculateBeddingAvailability([
      room(DOUBLE_STANDARD, 0),
      room(DOUBLE_STANDARD, 1),
      room(DOUBLE_STANDARD, 2),
      room(DOUBLE_STANDARD, 3),
    ]);

    expect(result.roomTypes[DOUBLE_STANDARD]).toEqual({
      totalAvailable: 4,
      options: {
        matrimonial: 2,
        dos_camas_separadas: 4,
      },
    });
  });

  it("derives the supplied Doble Superior availability without room names", () => {
    const result = calculateBeddingAvailability([
      room(DOUBLE_SUPERIOR, 0),
      room(DOUBLE_SUPERIOR, 1),
      room(DOUBLE_SUPERIOR, 2),
      room(DOUBLE_SUPERIOR, 3),
      room(DOUBLE_SUPERIOR, 4),
    ]);

    expect(result.roomTypes[DOUBLE_SUPERIOR]).toEqual({
      totalAvailable: 5,
      options: {
        matrimonial: 5,
        dos_camas_separadas: 3,
      },
    });
  });

  it("ignores blocked rooms and fails closed for unknown room IDs", () => {
    const result = calculateBeddingAvailability([
      room(DOUBLE_STANDARD, 0, { roomBlocked: true }),
      room(DOUBLE_STANDARD, 99),
    ]);

    expect(result.roomTypes[DOUBLE_STANDARD]?.totalAvailable).toBe(0);
    expect(result.mappingComplete).toBe(false);
    expect(result.unmappedRoomCount).toBe(1);
  });
});
