"use client";

import { useEffect, useState } from "react";

interface Props {
  /**
   * Watches for this element to appear then disappear (e.g. a third-party
   * loading spinner). Dismisses the overlay when it's gone.
   */
  waitForRemoval?: string;
  /**
   * Watches for this element to appear in the DOM (e.g. an interactive form
   * control). Used as a secondary signal when waitForRemoval is set, or as
   * the sole signal when it isn't.
   */
  selector?: string;
  /**
   * When true the overlay covers the full viewport including the navbar.
   * When false (default) the overlay starts below the 72px navbar.
   */
  coverNav?: boolean;
}

export function BookingLoader({ waitForRemoval, selector, coverNav = false }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let observer: MutationObserver | null = null;
    let done = false;
    let seenLoader = false;

    function markReady() {
      if (done) return;
      done = true;
      setReady(true);
      observer?.disconnect();
    }

    function check() {
      // --- waitForRemoval: fire when the loader element disappears ---
      if (waitForRemoval) {
        const loader = document.querySelector(waitForRemoval);
        if (loader) {
          seenLoader = true;
        } else if (seenLoader) {
          markReady();
          return;
        }
      }

      // --- selector: fire when the target element appears ---
      if (selector && document.querySelector(selector)) {
        markReady();
      }
    }

    check();
    if (done) return;

    observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer?.disconnect();
  }, [waitForRemoval, selector]);

  if (ready) return null;

  return (
    <div
      aria-busy="true"
      aria-label="Cargando"
      className={`fixed inset-x-0 bottom-0 flex items-center justify-center bg-white ${
        coverNav ? "z-60" : "z-40"
      }`}
      style={{ top: coverNav ? 0 : "72px" }}
    >
      <div
        className="h-12 w-12 rounded-full border-4 border-[#edf3ef] border-t-[#38645b] animate-spin"
        role="status"
      />
    </div>
  );
}
