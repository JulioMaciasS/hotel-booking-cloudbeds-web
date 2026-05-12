const STYLE_ID = "hotel-hide-cloudbeds-currency-controls";
const CONTROL_SELECTOR = [
  "button",
  "[role='button']",
  "select",
  "[aria-label]",
  "[title]",
  "[data-testid]",
].join(",");

const CURRENCY_CONTROL_PATTERN =
  /(currency|moneda|divisa|selector de moneda|seleccionar moneda|currency selector)/i;

function injectCurrencyHiderStyles(documentRef: Document) {
  if (documentRef.getElementById(STYLE_ID)) {
    return;
  }

  const style = documentRef.createElement("style");
  style.id = STYLE_ID;
  style.dataset.cbImmersiveExperienceRoot = "true";
  style.textContent = `
    :is(#cb-bookingengine, .cb-bookingengine-root, .cb-portal)
      :is([aria-label*="currency" i], [aria-label*="moneda" i], [title*="currency" i], [title*="moneda" i], [data-testid*="currency" i]) {
      display: none !important;
    }

    [data-hotel-currency-selector-hidden="true"] {
      display: none !important;
    }
  `;

  documentRef.head.appendChild(style);
}

function getElementSignature(element: Element) {
  return [
    element.getAttribute("aria-label"),
    element.getAttribute("title"),
    element.getAttribute("data-testid"),
    element.getAttribute("class"),
    element.tagName.toLowerCase() === "select" ? element.textContent : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function hideCloudbedsCurrencyControls(documentRef: Document = document) {
  injectCurrencyHiderStyles(documentRef);

  const candidates = documentRef.querySelectorAll(CONTROL_SELECTOR);

  for (const element of candidates) {
    if (element.closest("[data-hotel-currency-converted='true']")) {
      continue;
    }

    const signature = getElementSignature(element);

    if (!CURRENCY_CONTROL_PATTERN.test(signature)) {
      continue;
    }

    element.setAttribute("data-hotel-currency-selector-hidden", "true");
    element.setAttribute("hidden", "");
  }
}
