"use client";

import { useEffect } from "react";

/**
 * Intercepts clicks on any link that targets the booking widget — the nav
 * "Book" button, footer, mobile bar, in-page CTAs — and scrolls the widget to
 * the center of the viewport instead of the top, with no page navigation. The
 * selector covers the generic `?book=1` booking buttons (BOOKING_HREF, any
 * locale) and the home page's own `#reservar` anchor. Only acts when the widget
 * exists on the current page (i.e. the home page); from other pages the link
 * navigates and BookingIntentHandler does the centering once the picker loads.
 */
export function ScrollCenterHandler() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest(
        'a[href*="book=1"], a[href$="#reservar"]',
      );
      if (!anchor) return;
      const target = document.getElementById("reservar");
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
