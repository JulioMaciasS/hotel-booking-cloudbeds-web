function parseRate(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function cloudbedsGeneratedInternalName(value: string) {
  const normalized = value.trim();

  return normalized ? `cf_${normalized.slice(0, 20)}` : "";
}

export const publicConfig = {
  propertyCode: process.env.NEXT_PUBLIC_CLOUDBEDS_PROPERTY_CODE ?? "5fdNYA",
  cloudbedsIsland: process.env.NEXT_PUBLIC_CLOUDBEDS_ISLAND ?? "us2",
  baseCurrency: process.env.NEXT_PUBLIC_BASE_CURRENCY ?? "ARS",
  displayCurrency: process.env.NEXT_PUBLIC_DISPLAY_CURRENCY ?? "USD",
  /**
   * Argentine VAT (IVA) rate applied to lodging. Argentine residents pay it;
   * residents abroad are exempt (Decreto 1043/2016).
   */
  vatRate: parseRate(process.env.NEXT_PUBLIC_VAT_RATE, 0.21),
} as const;

/**
 * Internal names of the Cloudbeds booking-engine custom fields used to record
 * the FX snapshot with each reservation. These are the field's "Nombre interno"
 * (rendered as the input `name` / `data-testid`), NOT the display title — the
 * title is matched unreliably because the hotel can mislabel or duplicate it.
 * The app auto-fills and hides each field. Override via env when the hotel uses
 * different internal names.
 */
export const cloudbedsFxCustomFields = {
  fxRate: process.env.NEXT_PUBLIC_CB_FIELD_FX_RATE ?? "cf_fx_ars_usd",
  priceNoVatArs:
    process.env.NEXT_PUBLIC_CB_FIELD_PRICE_NO_VAT_ARS ?? "cf_precio_sin_iva_ars",
  priceNoVatUsd:
    process.env.NEXT_PUBLIC_CB_FIELD_PRICE_NO_VAT_USD ?? "cf_precio_sin_iva_usd",
  vatArs: process.env.NEXT_PUBLIC_CB_FIELD_VAT_ARS ?? "cf_iva_ars",
  vatUsd: process.env.NEXT_PUBLIC_CB_FIELD_VAT_USD ?? "cf_iva_usd",
  priceArs: process.env.NEXT_PUBLIC_CB_FIELD_PRICE_ARS ?? "cf_precio_ars_con_iva",
  priceUsd: process.env.NEXT_PUBLIC_CB_FIELD_PRICE_USD ?? "cf_precio_usd_con_iva",
  /**
   * The Comfiar "Factura T" flag. Set to "SI" for IVA-exempt residents abroad
   * (Comfiar runs the tax post-adjustment when this reads "SI"), "NO" for
   * Argentine residents. Reuses Comfiar's existing custom field — set this to
   * its internal name (check the input `name` in the booking-engine DOM).
   */
  facturaT: process.env.NEXT_PUBLIC_CB_FIELD_FACTURA_T ?? "cf_factura_t",
} as const;

export const cloudbedsBookingCustomFields = {
  /**
   * Compact bedding distribution persisted on the reservation for the
   * server-side room-assignment webhook. Example:
   * 227179928547456=matrimonial:1,dos_camas_separadas:1
   */
  beddingPreference:
    process.env.NEXT_PUBLIC_CB_FIELD_BEDDING_PREFERENCE ??
    "cf_bedding_preference",
} as const;

export const cloudbedsBookingCustomFieldAliases = {
  /**
   * Cloudbeds can auto-generate an internal name from the visible title by
   * prefixing `cf_` and truncating the base value. In the current property UI,
   * a field titled `cf_bedding_preference` rendered as
   * `cf_cf_bedding_preferenc`, so keep that alias while still honoring the
   * explicitly configured internal name.
   */
  beddingPreference: uniqueStrings([
    cloudbedsBookingCustomFields.beddingPreference,
    cloudbedsGeneratedInternalName(
      cloudbedsBookingCustomFields.beddingPreference,
    ),
    "cf_cf_bedding_preferenc",
  ]),
} as const;
