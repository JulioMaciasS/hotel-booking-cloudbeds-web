import { describe, expect, it } from "vitest";
import { validateStayDates } from "./booking-dates";

describe("validateStayDates", () => {
  it("accepts a valid stay", () => {
    expect(validateStayDates("2026-06-23", "2026-06-24")).toEqual({
      ok: true,
      checkin: "2026-06-23",
      checkout: "2026-06-24",
    });
  });

  it("rejects invalid calendar dates and reversed ranges", () => {
    expect(validateStayDates("2026-02-30", "2026-03-02").ok).toBe(false);
    expect(validateStayDates("2026-06-24", "2026-06-23").ok).toBe(false);
  });
});
