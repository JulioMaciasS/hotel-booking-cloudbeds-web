"use client";

import { ExternalLink, MapPin, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Sheet, type SheetRef } from "react-modal-sheet";
import type { MapPlaceDetails } from "@/components/HotelMap";

type MapPlaceSheetProps = {
  collapseRequestId: number;
  expandRequestId: number;
  onClose: () => void;
  place: MapPlaceDetails | null;
};

function SheetGrabber() {
  const t = useTranslations("location.map.details");
  const { currentSnap, snapTo } = Sheet.useContext();
  const isExpanded = currentSnap === 2;

  return (
    <Sheet.Header className="!flex !h-8 !items-center !justify-center">
      <button
        aria-label={isExpanded ? t("collapse") : t("expand")}
        className="flex h-8 w-20 items-center justify-center"
        onClick={() => snapTo(isExpanded ? 1 : 2)}
        type="button"
      >
        <span className="h-1.5 w-12 rounded-full bg-[#b9c3bf]" />
      </button>
    </Sheet.Header>
  );
}

export function MapPlaceSheet({
  collapseRequestId,
  expandRequestId,
  onClose,
  place,
}: MapPlaceSheetProps) {
  const t = useTranslations("location.map");
  const sheetRef = useRef<SheetRef>(null);

  useEffect(() => {
    sheetRef.current?.snapTo(2);
  }, [expandRequestId]);

  useEffect(() => {
    if (collapseRequestId > 0) sheetRef.current?.snapTo(1);
  }, [collapseRequestId]);

  if (!place) return null;

  const titleId = `map-place-sheet-${place.tKey}`;

  return (
    <Sheet
      detent="content"
      disableDismiss
      disableScrollLocking
      initialSnap={2}
      isOpen
      onClose={onClose}
      ref={sheetRef}
      snapPoints={[0, 0.43, 1]}
      style={{ zIndex: 1200 }}
    >
      <Sheet.Container
        aria-labelledby={titleId}
        className="!rounded-t-3xl !bg-[#fffdf8] !shadow-[0_-10px_36px_rgba(31,43,39,0.22)]"
        role="region"
      >
        <SheetGrabber />
        <Sheet.Content
          className="px-5"
          scrollStyle={{ paddingBottom: "calc(18px + env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
              style={{ backgroundColor: place.categoryColor }}
            >
              <MapPin size={19} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold leading-tight text-[#1f2b27]" id={titleId}>
                {place.title}
              </h2>
              <p
                className="mt-1 text-sm font-semibold"
                style={{ color: place.categoryColor }}
              >
                {place.categoryLabel}
              </p>
            </div>
            <button
              aria-label={t("details.close")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf3ef] text-[#1f2b27] transition hover:bg-[#dfe9e4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38645b]"
              onClick={onClose}
              type="button"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-[#5f6e69]">{place.note}</p>

          <a
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#35bea4] px-5 py-3 text-sm font-bold text-[#15362f] shadow-sm transition hover:bg-[#28ad95] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38645b]"
            href={place.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("viewOnGoogleMaps")}
            <ExternalLink aria-hidden="true" size={16} />
          </a>
        </Sheet.Content>
      </Sheet.Container>
    </Sheet>
  );
}
