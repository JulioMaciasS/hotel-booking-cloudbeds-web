import { beforeEach, describe, expect, it } from "vitest";
import {
  convertRateCheckerPrices,
  injectRateCheckerCurrencyStyles,
} from "./cloudbeds-rate-checker-currency";

const label = (usd: string, original: string) => `${usd} from ${original}`;
const quotes = () => document.querySelectorAll<HTMLElement>(
  "[data-hotel-rate-checker-display='true']",
);
function render() {
  document.body.innerHTML = `
    <cb-immersive-experience><p id="card-price">ARS 82,620.00</p></cb-immersive-experience>
    <div class="cb-rate-checker"><div data-testid="rate-checker-body">
      <div><p data-be-text="true">Tarifa directa</p><p id="direct" data-be-text="true">ARS 136,554.34</p></div>
      <div><p data-be-text="true">Google Hotel Search</p><p id="google" data-be-text="true">ARS 165,240.00</p></div>
      <p data-be-text="true">Estos precios pueden incluir impuestos</p>
    </div></div>`;
  return document.getElementById("direct")!;
}

describe("isolated rate checker currency display", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.getElementById("hotel-rate-checker-currency")?.remove();
  });

  it("preserves the exact vendor text node and its parent", () => {
    const source = render();
    const native = source.firstChild!;
    convertRateCheckerPrices(1530, label, document);
    expect(source.firstChild).toBe(native);
    expect(native.isConnected).toBe(true);
    expect(native.parentNode).toBe(source);
    expect(source.textContent).toBe("ARS 136,554.34");
    expect(quotes()[0].textContent).toBe("$89.25");
    expect(source.getAttribute("aria-hidden")).toBe("true");
    expect(getComputedStyle(source).display).toBe("none");
  });

  it("refreshes the display when Cloudbeds updates the retained text node", () => {
    const source = render();
    const native = source.firstChild!;
    convertRateCheckerPrices(1530, label, document);
    const mirror = quotes()[0];
    native.nodeValue = "ARS 218,486.94";
    convertRateCheckerPrices(1530, label, document);
    expect(quotes()[0]).toBe(mirror);
    expect(mirror.textContent).toBe("$142.80");
    expect(mirror.getAttribute("aria-label")).toBe("$142.80 from ARS 218,486.94");
    expect(native.isConnected).toBe(true);
  });

  it("does not touch prices outside the comparator or alter the selected quote", () => {
    render();
    const cardNode = document.getElementById("card-price")!.firstChild;
    convertRateCheckerPrices(1530, label, document);
    convertRateCheckerPrices(1530, label, document);
    expect(quotes()).toHaveLength(2);
    expect(document.getElementById("card-price")!.firstChild).toBe(cardNode);
    expect(cardNode!.textContent).toBe("ARS 82,620.00");
    expect(quotes()[1].textContent).toBe("$108.00");
  });

  it("hides native prices before FX is ready and never retains an invalid stale quote", () => {
    const source = render();
    injectRateCheckerCurrencyStyles(document);
    expect(getComputedStyle(source).display).toBe("none");
    convertRateCheckerPrices(1530, label, document);
    source.firstChild!.nodeValue = "—";
    convertRateCheckerPrices(1530, label, document);
    expect(quotes()[0].textContent).toBe("USD —");
    expect(document.querySelector("[data-testid='rate-checker-body']")!.getAttribute(
      "data-hotel-rate-checker-ready",
    )).toBe("false");
  });

  it("cleans up displays when the vendor replaces a price element", () => {
    const source = render();
    convertRateCheckerPrices(1530, label, document);
    const replacement = document.createElement("p");
    replacement.dataset.beText = "true";
    replacement.textContent = "ARS 177,520.64";
    source.replaceWith(replacement);
    convertRateCheckerPrices(1530, label, document);
    expect(quotes()).toHaveLength(2);
    expect(quotes()[0].textContent).toBe("$116.03");
    expect(replacement.firstChild!.isConnected).toBe(true);
  });
});
