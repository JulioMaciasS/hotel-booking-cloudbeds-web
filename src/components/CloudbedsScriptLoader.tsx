"use client";

import { useEffect } from "react";
import { appendCloudbedsLoader, CLOUDBEDS_SCRIPT_ID } from "@/lib/cloudbeds-loader";

const DISABLED_IN_DEVELOPMENT = process.env.NODE_ENV === "development";
const CLOUDBEDS_CHUNK_RELOAD_KEY = "hotel:cloudbeds-chunk-reload-at";

type CloudbedsWindow = Window & {
  __hotelCloudbedsChunkErrorReloadInstalled?: boolean;
};

function reloadOnceAfterCloudbedsChunkError() {
  try {
    const previousReloadAt = Number(
      window.sessionStorage.getItem(CLOUDBEDS_CHUNK_RELOAD_KEY),
    );
    const recentlyReloaded =
      Number.isFinite(previousReloadAt) &&
      Date.now() - previousReloadAt < 10 * 60 * 1000;

    if (recentlyReloaded) {
      return;
    }

    window.sessionStorage.setItem(
      CLOUDBEDS_CHUNK_RELOAD_KEY,
      String(Date.now()),
    );
  } catch {
    // Without persistent storage, reloading could produce an endless loop.
    return;
  }

  window.location.reload();
}

function isCloudbedsChunkLoadMessage(message: string) {
  return (
    /ChunkLoadError|Loading chunk .* failed/i.test(message) &&
    /cb-immersive-experience|cloudbeds|bookingengine/i.test(message)
  );
}

function installCloudbedsChunkErrorReload() {
  const scopedWindow = window as CloudbedsWindow;

  if (scopedWindow.__hotelCloudbedsChunkErrorReloadInstalled) {
    return;
  }

  scopedWindow.__hotelCloudbedsChunkErrorReloadInstalled = true;

  window.addEventListener(
    "error",
    (event) => {
      const target = event.target;

      if (
        target instanceof HTMLScriptElement &&
        target.id === CLOUDBEDS_SCRIPT_ID
      ) {
        reloadOnceAfterCloudbedsChunkError();
        return;
      }

      // Entry-script failures belong to the official loader: it retries the
      // other Cloudbeds CDNs. Do not reload before that fallback can complete.

      if (
        event.message &&
        isCloudbedsChunkLoadMessage(event.message)
      ) {
        reloadOnceAfterCloudbedsChunkError();
      }
    },
    true,
  );

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason as
      | { message?: unknown; request?: unknown; stack?: unknown }
      | undefined;
    const message = [
      reason?.message,
      reason?.request,
      reason?.stack,
      String(event.reason ?? ""),
    ]
      .filter(Boolean)
      .join(" ");

    if (isCloudbedsChunkLoadMessage(message)) {
      reloadOnceAfterCloudbedsChunkError();
    }
  });
}

export function CloudbedsScriptLoader() {
  useEffect(() => {
    if (DISABLED_IN_DEVELOPMENT) return;

    installCloudbedsChunkErrorReload();
    appendCloudbedsLoader();
  }, []);

  return null;
}
