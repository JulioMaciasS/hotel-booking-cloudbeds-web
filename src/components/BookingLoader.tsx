"use client";

import { useEffect, useState } from "react";

const READY_HEIGHT_THRESHOLD_PX = 200;
const FALLBACK_TIMEOUT_MS = 20_000;

export function BookingLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let observer: ResizeObserver | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    function markReady() {
      setReady(true);
      observer?.disconnect();
      if (timeout !== null) clearTimeout(timeout);
    }

    function observe(el: Element) {
      observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.height >= READY_HEIGHT_THRESHOLD_PX) {
            markReady();
          }
        }
      });
      observer.observe(el);
      timeout = setTimeout(markReady, FALLBACK_TIMEOUT_MS);
    }

    // The element might already be in the DOM, or we may need to wait for it.
    const existing = document.querySelector("cb-immersive-experience");
    if (existing) {
      observe(existing);
      return () => {
        observer?.disconnect();
        if (timeout !== null) clearTimeout(timeout);
      };
    }

    // If not yet in the DOM, wait for it via MutationObserver on <body>.
    const domWatcher = new MutationObserver(() => {
      const el = document.querySelector("cb-immersive-experience");
      if (el) {
        domWatcher.disconnect();
        observe(el);
      }
    });
    domWatcher.observe(document.body, { childList: true, subtree: true });

    return () => {
      domWatcher.disconnect();
      observer?.disconnect();
      if (timeout !== null) clearTimeout(timeout);
    };
  }, []);

  if (ready) return null;

  return (
    <div
      aria-busy="true"
      aria-label="Cargando motor de reservas"
      className="fixed inset-x-0 bottom-0 z-40 flex flex-col items-center justify-center gap-6 bg-white"
      style={{ top: "72px" }}
    >
      {/* Spinner */}
      <div
        className="h-12 w-12 rounded-full border-4 border-[#edf3ef] border-t-[#38645b] animate-spin"
        role="status"
      />

      <div className="text-center">
        <p className="text-sm font-semibold text-[#1f2b27]">
          Cargando motor de reservas…
        </p>
        <p className="mt-1 text-xs text-[#66736f]">
          Esto puede tardar unos segundos
        </p>
      </div>

      {/* Skeleton cards hinting at the widget content below */}
      <div className="mt-2 flex w-full max-w-2xl flex-col gap-3 px-6">
        {[70, 90, 60].map((w) => (
          <div
            key={w}
            className="h-4 animate-pulse rounded-full bg-[#edf3ef]"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  );
}
