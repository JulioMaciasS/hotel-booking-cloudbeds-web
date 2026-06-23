"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import tripadvisorLogo from "@assets/logo/tripadvisor.png";
import googleMapsLogo from "@assets/logo/Google_Maps_icon_(2020).png";

type ReviewMeta = {
  author: string;
  rating: number;
  source: "tripadvisor" | "google" | "booking";
};

type ReviewCopy = {
  text: string;
  origin: string;
  date: string;
  trip: string;
};

function TripAdvisorLogo() {
  return (
    <span className="relative block h-5 w-5">
      <Image
        src={tripadvisorLogo}
        alt="TripAdvisor"
        fill
        sizes="20px"
        className="object-contain"
      />
    </span>
  );
}

function GoogleMapsLogo() {
  return (
    <span className="relative block h-5 w-5">
      <Image
        src={googleMapsLogo}
        alt="Google Maps"
        fill
        sizes="20px"
        className="object-contain"
      />
    </span>
  );
}

function BookingLogo() {
  return (
    <span
      aria-label="Booking.com"
      className="flex h-5 items-center rounded px-1.5 text-[10px] font-bold tracking-tight text-white"
      style={{ background: "#003580" }}
    >
      booking
    </span>
  );
}

const AVATAR_PALETTE = [
  { bg: "#d4e8e0", fg: "#1a5c42" },
  { bg: "#dde8d4", fg: "#3a5c1a" },
  { bg: "#d4dde8", fg: "#1a3a5c" },
  { bg: "#e8dfd4", fg: "#5c3d1a" },
  { bg: "#e8d4e0", fg: "#5c1a42" },
];

function getAvatar(author: string) {
  const parts = author.trim().split(/\s+/);
  const initials = (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  const color = AVATAR_PALETTE[author.charCodeAt(0) % AVATAR_PALETTE.length];
  return { initials, ...color };
}

export function ReviewsSlider({ reviews }: { reviews: ReviewMeta[] }) {
  const t = useTranslations("reviews");
  const copy = t.raw("items") as ReviewCopy[];
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const total = reviews.length;

  const goTo = useCallback(
    (next: number) => {
      const wrapped = ((next % total) + total) % total;
      setIndex(wrapped);
      const el = trackRef.current;
      if (!el) return;
      const card = el.children[wrapped] as HTMLElement | undefined;
      card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    },
    [total],
  );

  // Scroll the track to keep the active card visible when index changes.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[index] as HTMLElement | undefined;
    if (!card) return;
    const left = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
    el.scrollTo({ left, behavior: "smooth" });
  }, [index]);

  return (
    <div className="mt-10">
      {/* Track — scrollable but driven by index; shows 1 card at a time on sm, 2 on md, 3 on lg */}
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-hidden scroll-smooth snap-x snap-mandatory pb-2"
        aria-live="polite"
        aria-atomic="true"
      >
        {reviews.map((review, i) => {
          const avatar = getAvatar(review.author);
          const isActive = i === index;
          const { text, origin, date, trip } = copy[i] ?? {
            text: "",
            origin: "",
            date: "",
            trip: "",
          };
          return (
            <blockquote
              key={review.author}
              aria-hidden={!isActive}
              className="flex w-full shrink-0 snap-start flex-col rounded-lg bg-white p-6 opacity-100 ring-1 ring-black/5 sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"
            >
              <div
                className="flex gap-0.5 text-amber-400"
                aria-label={t("ui.rating", { rating: review.rating })}
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    aria-hidden="true"
                    fill={s <= review.rating ? "currentColor" : "none"}
                    size={15}
                    strokeWidth={s <= review.rating ? 0 : 1.5}
                  />
                ))}
              </div>
              <p className="mt-4 flex-1 text-sm leading-7 text-[#3b4c46]">
                &ldquo;{text}&rdquo;
              </p>
              <footer className="mt-5 flex items-center gap-3 border-t border-black/5 pt-4">
                <div
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: avatar.bg, color: avatar.fg }}
                >
                  {avatar.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#1f2b27]">{review.author}</p>
                  <p className="text-xs text-[#66736f]">
                    {origin && `${origin} · `}
                    {date} · {trip}
                  </p>
                </div>
                <span className="shrink-0">
                  {review.source === "tripadvisor" ? (
                    <TripAdvisorLogo />
                  ) : review.source === "google" ? (
                    <GoogleMapsLogo />
                  ) : (
                    <BookingLogo />
                  )}
                </span>
              </footer>
            </blockquote>
          );
        })}
      </div>

      {/* Controls */}
      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          aria-label={t("ui.prev")}
          onClick={() => goTo(index - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c8d4ce] bg-white text-[#1f2b27] shadow-sm transition hover:bg-[#f0f4f2]"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex gap-1.5" role="tablist" aria-label={t("ui.tablistLabel")}>
          {reviews.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === index}
              aria-label={t("ui.goTo", { index: i + 1 })}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-200 ${
                i === index
                  ? "h-1.5 w-4 bg-[#38645b]"
                  : "h-1.5 w-1.5 bg-[#38645b]/25 hover:bg-[#38645b]/50"
              }`}
            />
          ))}
        </div>
        <button
          aria-label={t("ui.next")}
          onClick={() => goTo(index + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c8d4ce] bg-white text-[#1f2b27] shadow-sm transition hover:bg-[#f0f4f2]"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
