// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  reportFxDiagnostic,
  resetFxDiagnosticsForTests,
} from "./fx-diagnostics";

beforeEach(() => {
  resetFxDiagnosticsForTests();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("reportFxDiagnostic", () => {
  it("always logs to the console", () => {
    reportFxDiagnostic("rate-unavailable", { foo: 1 });

    expect(console.warn).toHaveBeenCalledWith(
      "[fx-diagnostics] rate-unavailable",
      { foo: 1 },
    );
  });

  it("rate-limits each event type per page load", () => {
    for (let i = 0; i < 10; i += 1) {
      reportFxDiagnostic("rate-stale", { i });
    }

    expect(console.warn).toHaveBeenCalledTimes(3);

    // A different type has its own budget.
    reportFxDiagnostic("rate-unavailable", {});
    expect(console.warn).toHaveBeenCalledTimes(4);
  });

  it("does not beacon when the env toggle is off", () => {
    const sendBeacon = vi.fn();
    vi.stubGlobal("navigator", { ...navigator, sendBeacon });

    reportFxDiagnostic("rate-unavailable", {});

    expect(sendBeacon).not.toHaveBeenCalled();
  });

  it("beacons to /api/fx-diagnostics when enabled", () => {
    vi.stubEnv("NEXT_PUBLIC_FX_DIAGNOSTICS", "on");
    const sendBeacon = vi.fn();
    vi.stubGlobal("navigator", { ...navigator, sendBeacon });

    reportFxDiagnostic("custom-field-missing", { missing: ["cf_x"] });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const [url, payload] = sendBeacon.mock.calls[0] as [string, string];
    expect(url).toBe("/api/fx-diagnostics");
    expect(JSON.parse(payload)).toMatchObject({
      type: "custom-field-missing",
      detail: { missing: ["cf_x"] },
    });
  });

  it("falls back to fetch keepalive when sendBeacon is unavailable", () => {
    vi.stubEnv("NEXT_PUBLIC_FX_DIAGNOSTICS", "on");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("navigator", { ...navigator, sendBeacon: undefined });
    vi.stubGlobal("fetch", fetchMock);

    reportFxDiagnostic("vat-not-applied", {});

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/fx-diagnostics",
      expect.objectContaining({ method: "POST", keepalive: true }),
    );
  });

  it("never throws when the transport fails", () => {
    vi.stubEnv("NEXT_PUBLIC_FX_DIAGNOSTICS", "on");
    vi.stubGlobal("navigator", {
      ...navigator,
      sendBeacon: () => {
        throw new Error("boom");
      },
    });

    expect(() => reportFxDiagnostic("rate-fallback-used", {})).not.toThrow();
  });
});
