import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

/** BCP-47 / OpenGraph locale codes for each supported UI locale. */
const OG_LOCALE: Record<Locale, string> = {
  es: "es_AR",
  en: "en_US",
};

/**
 * Absolute origin used to build canonical and hreflang URLs. Search engines
 * need fully-qualified URLs here, so set `NEXT_PUBLIC_SITE_URL` to the live
 * domain at deploy time; the placeholder below is only a stand-in for local
 * builds. Any trailing slash is stripped so we can safely concatenate paths.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.loslagoshotel.com.ar"
).replace(/\/$/, "");

/**
 * Build per-page `alternates` for multilingual SEO. Given the active locale and
 * a locale-agnostic href (e.g. "/habitaciones"), it returns the canonical URL
 * for the current locale plus a `languages` map pointing Google at the es/en
 * counterparts of the same page, with `x-default` falling back to the default
 * (Spanish) locale.
 *
 * URLs are derived through next-intl's `getPathname`, so the `/en` prefix (and
 * the `as-needed` rule that omits it for the default locale) stays in sync with
 * `routing` automatically.
 */
export function getAlternates(
  locale: Locale,
  href: string,
): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = siteUrl + getPathname({ locale: l, href });
  }
  languages["x-default"] =
    siteUrl + getPathname({ locale: routing.defaultLocale, href });

  return {
    canonical: siteUrl + getPathname({ locale, href }),
    languages,
  };
}

/**
 * Full page metadata in one call: title + description (from the `metadata`
 * message namespace, keyed by `metaKey`), canonical/hreflang alternates, and
 * Open Graph + Twitter cards so links shared on WhatsApp, Facebook, X and
 * LinkedIn render with a title, description and preview image.
 *
 * The preview image itself is supplied by the `opengraph-image` file convention
 * (`src/app/[locale]/opengraph-image.tsx`), which Next merges into every page's
 * `og:image`/`twitter:image` automatically — so it is intentionally not set
 * here.
 */
export async function buildPageMetadata(
  locale: Locale,
  href: string,
  metaKey: string,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t(`${metaKey}.title`);
  const description = t(`${metaKey}.description`);
  const url = siteUrl + getPathname({ locale, href });

  return {
    title,
    description,
    alternates: getAlternates(locale, href),
    openGraph: {
      type: "website",
      siteName: "Los Lagos Hotel",
      title,
      description,
      url,
      locale: OG_LOCALE[locale],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
