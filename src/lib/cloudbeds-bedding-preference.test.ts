import { describe, expect, it } from "vitest";
import {
  beddingPreferenceRoomCount,
  parseBeddingPreference,
  serializeBeddingPreference,
} from "./cloudbeds-bedding-preference";

describe("Cloudbeds bedding preference", () => {
  it("serializes and parses room-type keyed bedding counts", () => {
    const serialized = serializeBeddingPreference({
      "227179928547456": {
        dos_camas_separadas: 2,
        matrimonial: 1,
      },
      "229741711368385": {
        tres_camas_individuales: 1,
      },
    });

    expect(serialized).toBe(
      "227179928547456=dos_camas_separadas:2,matrimonial:1|229741711368385=tres_camas_individuales:1",
    );
    expect(parseBeddingPreference(serialized)).toEqual({
      "227179928547456": {
        dos_camas_separadas: 2,
        matrimonial: 1,
      },
      "229741711368385": {
        tres_camas_individuales: 1,
      },
    });
  });

  it("ignores invalid keys and non-positive counts", () => {
    const parsed = parseBeddingPreference(
      "v1|room-a=matrimonial:1,bogus:4,dos_camas_separadas:0|bad-entry",
    );

    expect(parsed).toEqual({
      "room-a": {
        matrimonial: 1,
      },
    });
    expect(beddingPreferenceRoomCount(parsed)).toBe(1);
  });
});
