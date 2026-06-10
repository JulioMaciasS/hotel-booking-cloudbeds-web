"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { FEATURES, ROOMS } from "@/lib/rooms";
import { BOOKING_HREF } from "@/lib/nav";

const AUTO_ROTATE_MS = 6000;

// ─── Bed icon ──────────────────────────────────────────────────────────────

function BedIcon({ beds }: { beds: number[] }) {
  const w = 32;
  const h = 18;
  const margin = 2;
  const gap = 2;
  const bedTop = 2;
  const bedH = 13;
  const totalUnits = beds.reduce((s, b) => s + b, 0) || 1;
  const available = w - margin * 2 - gap * (beds.length - 1);
  const unit = available / totalUnits;
  let cursor = margin;
  const shapes: React.ReactNode[] = [];

  beds.forEach((bed, idx) => {
    const bw = unit * bed;
    shapes.push(
      <rect key={`b${idx}`} x={cursor} y={bedTop} width={bw} height={bedH} rx="2" />,
    );
    const pillows = bed >= 2 ? 2 : 1;
    const pw = (bw - 4 - 1.5 * (pillows - 1)) / pillows;
    let pc = cursor + 2;
    for (let p = 0; p < pillows; p++) {
      shapes.push(
        <rect
          key={`p${idx}-${p}`}
          x={pc}
          y={bedTop + 2}
          width={pw}
          height={4}
          rx="1.5"
          fill="currentColor"
          stroke="none"
          opacity={0.3}
        />,
      );
      pc += pw + 1.5;
    }
    cursor += bw + gap;
  });

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={h}
      stroke="currentColor"
      strokeWidth={1.2}
      viewBox={`0 0 ${w} ${h}`}
      width={w}
    >
      {shapes}
    </svg>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

export function RoomsSection() {
  const t = useTranslations("rooms");
  const [roomIdx, setRoomIdx] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressRef = useRef<HTMLSpanElement>(null);

  const room = ROOMS[roomIdx];
  const total = room.photos.length;

  const goNextRoom = useCallback(() => {
    setRoomIdx((i) => (i + 1) % ROOMS.length);
    setPhotoIdx(0);
  }, []);

  // Auto-rotate the room selection until the user hovers/interacts.
  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(goNextRoom, AUTO_ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [goNextRoom, isPaused, roomIdx]);

  // Restart the progress-bar animation whenever the active room (or pause) changes.
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    el.style.animation = "none";
    void el.offsetHeight; // force reflow so the animation can restart
    el.style.animation = "";
  }, [roomIdx, isPaused]);

  function selectRoom(i: number) {
    setRoomIdx(i);
    setPhotoIdx(0);
    // Briefly pause so the timer doesn't immediately advance off the user's pick.
    setIsPaused(true);
    window.setTimeout(() => setIsPaused(false), 120);
  }

  function prev() {
    setPhotoIdx((i) => (i - 1 + total) % total);
  }

  function next() {
    setPhotoIdx((i) => (i + 1) % total);
  }

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <style>{`
        @keyframes room-progress-grow { from { width: 0%; } to { width: 100%; } }
        .room-progress { animation: room-progress-grow ${AUTO_ROTATE_MS}ms linear forwards; }
        .room-progress-paused { animation-play-state: paused; }
      `}</style>

      {/* Tab selector */}
      <div
        aria-label={t("section.tablistLabel")}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden"
        role="tablist"
      >
        {ROOMS.map((r, i) => {
          const isActive = i === roomIdx;
          return (
            <button
              key={r.key}
              aria-selected={isActive}
              onClick={() => selectRoom(i)}
              role="tab"
              type="button"
              className={`relative flex-none overflow-hidden rounded-full border px-4 py-2 text-sm font-semibold transition whitespace-nowrap ${
                isActive
                  ? "border-[#38645b] bg-[#38645b] text-white"
                  : "border-[#c8d4ce] bg-white text-[#34423e] hover:border-[#38645b]/50 hover:bg-[#f0f4f2]"
              }`}
            >
              {t(`items.${r.key}.name`)}
              {isActive && (
                <span
                  ref={progressRef}
                  aria-hidden="true"
                  className={`room-progress absolute bottom-0 left-0 h-0.5 bg-white/50 ${
                    isPaused ? "room-progress-paused" : ""
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Room panel — height is driven by the tallest details panel (grid stack),
          so every room renders at the same height with no inner scrollbar. */}
      <div className="mt-5 overflow-hidden rounded-2xl bg-[#f7f3ea] shadow-lg ring-1 ring-black/5 lg:grid lg:grid-cols-[3fr_2fr]">
        {/* ── Photo carousel ── */}
        <div className="relative aspect-4/3 overflow-hidden lg:aspect-auto lg:h-full">
          {/* All photos stay mounted and crossfade by opacity, so switching
              rooms or photos lands on an already-decoded image. */}
          {ROOMS.map((r, ri) =>
            r.photos.map((src, pi) => {
              const active = ri === roomIdx && pi === photoIdx;
              return (
                <div
                  key={`${ri}-${pi}`}
                  aria-hidden={!active}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    alt={t("section.photoOf", {
                      name: t(`items.${r.key}.name`),
                      index: pi + 1,
                    })}
                    className="object-cover"
                    fill
                    placeholder="blur"
                    priority={ri === 0 && pi === 0}
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    src={src}
                  />
                </div>
              );
            }),
          )}

          {/* Prev / Next */}
          {total > 1 && (
            <>
              <button
                aria-label={t("section.prevPhoto")}
                className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/55"
                onClick={prev}
                type="button"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                aria-label={t("section.nextPhoto")}
                className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/55"
                onClick={next}
                type="button"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {total > 1 && (
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {room.photos.map((_, i) => (
                <button
                  key={i}
                  aria-label={t("section.goToPhoto", { index: i + 1 })}
                  onClick={() => setPhotoIdx(i)}
                  type="button"
                  className={`rounded-full transition-all duration-200 ${
                    i === photoIdx
                      ? "h-1.5 w-4 bg-white"
                      : "h-1.5 w-1.5 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Counter */}
          <span className="absolute right-3 top-3 z-10 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {photoIdx + 1} / {total}
          </span>
        </div>

        {/* ── Room details (grid stack — all panels share one cell) ── */}
        <div className="relative grid">
          {ROOMS.map((r, ri) => {
            const active = ri === roomIdx;
            return (
              <div
                key={r.key}
                aria-hidden={!active}
                className={`col-start-1 row-start-1 flex flex-col justify-between p-6 transition-opacity duration-500 lg:p-8 ${
                  active ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <div>
                  {/* Tier + guests */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        r.tier === "superior"
                          ? "bg-[#38645b] text-white"
                          : "bg-[#edf3ef] text-[#38645b]"
                      }`}
                    >
                      {t(`tiers.${r.tier}`)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#66736f]">
                      <Users aria-hidden size={13} />
                      {t("guests", { count: r.guests })}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="mt-3 text-2xl font-semibold text-[#1f2b27]">
                    {t(`items.${r.key}.name`)}
                  </h3>

                  {/* Blurb */}
                  <p className="mt-2 text-sm leading-6 text-[#5f6e69]">
                    {t(`items.${r.key}.blurb`)}
                  </p>

                  {/* Bed options */}
                  <div className="mt-5">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#66736f]">
                      {t("section.bedTypeLabel")}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {r.bedOptions.map((opt, i) => (
                        <Fragment key={opt.key}>
                          {i > 0 && (
                            <span className="select-none text-xs text-[#a0aeaa]">
                              {t("section.bedSeparator")}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c8d4ce] bg-white px-3 py-1.5 text-xs text-[#5f6e69]">
                            <BedIcon beds={opt.beds} />
                            {t(`bedOptions.${opt.key}`)}
                          </span>
                        </Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="mt-5 space-y-2">
                    {FEATURES.map(({ icon: Icon, key }) => (
                      <li key={key} className="flex items-center gap-2 text-sm text-[#52615d]">
                        <Icon aria-hidden size={14} strokeWidth={1.8} className="shrink-0 text-[#38645b]" />
                        {t(`features.${key}`)}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Link
                  className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[#38645b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2e5049]"
                  href={BOOKING_HREF}
                  tabIndex={active ? undefined : -1}
                >
                  {t("section.viewAvailability")}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
