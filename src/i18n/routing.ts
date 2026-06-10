import { defineRouting } from "next-intl/routing";

/**
 * Site locales. Spanish is the default and keeps the unprefixed URLs the site
 * already ranks for (`/habitaciones`, …); English lives under `/en/*`. The
 * `as-needed` prefix means only non-default locales are prefixed, and browser
 * `Accept-Language` is used to pick a locale for first-time visitors.
 */
export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
  localeCookie: {
    // Remember the visitor's choice for a year.
    maxAge: 60 * 60 * 24 * 365,
  },
});

export type Locale = (typeof routing.locales)[number];
