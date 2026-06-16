import type { MetadataRoute } from "next";
import { siteUrl } from "@/i18n/metadata";

/**
 * Crawler rules. Everything indexable is open; only the API routes are blocked.
 * /reservas is left crawlable on purpose so search engines can read its
 * `noindex` tag (a robots `Disallow` would hide the page before they ever see
 * the tag).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
