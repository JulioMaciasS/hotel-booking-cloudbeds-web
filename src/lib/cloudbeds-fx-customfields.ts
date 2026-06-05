import { cloudbedsFxCustomFields } from "@/lib/config";
import { readCloudbedsSummaryUsd } from "@/lib/cloudbeds-vat-adjust";
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

  return true;
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
  arsPerUsd: number;
  fromArgentina: boolean;
  documentRef?: Document;
};

/**
 * Snapshots the FX rate and the with/without-IVA prices (ARS + USD) into the
 * Cloudbeds booking-engine custom fields so they are stored on the reservation.
 * No-ops silently until both the summary and the custom-field inputs render.
 */
export function recordFxCustomFields({
  arsPerUsd,
  fromArgentina,
  documentRef = document,
}: RecordFxOptions): boolean {
  if (!Number.isFinite(arsPerUsd) || arsPerUsd <= 0) {
    return false;
  }

  const summary = readCloudbedsSummaryUsd(documentRef);

  if (!summary) {
    return false;
  }

  // Always record the full breakdown (net / IVA / gross) regardless of the
  // toggle; staff send the paylink manually and may charge either amount. The
  // toggle drives Comfiar's "Factura T" flag: "SI" = IVA-exempt resident abroad
  // (Comfiar runs the tax post-adjustment), "NO" = Argentine resident.
  const netUsd = summary.subtotalUsd;
  const vatUsd = summary.taxUsd ?? netUsd * VAT_RATE;
  const grossUsd = netUsd + vatUsd;
  const facturaT = fromArgentina ? "NO" : "SI";

  const values: Array<[string, string]> = [
    [cloudbedsFxCustomFields.fxRate, formatRate(arsPerUsd)],
    [cloudbedsFxCustomFields.priceNoVatArs, formatArs(netUsd * arsPerUsd)],
    [cloudbedsFxCustomFields.priceNoVatUsd, formatUsdValue(netUsd)],
    [cloudbedsFxCustomFields.vatArs, formatArs(vatUsd * arsPerUsd)],
    [cloudbedsFxCustomFields.vatUsd, formatUsdValue(vatUsd)],
    [cloudbedsFxCustomFields.priceArs, formatArs(grossUsd * arsPerUsd)],
    [cloudbedsFxCustomFields.priceUsd, formatUsdValue(grossUsd)],
    [cloudbedsFxCustomFields.facturaT, facturaT],
  ];

  injectFieldStyles(documentRef);

  let filledAny = false;

  for (const [fieldName, value] of values) {
    if (fillCustomField(documentRef, fieldName, value)) {
      filledAny = true;
    }
  }

  if (filledAny) {
    hideAdditionalInfoHeading(documentRef);
  }

  return filledAny;
}
