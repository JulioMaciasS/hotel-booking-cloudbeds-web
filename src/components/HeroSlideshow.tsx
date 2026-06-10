"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import img0 from "@assets/updated images/otros/fachada frente del hotel 2_ai_edited.png";
import img1 from "@assets/updated images/otros/exterior del lateral del hotel con cartel en el centro.jpg";
import img2 from "@assets/updated images/otros/fachada lateral hotel + jardin.jpg";
import img3 from "@assets/updated images/otros/recepcion 6 completa.jpg";
import img4 from "@assets/updated images/triples/triple_std_matsin_hab_a_01_rightcenenteredbed_closeup.jpg";
import img5 from "@assets/updated images/otros/comedor 3.jpg";
import img6 from "@assets/updated images/dobles/doble_sup_sinsin_hab_a_05_frontcenteredbed_above.jpg";
import img7 from "@assets/updated images/otros/desayuno 4.jpg";
import img8 from "@assets/updated images/dobles/doble_sup_mat_hab_a_01_abitrightcenteredbed_withbathroomatback_withvisiblewindow.jpg";
import img9 from "@assets/updated images/triples/triple_sup_matsin_hab_a_03_leftcenteredbed_withbathroomatback.jpg";

const SLIDES = [img0, img1, img2, img3, img4, img5, img6, img7, img8, img9];

const INTERVAL_MS = 10_000;

export function HeroSlideshow() {
  const t = useTranslations("home.heroSlideshow");
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrent((prev) => (prev + 1) % SLIDES.length),
      INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {SLIDES.map((src, i) => (
        <div
          key={i}
          aria-hidden={i !== current}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
          style={{ zIndex: i === current ? 1 : 0 }}
        >
          {/* New key each time this slide becomes active → remounts and restarts the zoom */}
          <div
            key={i === current ? `kb-${current}` : `idle-${i}`}
            className="absolute inset-0"
            style={
              i === current
                ? { animation: "kenBurns 10s ease-in-out forwards" }
                : undefined
            }
          >
            <Image
              alt={t(`slides.${i}`)}
              className="object-cover"
              fill
              priority={i === 0}
              quality={90}
              sizes="100vw"
              src={src}
            />
          </div>
        </div>
      ))}

      {/* Slide indicator dots */}
      <div
        className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-1.5"
        role="tablist"
        aria-label={t("tablistLabel")}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            aria-label={t("goToSlide", { index: i + 1 })}
            aria-selected={i === current}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-5 bg-white"
                : "w-1.5 bg-white/40 hover:bg-white/70"
            } h-1.5`}
            onClick={() => setCurrent(i)}
            role="tab"
            type="button"
          />
        ))}
      </div>
    </>
  );
}
