"use client";

import React from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import hotelLogo from "@assets/old-web-images/logo-sin-fondo-270.png";

// Hotel — verified pin from the owner's share link (@-50.3357896,-72.2666423)
const HOTEL: [number, number] = [-50.33579, -72.26664];
const HOTEL_GOOGLE_MAPS_URL = "https://maps.app.goo.gl/fcEX1Tgnc37brYYAA";
const INITIAL_ZOOM = 15;

type PoiCategory =
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

type Poi = {
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
const POIS: Poi[] = [
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
  restaurant: "#c0392b",
  bar: "#8e44ad",
  cafe: "#e67e22",
  attraction: "#2980b9",
  transport: "#27ae60",
  nature: "#16a085",
  shop: "#7f8c8d",
  bank: "#d4ac0d",
  tourism: "#1a6a8a",
  centre: "#e84393",
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
    `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="46" viewBox="0 0 34 46" style="filter:drop-shadow(0 2px 5px rgba(0,0,0,.35))">`,
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

function makeDivIcon(html: string, w: number, h: number): L.DivIcon {
  return L.divIcon({
    html,
    className: "",
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -(h + 4)],
  });
}

const POPUP_LINK_STYLE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  marginTop: "6px",
  fontSize: "11px",
  fontWeight: 600,
  color: "#2980b9",
  textDecoration: "none",
};

function SetView() {
  const map = useMap();
  useEffect(() => {
    map.setView(HOTEL, INITIAL_ZOOM);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export function HotelMap() {
  const t = useTranslations("location.map");
  const hotelIcon = useMemo(() => makeDivIcon(hotelMarkerHtml(), 60, 67), []);
  const poiIcons = useMemo(
    () =>
      Object.fromEntries(
        (Object.keys(CATEGORY_COLOR) as PoiCategory[]).map((cat) => [
          cat,
          makeDivIcon(makePinSvg(cat), 34, 46),
        ]),
      ) as Record<PoiCategory, L.DivIcon>,
    [],
  );

  return (
    <MapContainer
      center={HOTEL}
      zoom={INITIAL_ZOOM}
      className="h-full w-full"
      scrollWheelZoom
      zoomControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>'
        maxZoom={20}
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <SetView />

      {/* Hotel — primary marker (the logo badge carries the name on its own) */}
      <Marker icon={hotelIcon} position={HOTEL}>
        <Popup>
          <p style={{ fontWeight: 700, fontSize: "13px", color: "#1f2b27", marginBottom: "2px" }}>
            Los Lagos Hotel
          </p>
          <p style={{ fontSize: "12px", color: "#5f6e69" }}>{t("hotel.address")}</p>
          <a
            href={HOTEL_GOOGLE_MAPS_URL}
            rel="noopener noreferrer"
            style={POPUP_LINK_STYLE}
            target="_blank"
          >
            {t("viewOnGoogleMaps")}
          </a>
        </Popup>
      </Marker>

      {/* Points of interest */}
      {POIS.map((poi) => (
        <Marker
          icon={poiIcons[poi.category]}
          key={poi.tKey}
          position={poi.coords}
          zIndexOffset={poi.category === "centre" ? 500 : 0}
        >
          {poi.category === "centre" && (
            <Tooltip permanent direction="right" offset={[16, -32]}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#1f2b27" }}>
                {t("centreLabel")}
              </span>
            </Tooltip>
          )}
          <Popup>
            <p style={{ fontWeight: 700, fontSize: "13px", color: "#1f2b27", marginBottom: "1px" }}>
              {t(`pois.${poi.tKey}.label`)}
            </p>
            <p style={{ fontSize: "11px", color: CATEGORY_COLOR[poi.category], fontWeight: 600, marginBottom: "3px" }}>
              {t(`categories.${poi.category}`)}
            </p>
            <p style={{ fontSize: "12px", color: "#5f6e69" }}>{t(`pois.${poi.tKey}.note`)}</p>
            <a
              href={poi.url}
              rel="noopener noreferrer"
              style={POPUP_LINK_STYLE}
              target="_blank"
            >
              {t("viewOnGoogleMaps")}
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
