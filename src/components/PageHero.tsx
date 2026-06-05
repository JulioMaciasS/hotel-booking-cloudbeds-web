import Image from "next/image";
import type { StaticImageData } from "next/image";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  image?: StaticImageData;
  /** Object-position for the background image, e.g. "center 40%". */
  imagePosition?: string;
};

/**
 * Compact page banner shown at the top of every inner page. The dark backdrop
 * keeps the transparent fixed site header readable, and the consistent layout
 * gives each page a clear identity.
 */
export function PageHero({ eyebrow, title, subtitle, image, imagePosition }: PageHeroProps) {
  return (
    <section className="relative flex min-h-[46svh] items-end overflow-hidden bg-[#1f2b27] text-white">
      {image && (
        <Image
          alt=""
          aria-hidden="true"
          className="object-cover"
          fill
          priority
          quality={90}
          sizes="100vw"
          src={image}
          style={imagePosition ? { objectPosition: imagePosition } : undefined}
        />
      )}
      {/* Depth gradients — protect the text and keep the header legible */}
      <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/25 to-black/60" />
      <div className="absolute inset-0 bg-linear-to-r from-black/40 via-black/10 to-transparent" />

      <div className="relative mx-auto w-full max-w-7xl px-5 pb-12 pt-28 sm:px-8 sm:pb-16">
        <div className="max-w-3xl [text-shadow:0_1px_14px_rgba(0,0,0,0.5)]">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-white/60">
            {eyebrow}
          </p>
          <h1 className="text-4xl font-semibold leading-[1.05] sm:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
