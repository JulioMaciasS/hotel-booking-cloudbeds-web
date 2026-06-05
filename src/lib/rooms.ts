import type { StaticImageData } from "next/image";
import {
  Coffee,
  ShowerHead,
  Thermometer,
  Tv,
  Wifi,
  type LucideIcon,
} from "lucide-react";

// ─── Photo imports ─────────────────────────────────────────────────────────

// Doble Estándar
import dblStd1 from "../../assets/updated images/dobles/doble_std_mat_hab_a_01_rightcenenteredbed_withabitvisiblewindow.jpg";
import dblStd2 from "../../assets/updated images/dobles/doble_std_mat_hab_a_03_leftcenteredbed.jpg";
import dblStd3 from "../../assets/updated images/dobles/doble_std_sinsin_hab_a_01_rightcenenteredbed.jpg";
import dblStd4 from "../../assets/updated images/dobles/doble_std_mat_hab_b_01_leftlateralbed_withtv.jpg";

// Triple Estándar
import triStd1 from "../../assets/updated images/triples/triple_std_matsin_hab_a_01_rightcenenteredbed_closeup.jpg";
import triStd2 from "../../assets/updated images/triples/triple_std_matsin_hab_a_02_rightcenenteredbed.jpg";
import triStd3 from "../../assets/updated images/triples/triple_std_sinsinsin_hab_a_01_rightcenenteredbed.jpg";
import triStd4 from "../../assets/updated images/triples/triple_std_matsin_hab_b_02_leftcenteredbed.jpg";

// Doble Superior
import dblSup1 from "../../assets/updated images/dobles/doble_sup_mat_hab_b_02_leftcenteredbed_withbathroomatback.jpg";
import dblSup2 from "../../assets/updated images/dobles/doble_sup_mat_hab_a_01_abitrightcenteredbed_withbathroomatback_withvisiblewindow.jpg";
import dblSup3 from "../../assets/updated images/dobles/doble_sup_sinsin_hab_a_01_leftcenteredbed_closeup.jpg";
import dblSup4 from "../../assets/updated images/dobles/doble_sup_mat_hab_b_03_frontcenteredbed.jpg";

// Triple Superior
import triSup1 from "../../assets/updated images/triples/triple_sup_matsin_hab_a_03_leftcenteredbed_withbathroomatback.jpg";
import triSup2 from "../../assets/updated images/triples/triple_sup_matsin_hab_a_01_rightcenenteredbed.jpeg";
import triSup3 from "../../assets/updated images/triples/triple_sup_matsin_hab_a_02_frontcenteredbed.jpeg";

// ─── Types ─────────────────────────────────────────────────────────────────

export type BedOption = { label: string; beds: number[] };

export type Room = {
  name: string;
  tier: "Estándar" | "Superior";
  guests: number;
  blurb: string;
  bedOptions: BedOption[];
  photos: StaticImageData[];
};

// ─── Data ──────────────────────────────────────────────────────────────────

const DOUBLE_BEDS: BedOption[] = [
  { label: "Matrimonial", beds: [2] },
  { label: "Dos camas separadas", beds: [1, 1] },
];

const TRIPLE_BEDS: BedOption[] = [
  { label: "Matrimonial y cama individual", beds: [2, 1] },
  { label: "Tres camas individuales", beds: [1, 1, 1] },
];

export const FEATURES: { icon: LucideIcon; label: string }[] = [
  { icon: Wifi, label: "Wi-Fi gratuito" },
  { icon: Tv, label: "TV por cable" },
  { icon: Thermometer, label: "Calefacción central" },
  { icon: ShowerHead, label: "Baño privado con amenities" },
  { icon: Coffee, label: "Desayuno incluido" },
];

export const ROOMS: Room[] = [
  {
    name: "Doble Estándar",
    tier: "Estándar",
    guests: 2,
    blurb:
      "Cómoda y luminosa, ideal para parejas o viajeros que buscan una base cálida y económica en el centro de El Calafate.",
    bedOptions: DOUBLE_BEDS,
    photos: [dblStd1, dblStd2, dblStd3, dblStd4],
  },
  {
    name: "Triple Estándar",
    tier: "Estándar",
    guests: 3,
    blurb:
      "Espacio extra para familias o grupos de amigos, con configuraciones de cama flexibles y todo lo necesario para descansar.",
    bedOptions: TRIPLE_BEDS,
    photos: [triStd1, triStd2, triStd3, triStd4],
  },
  {
    name: "Doble Superior",
    tier: "Superior",
    guests: 2,
    blurb:
      "Nuestra habitación doble más amplia y equipada, con terminaciones cuidadas y baño privado renovado.",
    bedOptions: DOUBLE_BEDS,
    photos: [dblSup1, dblSup2, dblSup3, dblSup4],
  },
  {
    name: "Triple Superior",
    tier: "Superior",
    guests: 3,
    blurb:
      "Lo mejor para familias: amplitud, confort superior y baño privado renovado, sin resignar la ubicación céntrica.",
    bedOptions: TRIPLE_BEDS,
    photos: [triSup1, triSup2, triSup3],
  },
];
