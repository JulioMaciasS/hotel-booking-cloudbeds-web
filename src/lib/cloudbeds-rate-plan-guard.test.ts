// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
  CLOUDBEDS_PUBLIC_RATE_PLAN_ID,
  CLOUDBEDS_TECHNICAL_GHS_RATE_PLAN_ID,
  GHS_SOURCE_RATE_PLAN_PARAM,
  replaceTechnicalGhsRatePlan,
} from "./cloudbeds-rate-plan-guard";

describe("replaceTechnicalGhsRatePlan", () => {
  it("replaces the technical plan while retaining its source id", () => {
    const source = new URL(
      `https://loslagoshotel.com.ar/reservas?checkin=2027-08-10&checkout=2027-08-11&origin=gha&rpid=${CLOUDBEDS_TECHNICAL_GHS_RATE_PLAN_ID}&rid=227179928547456`,
    );

    const safe = replaceTechnicalGhsRatePlan(source);

    expect(safe).not.toBeNull();
    expect(safe?.searchParams.get("rpid")).toBe(
      CLOUDBEDS_PUBLIC_RATE_PLAN_ID,
    );
    expect(safe?.searchParams.get(GHS_SOURCE_RATE_PLAN_PARAM)).toBe(
      CLOUDBEDS_TECHNICAL_GHS_RATE_PLAN_ID,
    );
    expect(safe?.searchParams.get("checkin")).toBe("2027-08-10");
    expect(safe?.searchParams.get("checkout")).toBe("2027-08-11");
    expect(safe?.searchParams.get("rid")).toBe("227179928547456");
  });

  it("does not rewrite a normal public-plan URL", () => {
    const source = new URL(
      `https://loslagoshotel.com.ar/reservas?rpid=${CLOUDBEDS_PUBLIC_RATE_PLAN_ID}`,
    );

    expect(replaceTechnicalGhsRatePlan(source)).toBeNull();
    expect(source.searchParams.has(GHS_SOURCE_RATE_PLAN_PARAM)).toBe(false);
  });
});
