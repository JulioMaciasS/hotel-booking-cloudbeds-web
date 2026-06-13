"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import {
  VAT_CHANGE_EVENT,
  VAT_RATE,
  readVatPreference,
  writeVatPreference,
} from "@/lib/vat";

const VAT_PERCENT = Math.round(VAT_RATE * 100);

function subscribe(onChange: () => void) {
  window.addEventListener(VAT_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(VAT_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * First-visit gate for /reservas: forces the guest to pick their IVA residency
 * before they see prices, since it changes what every amount means. Shows only
 * when no choice has been stored yet; afterwards the persistent control in the
 * top-right header takes over. Blocking by design — no dismiss without choosing.
 */
export function VatPreferencePrompt() {
  const t = useTranslations("booking.vat");
  // Open exactly while no residency choice is stored. Reads localStorage
  // without an SSR mismatch (server snapshot = closed) and closes itself as
  // soon as a choice is made here or in another tab.
  const open = useSyncExternalStore(
    subscribe,
    () => readVatPreference() === null,
    () => false,
  );
  const firstChoiceRef = useRef<HTMLButtonElement>(null);

  // Lock background scroll and focus the first option while the gate is open.
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstChoiceRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const choose = (fromArgentina: boolean) => {
    writeVatPreference(fromArgentina);
  };

  const richStrong = {
    strong: (chunks: React.ReactNode) => (
      <strong className="text-[#1f2b27]">{chunks}</strong>
    ),
  };

  return (
    <div
      aria-labelledby="vat-prompt-title"
      aria-modal="true"
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
        <h2
          className="text-lg font-semibold text-[#1f2b27] sm:text-xl"
          id="vat-prompt-title"
        >
          {t("prompt.title")}
        </h2>
        <p className="mt-1.5 text-sm text-[#52615d]">{t("prompt.subtitle")}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            ref={firstChoiceRef}
            className="group flex flex-col items-start rounded-xl border border-[#dfe5e2] bg-white p-4 text-left transition hover:border-[#38645b] hover:bg-[#f3f7f5] focus-visible:border-[#38645b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38645b]/30"
            onClick={() => choose(true)}
            type="button"
          >
            <span className="text-base font-semibold text-[#1f2b27]">
              {t("argentina")}
            </span>
            <span className="mt-0.5 text-sm font-medium text-[#38645b]">
              {t("argentinaWithVat", { percent: VAT_PERCENT })}
            </span>
            <span className="mt-2 text-xs leading-5 text-[#66736f]">
              {t("argentinaTitle", { percent: VAT_PERCENT })}
            </span>
          </button>

          <button
            className="group flex flex-col items-start rounded-xl border border-[#dfe5e2] bg-white p-4 text-left transition hover:border-[#38645b] hover:bg-[#f3f7f5] focus-visible:border-[#38645b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38645b]/30"
            onClick={() => choose(false)}
            type="button"
          >
            <span className="text-base font-semibold text-[#1f2b27]">
              {t("abroad")}
            </span>
            <span className="mt-0.5 text-sm font-medium text-[#38645b]">
              {t("abroadNoVat")}
            </span>
            <span className="mt-2 text-xs leading-5 text-[#66736f]">
              {t("abroadTitle")}
            </span>
          </button>
        </div>

        <div className="mt-5 space-y-2 border-t border-[#eef2f0] pt-4 text-xs leading-5 text-[#66736f]">
          <p>{t.rich("intro", { percent: VAT_PERCENT, ...richStrong })}</p>
          <p>{t.rich("checkInNote", richStrong)}</p>
        </div>
      </div>
    </div>
  );
}
