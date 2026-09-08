import { defineRouting } from "next-intl/routing";

/**
 * Site locales. Spanish is the default and keeps the unprefixed URLs the site
 * already ranks for (`/habitaciones`, …); English lives under `/en/*`. The
 * `as-needed` prefix means only non-default locales are prefixed. Locale
 * detection is disabled so an unprefixed Spanish booking URL cannot be changed
 * to English by the browser language or a stale locale cookie.
 */
export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localeDetection: false,
  localePrefix: "as-needed",
  localeCookie: {
    // Remember the visitor's choice for a year.
    maxAge: 60 * 60 * 24 * 365,
  },
});

export type Locale = (typeof routing.locales)[number];
