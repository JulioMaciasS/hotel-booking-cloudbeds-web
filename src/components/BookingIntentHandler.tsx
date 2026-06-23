"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { track } from "@/lib/analytics";

/**
 * Lands the visitor on the date picker — centred and briefly highlighted —
 * instead of an arbitrary scroll position, whenever they arrive at the home page
 * with booking intent:
 *  - a `?room=<key>` hint left by a room CTA (also recorded as a `book_intent`
 *    event so the room they cared about is captured for funnel analysis), or
 *  - a `?book` intent left by any generic booking button (the nav "Book",
 *    footer, mobile bar, or an inner-page CTA) navigating in from another page.
 *
 * Note: the picker is a Cloudbeds web component, so the room *type* cannot be
 * pre-selected from our side — but the visitor no longer has to hunt for it.
 *
 * Mounted on the home page (where the picker lives) and wrapped in <Suspense>
 * by the caller because it reads search params.
 */
export function BookingIntentHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const room = searchParams.get("room");
    // A generic booking button navigating in from another page lands here with
    // ?book (same-page clicks are centred directly by ScrollCenterHandler).
    const book = searchParams.has("book");
    if (!room && !book) return;

    if (room) track("book_intent", { room, source: "room_cta" });

    const target = document.getElementById("reservar");
    if (!target) return;

    // The Cloudbeds picker renders asynchronously, so #reservar starts at zero
    // height — scrolling immediately lands nowhere and later layout shifts undo
    // it. Wait until the picker's date input exists (it has real height by
    // then), then scroll it to centre and pulse it. Fall back to scrolling the
    // section anyway if the picker never loads.
    const PICKER_INPUT =
      'cb-property-date-picker [data-testid="property-date-picker-date-picker-checkin-input"]';

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      observer.disconnect();
      window.clearTimeout(fallback);
      // Drop the intent params from the URL now (after committing to centre) so
      // a refresh or share isn't sticky — but late enough that the observer can
      // still re-arm under React's dev double-invoke (which, by clearing them
      // up front, would otherwise skip the second run before the picker loads).
      const url = new URL(window.location.href);
      url.searchParams.delete("room");
      url.searchParams.delete("book");
      window.history.replaceState({}, "", url.pathname + url.search);
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("booking-intent-highlight");
      window.setTimeout(
        () => target.classList.remove("booking-intent-highlight"),
        2200,
      );
    };

    const observer = new MutationObserver(() => {
      if (document.querySelector(PICKER_INPUT)) reveal();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const fallback = window.setTimeout(reveal, 6000);

    if (document.querySelector(PICKER_INPUT)) reveal();

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, [searchParams]);

  return null;
}
