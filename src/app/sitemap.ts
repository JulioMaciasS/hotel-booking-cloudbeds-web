import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/i18n/metadata";

/**
 * XML sitemap for the indexable marketing pages, one entry per locale with
 * `hreflang` alternates so Google ties the es/en versions of each page
 * together. The booking shell (/reservas) and API routes are intentionally
 * excluded — /reservas is `noindex` and has no standalone content.
 */
const PAGES: { href: string; priority: number }[] = [
  { href: "/", priority: 1 },
  { href: "/habitaciones", priority: 0.8 },
  { href: "/hotel", priority: 0.8 },
  { href: "/experiencias", priority: 0.8 },
  { href: "/ubicacion", priority: 0.7 },
  { href: "/contacto", priority: 0.7 },
  { href: "/terminos", priority: 0.3 },
  { href: "/privacidad", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap(({ href, priority }) => {
    const languages: Record<string, string> = {};
    for (const l of routing.locales) {
      languages[l] = siteUrl + getPathname({ locale: l, href });
    }

    return routing.locales.map((locale) => ({
      url: siteUrl + getPathname({ locale, href }),
      changeFrequency: "monthly" as const,
      priority,
      alternates: { languages },
    }));
  });
}
