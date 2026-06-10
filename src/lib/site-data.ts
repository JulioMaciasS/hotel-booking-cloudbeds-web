import type { StaticImageData } from "next/image";
import {
  Bus,
  Car,
  CigaretteOff,
  ConciergeBell,
  Footprints,
  Luggage,
  MapPin,
  Mountain,
  MountainSnow,
  Plane,
  SprayCan,
  Users,
  WashingMachine,
  Waves,
  type LucideIcon,
} from "lucide-react";

import glacierImage from "@assets/old-web-images/the-perito-moreno-glacier-los-glaciares-national-2023-11-27-04-56-26-utc.jpg";
import glacierCloseImage from "@assets/old-web-images/the-perito-moreno-glacier-los-glaciares-national-2023-11-27-05-29-51-utc.jpg";
import cerroTorreImage from "@assets/old-web-images/cerro-torre-los-glaciares-national-park-patagoni-2023-11-27-05-11-13-utc.jpg";
import fitzRoyImage from "@assets/old-web-images/red-beech-trees-opposite-fitzroy-mount-autumn-in-2023-11-27-04-54-39-utc.jpg";

// ─── Hotel constants ─────────────────────────────────────────────────────────
// Proper nouns / numbers / URLs — identical across locales.

export const HOTEL = {
  name: "Los Lagos Hotel",
  street: "25 de Mayo 220",
  cityLine: "Z9405 El Calafate, Santa Cruz, Argentina",
  phone: "+54 2902 417738",
  phoneHref: "tel:+542902417738",
  whatsapp: "+54 9 2902 417738",
  whatsappHref: "https://wa.me/5492902417738",
  email: "loslagoshotelcalafate@gmail.com",
  checkIn: "14:00",
  checkOut: "10:00",
  rooms: 14,
  googleMapsUrl:
    "https://www.google.com/maps/place/Hotel+Los+Lagos/@-50.3361799,-72.2666852,17z/data=!4m11!3m10!1s0xbdbb0cbecdfaad93:0xabbbd7fd7dbc58e5!5m4!1s2026-07-23!2i5!4m1!1i2!8m2!3d-50.3357896!4d-72.2666423!16s%2Fg%2F1tdx0s_r?entry=tts&g_ep=EgoyMDI2MDYwMi4wIPu8ASoASAFQAw%3D%3D&skid=caa95aa2-6c5f-485c-916b-f122cb914a77",
  tripadvisorUrl:
    "https://www.tripadvisor.es/Hotel_Review-g312851-d1883505-Reviews-Los_Lagos_Hotel-El_Calafate_Province_of_Santa_Cruz_Patagonia.html",
  bookingUrl: "https://www.booking.com/hotel/ar/los-lagos-el-calafate.es.html",
} as const;

// ─── Services ──────────────────────────────────────────────────────────────
// Icons + stable keys; copy lives in the `hotel.services` message namespace,
// keyed by `key` (each has a `.name` and `.description`).

export const services: { key: string; icon: LucideIcon }[] = [
  { key: "housekeeping", icon: SprayCan },
  { key: "parking", icon: Car },
  { key: "luggage", icon: Luggage },
  { key: "laundry", icon: WashingMachine },
  { key: "concierge", icon: ConciergeBell },
  { key: "family", icon: Users },
  { key: "nonSmoking", icon: CigaretteOff },
];

// ─── Trips / Excursions ──────────────────────────────────────────────────────
// Image + stable key; copy lives in the `experiences.trips` namespace, keyed by
// `key` (`.name`, `.description`, `.duration`, `.distance`, `.highlight`).

export type Trip = { key: string; image: StaticImageData };

export const trips: Trip[] = [
  { key: "peritoMoreno", image: glacierImage },
  { key: "minitrekking", image: glacierCloseImage },
  { key: "navigation", image: cerroTorreImage },
  { key: "chalten", image: fitzRoyImage },
];

// ─── Reviews ─────────────────────────────────────────────────────────────────
// Author / rating / source stay in code; the localizable parts (`text`,
// `origin`, `date`, `trip`) live in the `reviews.items` namespace as an array
// aligned to this one by index.

export type ReviewMeta = {
  author: string;
  rating: number;
  source: "tripadvisor" | "google" | "booking";
};

export const reviews: ReviewMeta[] = [
  { author: "Maria Esther R.", rating: 5, source: "tripadvisor" },
  { author: "Rodrigo F.", rating: 5, source: "google" },
  { author: "cris_garcia", rating: 5, source: "tripadvisor" },
  { author: "Patrick H.", rating: 5, source: "tripadvisor" },
  { author: "Laura I.", rating: 4, source: "google" },
  { author: "Dioni Velázquez", rating: 4, source: "tripadvisor" },
  { author: "anaannese", rating: 4, source: "tripadvisor" },
  { author: "Luciana M.", rating: 4, source: "booking" },
  { author: "Markus W.", rating: 5, source: "booking" },
  { author: "Valentina C.", rating: 4, source: "booking" },
];

// ─── Distances ───────────────────────────────────────────────────────────────
// Numeric value / time / icons stay in code; `label` and `modeLabel` live in
// the `location.distances` namespace as an array aligned by index.

export type Distance = {
  value: string;
  time: string;
  modeIcon: LucideIcon;
  icon: LucideIcon;
};

export const distances: Distance[] = [
  { value: "200 m", time: "~3 min", modeIcon: Footprints, icon: MapPin },
  { value: "700 m", time: "~9 min", modeIcon: Footprints, icon: Bus },
  { value: "1.4 km", time: "~17 min", modeIcon: Footprints, icon: Waves },
  { value: "5 km", time: "~10 min", modeIcon: Car, icon: MountainSnow },
  { value: "16 km", time: "~30 min", modeIcon: Car, icon: Plane },
  { value: "80 km", time: "~1.5 h", modeIcon: Bus, icon: Mountain },
];
