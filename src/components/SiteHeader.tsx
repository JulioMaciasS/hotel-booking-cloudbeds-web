"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { BOOKING_HREF, NAV_LINKS } from "@/lib/nav";
import logoImage from "../../assets/old-web-images/logo-sin-fondo-270.png";

const SCROLL_THRESHOLD = 64;

export function SiteHeader() {
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

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/72 backdrop-blur-xl border-b border-black/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <Link className="flex items-center gap-3" href="/" onClick={() => setMobileOpen(false)}>
          <Image
            alt="Los Lagos Hotel"
            className={`h-14 w-14 rounded-full object-contain p-1 transition-all duration-300 ${
              scrolled ? "bg-white ring-1 ring-[#e4e8e6]" : "bg-white/90"
            }`}
            height={56}
            src={logoImage}
            width={56}
          />
          <span
            className={`text-base font-semibold tracking-wide transition-colors duration-300 ${
              scrolled ? "text-[#1f2b27]" : "text-white"
            }`}
          >
            Los Lagos Hotel
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                aria-current={active ? "page" : undefined}
                className={`transition-colors duration-300 ${
                  scrolled
                    ? active
                      ? "text-[#1f2b27]"
                      : "text-[#52615d] hover:text-[#1f2b27]"
                    : active
                      ? "text-white"
                      : "text-white/85 hover:text-white"
                } ${active ? "underline decoration-2 underline-offset-[6px] decoration-[#6dbfaa]" : ""}`}
                href={href}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-2">
          <Link
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 ${
              scrolled
                ? "bg-[#1f2b27] text-white hover:bg-[#31413d]"
                : "bg-white text-[#1f2b27] shadow-sm hover:bg-[#f0f4f2]"
            }`}
            href={BOOKING_HREF}
          >
            Reservar
          </Link>
          <button
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            className={`rounded-lg p-2 transition-colors lg:hidden ${
              scrolled
                ? "text-[#1f2b27] hover:bg-[#edf3ef]"
                : "text-white hover:bg-white/10"
            }`}
            onClick={() => setMobileOpen((prev) => !prev)}
            type="button"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "max-h-120 opacity-100" : "max-h-0 opacity-0"
        } ${
          scrolled
            ? "border-t border-black/[0.06] bg-white/72 backdrop-blur-xl"
            : "border-t border-white/10 bg-[#1f2b27]/80 backdrop-blur-xl"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-3 sm:px-8">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                  scrolled
                    ? active
                      ? "bg-[#edf3ef] text-[#1f2b27]"
                      : "text-[#1f2b27] hover:bg-[#edf3ef]"
                    : active
                      ? "bg-white/10 text-white"
                      : "text-white/90 hover:bg-white/10"
                }`}
                href={href}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
