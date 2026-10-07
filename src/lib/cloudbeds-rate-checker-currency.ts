import { convertArsToUsd, formatUsd, parseArsMoney } from "@/lib/currency";

export const RATE_CHECKER_SELECTOR = ".cb-rate-checker";
const BODY_SELECTOR = "[data-testid='rate-checker-body']";
// Observed vendor markup: each quote row has a label <p> followed by a price
// <p>. The injected display is a sibling <span>, never a replacement or parent
// of the native React text node. No generated Cloudbeds CSS classes are used.
const NATIVE_PRICE_SELECTOR = "div > p[data-be-text='true'] + p[data-be-text='true']";
const DISPLAY_SELECTOR = "[data-hotel-rate-checker-display='true']";
const STYLE_ID = "hotel-rate-checker-currency";
const displays = new WeakMap<Element, HTMLElement>();
const sources = new WeakMap<Element, HTMLElement>();

export function injectRateCheckerCurrencyStyles(documentRef: Document = document) {
  if (documentRef.getElementById(STYLE_ID)) return;
  const style = documentRef.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    ${RATE_CHECKER_SELECTOR} ${BODY_SELECTOR} ${NATIVE_PRICE_SELECTOR} {
      display: none !important;
    }
    ${RATE_CHECKER_SELECTOR} ${BODY_SELECTOR}:not([data-hotel-rate-checker-ready="true"]) {
      visibility: hidden;
    }
    ${RATE_CHECKER_SELECTOR}:has(${BODY_SELECTOR}:not([data-hotel-rate-checker-ready="true"]))::after {
      content: "USD…";
      display: block;
      padding: 12px;
      text-align: center;
    }
  `;
  documentRef.head.appendChild(style);
}

/** Scope this fix to the comparator. Calendar/cards/cart keep their converter. */
export function convertRateCheckerPrices(
  arsPerUsd: number,
  convertedLabel: (value: string, original: string) => string,
  documentRef: Document = document,
) {
  injectRateCheckerCurrencyStyles(documentRef);
  for (const body of documentRef.querySelectorAll<HTMLElement>(
    `${RATE_CHECKER_SELECTOR} ${BODY_SELECTOR}`,
  )) {
    for (const stale of body.querySelectorAll<HTMLElement>(DISPLAY_SELECTOR)) {
      const source = sources.get(stale);
      if (!source?.isConnected || source.parentElement !== stale.parentElement) {
        stale.remove();
      }
    }

    const priceElements = body.querySelectorAll<HTMLElement>(NATIVE_PRICE_SELECTOR);
    let ready = priceElements.length > 0;
    for (const source of priceElements) {
      const original = source.textContent?.trim() ?? "";
      const converted = convertArsToUsd(parseArsMoney(original), arsPerUsd);
      let display = displays.get(source);
      if (!display || display.parentElement !== source.parentElement) {
        display?.remove();
        display = documentRef.createElement("span");
        display.dataset.hotelRateCheckerDisplay = "true";
        display.dataset.noCurrencyConversion = "true";
        displays.set(source, display);
        sources.set(display, source);
        source.after(display);
      }
      // Preserve vendor styling but do not inherit its React-managed text.
      display.className = source.className;
      source.setAttribute("aria-hidden", "true");
      const value = converted === null ? "USD —" : formatUsd(converted);
      if (display.textContent !== value) display.textContent = value;
      display.setAttribute("aria-label", convertedLabel(value, original));
      display.dataset.originalCurrencyText = original;
      display.dataset.arsPerUsd = String(arsPerUsd);
      // Invalid/partial vendor prices fail closed; never keep an old quote or
      // expose ARS while a category/date change is still rendering.
      ready &&= converted !== null;
    }
    body.dataset.hotelRateCheckerReady = String(ready);
  }
}
