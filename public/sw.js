/* Los Lagos offline guide service worker.
 * Keep the version explicit so a deployment can retire an older map bundle. */
const CACHE_VERSION = "2026-09-08-v1";
const CACHE_PREFIX = "los-lagos-guide-";
const SHELL_CACHE = `${CACHE_PREFIX}shell-${CACHE_VERSION}`;
const MAP_CACHE = `${CACHE_PREFIX}map-${CACHE_VERSION}`;
const OPENFREEMAP_HOST = "tiles.openfreemap.org";
const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";
const MAP_SOURCE_URL = "https://tiles.openfreemap.org/planet";

function isGuidePath(pathname) {
  return /^\/(?:[a-z]{2}\/)?guia\/?$/.test(pathname);
}

function isCacheableSameOrigin(url) {
  return (
    isGuidePath(url.pathname) ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/maplibre/") ||
    url.pathname.startsWith("/assets/") ||
    /\.(?:avif|css|gif|ico|jpe?g|js|json|png|svg|webp|woff2?)$/i.test(url.pathname)
  );
}

async function cacheUrl(cache, rawUrl) {
  const url = new URL(rawUrl, self.location.origin);
  url.hash = "";
  const request = new Request(url.href, {
    credentials: url.origin === self.location.origin ? "same-origin" : "omit",
    mode: url.origin === self.location.origin ? "same-origin" : "cors",
  });
  // Optimised Next.js images vary by the browser's Accept header. The cached
  // bytes are still a valid image for subsequent offline requests, including
  // browsers that advertise a slightly different list of image formats.
  const cached = await cache.match(request, { ignoreVary: true });
  if (cached) return cached;

  const response = await fetch(request);
  if (!response.ok && response.type !== "opaque") {
    throw new Error(`Unable to cache ${url.href}: ${response.status}`);
  }
  await cache.put(request, response.clone());
  return response;
}

function lngLatToTile(longitude, latitude, zoom) {
  const scale = 2 ** zoom;
  const latitudeRadians = (latitude * Math.PI) / 180;
  return {
    x: Math.floor(((longitude + 180) / 360) * scale),
    y: Math.floor(
      ((1 - Math.asinh(Math.tan(latitudeRadians)) / Math.PI) / 2) * scale,
    ),
  };
}

function addTileRange(urls, template, zoom, xFrom, xTo, yFrom, yTo) {
  for (let x = xFrom; x <= xTo; x += 1) {
    for (let y = yFrom; y <= yTo; y += 1) {
      urls.add(
        template
          .replace("{z}", String(zoom))
          .replace("{x}", String(x))
          .replace("{y}", String(y)),
      );
    }
  }
}

function makeOfflineTileUrls(template, points) {
  const urls = new Set();
  const city = {
    east: -72.18,
    north: -50.28,
    south: -50.4,
    west: -72.36,
  };

  // A compact urban bundle: streets, the lakefront and the practical places
  // a guest is likely to consult while walking around El Calafate.
  for (let zoom = 11; zoom <= 14; zoom += 1) {
    const northwest = lngLatToTile(city.west, city.north, zoom);
    const southeast = lngLatToTile(city.east, city.south, zoom);
    addTileRange(
      urls,
      template,
      zoom,
      northwest.x,
      southeast.x,
      northwest.y,
      southeast.y,
    );
  }

  // Remote recommendations (airport, glacier, etc.) get a small local patch,
  // rather than downloading the enormous empty area between them and town.
  for (const point of points) {
    const [latitude, longitude] = point;
    for (let zoom = 11; zoom <= 13; zoom += 1) {
      const tile = lngLatToTile(longitude, latitude, zoom);
      addTileRange(urls, template, zoom, tile.x, tile.x, tile.y, tile.y);
    }
    const detailed = lngLatToTile(longitude, latitude, 14);
    addTileRange(
      urls,
      template,
      14,
      detailed.x - 1,
      detailed.x + 1,
      detailed.y - 1,
      detailed.y + 1,
    );
  }

  return [...urls];
}

async function cacheMany(cache, urls, onProgress) {
  const queue = [...new Set(urls)];
  let completed = 0;
  let failed = 0;
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < queue.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        await cacheUrl(cache, queue[index]);
      } catch {
        failed += 1;
      } finally {
        completed += 1;
        onProgress?.(completed, queue.length);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(6, queue.length) }, worker));
  return { failed, total: queue.length };
}

async function warmOfflineGuide({ points, shellUrls }, port) {
  const shellCache = await caches.open(SHELL_CACHE);
  const mapCache = await caches.open(MAP_CACHE);
  const safeShellUrls = shellUrls.filter((rawUrl) => {
    const url = new URL(rawUrl, self.location.origin);
    return url.origin === self.location.origin && isCacheableSameOrigin(url);
  });

  const essentialShell = [
    ...safeShellUrls,
    "/maplibre/maplibre-gl-worker.mjs",
    "/maplibre/maplibre-gl-shared.mjs",
  ];
  const shellResult = await cacheMany(shellCache, essentialShell, (done, total) => {
    port?.postMessage({ done, phase: "shell", total, type: "OFFLINE_PROGRESS" });
  });

  const styleResponse = await cacheUrl(mapCache, MAP_STYLE_URL);
  const sourceResponse = await cacheUrl(mapCache, MAP_SOURCE_URL);
  const style = await styleResponse.clone().json();
  const source = await sourceResponse.clone().json();
  const tileTemplate = source.tiles?.[0];
  if (!tileTemplate) throw new Error("OpenFreeMap did not return a tile template");

  const supportingUrls = [
    `${style.sprite}.json`,
    `${style.sprite}.png`,
    `${style.sprite}@2x.json`,
    `${style.sprite}@2x.png`,
    ...["Noto Sans Regular", "Noto Sans Italic", "Noto Sans Bold"].map((font) =>
      style.glyphs
        .replace("{fontstack}", encodeURIComponent(font))
        .replace("{range}", "0-255"),
    ),
  ];
  const vectorTiles = makeOfflineTileUrls(tileTemplate, points);
  const naturalEarthTiles = points.map(([latitude, longitude]) => {
    const tile = lngLatToTile(longitude, latitude, 6);
    return `https://tiles.openfreemap.org/natural_earth/ne2sr/6/${tile.x}/${tile.y}.png`;
  });
  const mapUrls = [...supportingUrls, ...vectorTiles, ...naturalEarthTiles];
  const mapResult = await cacheMany(mapCache, mapUrls, (done, total) => {
    port?.postMessage({ done, phase: "map", total, type: "OFFLINE_PROGRESS" });
  });

  const failed = shellResult.failed + mapResult.failed;
  const total = shellResult.total + mapResult.total + 2;
  if (shellResult.failed > 0 || mapResult.failed / Math.max(1, mapResult.total) > 0.08) {
    throw new Error(`Offline cache incomplete: ${failed}/${total} resources failed`);
  }
  return { failed, total };
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith(CACHE_PREFIX) &&
                key !== SHELL_CACHE &&
                key !== MAP_CACHE,
            )
            .map((key) => caches.delete(key)),
        ),
      ),
    ]),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_OFFLINE_GUIDE") return;
  const port = event.ports?.[0];
  event.waitUntil(
    warmOfflineGuide(
      {
        points: Array.isArray(event.data.points) ? event.data.points : [],
        shellUrls: Array.isArray(event.data.shellUrls) ? event.data.shellUrls : [],
      },
      port,
    )
      .then((result) => port?.postMessage({ ...result, type: "OFFLINE_READY" }))
      .catch((error) =>
        port?.postMessage({ message: String(error), type: "OFFLINE_ERROR" }),
      ),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const isMapRequest = url.hostname === OPENFREEMAP_HOST;
  const isShellRequest =
    url.origin === self.location.origin && isCacheableSameOrigin(url);
  if (!isMapRequest && !isShellRequest) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(isMapRequest ? MAP_CACHE : SHELL_CACHE);

      // Navigations are network-first so a new GitHub/Amplify deployment is
      // picked up on the next online visit. The saved document is only the
      // fallback when the hotel guest actually has no connection.
      if (request.mode === "navigate" && isGuidePath(url.pathname)) {
        try {
          const response = await fetch(request);
          if (response.ok) await cache.put(request, response.clone());
          return response;
        } catch {
          const fallback = await cache.match(request, {
            ignoreSearch: true,
            ignoreVary: true,
          });
          if (fallback) return fallback;
          throw new Error("The offline guide has not been cached yet");
        }
      }

      const cached = await cache.match(request, {
        ignoreSearch: request.mode === "navigate",
        ignoreVary: true,
      });
      if (cached) return cached;

      const response = await fetch(request);
      if (response.ok || response.type === "opaque") {
        await cache.put(request, response.clone());
      }
      return response;
    })(),
  );
});
