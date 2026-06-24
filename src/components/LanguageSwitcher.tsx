"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronDown, Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

/**
 * Locale dropdown — a custom popup (not a native <select>) so the menu matches
 * the site's styling on every platform. It swaps the locale while preserving the
 * current page and any query params, so the booking engine keeps its dates.
 *
 * The trigger keeps the compact code (ES/EN); the popup lists the full language
 * names with a check on the active one. Keyboard, Escape, click-outside and
 * focus return are all wired up, and the popup flips above the trigger when
 * there isn't room below (it sits near the bottom of the mobile menu).
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

  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const locales = routing.locales;
  const activeIndex = locales.indexOf(activeLocale as Locale);

  const switchTo = (next: Locale) => {
    setOpen(false);
    buttonRef.current?.focus();
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

  const openMenu = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    // Flip the popup above the trigger when there isn't room for it below
    // (the switcher sits low in the scrollable mobile menu).
    if (rect) setDropUp(window.innerHeight - rect.bottom < 160);
    setOpen(true);
  };

  // Close on outside pointerdown and on Escape (returning focus to the trigger).
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Move focus onto the active option once the popup is in the DOM.
  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  const onTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (open) optionRefs.current[activeIndex]?.focus();
      else openMenu();
    }
  };

  const onOptionKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      optionRefs.current[(index + 1) % locales.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      optionRefs.current[(index - 1 + locales.length) % locales.length]?.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full lg:w-auto"
      // Close when focus leaves the switcher entirely (e.g. tabbing past it).
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <Globe
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52615d]"
        size={18}
      />
      <button
        ref={buttonRef}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("label")}
        className="w-full cursor-pointer rounded-xl border border-black/10 bg-white px-10 py-3 text-center text-base font-semibold text-[#1f2b27] transition-colors hover:border-black/20 focus:outline-none focus:ring-2 focus:ring-[#6dbfaa] disabled:opacity-60 lg:w-auto lg:rounded-lg lg:py-2 lg:text-sm"
        disabled={isPending}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        type="button"
      >
        {t(`short.${activeLocale}`)}
      </button>
      <ChevronDown
        aria-hidden
        className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#52615d] transition-transform duration-200 ${
          open ? "rotate-180" : ""
        }`}
        size={18}
      />

      {open && (
        <ul
          aria-label={t("label")}
          className={`absolute right-0 z-50 w-full overflow-hidden rounded-xl border border-black/10 bg-white p-1 shadow-lg shadow-black/5 lg:w-auto lg:min-w-[11rem] ${
            dropUp ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          role="listbox"
        >
          {locales.map((locale, index) => {
            const selected = locale === activeLocale;
            return (
              <li key={locale} aria-selected={selected} role="option">
                <button
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left text-base text-[#1f2b27] transition-colors hover:bg-[#edf3ef] focus:bg-[#edf3ef] focus:outline-none lg:py-2.5 lg:text-sm ${
                    selected ? "font-semibold" : "font-medium"
                  }`}
                  lang={locale}
                  onClick={() => switchTo(locale)}
                  onKeyDown={(event) => onOptionKeyDown(event, index)}
                  type="button"
                >
                  <span>{t(locale)}</span>
                  {selected && (
                    <Check aria-hidden className="text-[#6dbfaa]" size={16} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
