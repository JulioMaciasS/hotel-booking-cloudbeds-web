import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

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
