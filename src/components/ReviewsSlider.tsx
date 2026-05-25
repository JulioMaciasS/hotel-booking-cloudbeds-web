"use client";

import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import tripadvisorLogo from "../../assets/logo/tripadvisor.png";
import googleMapsLogo from "../../assets/logo/Google_Maps_icon_(2020).png";

type Review = {
  author: string;
  origin: string;
  date: string;
  rating: number;
  text: string;
  trip: string;
  source: "tripadvisor" | "google" | "booking";
};

function TripAdvisorLogo() {
  return <Image src={tripadvisorLogo} alt="TripAdvisor" width={20} height={20} className="object-contain" />;
}

function GoogleMapsLogo() {
  return <Image src={googleMapsLogo} alt="Google Maps" width={14} height={20} className="object-contain" />;
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

export function ReviewsSlider({ reviews }: { reviews: Review[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    return () => el.removeEventListener("scroll", updateArrows);
  }, [updateArrows]);

  const scroll = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="mt-10">
      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((review) => {
          const avatar = getAvatar(review.author);
          return (
            <blockquote
              key={review.author}
              className="flex w-full shrink-0 snap-start flex-col rounded-lg bg-[#f7f3ea] p-6 ring-1 ring-black/5 sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"
            >
              <div
                className="flex gap-0.5 text-amber-400"
                aria-label={`${review.rating} de 5 estrellas`}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    aria-hidden="true"
                    fill={i <= review.rating ? "currentColor" : "none"}
                    size={15}
                    strokeWidth={i <= review.rating ? 0 : 1.5}
                  />
                ))}
              </div>
              <p className="mt-4 flex-1 text-sm leading-7 text-[#3b4c46]">
                &ldquo;{review.text}&rdquo;
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
                    {review.origin && `${review.origin} · `}
                    {review.date} · {review.trip}
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
          aria-label="Reseña anterior"
          disabled={!canPrev}
          onClick={() => scroll(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c8d4ce] bg-white text-[#1f2b27] shadow-sm transition hover:bg-[#f0f4f2] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex gap-1.5" aria-hidden="true">
          {reviews.map((_, i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[#38645b]/30"
            />
          ))}
        </div>
        <button
          aria-label="Reseña siguiente"
          disabled={!canNext}
          onClick={() => scroll(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c8d4ce] bg-white text-[#1f2b27] shadow-sm transition hover:bg-[#f0f4f2] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
