import { afterEach, describe, expect, it, vi } from "vitest";
import {
  VAT_CHANGE_EVENT,
  VAT_PREFERENCE_STORAGE_KEY,
  getFromArgentina,
  isArgentinaByLocale,
  readVatPreference,
  writeVatPreference,
} from "./vat";

function mockTimeZone(timeZone: string) {
  vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
    () =>
      ({
        resolvedOptions: () => ({ timeZone }) as Intl.ResolvedDateTimeFormatOptions,
      }) as Intl.DateTimeFormat,
  );
}

function mockLanguages(languages: string[]) {
  vi.spyOn(navigator, "languages", "get").mockReturnValue(languages);
  vi.spyOn(navigator, "language", "get").mockReturnValue(languages[0] ?? "");
}

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("vat preference storage", () => {
  it("round-trips the stored preference", () => {
    writeVatPreference(true);
    expect(window.localStorage.getItem(VAT_PREFERENCE_STORAGE_KEY)).toBe("true");
    expect(readVatPreference()).toBe(true);

    writeVatPreference(false);
    expect(readVatPreference()).toBe(false);
  });

  it("returns null when nothing valid is stored", () => {
    expect(readVatPreference()).toBeNull();
    window.localStorage.setItem(VAT_PREFERENCE_STORAGE_KEY, "maybe");
    expect(readVatPreference()).toBeNull();
  });

  it("dispatches a change event with the new value", () => {
    const handler = vi.fn();
    window.addEventListener(VAT_CHANGE_EVENT, handler);

    writeVatPreference(true);

    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0] as CustomEvent<{
      fromArgentina: boolean;
    }>;
    expect(event.detail.fromArgentina).toBe(true);

    window.removeEventListener(VAT_CHANGE_EVENT, handler);
  });
});

describe("isArgentinaByLocale", () => {
  it("detects an Argentine timezone", () => {
    mockTimeZone("America/Argentina/Buenos_Aires");
    mockLanguages(["en-US"]);
    expect(isArgentinaByLocale()).toBe(true);
  });

  it("falls back to an es-AR locale", () => {
    mockTimeZone("America/New_York");
    mockLanguages(["es-AR", "es"]);
    expect(isArgentinaByLocale()).toBe(true);
  });

  it("returns false for non-Argentine timezone and locale", () => {
    mockTimeZone("Europe/Madrid");
    mockLanguages(["es-ES"]);
    expect(isArgentinaByLocale()).toBe(false);
  });
});

describe("getFromArgentina", () => {
  it("prefers the stored choice over locale detection", () => {
    mockTimeZone("America/Argentina/Cordoba");
    mockLanguages(["es-AR"]);
    writeVatPreference(false);
    expect(getFromArgentina()).toBe(false);
  });

  it("uses locale detection when no choice is stored", () => {
    mockTimeZone("America/Argentina/Cordoba");
    mockLanguages(["es-AR"]);
    expect(getFromArgentina()).toBe(true);
  });
});
