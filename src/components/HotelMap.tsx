"use client";

import {
  AttributionControl,
  Map as MapLibreMap,
  type MapMovementEvent,
  Marker,
  NavigationControl,
  Popup,
  setWorkerUrl,
} from "maplibre-gl";
import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import hotelLogo from "@assets/old-web-images/logo-sin-fondo-270.png";

setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

// Hotel — verified pin from the owner's share link (@-50.3357896,-72.2666423)
const HOTEL: [number, number] = [-50.33579, -72.26664];
const HOTEL_GOOGLE_MAPS_URL = "https://maps.app.goo.gl/fcEX1Tgnc37brYYAA";
const INITIAL_ZOOM = 15;

export type PoiCategory =
  | "restaurant"
  | "bar"
  | "cafe"
  | "attraction"
  | "transport"
  | "nature"
  | "shop"
  | "bank"
  | "tourism"
  | "centre";

type HotelMapProps = {
  activeCategory?: PoiCategory | "all";
  cooperativeGestures?: boolean;
  focusRequest?: MapFocusRequest | null;
  onMapInteraction?: () => void;
  onPlaceSelect?: (place: MapPlaceDetails) => void;
  selectedTKey?: string | null;
  selectionMode?: "external" | "popup";
};

type FilterableMarker = {
  category: PoiCategory | "hotel";
  coords: [number, number];
  element: HTMLDivElement;
  marker: Marker;
  place: MapPlaceDetails;
  popup: Popup | null;
  setVisible: (visible: boolean) => void;
  tKey: string;
};

type EdgeIndicatorPosition = {
  x: number;
  y: number;
};

export type MapFocusRequest = {
  requestId: number;
  tKey: string;
};

export type MapPlaceDetails = {
  category: PoiCategory | "hotel";
  categoryColor: string;
  categoryLabel: string;
  note: string;
  tKey: string;
  title: string;
  url: string;
};

export type MapPoi = {
  /** Stable key resolving `label` and `note` under `location.map.pois.<tKey>`. */
  tKey: string;
  coords: [number, number];
  category: PoiCategory;
  url: string;
};

/*
 * Coordinates are the verified place pins (the `!3d<lat>!4d<lng>` value) from
 * the owner-supplied Google Maps share links below — accurate to the listing,
 * not geocoded from street numbers. Lago Argentino and Perito Moreno use the
 * exact lat/lng the owner provided. `centro` and `libertador` are not in that
 * list, so their original coordinates/links are left unchanged.
 */
export const MAP_POIS: MapPoi[] = [
  // ── Centre ────────────────────────────────────────────────────────────────
  {
    tKey: "centro",
    coords: [-50.33770, -72.26820],
    category: "centre",
    url: "https://www.google.com/maps/search/Centro+El+Calafate+Argentina",
  },

  // ── Restaurants ──────────────────────────────────────────────────────────
  {
    tKey: "laTablita",
    coords: [-50.3379421, -72.2572912],
    category: "restaurant",
    url: "https://maps.app.goo.gl/6PvyvJhhRMqPkXKQ9",
  },
  {
    tKey: "casimiroBigua",
    coords: [-50.3380944, -72.2623824],
    category: "restaurant",
    url: "https://maps.app.goo.gl/YSDojiCdfxhi7d6v9",
  },
  {
    tKey: "miViejo",
    coords: [-50.338179, -72.2647465],
    category: "restaurant",
    url: "https://maps.app.goo.gl/4RonQfwvG9xnVAWf8",
  },
  {
    tKey: "mako",
    coords: [-50.3384441, -72.266851],
    category: "restaurant",
    url: "https://maps.app.goo.gl/1u6FrpSJhVWN9BCo8",
  },
  {
    tKey: "laZaina",
    coords: [-50.3369593, -72.2635683],
    category: "restaurant",
    url: "https://maps.app.goo.gl/YdgiX9ivNW8smDXX8",
  },
  {
    tKey: "laLechuza",
    coords: [-50.3385261, -72.2681837],
    category: "restaurant",
    url: "https://maps.app.goo.gl/GJJHey4J7cbSMyTu8",
  },

  // ── Bars ──────────────────────────────────────────────────────────────────
  {
    tKey: "laZorra",
    coords: [-50.3381959, -72.2594997],
    category: "bar",
    url: "https://maps.app.goo.gl/5ib2PKVrHRJ2bC8T7",
  },
  {
    tKey: "yetiIceBar",
    coords: [-50.3385919, -72.2693884],
    category: "bar",
    url: "https://maps.app.goo.gl/3DLCS4EZhmsdjRy29",
  },

  // ── Cafés ─────────────────────────────────────────────────────────────────
  {
    tKey: "vivaLaPepa",
    coords: [-50.3384631, -72.2607868],
    category: "cafe",
    url: "https://maps.app.goo.gl/b87Es96kcZkoHWMM9",
  },
  {
    tKey: "ovejitas",
    coords: [-50.33834, -72.2663643],
    category: "cafe",
    url: "https://maps.app.goo.gl/QcCTPN2caQuVK6PT7",
  },

  // ── Attractions ───────────────────────────────────────────────────────────
  {
    tKey: "libertador",
    coords: [-50.33780, -72.26860],
    category: "attraction",
    url: "https://www.google.com/maps/search/Avenida+del+Libertador+El+Calafate",
  },
  {
    tKey: "centroInterpretacion",
    coords: [-50.3313371, -72.2649896],
    category: "attraction",
    url: "https://maps.app.goo.gl/yWtKf7jimQaap8JS7",
  },
  {
    tKey: "glaciarium",
    coords: [-50.3367106, -72.3398274],
    category: "attraction",
    url: "https://maps.app.goo.gl/WVJm2B9n9As5qEph8",
  },
  {
    tKey: "peritoMoreno",
    coords: [-50.470853, -73.043928],
    category: "attraction",
    url: "https://maps.app.goo.gl/ZDaivzUNMoGKejoGA",
  },

  // ── Nature ────────────────────────────────────────────────────────────────
  {
    tKey: "lagoArgentino",
    coords: [-50.324714, -72.298152],
    category: "nature",
    url: "https://maps.app.goo.gl/7fxWsviTRcRUvLgs8",
  },
  {
    tKey: "lagunaNimez",
    coords: [-50.3283488, -72.268301],
    category: "nature",
    url: "https://maps.app.goo.gl/L4tSg3hu34Aki58C9",
  },

  // ── Transport ─────────────────────────────────────────────────────────────
  {
    tKey: "terminal",
    coords: [-50.3375761, -72.2451082],
    category: "transport",
    url: "https://maps.app.goo.gl/nExzcZgJB4roM87q6",
  },
  {
    tKey: "aeropuerto",
    coords: [-50.2838909, -72.0536694],
    category: "transport",
    url: "https://maps.app.goo.gl/92B7pAVJ9ciM7VjX6",
  },

  // ── Banks ─────────────────────────────────────────────────────────────────
  {
    tKey: "bancoSantaCruz",
    coords: [-50.3385109, -72.267665],
    category: "bank",
    url: "https://maps.app.goo.gl/goutwEJumUdPpcF18",
  },
  {
    tKey: "bancoNacion",
    coords: [-50.3383945, -72.2706873],
    category: "bank",
    url: "https://maps.app.goo.gl/KopQyTMnkBHxLBLt8",
  },

  // ── Tourism agencies ──────────────────────────────────────────────────────
  {
    tKey: "patagoniaChic",
    coords: [-50.3377189, -72.2621592],
    category: "tourism",
    url: "https://maps.app.goo.gl/f92mSSKWZegh5s6v8",
  },
  {
    tKey: "calTur",
    coords: [-50.3379036, -72.2640403],
    category: "tourism",
    url: "https://maps.app.goo.gl/N9Z5D5Q7TFYEQZU89",
  },

  // ── Shops ─────────────────────────────────────────────────────────────────
  {
    tKey: "laAnonima",
    coords: [-50.3375814, -72.2615971],
    category: "shop",
    url: "https://maps.app.goo.gl/Cj6GkQLafsRJ8UfC9",
  },
];

// ─── Colour per category ───────────────────────────────────────────────────
const CATEGORY_COLOR: Record<PoiCategory, string> = {
  restaurant: "#b65445",
  bar: "#765b80",
  cafe: "#c47a42",
  attraction: "#477f99",
  transport: "#53876d",
  nature: "#43867d",
  shop: "#71807a",
  bank: "#ad8a36",
  tourism: "#3e7589",
  centre: "#bf6389",
};

// ─── SVG paths (24×24 Heroicons/Lucide style) ─────────────────────────────
const CATEGORY_ICON_PATH: Record<PoiCategory, string> = {
  // Utensils
  restaurant:
    "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6h3.5c.8 0 1.5.7 1.5 1.5V22",
  // Cocktail / martini glass — wider recognition for "bar" than a beer mug
  bar:
    "M4 2h16L12 13v9M9 22h6",
  // Coffee cup
  cafe:
    "M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8ZM6 2v2M10 2v2M14 2v2",
  // Camera
  attraction:
    "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3ZM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  // Bus
  transport:
    "M8 6v6M16 6v6M2 12h20M7 18h10M4 18H3a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-1M4 18a2 2 0 1 0 4 0M16 18a2 2 0 1 0 4 0M2 8h20",
  // Pine tree
  nature:
    "m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z",
  // Shopping bag
  shop:
    "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0",
  // Bank / building with columns
  bank:
    "M3 21h18M3 10h18M5 6l7-4 7 4M4 10v11M8 10v11M12 10v11M16 10v11M20 10v11",
  // Compass (tourism / info)
  tourism:
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12Z",
  // Map pin star / landmark
  centre:
    "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z",
};

function makePinSvg(category: PoiCategory): string {
  const color = CATEGORY_COLOR[category];
  const path = CATEGORY_ICON_PATH[category];
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="41" viewBox="0 0 34 46" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.28))">`,
    `<path d="M17 0C7.6 0 0 7.6 0 17c0 11.3 17 29 17 29S34 28.3 34 17C34 7.6 26.4 0 17 0z" fill="${color}"/>`,
    `<circle cx="17" cy="17" r="12" fill="white"/>`,
    `<svg x="5" y="5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">`,
    `<path d="${path}"/>`,
    `</svg></svg>`,
  ].join("");
}

// The hotel's own logo on a white badge with a brand-coloured pointer, so the
// primary marker is unmistakable among the generic category pins.
function hotelMarkerHtml(): string {
  return [
    `<div style="position:relative;width:60px;height:60px;">`,
    `<div style="display:flex;align-items:center;justify-content:center;width:60px;height:60px;box-sizing:border-box;background:#fff;border:2px solid #38645b;border-radius:50%;overflow:hidden;filter:drop-shadow(0 3px 6px rgba(0,0,0,.4));">`,
    `<img src="${hotelLogo.src}" alt="" style="width:48px;height:48px;object-fit:contain;display:block;" />`,
    `</div>`,
    `<div style="position:absolute;left:50%;bottom:-7px;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:8px solid #38645b;"></div>`,
    `</div>`,
  ].join("");
}

function toLngLat([latitude, longitude]: [number, number]): [number, number] {
  return [longitude, latitude];
}

function escapeHtml(value: string) {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return value.replace(/[&<>"']/g, (character) => entities[character]);
}

function makeMarkerElement(html: string, width: number, height: number) {
  const element = document.createElement("div");
  const visual = document.createElement("div");
  element.className = "hotel-map-marker";
  element.style.height = `${height}px`;
  element.style.width = `${width}px`;
  visual.className = "map-marker-visual";
  visual.innerHTML = html;
  element.append(visual);
  return element;
}

function focusMapMarker(
  map: MapLibreMap,
  markers: FilterableMarker[],
  selected: FilterableMarker,
  {
    moveCamera,
    onPlaceSelect,
    showPopup,
  }: {
    moveCamera: boolean;
    onPlaceSelect?: (place: MapPlaceDetails) => void;
    showPopup: boolean;
  },
) {
  for (const marker of markers) {
    const isSelected = marker === selected;
    marker.element.dataset.selected = isSelected ? "true" : "false";
    marker.element.style.zIndex = isSelected ? "5" : "";
    if (!isSelected) marker.popup?.remove();
  }

  onPlaceSelect?.(selected.place);

  if (showPopup && selected.popup && !selected.popup.isOpen()) {
    selected.marker.togglePopup();
  }

  if (moveCamera) {
    map.flyTo({
      center: selected.coords,
      duration: 500,
      essential: true,
      offset: [0, 70],
      zoom: Math.max(map.getZoom(), 16),
    });
  }
}

function makeMarkerInteractive(
  map: MapLibreMap,
  markers: FilterableMarker[],
  selected: FilterableMarker,
  onPlaceSelect: ((place: MapPlaceDetails) => void) | undefined,
  showPopup: boolean,
) {
  const { element } = selected;
  element.setAttribute("role", "button");
  element.tabIndex = 0;

  const activate = () => {
    // A direct tap selects immediately and leaves the camera where the guest
    // put it. Search-driven focus is handled separately and may move the map.
    window.requestAnimationFrame(() =>
      focusMapMarker(map, markers, selected, {
        moveCamera: false,
        onPlaceSelect,
        showPopup,
      }),
    );
  };
  element.addEventListener("click", activate);
  element.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activate();
  });
}

function syncSelectedMarker(markers: FilterableMarker[], selectedTKey: string | null) {
  for (const marker of markers) {
    const isSelected = marker.tKey === selectedTKey;
    marker.element.dataset.selected = isSelected ? "true" : "false";
    marker.element.style.zIndex = isSelected ? "5" : "";
    if (!isSelected) marker.popup?.remove();
  }
}

function getEdgeIndicatorPosition(
  map: MapLibreMap,
  markers: FilterableMarker[],
  selectedTKey: string | null,
  reserveBottomSpace: boolean,
): EdgeIndicatorPosition | null {
  if (!selectedTKey) return null;
  const selected = markers.find((marker) => marker.tKey === selectedTKey);
  if (!selected) return null;

  const container = map.getContainer();
  const containerRect = container.getBoundingClientRect();
  const width = container.clientWidth;
  const height = container.clientHeight;
  if (!width || !height) return null;

  // Project the marker from the same camera frame as the map. Reading its DOM
  // transform here can lag one paint behind MapLibre and makes the cue judder.
  const point = map.project(selected.coords);
  const markerWidth = selected.element.offsetWidth;
  const markerHeight = selected.element.offsetHeight;
  const markerRect = {
    bottom: point.y,
    left: point.x - markerWidth / 2,
    right: point.x + markerWidth / 2,
    top: point.y - markerHeight,
  };

  // Only the portion above the bottom sheet is usable map. Measure the sheet
  // instead of guessing its height, because its snap animation is responsive.
  const sheet = reserveBottomSpace
    ? document.querySelector<HTMLElement>(".react-modal-sheet-container")
    : null;
  const sheetRect = sheet?.getBoundingClientRect();
  const visibleBottom = Math.max(
    0,
    Math.min(
      height,
      sheetRect && sheetRect.top < containerRect.bottom
        ? sheetRect.top - containerRect.top
        : height,
    ),
  );
  const markerHasVisiblePixel =
    markerRect.right > 0 &&
    markerRect.left < width &&
    markerRect.bottom > 0 &&
    markerRect.top < visibleBottom;
  if (markerHasVisiblePixel) return null;

  // Keep the whole 44 px cue inside the interactive map while placing it as
  // close to the relevant edge as a native map pin would be.
  const margin = 28;
  const left = margin;
  const right = width - margin;
  const top = margin;
  const bottom = visibleBottom - margin;
  if (right <= left || bottom <= top) return null;

  const centerX = (left + right) / 2;
  const centerY = (top + bottom) / 2;
  const deltaX = point.x - centerX;
  const deltaY = point.y - centerY;
  const horizontalScale =
    deltaX > 0
      ? (right - centerX) / deltaX
      : deltaX < 0
        ? (left - centerX) / deltaX
        : Number.POSITIVE_INFINITY;
  const verticalScale =
    deltaY > 0
      ? (bottom - centerY) / deltaY
      : deltaY < 0
        ? (top - centerY) / deltaY
        : Number.POSITIVE_INFINITY;
  const scale = Math.min(horizontalScale, verticalScale);

  return {
    x: centerX + deltaX * scale,
    y: centerY + deltaY * scale,
  };
}

function makeOsmEmbedUrl([latitude, longitude]: [number, number]) {
  const latitudeRadius = 0.009;
  const longitudeRadius = 0.014;
  const params = new URLSearchParams({
    bbox: [
      longitude - longitudeRadius,
      latitude - latitudeRadius,
      longitude + longitudeRadius,
      latitude + latitudeRadius,
    ].join(","),
    layer: "mapnik",
    marker: `${latitude},${longitude}`,
  });

  return `https://www.openstreetmap.org/export/embed.html?${params}`;
}

function mountRasterFallback({
  container,
  linkLabel,
  note,
  title,
}: {
  container: HTMLDivElement;
  linkLabel: string;
  note: string;
  title: string;
}) {
  const frame = document.createElement("iframe");
  frame.className = "h-full w-full border-0";
  frame.loading = "eager";
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.src = makeOsmEmbedUrl(HOTEL);
  frame.title = title;

  const message = document.createElement("div");
  message.className =
    "absolute bottom-3 left-3 right-3 rounded-lg bg-white/95 p-3 text-xs text-[#5f6e69] shadow-md ring-1 ring-black/10 backdrop-blur-sm sm:left-auto sm:max-w-xs";

  const text = document.createElement("p");
  text.textContent = note;

  const link = document.createElement("a");
  link.className = "mt-1.5 inline-flex font-semibold text-[#38645b] hover:underline";
  link.href = HOTEL_GOOGLE_MAPS_URL;
  link.rel = "noopener noreferrer";
  link.target = "_blank";
  link.textContent = linkLabel;

  message.append(text, link);
  container.replaceChildren(frame, message);
  return frame;
}

function makePopupHtml({
  category,
  categoryColor,
  linkLabel,
  note,
  title,
  url,
}: {
  category?: string;
  categoryColor?: string;
  linkLabel: string;
  note: string;
  title: string;
  url: string;
}) {
  const categoryHtml = category
    ? `<p style="font-size:11px;color:${categoryColor};font-weight:600;margin:0 0 3px">${escapeHtml(category)}</p>`
    : "";

  return [
    `<p style="font-weight:700;font-size:13px;color:#1f2b27;margin:0 0 2px">${escapeHtml(title)}</p>`,
    categoryHtml,
    `<p style="font-size:12px;color:#5f6e69;margin:0">${escapeHtml(note)}</p>`,
    `<a href="${escapeHtml(url)}" rel="noopener noreferrer" target="_blank" style="display:inline-flex;align-items:center;margin-top:6px;font-size:11px;font-weight:600;color:#2980b9;text-decoration:none">${escapeHtml(linkLabel)}</a>`,
  ].join("");
}

export function HotelMap({
  activeCategory = "all",
  cooperativeGestures = true,
  focusRequest = null,
  onMapInteraction,
  onPlaceSelect,
  selectedTKey = null,
  selectionMode = "popup",
}: HotelMapProps) {
  const t = useTranslations("location.map");
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackFrameRef = useRef<HTMLIFrameElement | null>(null);
  const edgeIndicatorRef = useRef<HTMLButtonElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<FilterableMarker[]>([]);
  const selectedTKeyRef = useRef(selectedTKey);
  const updateEdgeIndicatorRef = useRef<() => void>(() => undefined);
  const edgeIndicatorVisibleRef = useRef(false);
  const [edgeIndicatorVisible, setEdgeIndicatorVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const fallbackOptions = {
      container,
      linkLabel: t("fallback.openInGoogleMaps"),
      note: t("fallback.note"),
      title: t("fallback.title"),
    };

    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        attributionControl: false,
        center: toLngLat(HOTEL),
        container,
        cooperativeGestures,
        maxZoom: 19,
        style: "https://tiles.openfreemap.org/styles/positron",
        zoom: INITIAL_ZOOM,
      });
    } catch {
      fallbackFrameRef.current = mountRasterFallback(fallbackOptions);
      return () => {
        fallbackFrameRef.current = null;
        container.replaceChildren();
      };
    }
    mapRef.current = map;
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(container);

    let loaded = false;
    let mapRemoved = false;
    let loadTimeout: number | null = null;

    const clearLoadTimeout = () => {
      if (loadTimeout === null) return;
      window.clearTimeout(loadTimeout);
      loadTimeout = null;
    };

    const showFallback = () => {
      if (loaded || mapRemoved) return;
      clearLoadTimeout();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      resizeObserver.disconnect();
      map.remove();
      mapRemoved = true;
      mapRef.current = null;
      markersRef.current = [];
      fallbackFrameRef.current = mountRasterFallback(fallbackOptions);
    };

    const armLoadTimeout = () => {
      clearLoadTimeout();
      if (loaded || mapRemoved || document.hidden) return;
      loadTimeout = window.setTimeout(showFallback, 12000);
    };

    function handleVisibilityChange() {
      if (document.hidden) {
        clearLoadTimeout();
        return;
      }
      map.resize();
      armLoadTimeout();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    armLoadTimeout();
    map.once("load", () => {
      loaded = true;
      clearLoadTimeout();
    });

    map.addControl(new NavigationControl({ showCompass: false }), "bottom-left");
    map.addControl(new AttributionControl({ compact: true }), "bottom-right");

    const hotelElement = makeMarkerElement(hotelMarkerHtml(), 60, 67);
    hotelElement.setAttribute("aria-label", t("hotel.label"));
    const hotelPlace: MapPlaceDetails = {
      category: "hotel",
      categoryColor: "#38645b",
      categoryLabel: t("hotel.category"),
      note: t("hotel.address"),
      title: t("hotel.label"),
      tKey: "hotel",
      url: HOTEL_GOOGLE_MAPS_URL,
    };
    const hotelPopup =
      selectionMode === "popup"
        ? new Popup({
            anchor: "bottom",
            closeOnMove: false,
            offset: 70,
          })
            .setMaxWidth("min(280px, calc(100vw - 32px))")
            .setHTML(
              makePopupHtml({
                linkLabel: t("viewOnGoogleMaps"),
                note: hotelPlace.note,
                title: hotelPlace.title,
                url: hotelPlace.url,
              }),
            )
        : null;
    const hotelMarker = new Marker({ anchor: "bottom", element: hotelElement }).setLngLat(
      toLngLat(HOTEL),
    );
    if (hotelPopup) hotelMarker.setPopup(hotelPopup);
    hotelMarker.addTo(map);

    const hotelMapMarker: FilterableMarker = {
      category: "hotel",
      coords: toLngLat(HOTEL),
      element: hotelElement,
      marker: hotelMarker,
      place: hotelPlace,
      popup: hotelPopup,
      setVisible: () => {
        hotelElement.hidden = false;
      },
      tKey: "hotel",
    };
    markersRef.current.push(hotelMapMarker);
    makeMarkerInteractive(
      map,
      markersRef.current,
      hotelMapMarker,
      onPlaceSelect,
      selectionMode === "popup",
    );
    hotelPopup?.on("close", () => {
      hotelElement.dataset.selected = "false";
      hotelElement.style.zIndex = "";
    });

    for (const poi of MAP_POIS) {
      const element = makeMarkerElement(makePinSvg(poi.category), 30, 41);
      const category = t(`categories.${poi.category}`);
      const note = t(`pois.${poi.tKey}.note`);
      const title = t(`pois.${poi.tKey}.label`);
      const coords = toLngLat(poi.coords);
      element.setAttribute("aria-label", title);

      if (poi.category === "centre") {
        const label = document.createElement("span");
        label.textContent = t("centreLabel");
        label.style.cssText =
          "position:absolute;left:26px;top:2px;white-space:nowrap;border-radius:4px;background:rgba(255,255,255,.92);padding:3px 6px;font-size:11px;font-weight:600;color:#1f2b27;box-shadow:0 1px 3px rgba(0,0,0,.18)";
        element.append(label);
      }

      const place: MapPlaceDetails = {
        category: poi.category,
        categoryColor: CATEGORY_COLOR[poi.category],
        categoryLabel: category,
        note,
        title,
        tKey: poi.tKey,
        url: poi.url,
      };
      const popup =
        selectionMode === "popup"
          ? new Popup({
              anchor: "bottom",
              closeOnMove: false,
              offset: 45,
            })
              .setMaxWidth("min(280px, calc(100vw - 32px))")
              .setHTML(
                makePopupHtml({
                  category,
                  categoryColor: CATEGORY_COLOR[poi.category],
                  linkLabel: t("viewOnGoogleMaps"),
                  note,
                  title,
                  url: poi.url,
                }),
              )
          : null;
      const marker = new Marker({ anchor: "bottom", element }).setLngLat(coords);
      if (popup) marker.setPopup(popup);
      marker.addTo(map);

      const mapMarker: FilterableMarker = {
        category: poi.category,
        coords,
        element,
        marker,
        place,
        popup,
        setVisible: (visible) => {
          element.hidden = !visible;
          if (!visible) popup?.remove();
        },
        tKey: poi.tKey,
      };
      markersRef.current.push(mapMarker);
      makeMarkerInteractive(
        map,
        markersRef.current,
        mapMarker,
        onPlaceSelect,
        selectionMode === "popup",
      );
      popup?.on("close", () => {
        element.dataset.selected = "false";
        element.style.zIndex = "";
      });
    }

    // Preserve a selection if the map renderer is recreated (for example,
    // after a responsive remount) while the details sheet remains mounted.
    syncSelectedMarker(markersRef.current, selectedTKeyRef.current);

    const updateEdgeIndicator = () => {
      const indicator = edgeIndicatorRef.current;
      const selected = markersRef.current.find(
        (marker) => marker.tKey === selectedTKeyRef.current,
      );
      if (!indicator || !selected) {
        if (edgeIndicatorVisibleRef.current) {
          edgeIndicatorVisibleRef.current = false;
          setEdgeIndicatorVisible(false);
        }
        return;
      }

      const position = getEdgeIndicatorPosition(
        map,
        markersRef.current,
        selectedTKeyRef.current,
        selectionMode === "external",
      );
      const shouldShowIndicator = Boolean(position);
      if (edgeIndicatorVisibleRef.current !== shouldShowIndicator) {
        edgeIndicatorVisibleRef.current = shouldShowIndicator;
        setEdgeIndicatorVisible(shouldShowIndicator);
      }
      if (!position) return;
      indicator.style.borderColor = selected.place.categoryColor;
      indicator.style.color = selected.place.categoryColor;
      indicator.style.transform = `translate3d(${position.x - 22}px, ${position.y - 22}px, 0)`;
    };
    const handleUserMapMovement = (event: MapMovementEvent) => {
      if (event.originalEvent) onMapInteraction?.();
      updateEdgeIndicator();
    };
    updateEdgeIndicatorRef.current = updateEdgeIndicator;
    map.on("movestart", handleUserMapMovement);
    map.on("move", updateEdgeIndicator);
    map.on("moveend", updateEdgeIndicator);
    map.on("render", updateEdgeIndicator);
    map.on("resize", updateEdgeIndicator);
    updateEdgeIndicator();

    return () => {
      clearLoadTimeout();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      resizeObserver.disconnect();
      fallbackFrameRef.current = null;
      updateEdgeIndicatorRef.current = () => undefined;
      map.off("movestart", handleUserMapMovement);
      map.off("move", updateEdgeIndicator);
      map.off("moveend", updateEdgeIndicator);
      map.off("render", updateEdgeIndicator);
      map.off("resize", updateEdgeIndicator);
      mapRef.current = null;
      markersRef.current = [];
      if (!mapRemoved) map.remove();
    };
  }, [cooperativeGestures, onMapInteraction, onPlaceSelect, selectionMode, t]);

  useEffect(() => {
    for (const marker of markersRef.current) {
      const matchesCategory =
        marker.category === "hotel" ||
        activeCategory === "all" ||
        marker.category === activeCategory;
      marker.setVisible(matchesCategory);
    }
  }, [activeCategory]);

  useEffect(() => {
    selectedTKeyRef.current = selectedTKey;
    syncSelectedMarker(markersRef.current, selectedTKey);
    updateEdgeIndicatorRef.current();
  }, [selectedTKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!focusRequest) return;

    if (!map) {
      const fallbackCoords =
        focusRequest.tKey === "hotel"
          ? HOTEL
          : MAP_POIS.find((poi) => poi.tKey === focusRequest.tKey)?.coords;
      if (fallbackCoords && fallbackFrameRef.current) {
        fallbackFrameRef.current.src = makeOsmEmbedUrl(fallbackCoords);
      }
      return;
    }

    const selected = markersRef.current.find(
      (marker) => marker.tKey === focusRequest.tKey,
    );
    if (!selected) return;

    focusMapMarker(map, markersRef.current, selected, {
      moveCamera: true,
      onPlaceSelect,
      showPopup: selectionMode === "popup",
    });
  }, [focusRequest, onPlaceSelect, selectionMode]);

  return (
    <div className="relative h-full w-full">
      <div className="h-full w-full" ref={containerRef} />
      {selectionMode === "external" && selectedTKey && (
        <button
          aria-label={t("details.returnToPlace", {
            place:
              selectedTKey === "hotel"
                ? t("hotel.label")
                : t(`pois.${selectedTKey}.label`),
          })}
          aria-hidden={!edgeIndicatorVisible}
          className={`absolute left-0 top-0 z-1000 flex h-11 w-11 will-change-transform items-center justify-center rounded-full border-2 bg-white/95 shadow-lg backdrop-blur-sm transition-opacity duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38645b] ${
            edgeIndicatorVisible
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
          onClick={() => {
            onMapInteraction?.();
            const map = mapRef.current;
            const selected = markersRef.current.find(
              (marker) => marker.tKey === selectedTKeyRef.current,
            );
            if (!map || !selected) return;
            map.easeTo({
              center: selected.coords,
              duration: 450,
              essential: true,
              offset: [0, 55],
              zoom: Math.max(map.getZoom(), 15),
            });
          }}
          ref={edgeIndicatorRef}
          type="button"
        >
          <MapPin aria-hidden="true" fill="currentColor" size={23} />
        </button>
      )}
    </div>
  );
}
