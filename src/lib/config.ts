export const publicConfig = {
  propertyCode: process.env.NEXT_PUBLIC_CLOUDBEDS_PROPERTY_CODE ?? "5fdNYA",
  baseCurrency: process.env.NEXT_PUBLIC_BASE_CURRENCY ?? "ARS",
  displayCurrency: process.env.NEXT_PUBLIC_DISPLAY_CURRENCY ?? "USD",
} as const;
