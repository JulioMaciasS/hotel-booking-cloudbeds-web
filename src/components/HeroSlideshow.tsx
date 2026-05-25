"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import img0 from "../../assets/updated images/otros/fachada frente del hotel 2_ai_edited.png";
import img1 from "../../assets/updated images/otros/exterior del lateral del hotel con cartel en el centro.jpg";
import img2 from "../../assets/updated images/otros/fachada lateral hotel + jardin.jpg";
import img3 from "../../assets/updated images/otros/recepcion 6 completa.jpg";
import img4 from "../../assets/updated images/triples/triple_std_matsin_hab_a_01_rightcenenteredbed_closeup.jpg";
import img5 from "../../assets/updated images/otros/comedor 3.jpg";
import img6 from "../../assets/updated images/dobles/doble_sup_sinsin_hab_a_05_frontcenteredbed_above.jpg";
import img7 from "../../assets/updated images/otros/desayuno 4.jpg";
import img8 from "../../assets/updated images/dobles/doble_sup_mat_hab_a_01_abitrightcenteredbed_withbathroomatback_withvisiblewindow.jpg";
import img9 from "../../assets/updated images/triples/triple_sup_matsin_hab_a_03_leftcenteredbed_withbathroomatback.jpg";

const SLIDES = [
  { src: img0, alt: "Fachada de Los Lagos Hotel, El Calafate" },
  { src: img1, alt: "Lateral del hotel con cartel" },
  { src: img2, alt: "Lateral del hotel con jardín" },
  { src: img3, alt: "Recepción de Los Lagos Hotel" },
  { src: img4, alt: "Habitación triple estándar" },
  { src: img5, alt: "Comedor de Los Lagos Hotel" },
  { src: img6, alt: "Habitación doble superior con dos camas" },
  { src: img7, alt: "Desayuno en Los Lagos Hotel" },
  { src: img8, alt: "Habitación doble superior" },
  { src: img9, alt: "Habitación triple superior" },
];

const INTERVAL_MS = 10_000;

export function HeroSlideshow() {
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
      {SLIDES.map(({ src, alt }, i) => (
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
              alt={alt}
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
        aria-label="Imágenes del hotel"
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            aria-label={`Ver imagen ${i + 1}`}
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
