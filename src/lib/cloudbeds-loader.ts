import { replaceTechnicalGhsRatePlan } from "./cloudbeds-rate-plan-guard";

export const CLOUDBEDS_SCRIPT_ID = "cloudbeds-immersive-experience-script";
export const CLOUDBEDS_LOADER_URL =
  "https://static1.cloudbeds.com/booking-engine/latest/loader.js";
export const CLOUDBEDS_ASSET_ORIGINS = [
  "https://static1.cloudbeds.com",
  "https://static2.cloudbeds.com",
  "https://static3.cloudbeds.com",
] as const;

/** Download may start in SSR, but execution must stay after hydration/URL guards. */
export function appendCloudbedsLoader() {
  const safeUrl = replaceTechnicalGhsRatePlan(new URL(window.location.href));
  if (safeUrl) {
    window.history.replaceState(
      window.history.state,
      "",
      `${safeUrl.pathname}${safeUrl.search}${safeUrl.hash}`,
    );
    document.documentElement.dataset.hotelGhsTechnicalRatePlan = "true";
  }

  if (document.getElementById(CLOUDBEDS_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.async = true;
  // The official loader reads document.currentScript and propagates this dataset.
  script.dataset.entry = "immersive";
  script.dataset.cloudbedsImmersive = "true";
  script.dataset.cookieconsent = "ignore";
  script.crossOrigin = "anonymous";
  script.id = CLOUDBEDS_SCRIPT_ID;
  script.src = CLOUDBEDS_LOADER_URL;
  script.type = "text/javascript";
  document.head.append(script);
}
