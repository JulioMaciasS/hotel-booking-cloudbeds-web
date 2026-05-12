import { describe, expect, it } from "vitest";
import {
  convertArsToUsd,
  formatUsd,
  parseArsMoney,
  shouldConvertTextNode,
} from "./currency";

describe("parseArsMoney", () => {
  it("parses Argentine thousands and decimal formats", () => {
    expect(parseArsMoney("ARS 120.000")).toBe(120000);
    expect(parseArsMoney("$ 240.000,50")).toBe(240000.5);
    expect(parseArsMoney("AR$ 1.200.000")).toBe(1200000);
    expect(parseArsMoney("$120000")).toBe(120000);
  });

  it("rejects invalid or non-ARS values", () => {
    expect(parseArsMoney("USD 100.00")).toBeNull();
    expect(parseArsMoney("US$ 100")).toBeNull();
    expect(parseArsMoney("sin precio")).toBeNull();
    expect(parseArsMoney("ARS")).toBeNull();
    expect(parseArsMoney("ARS -120.000")).toBeNull();
  });
});

describe("convertArsToUsd", () => {
  it("converts ARS amounts with the hotel rate", () => {
    expect(convertArsToUsd(120000, 1200)).toBe(100);
    expect(convertArsToUsd(240000.5, 1200)).toBeCloseTo(200.000416);
  });

  it("rejects invalid conversion inputs", () => {
    expect(convertArsToUsd(null, 1200)).toBeNull();
    expect(convertArsToUsd(120000, 0)).toBeNull();
    expect(convertArsToUsd(Number.NaN, 1200)).toBeNull();
  });
});

describe("formatUsd", () => {
  it("formats with an explicit USD code and two decimals", () => {
    expect(formatUsd(100)).toBe("USD 100.00");
    expect(formatUsd(1200.5)).toBe("USD 1,200.50");
  });
});

describe("shouldConvertTextNode", () => {
  it("accepts ARS text nodes", () => {
    const container = document.createElement("div");
    const textNode = document.createTextNode("Desde ARS 120.000");

    container.append(textNode);

    expect(shouldConvertTextNode(textNode)).toBe(true);
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
