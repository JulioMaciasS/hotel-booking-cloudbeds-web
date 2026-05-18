"use client";

import { useEffect } from "react";

/**
 * Intercepts clicks on any <a href="#reservar"> link and scrolls the target
 * element to the center of the viewport instead of the top.
 */
export function ScrollCenterHandler() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest('a[href="#reservar"]');
      if (!anchor) return;
      e.preventDefault();
      document
        .getElementById("reservar")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
