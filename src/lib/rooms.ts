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
import dblStd1 from "@assets/updated images/dobles/doble_std_mat_hab_a_01_rightcenenteredbed_withabitvisiblewindow.jpg";
import dblStd2 from "@assets/updated images/dobles/doble_std_mat_hab_a_03_leftcenteredbed.jpg";
import dblStd3 from "@assets/updated images/dobles/doble_std_sinsin_hab_a_01_rightcenenteredbed.jpg";
import dblStd4 from "@assets/updated images/dobles/doble_std_mat_hab_b_01_leftlateralbed_withtv.jpg";

// Triple Estándar
import triStd1 from "@assets/updated images/triples/triple_std_matsin_hab_a_01_rightcenenteredbed_closeup.jpg";
import triStd2 from "@assets/updated images/triples/triple_std_matsin_hab_a_02_rightcenenteredbed.jpg";
import triStd3 from "@assets/updated images/triples/triple_std_sinsinsin_hab_a_01_rightcenenteredbed.jpg";
import triStd4 from "@assets/updated images/triples/triple_std_matsin_hab_b_02_leftcenteredbed.jpg";

// Doble Superior
import dblSup1 from "@assets/updated images/dobles/doble_sup_mat_hab_b_02_leftcenteredbed_withbathroomatback.jpg";
import dblSup2 from "@assets/updated images/dobles/doble_sup_mat_hab_a_01_abitrightcenteredbed_withbathroomatback_withvisiblewindow.jpg";
import dblSup3 from "@assets/updated images/dobles/doble_sup_sinsin_hab_a_01_leftcenteredbed_closeup.jpg";
import dblSup4 from "@assets/updated images/dobles/doble_sup_mat_hab_b_03_frontcenteredbed.jpg";

// Triple Superior
import triSup1 from "@assets/updated images/triples/triple_sup_matsin_hab_a_03_leftcenteredbed_withbathroomatback.jpg";
import triSup2 from "@assets/updated images/triples/triple_sup_matsin_hab_a_01_rightcenenteredbed.jpeg";
import triSup3 from "@assets/updated images/triples/triple_sup_matsin_hab_a_02_frontcenteredbed.jpeg";

// ─── Types ─────────────────────────────────────────────────────────────────
// Structure + media live here; localizable copy (room name/blurb, tier label,
// bed-option labels, feature labels) lives in the `rooms` message namespace,
// resolved by the stable `key` values below.

export type Tier = "standard" | "superior";

/** `key` resolves `rooms.bedOptions.<key>`; `beds` drives the bed-count icons. */
export type BedOption = { key: string; beds: number[] };

export type Room = {
  /** Resolves `rooms.items.<key>.name` / `.blurb`. */
  key: string;
  tier: Tier;
  guests: number;
  bedOptions: BedOption[];
  photos: StaticImageData[];
};

// ─── Data ──────────────────────────────────────────────────────────────────

const DOUBLE_BEDS: BedOption[] = [
  { key: "matrimonial", beds: [2] },
  { key: "twin", beds: [1, 1] },
];

const TRIPLE_BEDS: BedOption[] = [
  { key: "matrimonialSingle", beds: [2, 1] },
  { key: "threeSingles", beds: [1, 1, 1] },
];

/** Icons + stable keys; labels live in `rooms.features.<key>`. */
export const FEATURES: { icon: LucideIcon; key: string }[] = [
  { icon: Wifi, key: "wifi" },
  { icon: Tv, key: "tv" },
  { icon: Thermometer, key: "heating" },
  { icon: ShowerHead, key: "bathroom" },
  { icon: Coffee, key: "breakfast" },
];

export const ROOMS: Room[] = [
  {
    key: "doubleStandard",
    tier: "standard",
    guests: 2,
    bedOptions: DOUBLE_BEDS,
    photos: [dblStd1, dblStd2, dblStd3, dblStd4],
  },
  {
    key: "tripleStandard",
    tier: "standard",
    guests: 3,
    bedOptions: TRIPLE_BEDS,
    photos: [triStd1, triStd2, triStd3, triStd4],
  },
  {
    key: "doubleSuperior",
    tier: "superior",
    guests: 2,
    bedOptions: DOUBLE_BEDS,
    photos: [dblSup1, dblSup2, dblSup3, dblSup4],
  },
  {
    key: "tripleSuperior",
    tier: "superior",
    guests: 3,
    bedOptions: TRIPLE_BEDS,
    photos: [triSup1, triSup2, triSup3],
  },
];
