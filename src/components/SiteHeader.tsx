"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BOOKING_HREF, NAV_LINKS } from "@/lib/nav";
import logoImage from "@assets/old-web-images/logo-sin-fondo-270.png";

const SCROLL_THRESHOLD = 64;

export function SiteHeader() {
  const t = useTranslations("common");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > SCROLL_THRESHOLD;
      setScrolled(next);
      // Close mobile menu when scrolling past the hero
      if (next) setMobileOpen(false);
    };
    onScroll(); // check on mount (e.g. loaded at an anchor)
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock the page behind the full-screen mobile menu so only the menu scrolls.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-black/[0.06] transition-all duration-300 ${
        // Solid white while the full-screen menu is open (its backdrop-blur
        // would otherwise become the containing block for the fixed overlay);
        // white by default; translucent whitish blur once scrolled.
        mobileOpen ? "bg-white" : scrolled ? "bg-white/72 backdrop-blur-xl" : "bg-white"
      }`}
    >
      <div className="mx-auto flex h-[85px] w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Logo (transparent, not rounded — sits directly on the white bar) */}
        <Link className="flex items-center" href="/" onClick={() => setMobileOpen(false)}>
          <Image
            alt={t("brand")}
            className="h-[85px] w-[85px] object-contain"
            height={85}
            src={logoImage}
            width={85}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {NAV_LINKS.map(({ href, key }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                aria-current={active ? "page" : undefined}
                className={`transition-colors duration-300 ${
                  active
                    ? "text-[#1f2b27]"
                    : "text-[#52615d] hover:text-[#1f2b27]"
                } ${active ? "underline decoration-2 underline-offset-[6px] decoration-[#6dbfaa]" : ""}`}
                href={href}
              >
                {t(`nav.${key}`)}
              </Link>
            );
          })}
        </nav>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <LanguageSwitcher />
          </div>
          <Link
            className="rounded-lg btn-book px-4 py-2 text-sm font-semibold transition-all duration-300"
            href={BOOKING_HREF}
          >
            {t("actions.book")}
          </Link>
          <button
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? t("actions.closeMenu") : t("actions.openMenu")}
            className="rounded-lg p-2 text-[#1f2b27] transition-colors hover:bg-[#edf3ef] lg:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            type="button"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu — full-height overlay below the header bar. Fades via
          opacity/visibility so it's fully inert (no pointer/scroll capture)
          when closed. The body scroll-lock keeps the page fixed behind it. */}
      <div
        className={`fixed inset-x-0 bottom-0 top-[85px] z-40 bg-white transition-all duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="flex h-full flex-col overflow-y-auto">
          {/* Top-aligned just under the header bar; mx-auto centres the stack
              horizontally and overflow-y-auto scrolls it on short (landscape)
              viewports without clipping the top. */}
          <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-2 px-6 pt-6 pb-8">
            {NAV_LINKS.map(({ href, key }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  aria-current={active ? "page" : undefined}
                  className={`w-full rounded-xl px-6 py-4 text-center text-lg font-medium transition-colors ${
                    active
                      ? "bg-[#edf3ef] text-[#1f2b27]"
                      : "text-[#1f2b27] hover:bg-[#edf3ef]"
                  }`}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                >
                  {t(`nav.${key}`)}
                </Link>
              );
            })}
            <div className="mt-4 w-full">
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
