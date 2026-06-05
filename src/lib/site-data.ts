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

import glacierImage from "../../assets/old-web-images/the-perito-moreno-glacier-los-glaciares-national-2023-11-27-04-56-26-utc.jpg";
import glacierCloseImage from "../../assets/old-web-images/the-perito-moreno-glacier-los-glaciares-national-2023-11-27-05-29-51-utc.jpg";
import cerroTorreImage from "../../assets/old-web-images/cerro-torre-los-glaciares-national-park-patagoni-2023-11-27-05-11-13-utc.jpg";
import fitzRoyImage from "../../assets/old-web-images/red-beech-trees-opposite-fitzroy-mount-autumn-in-2023-11-27-04-54-39-utc.jpg";

// ─── Hotel constants ─────────────────────────────────────────────────────────

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

// ─── Services ────────────────────────────────────────────────────────────────

export const services: { name: string; description: string; icon: LucideIcon }[] = [
  {
    name: "Servicio Diario de Mucama",
    description:
      "Limpieza diaria de habitaciones. Cambio de toallas cada 2 días y sábanas cada 7 días.",
    icon: SprayCan,
  },
  {
    name: "Estacionamiento Vigilado",
    description:
      "Estacionamiento descubierto en la puerta del hotel, monitoreado por cámaras de seguridad.",
    icon: Car,
  },
  {
    name: "Guardaequipaje",
    description:
      "Servicio de custodia de equipaje disponible antes del check-in y después del check-out.",
    icon: Luggage,
  },
  {
    name: "Servicio de Lavandería",
    description: "Servicio de lavandería disponible para los huéspedes.",
    icon: WashingMachine,
  },
  {
    name: "Conserjería",
    description:
      "Asistencia personalizada para organizar excursiones, traslados y reservas locales.",
    icon: ConciergeBell,
  },
  {
    name: "Apto para Familias",
    description:
      "Habitaciones triples y configuraciones especiales para familias con niños.",
    icon: Users,
  },
  {
    name: "Habitaciones No Fumadores",
    description:
      "Todas las habitaciones y espacios comunes son libres de humo.",
    icon: CigaretteOff,
  },
];

// ─── Trips / Excursions ──────────────────────────────────────────────────────

export type Trip = {
  name: string;
  description: string;
  duration: string;
  distance: string;
  image: StaticImageData;
  highlight: string;
};

export const trips: Trip[] = [
  {
    name: "Glaciar Perito Moreno",
    description:
      "El glaciar más famoso de Patagonia. Excursión de día completo en bus con pasarelas de madera y vistas privilegiadas al glaciar en movimiento.",
    duration: "Día completo",
    distance: "80 km · 1.5 h en bus",
    image: glacierImage,
    highlight: "Excursión estrella",
  },
  {
    name: "Minitrekking sobre el Glaciar",
    description:
      "Caminata sobre el hielo del Perito Moreno con crampones y guías certificados. Una experiencia única que combina navegación y trekking.",
    duration: "Día completo",
    distance: "80 km · 1.5 h en bus",
    image: glacierCloseImage,
    highlight: "Experiencia única",
  },
  {
    name: "Navegación Lago Argentino",
    description:
      "Safari lacustre por el Lago Argentino con vistas a los glaciares Upsala, Spegazzini y Onelli. Salida desde Puerto Bandera.",
    duration: "Día completo",
    distance: "45 km · 45 min en bus",
    image: cerroTorreImage,
    highlight: "Navegación glaciar",
  },
  {
    name: "El Chaltén – Fitz Roy",
    description:
      "La capital nacional del trekking. Senderos con vistas al Cerro Fitz Roy y Cerro Torre en el Parque Nacional Los Glaciares.",
    duration: "Día completo",
    distance: "220 km · 2.5 h en bus",
    image: fitzRoyImage,
    highlight: "Trekking legendario",
  },
];

// ─── Reviews ─────────────────────────────────────────────────────────────────

export type Review = {
  author: string;
  origin: string;
  date: string;
  rating: number;
  text: string;
  trip: string;
  source: "tripadvisor" | "google" | "booking";
};

export const reviews: Review[] = [
  {
    author: "Maria Esther R.",
    origin: "Sevilla, España",
    date: "Diciembre 2025",
    rating: 5,
    text: "Buenas instalaciones. Personal de recepción muy agradable, sobre todo el chico de la tarde/noche. Desayuno muy completo. Buena relación precio/calidad.",
    trip: "Viaje en pareja",
    source: "tripadvisor",
  },
  {
    author: "Rodrigo F.",
    origin: "Santiago, Chile",
    date: "Enero 2025",
    rating: 5,
    text: "Muy buena opción en El Calafate. Cálido, limpio y bien ubicado. El desayuno está muy completo y el personal siempre dispuesto a ayudar con excursiones y traslados.",
    trip: "Viaje en familia",
    source: "google",
  },
  {
    author: "cris_garcia",
    origin: "Avellaneda, Argentina",
    date: "Febrero 2023",
    rating: 5,
    text: "Excelente relación precio calidad. La calefacción, la ducha, los colchones y ropa de cama impecables. La amabilidad y buena predisposición de Juan es para destacar. Nos sentimos muy a gusto en este hotel.",
    trip: "Viaje en pareja",
    source: "tripadvisor",
  },
  {
    author: "Patrick H.",
    origin: "Europa",
    date: "Diciembre 2018",
    rating: 5,
    text: "La habitación estaba limpia, la limpiaban cada día y las camas eran cómodas. Desayuno incluido: pan, café, leche, yogures, zumos, cereales, mermelada, queso y jamón. Definitivamente me quedaría aquí de nuevo.",
    trip: "Viaje en pareja",
    source: "tripadvisor",
  },
  {
    author: "Laura I.",
    origin: "Buenos Aires, Argentina",
    date: "Marzo 2024",
    rating: 4,
    text: "Excelente relación calidad-precio. Las habitaciones son acogedoras y la calefacción funcionó perfectamente durante las noches frías. La recepción 24 horas fue muy conveniente al llegar tarde.",
    trip: "Viaje en pareja",
    source: "google",
  },
  {
    author: "Dioni Velázquez",
    origin: "Asunción, Paraguay",
    date: "Julio 2023",
    rating: 4,
    text: "Hotel coqueto, pequeño pero muy lindo. Queda cerca de la zona céntrica, los traslados se pueden hacer caminando. Lindas vistas a las montañas nevadas. Buen desayuno incluido.",
    trip: "Viaje en pareja",
    source: "tripadvisor",
  },
  {
    author: "anaannese",
    origin: "Bahía Blanca, Argentina",
    date: "Febrero 2023",
    rating: 4,
    text: "Súper bien ubicado, a 3 cuadras de la calle principal. La ducha con buena presión y buen agua caliente. El WiFi funciona muy bien. La gente que atiende siempre muy amable.",
    trip: "Viaje en solitario",
    source: "tripadvisor",
  },
  {
    author: "Luciana M.",
    origin: "Córdoba, Argentina",
    date: "Abril 2025",
    rating: 4,
    text: "Muy buena relación precio-calidad. Ubicación inmejorable para recorrer el centro y el lago. El desayuno muy variado y el personal siempre atento. Habitaciones sencillas pero cómodas y con buena calefacción para las noches frías.",
    trip: "Viaje en pareja",
    source: "booking",
  },
  {
    author: "Markus W.",
    origin: "Alemania",
    date: "Noviembre 2024",
    rating: 5,
    text: "Perfect location, a few minutes walk from the town center and the lake. Breakfast was excellent with a great variety. The staff was very helpful with excursion bookings to Perito Moreno. Would definitely stay again.",
    trip: "Viaje en pareja",
    source: "booking",
  },
  {
    author: "Valentina C.",
    origin: "Montevideo, Uruguay",
    date: "Enero 2024",
    rating: 4,
    text: "Habitación limpia y muy calefaccionada, esencial en El Calafate. El personal nos ayudó a organizar las excursiones. Buena relación calidad-precio para Patagonia. Lo recomendaría para viajeros que buscan comodidad céntrica.",
    trip: "Viaje en pareja",
    source: "booking",
  },
];

// ─── Distances ───────────────────────────────────────────────────────────────

export type Distance = {
  label: string;
  value: string;
  time: string;
  modeIcon: LucideIcon;
  modeLabel: string;
  icon: LucideIcon;
};

export const distances: Distance[] = [
  { label: "Centro — Av. del Libertador", value: "200 m", time: "~3 min", modeIcon: Footprints, modeLabel: "Caminando", icon: MapPin },
  { label: "Terminal de Ómnibus", value: "700 m", time: "~9 min", modeIcon: Footprints, modeLabel: "Caminando", icon: Bus },
  { label: "Lago Argentino (orilla)", value: "1.4 km", time: "~17 min", modeIcon: Footprints, modeLabel: "Caminando", icon: Waves },
  { label: "Glaciarium", value: "5 km", time: "~10 min", modeIcon: Car, modeLabel: "En auto", icon: MountainSnow },
  { label: "Aeropuerto El Calafate (FTE)", value: "16 km", time: "~30 min", modeIcon: Car, modeLabel: "En auto", icon: Plane },
  { label: "Glaciar Perito Moreno", value: "80 km", time: "~1.5 h", modeIcon: Bus, modeLabel: "En bus", icon: Mountain },
];
