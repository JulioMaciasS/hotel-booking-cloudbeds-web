"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

/**
 * Segmented ES | EN switch. Swaps the locale while staying on the current page
 * (and preserving any query params, so the booking engine keeps its dates).
 */
export function LanguageSwitcher({ scrolled = true }: { scrolled?: boolean }) {
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
    <div
      aria-label={t("label")}
      className={`flex items-center rounded-lg border p-0.5 text-xs font-semibold ${
        scrolled
          ? "border-black/10 bg-white/60"
          : "border-white/30 bg-white/10 backdrop-blur"
      }`}
      role="group"
    >
      {routing.locales.map((locale) => {
        const active = locale === activeLocale;
        return (
          <button
            key={locale}
            aria-current={active ? "true" : undefined}
            className={`rounded-md px-2 py-1 transition-colors ${
              active
                ? scrolled
                  ? "bg-[#1f2b27] text-white"
                  : "bg-white text-[#1f2b27]"
                : scrolled
                  ? "text-[#52615d] hover:text-[#1f2b27]"
                  : "text-white/85 hover:text-white"
            }`}
            disabled={isPending}
            lang={locale}
            onClick={() => switchTo(locale)}
            type="button"
          >
            {t(`short.${locale}`)}
          </button>
        );
      })}
    </div>
  );
}
