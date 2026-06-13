import { describe, expect, it } from "vitest";
import {
  convertArsToUsd,
  formatUsd,
  formatUsdWhole,
  isCalendarRateTextNode,
  parseCloudbedsArsMoney,
  parseArsMoney,
  shouldConvertTextNode,
} from "./currency";

describe("parseArsMoney", () => {
  it("parses Argentine thousands and decimal formats", () => {
    expect(parseArsMoney("ARS 120.000")).toBe(120000);
    expect(parseArsMoney("$ 240.000,50")).toBe(240000.5);
    expect(parseArsMoney("AR$ 1.200.000")).toBe(1200000);
    expect(parseArsMoney("120.000 ARS")).toBe(120000);
    expect(parseArsMoney("ARS 120k")).toBe(120000);
    expect(parseArsMoney("$120000")).toBe(120000);
  });

  it("rejects invalid or non-ARS values", () => {
    expect(parseArsMoney("USD 100.00")).toBeNull();
    expect(parseArsMoney("US$ 100")).toBeNull();
    expect(parseArsMoney("sin precio")).toBeNull();
    expect(parseArsMoney("ARS")).toBeNull();
    expect(parseArsMoney("ARS -120.000")).toBeNull();
    expect(parseArsMoney("120.000")).toBeNull();
    expect(parseArsMoney("100k")).toBeNull();
  });
});

describe("parseCloudbedsArsMoney", () => {
  it("parses Cloudbeds abbreviated ARS prices without a currency marker", () => {
    expect(parseCloudbedsArsMoney("100k")).toBe(100000);
    expect(parseCloudbedsArsMoney("100 K")).toBe(100000);
    expect(parseCloudbedsArsMoney("71,5k")).toBe(71500);
  });

  it("parses bare Cloudbeds numeric prices only when allowed by DOM context", () => {
    expect(
      parseCloudbedsArsMoney("277,700,600.00", { allowBareNumber: true }),
    ).toBe(277700.6);
    expect(
      parseCloudbedsArsMoney("305.470.660,00", { allowBareNumber: true }),
    ).toBe(305470.66);
    expect(
      parseCloudbedsArsMoney("1,200,000.00", { allowBareNumber: true }),
    ).toBe(1200000);
    expect(parseCloudbedsArsMoney("277,700,600.00")).toBeNull();
  });

  it("normalizes scaled explicit ARS values only for Cloudbeds price contexts", () => {
    expect(parseCloudbedsArsMoney("ARS 277,700,600.00")).toBe(277700600);
    expect(
      parseCloudbedsArsMoney("ARS 277,700,600.00", {
        normalizeScaledAmount: true,
      }),
    ).toBe(277700.6);
  });

  it("still rejects unrelated or USD values", () => {
    expect(parseCloudbedsArsMoney("100")).toBeNull();
    expect(parseCloudbedsArsMoney("USD 100k")).toBeNull();
  });

  it("rejects bare digit runs without a separator or decimals, even in price contexts", () => {
    // Years / IDs must never convert, regardless of DOM context.
    expect(parseCloudbedsArsMoney("2026", { allowBareNumber: true })).toBeNull();
    expect(
      parseCloudbedsArsMoney("123456", { allowBareNumber: true }),
    ).toBeNull();
    // The same magnitude WITH a price signal still parses.
    expect(
      parseCloudbedsArsMoney("123.456", { allowBareNumber: true }),
    ).toBe(123456);
    expect(
      parseCloudbedsArsMoney("123456.00", { allowBareNumber: true }),
    ).toBe(123456);
  });

  it("bounds the /1000 unscaling to plausible prices", () => {
    // Just under the threshold: taken at face value.
    expect(
      parseCloudbedsArsMoney("99,999,999.00", { allowBareNumber: true }),
    ).toBe(99999999);
    // Past the threshold: unscaled back into a plausible price.
    expect(
      parseCloudbedsArsMoney("100,000,100.00", { allowBareNumber: true }),
    ).toBe(100000.1);
    // Still past the threshold after unscaling: not a price — rejected.
    expect(
      parseCloudbedsArsMoney("100,000,000,000,000.00", {
        allowBareNumber: true,
      }),
    ).toBeNull();
    expect(
      parseCloudbedsArsMoney("ARS 100,000,000,000,000.00", {
        normalizeScaledAmount: true,
      }),
    ).toBeNull();
  });
});

describe("convertArsToUsd", () => {
  it("converts ARS amounts with the hotel rate", () => {
    expect(convertArsToUsd(120000, 1400)).toBeCloseTo(85.714285);
    expect(convertArsToUsd(240000.5, 1400)).toBeCloseTo(171.428928);
  });

  it("rejects invalid conversion inputs", () => {
    expect(convertArsToUsd(null, 1400)).toBeNull();
    expect(convertArsToUsd(120000, 0)).toBeNull();
    expect(convertArsToUsd(Number.NaN, 1400)).toBeNull();
  });
});

describe("formatUsd", () => {
  it("formats with a dollar sign and two decimals", () => {
    expect(formatUsd(100)).toBe("$100.00");
    expect(formatUsd(1200.5)).toBe("$1,200.50");
  });
});

describe("formatUsdWhole", () => {
  it("rounds to whole dollars with no decimals", () => {
    expect(formatUsdWhole(38.97)).toBe("$39");
    expect(formatUsdWhole(36)).toBe("$36");
    expect(formatUsdWhole(36.004)).toBe("$36");
    expect(formatUsdWhole(1234.56)).toBe("$1,235");
  });

  it("handles non-finite input", () => {
    expect(formatUsdWhole(Number.NaN)).toBe("$0");
  });
});

describe("isCalendarRateTextNode", () => {
  it("detects prices inside calendar day cells, not room/summary prices", () => {
    const cell = document.createElement("p");
    cell.setAttribute("data-testid", "day-2026-06-12-lowest-rate-56550");
    const calendarNode = document.createTextNode("56.5 K");
    cell.append(calendarNode);

    const roomPrice = document.createElement("p");
    roomPrice.className = "cb-rate-plan-price";
    const roomNode = document.createTextNode("ARS 120.000");
    roomPrice.append(roomNode);

    expect(isCalendarRateTextNode(calendarNode)).toBe(true);
    expect(isCalendarRateTextNode(roomNode)).toBe(false);
  });
});

describe("shouldConvertTextNode", () => {
  it("accepts ARS text nodes", () => {
    const container = document.createElement("div");
    const textNode = document.createTextNode("Desde ARS 120.000");

    container.append(textNode);

    expect(shouldConvertTextNode(textNode)).toBe(true);
  });

  it("accepts abbreviated k prices only inside Cloudbeds nodes", () => {
    const cloudbedsRoot = document.createElement("cb-property-date-picker");
    const cloudbedsTextNode = document.createTextNode("100k");
    const regularContainer = document.createElement("div");
    const regularTextNode = document.createTextNode("100k");

    cloudbedsRoot.append(cloudbedsTextNode);
    regularContainer.append(regularTextNode);

    expect(shouldConvertTextNode(cloudbedsTextNode)).toBe(true);
    expect(shouldConvertTextNode(regularTextNode)).toBe(false);
  });

  it("accepts bare numeric price text inside Cloudbeds price contexts", () => {
    const cloudbedsRoot = document.createElement("cb-immersive-experience");
    const price = document.createElement("p");
    const priceTextNode = document.createTextNode("277,700,600.00");
    const year = document.createElement("p");
    const yearTextNode = document.createTextNode("2026");

    price.className = "cb-rate-plan-price";
    price.append(priceTextNode);
    year.append(yearTextNode);
    cloudbedsRoot.append(price, year);

    expect(shouldConvertTextNode(priceTextNode)).toBe(true);
    expect(shouldConvertTextNode(yearTextNode)).toBe(false);
  });

  it("skips converted nodes and non-price text", () => {
    const converted = document.createElement("span");
    const convertedText = document.createTextNode("ARS 120.000");

    converted.dataset.hotelCurrencyConverted = "true";
    converted.append(convertedText);

    expect(shouldConvertTextNode(convertedText)).toBe(false);
    expect(shouldConvertTextNode(document.createTextNode("Habitacion"))).toBe(
      false,
    );
  });
});
