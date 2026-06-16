"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { track } from "@/lib/analytics";

/**
 * Picks up a `?room=<key>` hint left by a room CTA and lands the visitor on the
 * date picker instead of an arbitrary scroll position: it scrolls the picker to
 * the centre, briefly highlights it, and records the room interest as a
 * `book_intent` analytics event.
 *
 * Note: the picker is a Cloudbeds web component, so the room *type* cannot be
 * pre-selected from our side — but the visitor no longer has to hunt for the
 * picker, and the room they cared about is captured for funnel analysis.
 *
 * Mounted on the home page (where the picker lives) and wrapped in <Suspense>
 * by the caller because it reads search params.
 */
export function BookingIntentHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const room = searchParams.get("room");
    if (!room) return;

    track("book_intent", { room, source: "room_cta" });

    // Drop the hint from the URL so a refresh or share isn't sticky.
    const url = new URL(window.location.href);
    url.searchParams.delete("room");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);

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
