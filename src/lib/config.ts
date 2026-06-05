function parseRate(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const publicConfig = {
  propertyCode: process.env.NEXT_PUBLIC_CLOUDBEDS_PROPERTY_CODE ?? "5fdNYA",
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
