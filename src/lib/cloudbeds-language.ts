/** Cloudbeds names Brazilian Portuguese `pt-br`; site routes stay `/pt`. */
export function getCloudbedsLanguage(locale: string): string {
  return locale === "pt" ? "pt-br" : locale;
}
