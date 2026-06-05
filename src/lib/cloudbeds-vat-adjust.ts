import { formatUsd } from "@/lib/currency";
import { VAT_RATE } from "@/lib/vat";

const STYLE_ID = "hotel-cloudbeds-iva-adjustments";
const VAT_PERCENT = Math.round(VAT_RATE * 100);

// Labels can carry a trailing colon (e.g. "Subtotal : ") in the shopping-cart
// summary, so allow optional trailing punctuation/whitespace.
const SUBTOTAL_PATTERN = /^\s*subtotal\s*[:：]?\s*$/i;
const TAX_PATTERN =
  /^\s*(?:impuestos(?:\s+y\s+tasas)?|taxes(?:\s+(?:and|&)\s+fees)?|iva|vat)\s*[:：]?\s*$/i;
const TOTAL_PATTERN = /^\s*total\s*[:：]?\s*$/i;
const DEPOSIT_PATTERN =
  /^\s*(?:dep[oó]sito|deposit|pagar\s+ahora|pay\s+now)\s*[:：]?\s*$/i;

const CONVERTED_VALUE_SELECTOR = "[data-hotel-currency-converted='true']";
const TAX_TESTID_SELECTOR = "[data-testid$='taxes-and-fees']";
const GRAND_TOTAL_TESTID_SELECTOR = "[data-testid$='grand-total']";
const SUBTOTAL_TESTID_SELECTOR = "[data-testid$='summary-total']";
const PRICE_LABEL_PATTERN = /(precio\s+desde|price\s+from)/i;
// Words that mark another summary line. We never hide a container that also
// holds one of these — it would remove the whole breakdown, not just the tax.
const SUMMARY_BOUNDARY_PATTERN = /subtotal|total|dep[oó]sito|deposit/i;

type LabeledRow = {
  labelEl: Element;
  row: Element;
  valueEl: Element | null;
};

/** Text contributed directly by an element, ignoring descendant elements. */
function directText(element: Element): string {
  let text = "";

  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent ?? "";
    }
  }

  return text;
}

export function injectCloudbedsIvaStyles(documentRef: Document = document) {
  if (documentRef.getElementById(STYLE_ID)) {
    return;
  }

  const style = documentRef.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    [data-hotel-iva-hidden="true"] {
      display: none !important;
    }

    .hotel-iva-note {
      color: #38645b;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.35;
      margin-top: 6px;
    }

    .hotel-iva-card-tag {
      color: #5f6e69;
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      margin-left: 6px;
      white-space: nowrap;
    }
  `;

  documentRef.head.appendChild(style);
}

function findPriceValueEl(row: Element, excludeEl: Element): Element | null {
  const converted = row.querySelectorAll(CONVERTED_VALUE_SELECTOR);

  for (const candidate of converted) {
    if (!excludeEl.contains(candidate) && !candidate.contains(excludeEl)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Finds the row for a summary line (Subtotal / Impuestos / Total) by locating
 * the smallest element whose own text matches the label, then ascending to a
 * container that also holds a price value.
 */
function findLabeledRow(
  root: ParentNode,
  labelPattern: RegExp,
): LabeledRow | null {
  const candidates = root.querySelectorAll<HTMLElement>("*");

  for (const element of candidates) {
    if (!labelPattern.test(directText(element).trim())) {
      continue;
    }

    let row: Element | null = element;

    for (let depth = 0; depth < 4 && row; depth += 1) {
      const valueEl = findPriceValueEl(row, element);

      if (valueEl) {
        return { labelEl: element, row, valueEl };
      }

      row = row.parentElement;
    }

    // Label found but no price located nearby; still return the row so callers
    // can hide it (the tax line may render its amount slightly later).
    return { labelEl: element, row: element, valueEl: null };
  }

  return null;
}

/** Smallest ancestor of `taxRow` that also contains a Subtotal label. */
function findSummaryRoot(taxRow: Element): Element | null {
  let ancestor: Element | null = taxRow;

  for (let depth = 0; depth < 6 && ancestor; depth += 1) {
    const hasSubtotal = Array.from(
      ancestor.querySelectorAll<HTMLElement>("*"),
    ).some((element) => SUBTOTAL_PATTERN.test(directText(element).trim()));

    if (hasSubtotal) {
      return ancestor;
    }

    ancestor = ancestor.parentElement;
  }

  return null;
}

function setGlobalIvaNote(
  documentRef: Document,
  exempt: boolean,
  container: Element | null,
) {
  const existing = Array.from(documentRef.querySelectorAll(".hotel-iva-note"));

  // Not exempt, or nowhere to anchor the note: remove any leftovers.
  if (!exempt || !container) {
    existing.forEach((note) => note.remove());
    return;
  }

  // Keep exactly one note, as a direct child of the current summary container;
  // drop any orphaned notes left behind by a Cloudbeds re-render.
  let kept = false;
  for (const note of existing) {
    if (!kept && note.parentElement === container) {
      kept = true;
    } else {
      note.remove();
    }
  }

  if (!kept) {
    const note = documentRef.createElement("p");
    note.className = "hotel-iva-note";
    note.dataset.noCurrencyConversion = "true";
    note.textContent = `IVA exento — residente en el exterior (no paga IVA ${VAT_PERCENT}%).`;
    container.appendChild(note);
  }
}

/** The converted price span within (or equal to) an element. */
function getConvertedSpan(element: Element | null): HTMLElement | null {
  if (!element) {
    return null;
  }

  if (element.matches(CONVERTED_VALUE_SELECTOR)) {
    return element as HTMLElement;
  }

  return element.querySelector<HTMLElement>(CONVERTED_VALUE_SELECTOR);
}

/** The price value element next to a label, ascending a few levels. */
function valueNearLabel(labelEl: Element): HTMLElement | null {
  let row: Element | null = labelEl;

  for (let depth = 0; depth < 4 && row; depth += 1) {
    const valueEl = findPriceValueEl(row, labelEl);

    if (valueEl) {
      return valueEl as HTMLElement;
    }

    row = row.parentElement;
  }

  return null;
}

/**
 * The largest ancestor of the tax value that does NOT also contain another
 * summary line (Subtotal / Total / Deposit) — i.e. the isolated tax row, safe
 * to hide. Bounded by label text rather than price-span counts, so it never
 * over-climbs and hides the whole breakdown during a partial render.
 */
function taxRowToHide(valueEl: Element, body: Element): Element {
  let node: Element = valueEl;

  while (node.parentElement && node.parentElement !== body) {
    const parent = node.parentElement;

    if (SUMMARY_BOUNDARY_PATTERN.test(parent.textContent ?? "")) {
      break;
    }

    node = parent;
  }

  return node;
}

function storeOriginalText(element: HTMLElement) {
  if (element.dataset.hotelIvaOrigText === undefined) {
    element.dataset.hotelIvaOrigText = element.textContent ?? "";
  }
}

function setValueText(element: HTMLElement, text: string) {
  storeOriginalText(element);

  if (element.textContent !== text) {
    element.textContent = text;
  }
}

function restoreValue(element: HTMLElement) {
  if (element.dataset.hotelIvaOrigText !== undefined) {
    element.textContent = element.dataset.hotelIvaOrigText;
    delete element.dataset.hotelIvaOrigText;
  }
}

function adjustSummary(documentRef: Document, fromArgentina: boolean) {
  const body = documentRef.body;

  // Clear any previous hide flags first, so a stale/over-broad hide from an
  // earlier partial render can never persist. We re-apply the correct ones
  // below within the same synchronous pass (no visible flicker).
  for (const hidden of documentRef.querySelectorAll(
    "[data-hotel-iva-hidden='true']",
  )) {
    hidden.removeAttribute("data-hotel-iva-hidden");
  }

  // --- Tax value elements (label-based + data-testid-based) ---
  const taxValueEls = new Set<HTMLElement>();
  const taxLabelRow = findLabeledRow(body, TAX_PATTERN);

  if (taxLabelRow?.valueEl) {
    taxValueEls.add(taxLabelRow.valueEl as HTMLElement);
  }

  for (const el of documentRef.querySelectorAll(TAX_TESTID_SELECTOR)) {
    const span = getConvertedSpan(el);

    if (span) {
      taxValueEls.add(span);
    }
  }

  // --- Net (subtotal) value: label first, then testid fallback ---
  const netEl =
    (findLabeledRow(body, SUBTOTAL_PATTERN)?.valueEl as HTMLElement | null) ??
    getConvertedSpan(documentRef.querySelector(SUBTOTAL_TESTID_SELECTOR));

  if (taxValueEls.size === 0 || !netEl) {
    setGlobalIvaNote(documentRef, false, null);
    return;
  }

  // --- Gross total elements: "Total" label (scoped) + grand-total testid ---
  const grossEls = new Set<HTMLElement>();
  const firstTaxEl = [...taxValueEls][0];
  const summaryRoot = findSummaryRoot(firstTaxEl) ?? body;
  const totalRow = findLabeledRow(summaryRoot, TOTAL_PATTERN);

  if (totalRow?.valueEl) {
    grossEls.add(totalRow.valueEl as HTMLElement);
  }

  for (const el of documentRef.querySelectorAll(GRAND_TOTAL_TESTID_SELECTOR)) {
    const span = getConvertedSpan(el);

    if (span) {
      grossEls.add(span);
    }
  }

  // --- Deposit / payment-schedule value (scaled proportionally) ---
  const depositRow = findLabeledRow(body, DEPOSIT_PATTERN);
  const depositEl = depositRow?.labelEl
    ? valueNearLabel(depositRow.labelEl)
    : null;

  const netUsd = parseUsdValue(netEl);

  if (!fromArgentina) {
    // Resident abroad: hide every IVA line, drop totals to the net subtotal,
    // and scale the deposit proportionally to the gross→net reduction.
    for (const taxEl of taxValueEls) {
      taxRowToHide(taxEl, body).setAttribute("data-hotel-iva-hidden", "true");
    }

    const netText = netEl.textContent ?? "";
    const firstGrossEl = grossEls.size > 0 ? [...grossEls][0] : null;

    for (const grossEl of grossEls) {
      if (grossEl !== netEl) {
        setValueText(grossEl, netText);
      }
    }

    // Scale the deposit using the gross→net ratio derived from the gross total
    // value, not from net+tax. This avoids a 1-cent rounding drift caused by
    // individually-rounded USD amounts not summing exactly.
    if (depositEl && netUsd !== null && firstGrossEl) {
      const grossOrigUsd = parseUsdValue({
        textContent: firstGrossEl.dataset.hotelIvaOrigText ?? firstGrossEl.textContent ?? "",
      } as Element);
      const depositOrigUsd = parseUsdValue({
        textContent: depositEl.dataset.hotelIvaOrigText ?? depositEl.textContent ?? "",
      } as Element);

      if (grossOrigUsd !== null && grossOrigUsd > 0 && depositOrigUsd !== null) {
        setValueText(depositEl, formatUsd(depositOrigUsd / grossOrigUsd * netUsd));
      }
    }

    setGlobalIvaNote(documentRef, true, summaryRoot);
    return;
  }

  // Argentine resident: restore Cloudbeds' default IVA-inclusive view.
  // (Hide flags were already cleared at the top of this function.)
  for (const grossEl of grossEls) {
    restoreValue(grossEl);
  }

  if (depositEl) {
    restoreValue(depositEl);
  }

  setGlobalIvaNote(documentRef, false, null);
}

function annotateRoomCards(documentRef: Document, fromArgentina: boolean) {
  const tagText = fromArgentina ? `+ IVA ${VAT_PERCENT}%` : "IVA exento";
  const labels = documentRef.querySelectorAll<HTMLElement>("*");

  for (const element of labels) {
    if (!PRICE_LABEL_PATTERN.test(directText(element).trim())) {
      continue;
    }

    const host = element.parentElement ?? element;

    if (host.closest("[data-hotel-iva-hidden='true']")) {
      continue;
    }

    let tag = host.querySelector<HTMLElement>(":scope > .hotel-iva-card-tag");

    if (!tag) {
      tag = documentRef.createElement("span");
      tag.className = "hotel-iva-card-tag";
      tag.dataset.noCurrencyConversion = "true";
      element.after(tag);
    }

    if (tag.textContent !== tagText) {
      tag.textContent = tagText;
    }
  }
}

function parseUsdValue(element: Element | null): number | null {
  const text = element?.textContent ?? "";
  const cleaned = text.replace(/[^\d.,-]/g, "");

  if (!cleaned) {
    return null;
  }

  const numeric = Number(cleaned.replace(/,/g, ""));

  return Number.isFinite(numeric) ? numeric : null;
}

/**
 * Reads the converted (USD) Subtotal and IVA amounts from the booking summary,
 * regardless of the current VAT-display mode. Returns null until the summary
 * has rendered and prices have been converted. Used to snapshot the purchase.
 */
export function readCloudbedsSummaryUsd(
  documentRef: Document = document,
): { subtotalUsd: number; taxUsd: number | null } | null {
  const netEl =
    (findLabeledRow(documentRef.body, SUBTOTAL_PATTERN)
      ?.valueEl as HTMLElement | null) ??
    getConvertedSpan(documentRef.querySelector(SUBTOTAL_TESTID_SELECTOR));
  const subtotalUsd = parseUsdValue(netEl);

  if (subtotalUsd === null) {
    return null;
  }

  const taxEl =
    (findLabeledRow(documentRef.body, TAX_PATTERN)
      ?.valueEl as HTMLElement | null) ??
    getConvertedSpan(documentRef.querySelector(TAX_TESTID_SELECTOR));
  // The tax row is only display-hidden in exempt mode; its value text is intact.
  const taxUsd = parseUsdValue({
    textContent: taxEl?.dataset?.hotelIvaOrigText ?? taxEl?.textContent ?? "",
  } as Element);

  return { subtotalUsd, taxUsd };
}

export function applyCloudbedsVatDisplay(
  fromArgentina: boolean,
  documentRef: Document = document,
) {
  injectCloudbedsIvaStyles(documentRef);

  try {
    adjustSummary(documentRef, fromArgentina);
    annotateRoomCards(documentRef, fromArgentina);
  } catch (error) {
    console.warn("Cloudbeds VAT display adjustment failed.", error);
  }
}
