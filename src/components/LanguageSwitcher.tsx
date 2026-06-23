"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

/**
 * Locale dropdown — a native <select> (the OS picker is the friendliest control
 * on touch) that swaps the locale while preserving the current page and any
 * query params, so the booking engine keeps its dates.
 *
 * Sizing is breakpoint-driven because the two nav placements never show at once:
 * full-width and tappable in the mobile menu (`lg:hidden`), compact in the
 * desktop nav bar (`hidden lg:block`). So the base styles dress the mobile one
 * and the `lg:` styles dress the desktop one.
 */
export function LanguageSwitcher() {
  const t = useTranslations("common.languageSwitcher");
  const activeLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: Locale) => {
    if (next === activeLocale || isPending) return;
    // Read the live query string at click time (client-only) so we preserve
    // booking params without useSearchParams() — which would force the whole
    // page out of static rendering.
    const query = Object.fromEntries(
      new URLSearchParams(window.location.search).entries(),
    );
    startTransition(() => {
      router.replace({ pathname, query }, { locale: next });
    });
  };

  return (
    <div className="relative w-full lg:w-auto">
      <Globe
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52615d]"
        size={18}
      />
      <select
        aria-label={t("label")}
        className="w-full cursor-pointer appearance-none rounded-xl border border-black/10 bg-white px-10 py-3 text-center text-base font-semibold text-[#1f2b27] transition-colors hover:border-black/20 focus:outline-none focus:ring-2 focus:ring-[#6dbfaa] disabled:opacity-60 lg:w-auto lg:rounded-lg lg:py-2 lg:text-sm"
        disabled={isPending}
        onChange={(event) => switchTo(event.target.value as Locale)}
        value={activeLocale}
      >
        {routing.locales.map((locale) => (
          <option key={locale} lang={locale} value={locale}>
            {t(`short.${locale}`)}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#52615d]"
        size={18}
      />
    </div>
  );
}
