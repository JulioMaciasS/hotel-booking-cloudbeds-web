import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

/**
 * Message namespaces, each backed by its own JSON file under
 * `messages/<locale>/`. Splitting them keeps each section's copy isolated and
 * easy to maintain; they're merged into a single message tree per request.
 */
const NAMESPACES = [
  "common",
  "metadata",
  "home",
  "rooms",
  "hotel",
  "experiences",
  "location",
  "guide",
  "contact",
  "reviews",
  "legal",
  "booking",
  "notFound",
] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const entries = await Promise.all(
    NAMESPACES.map(async (ns) => {
      const mod = await import(`../../messages/${locale}/${ns}.json`);
      return [ns, mod.default] as const;
    }),
  );

  return {
    locale,
    messages: Object.fromEntries(entries),
  };
});
