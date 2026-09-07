"use client";

import { CheckCircle2, CloudDownload, TriangleAlert, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { MAP_POIS } from "@/components/HotelMap";

type OfflineState = "hidden" | "preparing" | "ready" | "using" | "error";
const OFFLINE_ENABLED = process.env.NODE_ENV === "production";

function collectShellUrls() {
  const urls = new Set<string>([window.location.href]);
  for (const element of document.querySelectorAll<HTMLImageElement>("img")) {
    if (element.currentSrc || element.src) urls.add(element.currentSrc || element.src);
  }
  for (const element of document.querySelectorAll<HTMLScriptElement>("script[src]")) {
    urls.add(element.src);
  }
  for (const element of document.querySelectorAll<HTMLLinkElement>(
    'link[rel="stylesheet"], link[rel="preload"], link[rel="icon"]',
  )) {
    if (element.href) urls.add(element.href);
  }
  for (const entry of performance.getEntriesByType("resource")) {
    const url = new URL(entry.name, window.location.origin);
    if (url.origin === window.location.origin) urls.add(url.href);
  }
  return [...urls];
}

export function OfflineGuide() {
  const t = useTranslations("location.map.guide.offline");
  const [state, setState] = useState<OfflineState>("hidden");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!OFFLINE_ENABLED) return;

    let hideTimer: number | undefined;
    let cancelled = false;

    const hideLater = () => {
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setState("hidden"), 5500);
    };

    async function prepare() {
      if (!("serviceWorker" in navigator)) {
        setState("error");
        hideLater();
        return;
      }
      if (!navigator.onLine) {
        setState("using");
        hideLater();
        return;
      }

      setState("preparing");
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        await navigator.serviceWorker.ready;
        const worker = registration.active;
        if (!worker) throw new Error("Offline worker did not activate");

        const channel = new MessageChannel();
        channel.port1.onmessage = (event) => {
          if (cancelled) return;
          if (event.data?.type === "OFFLINE_PROGRESS") {
            const phaseProgress = event.data.total
              ? event.data.done / event.data.total
              : 0;
            setProgress(
              Math.round(
                event.data.phase === "shell"
                  ? phaseProgress * 15
                  : 15 + phaseProgress * 85,
              ),
            );
          }
          if (event.data?.type === "OFFLINE_READY") {
            setProgress(100);
            setState("ready");
            hideLater();
          }
          if (event.data?.type === "OFFLINE_ERROR") {
            setState("error");
            hideLater();
          }
        };
        worker.postMessage(
          {
            points: MAP_POIS.map((poi) => poi.coords),
            shellUrls: collectShellUrls(),
            type: "CACHE_OFFLINE_GUIDE",
          },
          [channel.port2],
        );
      } catch {
        if (!cancelled) {
          setState("error");
          hideLater();
        }
      }
    }

    const idleCallback = window.requestIdleCallback?.(() => void prepare(), {
      timeout: 1800,
    });
    const fallbackTimer = idleCallback
      ? undefined
      : window.setTimeout(() => void prepare(), 700);

    return () => {
      cancelled = true;
      window.clearTimeout(hideTimer);
      if (idleCallback) window.cancelIdleCallback?.(idleCallback);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
    };
  }, []);

  if (!OFFLINE_ENABLED || state === "hidden") return null;

  const icon =
    state === "ready" ? (
      <CheckCircle2 aria-hidden="true" size={18} />
    ) : state === "using" ? (
      <WifiOff aria-hidden="true" size={18} />
    ) : state === "error" ? (
      <TriangleAlert aria-hidden="true" size={18} />
    ) : (
      <CloudDownload aria-hidden="true" size={18} />
    );
  const label =
    state === "ready"
      ? t("ready")
      : state === "using"
        ? t("using")
        : state === "error"
          ? t("error")
          : t("preparing", { progress });

  return (
    <div
      aria-live="polite"
      className={`fixed left-1/2 top-[98px] z-1300 flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-lg backdrop-blur-sm sm:text-sm ${
        state === "error"
          ? "bg-[#fff4ed] text-[#8b3e2f] ring-1 ring-[#e8b8a9]"
          : "bg-[#15362f]/92 text-white ring-1 ring-white/20"
      }`}
      role={state === "error" ? "alert" : "status"}
    >
      {icon}
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
}
