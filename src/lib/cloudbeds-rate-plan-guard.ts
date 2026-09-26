export const CLOUDBEDS_PUBLIC_RATE_PLAN_ID = "236350098788544";
export const CLOUDBEDS_TECHNICAL_GHS_RATE_PLAN_ID = "278686453629056";
export const GHS_SOURCE_RATE_PLAN_PARAM = "hotel_ghs_source_rpid";

/**
 * Cloudbeds reads `rpid` from the page URL when its immersive component boots.
 * Keep the Google/Cloudbeds package id for diagnostics, but make the public,
 * actually bookable plan the one handed to the component.
 */
export function replaceTechnicalGhsRatePlan(url: URL): URL | null {
  if (
    url.searchParams.get("rpid") !== CLOUDBEDS_TECHNICAL_GHS_RATE_PLAN_ID
  ) {
    return null;
  }

  const safeUrl = new URL(url.toString());
  safeUrl.searchParams.set(
    GHS_SOURCE_RATE_PLAN_PARAM,
    CLOUDBEDS_TECHNICAL_GHS_RATE_PLAN_ID,
  );
  safeUrl.searchParams.set("rpid", CLOUDBEDS_PUBLIC_RATE_PLAN_ID);

  return safeUrl;
}
