// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  readStoredFxRate,
  resolveFxRate,
  writeStoredFxRate,
} from "./fx-rate-client";
import { resetFxDiagnosticsForTests } from "./fx-diagnostics";

const NOW = new Date("2026-06-12T12:00:00.000Z").getTime();

function mockFetchResponses(
  ...responses: Array<{ ok: boolean; body?: unknown } | Error>
) {
  const mock = vi.fn();

  for (const response of responses) {
    if (response instanceof Error) {
      mock.mockRejectedValueOnce(response);
    } else {
      mock.mockResolvedValueOnce({
        ok: response.ok,
        json: () => Promise.resolve(response.body ?? {}),
      });
    }
  }

  vi.stubGlobal("fetch", mock);
  return mock;
}

beforeEach(() => {
  window.localStorage.clear();
  resetFxDiagnosticsForTests();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("stored fx rate", () => {
  it("round-trips a stored rate within the freshness window", () => {
    writeStoredFxRate({ arsPerUsd: 1460, asOf: "2026-06-12T10:00:00.000Z" }, NOW);

    expect(readStoredFxRate(NOW)).toEqual({
      arsPerUsd: 1460,
      asOf: "2026-06-12T10:00:00.000Z",
      savedAt: NOW,
    });
  });

  it("expires a stored rate older than 72h", () => {
    const old = NOW - 73 * 3_600_000;
    writeStoredFxRate({ arsPerUsd: 1460, asOf: null }, old);

    expect(readStoredFxRate(NOW)).toBeNull();
  });

  it("rejects corrupted storage payloads", () => {
    window.localStorage.setItem("hotel-fx-last-known-rate", "{not json");
    expect(readStoredFxRate(NOW)).toBeNull();

    window.localStorage.setItem(
      "hotel-fx-last-known-rate",
      JSON.stringify({ arsPerUsd: "abc", savedAt: NOW }),
    );
    expect(readStoredFxRate(NOW)).toBeNull();
  });
});

describe("resolveFxRate", () => {
  it("returns the API rate and persists it as last-known-good", async () => {
    mockFetchResponses({
      ok: true,
      body: { active: true, arsPerUsd: 1460, stale: false, asOf: "2026-06-12T10:00:00.000Z" },
    });

    const resolved = await resolveFxRate();

    expect(resolved).toEqual({ arsPerUsd: 1460, stale: false, source: "api" });
    expect(readStoredFxRate(NOW)?.arsPerUsd).toBe(1460);
  });

  it("retries on network failure and succeeds on a later attempt", async () => {
    const mock = mockFetchResponses(new Error("network down"), {
      ok: true,
      body: { active: true, arsPerUsd: 1500, stale: false, asOf: null },
    });

    const pending = resolveFxRate();
    await vi.runAllTimersAsync();
    const resolved = await pending;

    expect(mock).toHaveBeenCalledTimes(2);
    expect(resolved).toEqual({ arsPerUsd: 1500, stale: false, source: "api" });
  });

  it("falls back to the stored rate when all attempts fail", async () => {
    writeStoredFxRate({ arsPerUsd: 1420, asOf: null }, NOW - 3_600_000);
    mockFetchResponses(
      new Error("down"),
      new Error("down"),
      new Error("down"),
    );

    const pending = resolveFxRate();
    await vi.runAllTimersAsync();
    const resolved = await pending;

    expect(resolved).toEqual({
      arsPerUsd: 1420,
      stale: true,
      source: "client-last-known-good",
    });
  });

  it("does not retry when the API answers with an inactive rate, and falls back", async () => {
    writeStoredFxRate({ arsPerUsd: 1410, asOf: null }, NOW - 3_600_000);
    const mock = mockFetchResponses({
      ok: true,
      body: { active: false, arsPerUsd: 0 },
    });

    const resolved = await resolveFxRate();

    expect(mock).toHaveBeenCalledTimes(1);
    expect(resolved?.source).toBe("client-last-known-good");
  });

  it("returns null when there is no API rate and no stored fallback", async () => {
    mockFetchResponses(new Error("down"), new Error("down"), new Error("down"));

    const pending = resolveFxRate();
    await vi.runAllTimersAsync();

    expect(await pending).toBeNull();
  });
});
