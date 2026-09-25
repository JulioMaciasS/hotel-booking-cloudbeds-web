import { describe, expect, it } from "vitest";
import {
  evaluateFxUpstream,
  fxConfigFromEnv,
  type FxEvaluationConfig,
} from "./fx-rate";

const NOW = new Date("2026-06-12T12:00:00.000Z");

const CONFIG: FxEvaluationConfig = {
  minRate: 200,
  maxRate: 100_000,
  staleAfterHours: 48,
};

function hoursAgo(hours: number): string {
  return new Date(NOW.getTime() - hours * 3_600_000).toISOString();
}

describe("evaluateFxUpstream", () => {
  it("accepts a fresh in-band rate", () => {
    const result = evaluateFxUpstream(
      { status: "ok", usdArsRate: 1460, confirmedAt: hoursAgo(2) },
      NOW,
      CONFIG,
    );

    expect(result).toMatchObject({
      ok: true,
      arsPerUsd: 1460,
      stale: false,
    });
    if (result.ok) {
      expect(result.ageHours).toBeCloseTo(2, 5);
    }
  });

  it("flags a rate older than the stale threshold but keeps it usable", () => {
    const result = evaluateFxUpstream(
      { status: "ok", usdArsRate: 1460, confirmedAt: hoursAgo(72) },
      NOW,
      CONFIG,
    );

    expect(result).toMatchObject({ ok: true, arsPerUsd: 1460, stale: true });
  });

  it("keeps a valid rate usable even when it was confirmed five years ago", () => {
    const result = evaluateFxUpstream(
      { status: "ok", usdArsRate: 1530, confirmedAt: hoursAgo(24 * 365 * 5) },
      NOW,
      CONFIG,
    );

    expect(result).toMatchObject({ ok: true, arsPerUsd: 1530, stale: true });
  });

  it("rejects rates outside the sanity band", () => {
    for (const usdArsRate of [1, 199.99, 100_001, 5_000_000]) {
      expect(
        evaluateFxUpstream(
          { status: "ok", usdArsRate, confirmedAt: hoursAgo(1) },
          NOW,
          CONFIG,
        ),
      ).toEqual({ ok: false, reason: "rate-out-of-band" });
    }
  });

  it("rejects malformed rates and statuses", () => {
    expect(
      evaluateFxUpstream({ status: "error", usdArsRate: 1460 }, NOW, CONFIG),
    ).toEqual({ ok: false, reason: "invalid-status" });
    expect(evaluateFxUpstream({}, NOW, CONFIG)).toEqual({
      ok: false,
      reason: "invalid-status",
    });

    for (const usdArsRate of [null, undefined, "abc", NaN, -5, 0]) {
      expect(
        evaluateFxUpstream({ status: "ok", usdArsRate }, NOW, CONFIG),
      ).toEqual({ ok: false, reason: "invalid-rate" });
    }
  });

  it("accepts an in-band rate with no timestamp, unflagged but with unknown age", () => {
    const result = evaluateFxUpstream(
      { status: "ok", usdArsRate: 1460 },
      NOW,
      CONFIG,
    );

    expect(result).toEqual({
      ok: true,
      arsPerUsd: 1460,
      asOf: null,
      ageHours: null,
      stale: false,
    });
  });

  it("falls back to observedAt/updatedAt when confirmedAt is missing or invalid", () => {
    const result = evaluateFxUpstream(
      {
        status: "ok",
        usdArsRate: 1460,
        confirmedAt: "not-a-date",
        observedAt: hoursAgo(3),
      },
      NOW,
      CONFIG,
    );

    expect(result).toMatchObject({ ok: true, stale: false });
    if (result.ok) {
      expect(result.ageHours).toBeCloseTo(3, 5);
    }
  });
});

describe("fxConfigFromEnv", () => {
  it("uses defaults when env vars are missing or invalid", () => {
    expect(fxConfigFromEnv({})).toEqual({
      minRate: 200,
      maxRate: 100_000,
      staleAfterHours: 48,
    });
    expect(fxConfigFromEnv({ FX_RATE_MIN: "abc", FX_RATE_MAX: "-1" })).toEqual({
      minRate: 200,
      maxRate: 100_000,
      staleAfterHours: 48,
    });
  });

  it("reads overrides from env", () => {
    expect(
      fxConfigFromEnv({
        FX_RATE_MIN: "500",
        FX_RATE_MAX: "20000",
        FX_RATE_MAX_AGE_HOURS: "24",
      }),
    ).toEqual({
      minRate: 500,
      maxRate: 20_000,
      staleAfterHours: 24,
    });
  });
});
