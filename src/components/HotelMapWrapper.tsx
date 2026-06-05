"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Maximize2, X } from "lucide-react";

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
  const [expanded, setExpanded] = useState(false);

  // Lock body scroll while expanded; restore on close/unmount.
  useEffect(() => {
    if (!expanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [expanded]);

  // Close on Escape key.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  return (
    <>
      {/* Inline map — `isolate` creates a stacking context that contains all of
          Leaflet's internal z-indices (200–800) so they can't bleed above the
          site navbar (z-50) or the expanded modal. */}
      <div className="relative isolate h-120 w-full">
        <HotelMap />
        <button
          aria-label="Ampliar mapa"
          className="absolute right-2.5 top-2.5 z-1000 flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-black/10 transition hover:bg-[#f0f4f2]"
          onClick={() => setExpanded(true)}
          type="button"
        >
          <Maximize2 size={16} className="text-[#1f2b27]" />
        </button>
      </div>

      {/* Fullscreen modal — starts at top-18 (72px) so the backdrop never
          covers the navbar. z-40 keeps it below the header (z-50). */}
      {expanded && (
        <div
          aria-label="Mapa ampliado"
          aria-modal="true"
          className="fixed inset-x-0 bottom-0 top-18 z-40 flex flex-col bg-black/60"
          role="dialog"
        >
          {/* Backdrop close */}
          <button
            aria-label="Cerrar mapa"
            className="absolute inset-0 cursor-default"
            onClick={() => setExpanded(false)}
            tabIndex={-1}
            type="button"
          />
          {/* Map panel — `isolate` contains Leaflet's z-indices within the modal */}
          <div className="relative isolate m-4 flex-1 overflow-hidden rounded-xl shadow-2xl sm:m-6">
            <HotelMap />
            <button
              aria-label="Cerrar mapa"
              className="absolute right-3 top-3 z-1000 flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-black/10 transition hover:bg-[#f0f4f2]"
              onClick={() => setExpanded(false)}
              type="button"
            >
              <X size={18} className="text-[#1f2b27]" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
