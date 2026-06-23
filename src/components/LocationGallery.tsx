"use client";

import { useCallback, useEffect, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import img0 from "@assets/updated images/otros/fachada frente del hotel 2.jpg";
import img1 from "@assets/updated images/otros/jardin 1.jpg";
import img2 from "@assets/updated images/otros/fachada lateral del hotel.jpg";
import img3 from "@assets/updated images/otros/jardin 4.jpg";
import img4 from "@assets/updated images/otros/cartel del hotel en el frente del hotel.jpg";
import img5 from "@assets/updated images/otros/jardin 6.jpg";

// Order matches `location.page.gallery.alts`.
const IMAGES: StaticImageData[] = [img0, img1, img2, img3, img4, img5];

/**
 * Hotel photo gallery for the location page — a responsive grid that opens a
 * full-screen lightbox (keyboard + on-screen prev/next, scroll-locked while
 * open). Sits below the map, so visitors get the practical "where we are"
 * details first, then a look around the property.
 */
export function LocationGallery() {
  const t = useTranslations("location.page.gallery");
  const alts = t.raw("alts") as string[];
  const [lightbox, setLightbox] = useState<number | null>(null);

  const close = useCallback(() => setLightbox(null), []);
  const step = useCallback(
    (dir: number) =>
      setLightbox((i) =>
        i === null ? i : (i + dir + IMAGES.length) % IMAGES.length,
      ),
    [],
  );

  // While the lightbox is open: lock body scroll and wire up keyboard control.
  useEffect(() => {
    if (lightbox === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, close, step]);

  return (
    <section className="bg-[#f7f3ea] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#38645b]">
            {t("eyebrow")}
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1f2b27] sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-base leading-7 text-[#5f6e69]">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
          {IMAGES.map((src, i) => (
            <button
              key={i}
              aria-label={`${t("open")} — ${alts[i]}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg ring-1 ring-black/5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38645b]"
              onClick={() => setLightbox(i)}
              type="button"
            >
              <Image
                alt={alts[i]}
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                src={src}
              />
            </button>
          ))}
        </div>
      </div>

      {lightbox !== null && (
        <div
          aria-label={t("title")}
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
        >
          {/* Backdrop — clicking the dark area closes (the image sits above it) */}
          <button
            aria-label={t("close")}
            className="absolute inset-0 cursor-default"
            onClick={close}
            tabIndex={-1}
            type="button"
          />

          <div className="relative z-10 h-[85vh] w-full max-w-5xl">
            <Image
              alt={alts[lightbox]}
              className="object-contain drop-shadow-2xl"
              fill
              sizes="(min-width: 768px) 80vw, 92vw"
              src={IMAGES[lightbox]}
            />
          </div>

          <button
            aria-label={t("close")}
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            onClick={close}
            type="button"
          >
            <X size={20} />
          </button>

          <button
            aria-label={t("previous")}
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:left-5"
            onClick={() => step(-1)}
            type="button"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            aria-label={t("next")}
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-5"
            onClick={() => step(1)}
            type="button"
          >
            <ChevronRight size={24} />
          </button>

          <p className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white/90">
            {t("counter", { current: lightbox + 1, total: IMAGES.length })}
          </p>
        </div>
      )}
    </section>
  );
}
