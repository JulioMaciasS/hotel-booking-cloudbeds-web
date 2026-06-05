import { publicConfig } from "@/lib/config";

const CLOUDBEDS_ROOT_SELECTOR = [
  "cb-property-date-picker",
  "cb-immersive-experience",
  "#cb-bookingengine",
  ".cb-bookingengine-root",
  ".cb-portal",
  ".chakra-portal",
].join(",");

/**
 * Rewrites Cloudbeds currency *labels* (e.g. "Precio en ARS") from the base
 * currency code to the display currency code, to match the prices that
 * BookingPriceObserver visually converts to USD. Only touches text nodes that
 * are labels (no digits), inside the Cloudbeds widgets, and not already a
 * converted price span. Idempotent: once relabelled there is no base code left.
 */
export function relabelCloudbedsCurrencyText(documentRef: Document = document) {
  const base = publicConfig.baseCurrency;
  const display = publicConfig.displayCurrency;

  if (!base || base === display) {
    return;
  }

  const pattern = new RegExp(`\\b${base}\\b`, "g");
  const walker = documentRef.createTreeWalker(
    documentRef.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const text = node.textContent ?? "";

        if (!text.includes(base) || /\d/.test(text)) {
          return NodeFilter.FILTER_REJECT;
        }

        const parent = node.parentElement;

        if (
          !parent ||
          !parent.closest(CLOUDBEDS_ROOT_SELECTOR) ||
          parent.closest("[data-hotel-currency-converted='true']")
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );

  const nodes: Text[] = [];
  let next = walker.nextNode();

  while (next) {
    nodes.push(next as Text);
    next = walker.nextNode();
  }

  for (const node of nodes) {
    const text = node.textContent ?? "";
    const replaced = text.replace(pattern, display);

    if (replaced !== text) {
      node.textContent = replaced;
    }
  }
}
