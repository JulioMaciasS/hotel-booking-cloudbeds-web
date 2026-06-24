import { describe, expect, it } from "vitest";
import { planBeddingRoomAssignments } from "./cloudbeds-room-assignment";

describe("Cloudbeds room assignment planner", () => {
  it("keeps already-compatible rooms and plans only incompatible assignments", () => {
    const result = planBeddingRoomAssignments({
      availableRooms: [
        {
          roomID: "227179928547456-2",
          roomTypeID: "227179928547456",
        },
      ],
      preference: {
        "227179928547456": {
          dos_camas_separadas: 1,
          matrimonial: 1,
        },
      },
      reservationRooms: [
        {
          oldRoomID: "227179928547456-0",
          roomTypeID: "227179928547456",
          subReservationID: "res-1",
        },
        {
          oldRoomID: "227179928547456-3",
          roomTypeID: "227179928547456",
          subReservationID: "res-1-1",
        },
      ],
    });

    expect(result.issues).toEqual([]);
    expect(result.planned).toHaveLength(2);
    expect(result.planned).toContainEqual({
        bedding: "dos_camas_separadas",
        newRoomID: "227179928547456-3",
        oldRoomID: "227179928547456-3",
        roomTypeID: "227179928547456",
        status: "already_compatible",
        subReservationID: "res-1-1",
      });
    expect(result.planned).toContainEqual({
        bedding: "matrimonial",
        newRoomID: "227179928547456-0",
        oldRoomID: "227179928547456-0",
        roomTypeID: "227179928547456",
        status: "already_compatible",
        subReservationID: "res-1",
      });
  });

  it("prefers fixed-layout rooms before flexible rooms", () => {
    const result = planBeddingRoomAssignments({
      availableRooms: [
        {
          roomID: "227179928547456-0",
          roomTypeID: "227179928547456",
        },
        {
          roomID: "227179928547456-2",
          roomTypeID: "227179928547456",
        },
      ],
      preference: {
        "227179928547456": {
          dos_camas_separadas: 1,
        },
      },
      reservationRooms: [
        {
          roomTypeID: "227179928547456",
          subReservationID: "res-2",
        },
      ],
    });

    expect(result.issues).toEqual([]);
    expect(result.planned[0]).toMatchObject({
      bedding: "dos_camas_separadas",
      newRoomID: "227179928547456-2",
      status: "planned",
      subReservationID: "res-2",
    });
  });

  it("reports a graceful issue when no compatible room is available", () => {
    const result = planBeddingRoomAssignments({
      availableRooms: [],
      preference: {
        "229741711368385": {
          tres_camas_individuales: 1,
        },
      },
      reservationRooms: [
        {
          roomTypeID: "229741711368385",
          subReservationID: "res-3",
        },
      ],
    });

    expect(result.planned).toEqual([]);
    expect(result.issues).toEqual([
      {
        bedding: "tres_camas_individuales",
        reason: "missing_compatible_room",
        roomTypeID: "229741711368385",
      },
    ]);
  });
});
