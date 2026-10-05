import { preconnect, preload } from "react-dom";
import {
  CLOUDBEDS_ASSET_ORIGINS,
  CLOUDBEDS_LOADER_URL,
} from "@/lib/cloudbeds-loader";

/** Server-rendered hints only: never execute Cloudbeds ahead of our guards. */
export function CloudbedsResourceHints() {
  if (process.env.NODE_ENV === "development") return null;

  for (const origin of CLOUDBEDS_ASSET_ORIGINS) {
    preconnect(origin, { crossOrigin: "anonymous" });
  }
  preload(CLOUDBEDS_LOADER_URL, {
    as: "script",
    crossOrigin: "anonymous",
  });
  return null;
}
