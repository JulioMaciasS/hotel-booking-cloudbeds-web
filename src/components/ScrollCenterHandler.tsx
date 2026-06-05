"use client";

import { useEffect } from "react";

/**
 * Intercepts clicks on links that target the booking widget (#reservar or the
 * cross-page /#reservar form) and scrolls it to the center of the viewport
 * instead of the top. Only acts when the widget exists on the current page.
 */
export function ScrollCenterHandler() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest(
        'a[href="#reservar"], a[href="/#reservar"]',
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
