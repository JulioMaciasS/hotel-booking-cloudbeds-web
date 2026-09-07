"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Maximize2, Search, SlidersHorizontal, X } from "lucide-react";
import {
  MAP_POIS,
  type MapFocusRequest,
  type MapPlaceDetails,
  type PoiCategory,
} from "@/components/HotelMap";
import { MapPlaceSheet } from "@/components/MapPlaceSheet";
import {
  MAP_EXPANDED_EVENT,
  MAP_TOOL_EVENT,
  type MapExpandedEventDetail,
  type MapTool,
  type MapToolEventDetail,
} from "@/lib/map-events";

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

type HotelMapWrapperProps = {
  className?: string;
  defaultExpanded?: boolean;
  expandedDismissible?: boolean;
};

const FILTER_CATEGORIES: PoiCategory[] = [
  "restaurant",
  "bar",
  "cafe",
  "attraction",
  "nature",
  "transport",
  "shop",
  "bank",
  "tourism",
  "centre",
];

type MapFiltersProps = {
  activeCategory: PoiCategory | "all";
  autoFocusSearch?: boolean;
  filtersExpanded?: boolean;
  onCategoryChange: (category: PoiCategory | "all") => void;
  onFiltersToggle?: () => void;
  onPlaceSelect: (tKey: string) => void;
  onQueryChange: (query: string) => void;
  query: string;
  showFilters?: boolean;
  showSearch?: boolean;
};

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim();
}

function MapFilters({
  activeCategory,
  autoFocusSearch = false,
  filtersExpanded = false,
  onCategoryChange,
  onFiltersToggle,
  onPlaceSelect,
  onQueryChange,
  query,
  showFilters = true,
  showSearch = true,
}: MapFiltersProps) {
  const t = useTranslations("location.map");
  const [resultsOpen, setResultsOpen] = useState(false);
  const normalizedQuery = normalizeSearch(query);
  const results = useMemo(() => {
    if (!normalizedQuery) return [];

    const hotelResult = {
      categoryLabel: t("hotel.category"),
      note: t("hotel.address"),
      searchText: normalizeSearch(
        `${t("hotel.label")} ${t("hotel.address")} ${t("hotel.category")} ${t("hotel.searchTerms")}`,
      ),
      title: t("hotel.label"),
      tKey: "hotel",
    };
    const poiResults = MAP_POIS.filter(
      (poi) => activeCategory === "all" || poi.category === activeCategory,
    ).map((poi) => {
        const category = t(`categories.${poi.category}`);
        const note = t(`pois.${poi.tKey}.note`);
        const title = t(`pois.${poi.tKey}.label`);
        return {
          ...poi,
          categoryLabel: category,
          note,
          searchText: normalizeSearch(`${title} ${note} ${category}`),
          title,
        };
      });

    return [hotelResult, ...poiResults]
      .filter((poi) => poi.searchText.includes(normalizedQuery))
      .slice(0, 6);
  }, [activeCategory, normalizedQuery, t]);

  const selectPlace = (tKey: string, title: string) => {
    onQueryChange(title);
    setResultsOpen(false);
    onPlaceSelect(tKey);
  };

  return (
    <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-black/5 sm:p-4">
      {showSearch && (
        <div className="flex gap-2">
          <form
            className="min-w-0 flex-1"
            onSubmit={(event) => {
              event.preventDefault();
              if (results[0]) selectPlace(results[0].tKey, results[0].title);
            }}
          >
            <label className="flex h-11 items-center gap-2 rounded-lg bg-[#f7f3ea] px-3 text-[#5f6e69] ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-[#6dbfaa]">
              <Search aria-hidden="true" className="shrink-0 text-[#38645b]" size={17} />
              <span className="sr-only">{t("search.label")}</span>
              <input
                autoFocus={autoFocusSearch}
                className="map-search-input min-w-0 flex-1 bg-transparent text-sm text-[#1f2b27] outline-none placeholder:text-[#8fa09a]"
                onChange={(event) => {
                  onQueryChange(event.target.value);
                  setResultsOpen(true);
                }}
                onFocus={() => {
                  if (normalizedQuery) setResultsOpen(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setResultsOpen(false);
                }}
                placeholder={t("search.placeholder")}
                type="search"
                value={query}
              />
              {query && (
                <button
                  aria-label={t("search.clear")}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#5f6e69] transition hover:bg-black/5 hover:text-[#1f2b27]"
                  onClick={() => {
                    onQueryChange("");
                    setResultsOpen(false);
                  }}
                  type="button"
                >
                  <X aria-hidden="true" size={14} />
                </button>
              )}
            </label>
          </form>
          {onFiltersToggle && (
            <button
              aria-expanded={filtersExpanded}
              aria-label={t("filters.button")}
              className={`flex h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold ring-1 transition ${
                filtersExpanded || activeCategory !== "all"
                  ? "bg-[#38645b] text-white ring-[#38645b]"
                  : "bg-white text-[#38645b] ring-black/10 hover:bg-[#edf3ef]"
              }`}
              onClick={onFiltersToggle}
              type="button"
            >
              <SlidersHorizontal aria-hidden="true" size={17} />
              <span className="hidden sm:inline">{t("filters.button")}</span>
            </button>
          )}
        </div>
      )}

      {showSearch && resultsOpen && normalizedQuery && (
        <div className="mt-2 overflow-hidden rounded-lg border border-[#d9e1dd] bg-white">
          {results.length > 0 ? (
            <ul
              aria-label={t("search.resultsLabel")}
              className="max-h-64 divide-y divide-black/5 overflow-y-auto"
            >
              {results.map((result) => (
                <li key={result.tKey}>
                  <button
                    className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition hover:bg-[#edf3ef] focus:bg-[#edf3ef] focus:outline-none"
                    onClick={() => selectPlace(result.tKey, result.title)}
                    type="button"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#edf3ef] text-[#38645b]">
                      <MapPin aria-hidden="true" size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[#1f2b27]">
                        {result.title}
                      </span>
                      <span className="block truncate text-xs text-[#5f6e69]">
                        {result.categoryLabel} · {result.note}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-3 text-sm text-[#5f6e69]">{t("search.noResults")}</p>
          )}
        </div>
      )}

      {showFilters && (
        <div
          aria-label={t("filters.label")}
          className={`flex flex-wrap gap-2 ${showSearch ? "mt-3" : ""}`}
          role="group"
        >
          {["all" as const, ...FILTER_CATEGORIES].map((category) => {
            const active = category === activeCategory;
            return (
              <button
                aria-pressed={active}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-[#38645b] text-white shadow-sm"
                    : "bg-white text-[#52615d] ring-1 ring-black/10 hover:bg-[#edf3ef] hover:text-[#1f2b27]"
                }`}
                key={category}
                onClick={() => onCategoryChange(category)}
                type="button"
              >
                {category === "all" ? t("filters.all") : t(`categories.${category}`)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

type MapPanelProps = {
  activeCategory: PoiCategory | "all";
  closeLabel?: string;
  cooperativeGestures?: boolean;
  focusRequest: MapFocusRequest | null;
  onClose?: () => void;
  onExpand?: () => void;
  onMapInteraction?: () => void;
  onPlaceSelect?: (place: MapPlaceDetails) => void;
  selectedTKey?: string | null;
  selectionMode?: "external" | "popup";
};

function MapPanel({
  activeCategory,
  closeLabel,
  cooperativeGestures = true,
  focusRequest,
  onClose,
  onExpand,
  onMapInteraction,
  onPlaceSelect,
  selectedTKey,
  selectionMode,
}: MapPanelProps) {
  const t = useTranslations("location.map");

  return (
    <>
      <HotelMap
        activeCategory={activeCategory}
        cooperativeGestures={cooperativeGestures}
        focusRequest={focusRequest}
        onMapInteraction={onMapInteraction}
        onPlaceSelect={onPlaceSelect}
        selectedTKey={selectedTKey}
        selectionMode={selectionMode}
      />
      {(onClose || onExpand) && (
        <button
          aria-label={closeLabel ?? t("expand")}
          className="absolute right-2.5 top-2.5 z-1000 flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-black/10 transition hover:bg-[#f0f4f2] sm:right-3 sm:top-3"
          onClick={onClose ?? onExpand}
          type="button"
        >
          {onClose ? (
            <X aria-hidden="true" className="text-[#1f2b27]" size={18} />
          ) : (
            <Maximize2 aria-hidden="true" className="text-[#1f2b27]" size={16} />
          )}
        </button>
      )}
    </>
  );
}

export function HotelMapWrapper({
  className = "h-120",
  defaultExpanded = false,
  expandedDismissible = true,
}: HotelMapWrapperProps) {
  const t = useTranslations("location.map");
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<PoiCategory | "all">("all");
  const [focusRequest, setFocusRequest] = useState<MapFocusRequest | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [mobileTool, setMobileTool] = useState<MapTool>(null);
  const [selectedPlace, setSelectedPlace] = useState<MapPlaceDetails | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [sheetCollapseRequestId, setSheetCollapseRequestId] = useState(0);
  const [sheetExpandRequestId, setSheetExpandRequestId] = useState(0);

  const collapsePlaceSheet = useCallback(() => {
    setSheetCollapseRequestId((current) => current + 1);
  }, []);

  const selectMapPlace = useCallback((place: MapPlaceDetails) => {
    setSelectedPlace(place);
    setSheetExpandRequestId((current) => current + 1);
  }, []);

  const closeExpandedMap = useCallback(() => {
    if (!expandedDismissible) return;
    setExpanded(false);
    setMobileTool(null);
    setSelectedPlace(null);
    window.dispatchEvent(
      new CustomEvent<MapToolEventDetail>(MAP_TOOL_EVENT, {
        detail: { tool: null },
      }),
    );
  }, [expandedDismissible]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const updateViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
      if (!mediaQuery.matches) setSelectedPlace(null);
    };
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  const changeCategory = (category: PoiCategory | "all") => {
    collapsePlaceSheet();
    setActiveCategory(category);
    setSelectedPlace((current) => {
      if (
        current &&
        current.category !== "hotel" &&
        category !== "all" &&
        current.category !== category
      ) {
        return null;
      }
      return current;
    });
  };

  const focusPlace = (tKey: string) => {
    setFocusRequest((current) => ({
      requestId: (current?.requestId ?? 0) + 1,
      tKey,
    }));
  };

  // The mobile booking bar is useful while browsing the page, but duplicates
  // the header CTA and steals map space in the expanded view.
  useEffect(() => {
    // Defer the event one frame so the header has installed its listener when
    // `/guia` mounts with the map already expanded.
    const frame = window.requestAnimationFrame(() => {
      window.dispatchEvent(
        new CustomEvent<MapExpandedEventDetail>(MAP_EXPANDED_EVENT, {
          detail: { expanded },
        }),
      );
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (!expanded) return;
      window.dispatchEvent(
        new CustomEvent<MapExpandedEventDetail>(MAP_EXPANDED_EVENT, {
          detail: { expanded: false },
        }),
      );
    };
  }, [expanded]);

  useEffect(() => {
    const onMapTool = (event: Event) => {
      const detail = (event as CustomEvent<MapToolEventDetail>).detail;
      const tool = detail?.tool ?? null;
      setMobileTool(tool);
      if (tool) collapsePlaceSheet();
    };

    window.addEventListener(MAP_TOOL_EVENT, onMapTool);
    return () => window.removeEventListener(MAP_TOOL_EVENT, onMapTool);
  }, [collapsePlaceSheet]);

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
    if (!expanded || !expandedDismissible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeExpandedMap();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeExpandedMap, expanded, expandedDismissible]);

  return (
    <>
      <div className={`flex w-full flex-col gap-3 ${className}`}>
        <MapFilters
          activeCategory={activeCategory}
          filtersExpanded={filtersExpanded}
          onCategoryChange={changeCategory}
          onFiltersToggle={() => setFiltersExpanded((current) => !current)}
          onPlaceSelect={focusPlace}
          onQueryChange={setQuery}
          query={query}
          showFilters={filtersExpanded}
        />
        {/* `isolate` contains the map renderer and controls below site chrome. */}
        <div className="relative isolate min-h-[24rem] flex-1 overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
          {!expanded && (
            <MapPanel
              activeCategory={activeCategory}
              focusRequest={focusRequest}
              onExpand={() => setExpanded(true)}
            />
          )}
        </div>
      </div>

      {/* Fullscreen modal — the top aligns with the header's bottom edge.
          z-40 keeps it below the header (z-50); the redundant mobile booking
          bar is hidden while this view is open, leaving an even map inset. */}
      {expanded && (
        <div
          aria-label={t("expandedLabel")}
          aria-modal="true"
          className="fixed inset-x-0 bottom-0 top-[86px] z-40 flex flex-col bg-black/60"
          role="dialog"
        >
          {expandedDismissible && (
            <button
              aria-label={t("close")}
              className="absolute inset-0 cursor-default"
              onClick={closeExpandedMap}
              tabIndex={-1}
              type="button"
            />
          )}
          <div className="relative flex min-h-0 flex-1 flex-col lg:m-6 lg:gap-3">
            <div className="hidden lg:block">
              <MapFilters
                activeCategory={activeCategory}
                filtersExpanded={filtersExpanded}
                onCategoryChange={changeCategory}
                onFiltersToggle={() => setFiltersExpanded((current) => !current)}
                onPlaceSelect={focusPlace}
                onQueryChange={setQuery}
                query={query}
                showFilters={filtersExpanded}
              />
            </div>
            {mobileTool && (
              <div
                className="absolute left-3 right-16 top-3 z-1100 lg:hidden"
                key="mobile-map-tools"
              >
                <MapFilters
                  activeCategory={activeCategory}
                  autoFocusSearch={mobileTool === "search"}
                  onCategoryChange={changeCategory}
                  onPlaceSelect={(tKey) => {
                    focusPlace(tKey);
                    window.dispatchEvent(
                      new CustomEvent<MapToolEventDetail>(MAP_TOOL_EVENT, {
                        detail: { tool: null },
                      }),
                    );
                  }}
                  onQueryChange={setQuery}
                  query={query}
                  showFilters={mobileTool === "filters"}
                  showSearch={mobileTool === "search"}
                />
              </div>
            )}
            {/* Map panel */}
            <div
              className="relative isolate min-h-0 flex-1 overflow-hidden shadow-2xl lg:rounded-xl"
              key="expanded-map-panel"
            >
              <MapPanel
                activeCategory={activeCategory}
                closeLabel={expandedDismissible ? t("close") : undefined}
                cooperativeGestures={false}
                focusRequest={focusRequest}
                onClose={expandedDismissible ? closeExpandedMap : undefined}
                onMapInteraction={isMobileViewport ? collapsePlaceSheet : undefined}
                onPlaceSelect={isMobileViewport ? selectMapPlace : undefined}
                selectedTKey={isMobileViewport ? selectedPlace?.tKey : null}
                selectionMode={isMobileViewport ? "external" : "popup"}
              />
            </div>
          </div>
          {isMobileViewport && (
            <MapPlaceSheet
              collapseRequestId={sheetCollapseRequestId}
              expandRequestId={sheetExpandRequestId}
              onClose={() => setSelectedPlace(null)}
              place={selectedPlace}
            />
          )}
        </div>
      )}
    </>
  );
}
