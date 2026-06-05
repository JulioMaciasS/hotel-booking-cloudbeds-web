"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { BOOKING_HREF } from "@/lib/nav";

const SHOW_AFTER = 520;

/**
 * Persistent bottom "Reservar" bar on mobile. Appears after the user scrolls
 * past the hero, giving a constant path to the booking engine. Hidden on lg+
 * where the sticky header CTA is always visible.
 */
export function MobileBookingBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/90 px-4 py-3 backdrop-blur-lg transition-transform duration-300 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#1f2b27]">
            Reservá tu estadía
          </p>
          <p className="truncate text-xs text-[#66736f]">
            Mejor tarifa · sin comisiones
          </p>
        </div>
        <Link
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#38645b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2e5049] active:scale-[0.99]"
          href={BOOKING_HREF}
        >
          <CalendarDays size={16} aria-hidden="true" />
          Buscar fechas
        </Link>
      </div>
    </div>
  );
}
