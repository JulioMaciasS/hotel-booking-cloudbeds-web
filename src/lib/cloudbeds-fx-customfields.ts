import {
  cloudbedsBookingCustomFieldAliases,
  cloudbedsFxCustomFields,
} from "@/lib/config";
import { readCloudbedsBeddingPreference } from "@/lib/cloudbeds-bedding-selector";
import { readCloudbedsSummaryUsd } from "@/lib/cloudbeds-vat-adjust";
import { reportFxDiagnostic } from "@/lib/fx-diagnostics";
import { VAT_RATE } from "@/lib/vat";

const STYLE_ID = "hotel-cloudbeds-fx-field-adjustments";

function injectFieldStyles(documentRef: Document) {
  if (documentRef.getElementById(STYLE_ID)) {
    return;
  }

  const style = documentRef.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    [data-hotel-fx-field-hidden="true"] {
      display: none !important;
    }
  `;
  documentRef.head.appendChild(style);
}

function formatArs(amount: number): string {
  return Math.round(amount).toString();
}

function formatUsdValue(amount: number): string {
  return amount.toFixed(2);
}

function formatRate(amount: number): string {
  return Number.isInteger(amount) ? amount.toString() : amount.toFixed(2);
}

type FieldControl =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

/** Resolves a select value to a real option (by value, then by visible text). */
function resolveSelectValue(
  select: HTMLSelectElement,
  value: string,
): string | null {
  const target = value.trim().toLowerCase();

  for (const option of select.options) {
    if (option.value.trim().toLowerCase() === target) {
      return option.value;
    }
  }

  for (const option of select.options) {
    if ((option.textContent ?? "").trim().toLowerCase() === target) {
      return option.value;
    }
  }

  return null;
}

/** Sets a value on a (possibly React-controlled) control and fires change events. */
function setNativeValue(element: FieldControl, value: string) {
  const resolved =
    element instanceof HTMLSelectElement
      ? resolveSelectValue(element, value)
      : value;

  if (resolved === null) {
    return;
  }

  const prototype = Object.getPrototypeOf(element) as object;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");

  if (descriptor?.set) {
    descriptor.set.call(element, resolved);
  } else {
    element.value = resolved;
  }

  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

/**
 * Locates a custom-field control by its internal name. Cloudbeds renders the
 * field's "Nombre interno" as the input `name` and as
 * `data-testid="form-custom-field-<name>-input"`, both of which are stable and
 * unique (unlike the display label, which the hotel can mislabel/duplicate).
 */
function findFieldControl(
  documentRef: Document,
  fieldName: string,
): FieldControl | null {
  const name = fieldName.trim();

  if (!name) {
    return null;
  }

  const selector = [
    `input[name="${name}"]`,
    `textarea[name="${name}"]`,
    `select[name="${name}"]`,
    `[data-testid="form-custom-field-${name}-input"]`,
  ].join(",");

  const control = documentRef.querySelector(selector);

  return isFieldControl(control) ? control : null;
}

function isFieldControl(node: Element | null): node is FieldControl {
  return (
    node instanceof HTMLInputElement ||
    node instanceof HTMLTextAreaElement ||
    node instanceof HTMLSelectElement
  );
}

function hideFieldControl(control: FieldControl) {
  control.dataset.hotelFxField = "true";

  // Hide the whole field row (label + input). The control sits inside a
  // `*form-field*` wrapper; hide its parent stack so no empty gap remains.
  const fieldWrapper = control.closest<HTMLElement>("[class*='form-field' i]");
  const wrapper =
    fieldWrapper?.parentElement ??
    fieldWrapper ??
    control.parentElement ??
    control;

  wrapper.setAttribute("data-hotel-fx-field-hidden", "true");
}

function fillCustomField(
  documentRef: Document,
  fieldName: string,
  value: string,
): boolean {
  const control = findFieldControl(documentRef, fieldName);

  if (!control) {
    return false;
  }

  if (control.value !== value) {
    setNativeValue(control, value);
  }

  hideFieldControl(control);

  return true;
}

function fillAnyCustomField(
  documentRef: Document,
  fieldNames: readonly string[],
  value: string,
) {
  let filledAny = false;

  for (const fieldName of fieldNames) {
    filledAny = fillCustomField(documentRef, fieldName, value) || filledAny;
  }

  return filledAny;
}

const ADDITIONAL_INFO_PATTERN =
  /^\s*(?:informaci[oó]n adicional|additional information)\s*$/i;

/** Hides the "Información adicional" heading once all our fields are hidden. */
function hideAdditionalInfoHeading(documentRef: Document) {
  const headings = documentRef.querySelectorAll<HTMLElement>(
    "h1, h2, h3, h4, h5, h6",
  );

  for (const heading of headings) {
    if (!ADDITIONAL_INFO_PATTERN.test(heading.textContent ?? "")) {
      continue;
    }

    const wrapper = heading.parentElement ?? heading;
    wrapper.setAttribute("data-hotel-fx-field-hidden", "true");
  }
}

type RecordFxOptions = {
  /**
   * Null when no usable FX rate exists. Degraded mode still records the
   * residency (Factura T) flag — it depends only on the toggle, and Comfiar
   * needs it regardless of whether the FX snapshot could be taken.
   */
  arsPerUsd: number | null;
  fromArgentina: boolean;
  documentRef?: Document;
};

/** One-shot flag: report the first successful summary read per page load. */
let snapshotReported = false;

/**
 * Snapshots the FX rate and the with/without-IVA prices (ARS + USD) into the
 * Cloudbeds booking-engine custom fields so they are stored on the reservation.
 * No-ops until the custom-field inputs render; price fields additionally wait
 * for the summary to render and the prices to be converted.
 */
export function recordFxCustomFields({
  arsPerUsd,
  fromArgentina,
  documentRef = document,
}: RecordFxOptions): boolean {
  injectFieldStyles(documentRef);

  // These fields are internal bookkeeping and must never be guest-facing:
  // hide every configured field as soon as it renders, filled or not.
  let fieldsOnPage = 0;

  for (const fieldName of [
    ...Object.values(cloudbedsFxCustomFields),
    ...cloudbedsBookingCustomFieldAliases.beddingPreference,
  ]) {
    const control = findFieldControl(documentRef, fieldName);

    if (control) {
      hideFieldControl(control);
      fieldsOnPage += 1;
    }
  }

  if (fieldsOnPage === 0) {
    // Not on the checkout step yet — nothing to record.
    return false;
  }

  // The residency flag drives Comfiar's "Factura T": "SI" = IVA-exempt
  // resident abroad (Comfiar runs the tax post-adjustment), "NO" = resident.
  const values: Array<[string | readonly string[], string]> = [
    [cloudbedsFxCustomFields.facturaT, fromArgentina ? "NO" : "SI"],
  ];
  const beddingPreference = readCloudbedsBeddingPreference(documentRef);

  if (beddingPreference) {
    values.push([
      cloudbedsBookingCustomFieldAliases.beddingPreference,
      beddingPreference,
    ]);
  }

  const hasRate =
    typeof arsPerUsd === "number" &&
    Number.isFinite(arsPerUsd) &&
    arsPerUsd > 0;
  const summary = hasRate ? readCloudbedsSummaryUsd(documentRef) : null;

  if (hasRate && summary) {
    // Always record the full breakdown (net / IVA / gross) regardless of the
    // toggle; staff send the paylink manually and may charge either amount.
    const netUsd = summary.subtotalUsd;
    const vatUsd = summary.taxUsd ?? netUsd * VAT_RATE;
    const grossUsd = netUsd + vatUsd;

    values.push(
      [cloudbedsFxCustomFields.fxRate, formatRate(arsPerUsd)],
      [cloudbedsFxCustomFields.priceNoVatArs, formatArs(netUsd * arsPerUsd)],
      [cloudbedsFxCustomFields.priceNoVatUsd, formatUsdValue(netUsd)],
      [cloudbedsFxCustomFields.vatArs, formatArs(vatUsd * arsPerUsd)],
      [cloudbedsFxCustomFields.vatUsd, formatUsdValue(vatUsd)],
      [cloudbedsFxCustomFields.priceArs, formatArs(grossUsd * arsPerUsd)],
      [cloudbedsFxCustomFields.priceUsd, formatUsdValue(grossUsd)],
    );

    if (!snapshotReported) {
      snapshotReported = true;
      // Net-vs-gross verification aid: compare these against the amounts on a
      // real reservation to confirm Cloudbeds' "Subtotal" is the net price.
      reportFxDiagnostic("summary-snapshot", {
        subtotalUsd: netUsd,
        taxUsd: summary.taxUsd,
        derivedGrossUsd: grossUsd,
        arsPerUsd,
        vatRate: VAT_RATE,
      });
    }
  }

  let filledAny = false;
  const missing: string[] = [];

  for (const [fieldName, value] of values) {
    const fieldNames = Array.isArray(fieldName) ? fieldName : [fieldName];

    if (fillAnyCustomField(documentRef, fieldNames, value)) {
      filledAny = true;
    } else {
      missing.push(fieldNames[0] ?? "");
    }
  }

  // The checkout form is on screen (we found some of our fields) yet one of
  // the configured internal names matched nothing — almost certainly renamed
  // in Cloudbeds. Without this report the reservation silently loses FX data.
  if (missing.length > 0) {
    reportFxDiagnostic("custom-field-missing", { missing });
  }

  if (filledAny) {
    hideAdditionalInfoHeading(documentRef);
  }

  return filledAny;
}
