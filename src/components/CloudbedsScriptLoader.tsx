"use client";

import { useEffect } from "react";

const CLOUDBEDS_SCRIPT_ID = "cloudbeds-immersive-experience-script";
const CLOUDBEDS_ASSET_BASE =
  "https://static1.cloudbeds.com/booking-engine/latest/static/js/immersive-experience/";
const CLOUDBEDS_SCRIPT_SRC =
  `${CLOUDBEDS_ASSET_BASE}cb-immersive-experience.js`;
const CLOUDBEDS_CHUNK_RELOAD_KEY = "hotel:cloudbeds-chunk-reload-at";
const CLOUDBEDS_CACHE_BUST_PARAM = "_hotel_cb";

type CloudbedsWindow = Window & {
  __hotelCloudbedsAssetCacheToken?: string;
  __hotelCloudbedsChunkCacheBusterInstalled?: boolean;
  __hotelCloudbedsChunkErrorReloadInstalled?: boolean;
};

function getCloudbedsCacheToken() {
  return Date.now().toString(36);
}

function isCloudbedsAssetUrl(source: string) {
  try {
    const url = new URL(source);

    return url.href.startsWith(CLOUDBEDS_ASSET_BASE);
  } catch {
    return false;
  }
}

function withCloudbedsCacheToken(source: string, token: string) {
  if (!isCloudbedsAssetUrl(source)) {
    return source;
  }

  const url = new URL(source);
  url.searchParams.set(CLOUDBEDS_CACHE_BUST_PARAM, token);

  return url.toString();
}

function installCloudbedsChunkCacheBuster(token: string) {
  const scopedWindow = window as CloudbedsWindow;

  scopedWindow.__hotelCloudbedsAssetCacheToken = token;

  if (scopedWindow.__hotelCloudbedsChunkCacheBusterInstalled) {
    return;
  }

  scopedWindow.__hotelCloudbedsChunkCacheBusterInstalled = true;

  const originalAppendChild = Node.prototype.appendChild;

  Node.prototype.appendChild = function appendChild<T extends Node>(
    node: T,
  ): T {
    const activeToken = scopedWindow.__hotelCloudbedsAssetCacheToken;

    if (
      activeToken &&
      node instanceof HTMLScriptElement &&
      isCloudbedsAssetUrl(node.src)
    ) {
      node.src = withCloudbedsCacheToken(node.src, activeToken);
    }

    return originalAppendChild.call(this, node) as T;
  };
}

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
    // Storage may be unavailable; still attempt one normal reload.
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
        isCloudbedsAssetUrl(target.src)
      ) {
        reloadOnceAfterCloudbedsChunkError();
        return;
      }

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
    const cacheToken = getCloudbedsCacheToken();

    installCloudbedsChunkCacheBuster(cacheToken);
    installCloudbedsChunkErrorReload();

    if (document.getElementById(CLOUDBEDS_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.dataset.cloudbedsImmersive = "true";
    script.dataset.cookieconsent = "ignore";
    script.id = CLOUDBEDS_SCRIPT_ID;
    script.src = withCloudbedsCacheToken(CLOUDBEDS_SCRIPT_SRC, cacheToken);
    script.type = "text/javascript";

    document.head.append(script);
  }, []);

  return null;
}
