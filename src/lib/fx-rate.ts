/**
 * Validation of the upstream FX payload (Supabase Edge Function). Pure
 * functions so the policy is unit-testable apart from the route handler.
 *
 * Policy:
 *  - The rate must be a finite number inside a configurable sanity band, so a
 *    corrupt upstream value (1, 0, 1e9…) can never reach the UI.
 *  - The rate carries a confirmation timestamp. Past `staleAfterHours` it is
 *    served flagged `stale: true` (an old rate beats no rate); past
 *    `inactiveAfterHours` it is rejected outright.
 */

export type FxUpstreamPayload = {
  status?: unknown;
  usdArsRate?: unknown;
  confirmedAt?: unknown;
  observedAt?: unknown;
  updatedAt?: unknown;
};

export type FxEvaluationConfig = {
  minRate: number;
  maxRate: number;
  staleAfterHours: number;
  inactiveAfterHours: number;
};

export type FxRejectionReason =
  | "invalid-status"
  | "invalid-rate"
  | "rate-out-of-band"
  | "rate-too-old";

export type FxEvaluation =
  | {
      ok: true;
      arsPerUsd: number;
      /** Upstream confirmation timestamp (ISO), when present. */
      asOf: string | null;
      /** Age in hours at evaluation time; null when upstream sent no timestamp. */
      ageHours: number | null;
      stale: boolean;
    }
  | { ok: false; reason: FxRejectionReason };

function parseEnvNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function fxConfigFromEnv(
  env: Record<string, string | undefined> = process.env,
): FxEvaluationConfig {
  return {
    minRate: parseEnvNumber(env.FX_RATE_MIN, 200),
    maxRate: parseEnvNumber(env.FX_RATE_MAX, 100_000),
    staleAfterHours: parseEnvNumber(env.FX_RATE_MAX_AGE_HOURS, 48),
    inactiveAfterHours: parseEnvNumber(env.FX_RATE_HARD_MAX_AGE_HOURS, 168),
  };
}

function upstreamTimestamp(payload: FxUpstreamPayload): string | null {
  for (const candidate of [
    payload.confirmedAt,
    payload.observedAt,
    payload.updatedAt,
  ]) {
    if (typeof candidate === "string" && !Number.isNaN(Date.parse(candidate))) {
      return candidate;
    }
  }

  return null;
}

export function evaluateFxUpstream(
  payload: FxUpstreamPayload,
  now: Date,
  config: FxEvaluationConfig,
): FxEvaluation {
  if (payload.status !== "ok") {
    return { ok: false, reason: "invalid-status" };
  }

  const arsPerUsd = Number(payload.usdArsRate);

  if (!Number.isFinite(arsPerUsd) || arsPerUsd <= 0) {
    return { ok: false, reason: "invalid-rate" };
  }

  if (arsPerUsd < config.minRate || arsPerUsd > config.maxRate) {
    return { ok: false, reason: "rate-out-of-band" };
  }

  const asOf = upstreamTimestamp(payload);

  // No timestamp: age unknown. Accept un-flagged — the band check still holds
  // and rejecting would turn a missing metadata field into a full outage.
  if (asOf === null) {
    return { ok: true, arsPerUsd, asOf: null, ageHours: null, stale: false };
  }

  const ageHours = (now.getTime() - Date.parse(asOf)) / 3_600_000;

  if (ageHours > config.inactiveAfterHours) {
    return { ok: false, reason: "rate-too-old" };
  }

  return {
    ok: true,
    arsPerUsd,
    asOf,
    ageHours,
    stale: ageHours > config.staleAfterHours,
  };
}
