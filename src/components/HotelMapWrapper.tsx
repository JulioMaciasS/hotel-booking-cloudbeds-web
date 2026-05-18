"use client";

import dynamic from "next/dynamic";

const HotelMap = dynamic(
  () => import("@/components/HotelMap").then((m) => m.HotelMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#edf3ef] text-sm text-[#5f6e69]">
        Cargando mapa…
      </div>
    ),
  },
);

export function HotelMapWrapper() {
  return <HotelMap />;
}
