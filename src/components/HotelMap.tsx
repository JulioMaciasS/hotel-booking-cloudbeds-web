"use client";

import React from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";

// Hotel — verified from Google Maps @-50.3357896,-72.2666423
const HOTEL: [number, number] = [-50.33579, -72.26664];
const HOTEL_GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/Hotel+Los+Lagos/@-50.3361799,-72.2666852,17z/data=!4m11!3m10!1s0xbdbb0cbecdfaad93:0xabbbd7fd7dbc58e5!5m4!1s2026-07-23!2i5!4m1!1i2!8m2!3d-50.3357896!4d-72.2666423!16s%2Fg%2F1tdx0s_r?entry=tts&g_ep=EgoyMDI2MDYwMi4wIPu8ASoASAFQAw%3D%3D&skid=caa95aa2-6c5f-485c-916b-f122cb914a77";
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
  label: string;
  coords: [number, number];
  note: string;
  category: PoiCategory;
  url: string;
};

/*
 * Coordinates sourced from:
 * - La Tablita: Google Maps @-50.3379421,-72.2572912
 * - Glaciarium: Wikivoyage -50.336632,-72.339819
 * - Perito Moreno: Wikivoyage -50.483333,-73.05
 * - Centro Interpretación: Wikivoyage -50.330988,-72.265066
 * - Airport FTE: Wikivoyage -50.2799,-72.0531
 * - All others geocoded from confirmed street addresses on the
 *   Av. del Libertador grid (~0.0000134°lng per address number)
 */
const POIS: Poi[] = [
  // ── Centre ────────────────────────────────────────────────────────────────
  {
    label: "Centro de El Calafate",
    coords: [-50.33770, -72.26820],
    note: "Corazón comercial y gastronómico de la ciudad",
    category: "centre",
    url: "https://www.google.com/maps/search/Centro+El+Calafate+Argentina",
  },

  // ── Restaurants ──────────────────────────────────────────────────────────
  {
    label: "La Tablita",
    coords: [-50.33794, -72.25729],
    note: "Parrilla patagónica icónica desde 1965 · Cnel. Rosales 28",
    category: "restaurant",
    url: "https://www.google.com/maps/place/La+Tablita/@-50.3379421,-72.2572912,17z",
  },
  {
    label: "Casimiro Biguá",
    coords: [-50.33770, -72.27412],
    note: "Gourmet & parrilla · Av. Libertador 963",
    category: "restaurant",
    url: "https://www.google.com/maps/search/Casimiro+Bigua+El+Calafate+Argentina",
  },
  {
    label: "Mi Viejo",
    coords: [-50.33790, -72.27740],
    note: "Parrilla argentina · Av. Libertador 1111",
    category: "restaurant",
    url: "https://www.google.com/maps/search/Mi+Viejo+restaurante+El+Calafate+Argentina",
  },
  {
    label: "Mako Fuegos y Vinos",
    coords: [-50.33800, -72.27870],
    note: "Cocina de autor & vinos · Av. Libertador 1223",
    category: "restaurant",
    url: "https://www.google.com/maps/search/Mako+Fuegos+y+Vinos+El+Calafate",
  },
  {
    label: "La Zaina Cocina Patagónica",
    coords: [-50.33860, -72.27550],
    note: "Cocina regional · Gregores 1057",
    category: "restaurant",
    url: "https://www.google.com/maps/search/La+Zaina+Cocina+Patagonica+El+Calafate",
  },
  {
    label: "La Lechuza",
    coords: [-50.33857, -72.26825],
    note: "Pizzas & pastas · Av. Libertador 1301",
    category: "restaurant",
    url: "https://www.google.com/maps/search/La+Lechuza+El+Calafate+Argentina",
  },

  // ── Bars ──────────────────────────────────────────────────────────────────
  {
    label: "La Zorra Taproom",
    coords: [-50.33756, -72.27256],
    note: "Cerveza artesanal patagónica · Av. Libertador 832",
    category: "bar",
    url: "https://www.google.com/maps/search/La+Zorra+Taproom+El+Calafate",
  },
  {
    label: "Borges y Álvarez Libro-Bar",
    coords: [-50.33789, -72.27502],
    note: "Bar literario & cerveza artesanal · Av. Libertador 1015",
    category: "bar",
    url: "https://www.google.com/maps/search/Borges+y+Alvarez+Libro+Bar+El+Calafate",
  },

  // ── Cafés ─────────────────────────────────────────────────────────────────
  {
    label: "Viva la Pepa",
    coords: [-50.33892, -72.26818],
    note: "Crepería & café · Amado 833",
    category: "cafe",
    url: "https://www.google.com/maps/search/Viva+la+Pepa+El+Calafate+Argentina",
  },
  {
    label: "Chocolates Ovejitas",
    coords: [-50.33805, -72.27840],
    note: "Chocolatería & café patagónico · Av. Libertador 1197",
    category: "cafe",
    url: "https://www.google.com/maps/search/Chocolates+Ovejitas+El+Calafate",
  },

  // ── Attractions ───────────────────────────────────────────────────────────
  {
    label: "Av. del Libertador",
    coords: [-50.33780, -72.26860],
    note: "Calle peatonal principal · ~200 m caminando",
    category: "attraction",
    url: "https://www.google.com/maps/search/Avenida+del+Libertador+El+Calafate",
  },
  {
    label: "Centro de Interpretación Histórica",
    coords: [-50.33099, -72.26507],
    note: "Museo local · Av. Brown y Bonarelli · ~700 m",
    category: "attraction",
    url: "https://www.google.com/maps/search/Centro+Interpretacion+Historica+El+Calafate",
  },
  {
    label: "Glaciarium",
    coords: [-50.33663, -72.33982],
    note: "Museo de glaciares · Ruta 11 · 5 km en auto",
    category: "attraction",
    url: "https://www.google.com/maps/search/Glaciarium+El+Calafate",
  },
  {
    label: "Glaciar Perito Moreno",
    coords: [-50.48333, -73.05000],
    note: "Maravilla natural · 80 km · 1.5 h en bus",
    category: "attraction",
    url: "https://www.google.com/maps/search/Glaciar+Perito+Moreno+Argentina",
  },

  // ── Nature ────────────────────────────────────────────────────────────────
  {
    label: "Lago Argentino (orilla)",
    coords: [-50.34780, -72.27350],
    note: "Orilla del lago · ~400 m caminando",
    category: "nature",
    url: "https://www.google.com/maps/search/Lago+Argentino+El+Calafate",
  },
  {
    label: "Laguna Nimez",
    coords: [-50.34890, -72.27240],
    note: "Reserva de aves · ~1.2 km caminando",
    category: "nature",
    url: "https://www.google.com/maps/search/Laguna+Nimez+El+Calafate",
  },

  // ── Transport ─────────────────────────────────────────────────────────────
  {
    label: "Terminal de Ómnibus",
    coords: [-50.33626, -72.25697],
    note: "Terminal de buses · ~700 m caminando",
    category: "transport",
    url: "https://www.google.com/maps/search/Terminal+Omnibus+El+Calafate+Argentina",
  },
  {
    label: "Aeropuerto FTE",
    coords: [-50.27990, -72.05310],
    note: "Aeropuerto Malvinas Argentinas · 16 km en auto",
    category: "transport",
    url: "https://www.google.com/maps/search/Aeropuerto+El+Calafate+FTE",
  },

  // ── Banks ─────────────────────────────────────────────────────────────────
  {
    label: "Banco Santa Cruz",
    coords: [-50.33800, -72.27960],
    note: "Sucursal bancaria & cajero · Av. Libertador 1285",
    category: "bank",
    url: "https://www.google.com/maps/search/Banco+Santa+Cruz+El+Calafate",
  },
  {
    label: "Banco Nación Argentina",
    coords: [-50.33790, -72.27769],
    note: "Sucursal bancaria & cajero · Av. Libertador 1133",
    category: "bank",
    url: "https://www.google.com/maps/search/Banco+Nacion+Argentina+El+Calafate",
  },

  // ── Tourism agencies ──────────────────────────────────────────────────────
  {
    label: "Interlagos Turismo",
    coords: [-50.33800, -72.27821],
    note: "Agencia de excursiones · Av. Libertador 1175",
    category: "tourism",
    url: "https://www.google.com/maps/search/Interlagos+Turismo+El+Calafate",
  },
  {
    label: "Cal-Tur",
    coords: [-50.33788, -72.27589],
    note: "Agencia de turismo · Av. Libertador 1080",
    category: "tourism",
    url: "https://www.google.com/maps/search/Cal-Tur+El+Calafate+Argentina",
  },

  // ── Shops ─────────────────────────────────────────────────────────────────
  {
    label: "Supermercado La Anónima",
    coords: [-50.33710, -72.26350],
    note: "Supermercado · centro",
    category: "shop",
    url: "https://www.google.com/maps/search/La+Anonima+El+Calafate+Argentina",
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
  // Leaf
  nature:
    "M12 22V12M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
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

const CATEGORY_LABEL: Record<PoiCategory, string> = {
  restaurant: "Restaurante",
  bar: "Bar",
  cafe: "Café",
  attraction: "Atracción",
  transport: "Transporte",
  nature: "Naturaleza",
  shop: "Comercio",
  bank: "Banco",
  tourism: "Agencia de turismo",
  centre: "Centro de la ciudad",
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

function hotelPinSvg(): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="54" viewBox="0 0 40 54" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,.4))">`,
    `<path d="M20 0C9 0 0 9 0 20c0 13.5 20 34 20 34S40 33.5 40 20C40 9 31 0 20 0z" fill="#38645b"/>`,
    `<circle cx="20" cy="20" r="14" fill="white"/>`,
    `<svg x="6" y="6" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38645b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">`,
    `<path d="M3 22V8l9-6 9 6v14M3 22h18M9 22v-6h6v6M9 10h1M14 10h1M9 14h1M14 14h1"/>`,
    `</svg></svg>`,
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
  const hotelIcon = useMemo(() => makeDivIcon(hotelPinSvg(), 40, 54), []);
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
      scrollWheelZoom={false}
      zoomControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>'
        maxZoom={20}
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <SetView />

      {/* Hotel — primary marker */}
      <Marker icon={hotelIcon} position={HOTEL}>
        <Tooltip permanent direction="right" offset={[18, -38]}>
          <span style={{ fontWeight: 700, fontSize: "12px", color: "#1f2b27" }}>
            Los Lagos Hotel
          </span>
        </Tooltip>
        <Popup>
          <p style={{ fontWeight: 700, fontSize: "13px", color: "#1f2b27", marginBottom: "2px" }}>
            Los Lagos Hotel
          </p>
          <p style={{ fontSize: "12px", color: "#5f6e69" }}>25 de Mayo 220, El Calafate</p>
          <a
            href={HOTEL_GOOGLE_MAPS_URL}
            rel="noopener noreferrer"
            style={POPUP_LINK_STYLE}
            target="_blank"
          >
            Ver en Google Maps ↗
          </a>
        </Popup>
      </Marker>

      {/* Points of interest */}
      {POIS.map((poi) => (
        <Marker
          icon={poiIcons[poi.category]}
          key={poi.label}
          position={poi.coords}
          zIndexOffset={poi.category === "centre" ? 500 : 0}
        >
          {poi.category === "centre" && (
            <Tooltip permanent direction="right" offset={[16, -32]}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#1f2b27" }}>
                Centro
              </span>
            </Tooltip>
          )}
          <Popup>
            <p style={{ fontWeight: 700, fontSize: "13px", color: "#1f2b27", marginBottom: "1px" }}>
              {poi.label}
            </p>
            <p style={{ fontSize: "11px", color: CATEGORY_COLOR[poi.category], fontWeight: 600, marginBottom: "3px" }}>
              {CATEGORY_LABEL[poi.category]}
            </p>
            <p style={{ fontSize: "12px", color: "#5f6e69" }}>{poi.note}</p>
            <a
              href={poi.url}
              rel="noopener noreferrer"
              style={POPUP_LINK_STYLE}
              target="_blank"
            >
              Ver en Google Maps ↗
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
