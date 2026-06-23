"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Maximize2, X } from "lucide-react";

function MapLoading() {
  const t = useTranslations("location.map");
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#edf3ef] text-sm text-[#5f6e69]">
      {t("loading")}
    </div>
  );
}

const HotelMap = dynamic(
  () => import("@/components/HotelMap").then((m) => m.HotelMap),
  {
    ssr: false,
    loading: () => <MapLoading />,
  },
);

export function HotelMapWrapper() {
  const t = useTranslations("location.map");
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
          aria-label={t("expand")}
          className="absolute right-2.5 top-2.5 z-1000 flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-black/10 transition hover:bg-[#f0f4f2]"
          onClick={() => setExpanded(true)}
          type="button"
        >
          <Maximize2 size={16} className="text-[#1f2b27]" />
        </button>
      </div>

      {/* Fullscreen modal — the top aligns with the header's bottom edge
          (h-[85px] + 1px border = 86px) and the bottom padding reserves exactly
          the mobile booking bar's height (~65px; also fixed, z-40, bottom-0).
          Combined with the map panel's even m-4 / sm:m-6 inset, that leaves the
          map equidistant from the navbar, the booking bar, and the side edges.
          z-40 keeps the modal below the header (z-50); the bar is lg:hidden, so
          the bottom reservation is dropped at lg. */}
      {expanded && (
        <div
          aria-label={t("expandedLabel")}
          aria-modal="true"
          className="fixed inset-x-0 bottom-0 top-[86px] z-40 flex flex-col bg-black/60 pb-[calc(65px+env(safe-area-inset-bottom))] lg:pb-0"
          role="dialog"
        >
          {/* Backdrop close */}
          <button
            aria-label={t("close")}
            className="absolute inset-0 cursor-default"
            onClick={() => setExpanded(false)}
            tabIndex={-1}
            type="button"
          />
          {/* Map panel — `isolate` contains Leaflet's z-indices within the modal */}
          <div className="relative isolate m-4 flex-1 overflow-hidden rounded-xl shadow-2xl sm:m-6">
            <HotelMap />
            <button
              aria-label={t("close")}
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
