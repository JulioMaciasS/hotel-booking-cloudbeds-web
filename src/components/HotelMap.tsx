"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";

const HOTEL: [number, number] = [-50.33588, -72.26668];

const POIS: { label: string; coords: [number, number]; note: string }[] = [
  {
    label: "Av. del Libertador (calle peatonal)",
    coords: [-50.3378, -72.2630],
    note: "200 m · caminando",
  },
  {
    label: "Lago Argentino (orilla)",
    coords: [-50.3460, -72.2690],
    note: "400 m · caminando",
  },
  {
    label: "Terminal de Ómnibus",
    coords: [-50.3368, -72.2565],
    note: "700 m · caminando",
  },
  {
    label: "Laguna Nimez (reserva de aves)",
    coords: [-50.3535, -72.2810],
    note: "1.2 km · caminando",
  },
  {
    label: "Glaciarium (centro de interpretación)",
    coords: [-50.3352, -72.2895],
    note: "5 km · en auto",
  },
];

function hotelDivIcon() {
  return L.divIcon({
    html: `<svg viewBox="0 0 32 44" xmlns="http://www.w3.org/2000/svg" width="32" height="44" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.35))"><path d="M16 0C7.2 0 0 7.2 0 16c0 10.5 16 28 16 28S32 26.5 32 16C32 7.2 24.8 0 16 0z" fill="#38645b"/><circle cx="16" cy="16" r="9" fill="white"/><circle cx="16" cy="16" r="5" fill="#38645b"/></svg>`,
    className: "",
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -46],
  });
}

function poiDivIcon() {
  return L.divIcon({
    html: `<svg viewBox="0 0 22 30" xmlns="http://www.w3.org/2000/svg" width="22" height="30" style="filter:drop-shadow(0 1px 3px rgba(0,0,0,.28))"><path d="M11 0C4.9 0 0 4.9 0 11c0 6.7 11 19 11 19S22 17.7 22 11C22 4.9 17.1 0 11 0z" fill="#5f6e69"/><circle cx="11" cy="11" r="5" fill="white"/></svg>`,
    className: "",
    iconSize: [22, 30],
    iconAnchor: [11, 30],
    popupAnchor: [0, -32],
  });
}

function FitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(L.latLngBounds(coords), { padding: [50, 50], maxZoom: 14 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export function HotelMap() {
  const allCoords: [number, number][] = [HOTEL, ...POIS.map((p) => p.coords)];
  const hotelIcon = useMemo(() => hotelDivIcon(), []);
  const poiIcon = useMemo(() => poiDivIcon(), []);

  return (
    <MapContainer
      center={HOTEL}
      zoom={9}
      className="h-full w-full"
      scrollWheelZoom={false}
      zoomControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>'
        maxZoom={20}
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <FitBounds coords={allCoords} />

      {/* Hotel — primary marker */}
      <Marker icon={hotelIcon} position={HOTEL}>
        <Tooltip permanent direction="right" offset={[14, -30]}>
          <span style={{ fontWeight: 700, fontSize: "12px", color: "#1f2b27" }}>Los Lagos Hotel</span>
        </Tooltip>
        <Popup>
          <p
            style={{
              fontWeight: 700,
              fontSize: "13px",
              color: "#1f2b27",
              marginBottom: "2px",
            }}
          >
            Los Lagos Hotel
          </p>
          <p style={{ fontSize: "12px", color: "#5f6e69" }}>
            25 de Mayo 220, El Calafate
          </p>
        </Popup>
      </Marker>

      {/* Points of interest */}
      {POIS.map((poi) => (
        <Marker icon={poiIcon} key={poi.label} position={poi.coords}>
          <Tooltip permanent direction="right" offset={[10, -18]}>
            <span style={{ fontSize: "11px", color: "#1f2b27" }}>{poi.label}</span>
          </Tooltip>
          <Popup>
            <p
              style={{
                fontWeight: 700,
                fontSize: "13px",
                color: "#1f2b27",
                marginBottom: "2px",
              }}
            >
              {poi.label}
            </p>
            <p style={{ fontSize: "12px", color: "#5f6e69" }}>{poi.note}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
