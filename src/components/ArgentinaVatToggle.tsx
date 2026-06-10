"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Info, X } from "lucide-react";
import {
  VAT_CHANGE_EVENT,
  VAT_RATE,
  getFromArgentina,
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

export function ArgentinaVatToggle() {
  const t = useTranslations("booking");
  // Reads the shared preference (localStorage + locale default) without an SSR
  // mismatch; updates whenever the choice changes here or in another tab.
  const fromArgentina = useSyncExternalStore(
    subscribe,
    getFromArgentina,
    () => false,
  );
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    if (!infoOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setInfoOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [infoOpen]);

  const pillClass = (active: boolean) =>
    `rounded-full px-3 py-1 text-center leading-tight transition ${
      active
        ? "bg-[#38645b] text-white shadow-sm"
        : "text-[#34423e] hover:text-[#1f2b27]"
    }`;

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-[11px] font-medium text-[#52615d] md:inline">
        {t("vat.residenceQuestion")}
      </span>

      <div
        aria-label={t("vat.groupLabel")}
        className="inline-flex items-center rounded-full bg-[#f1f5f3] p-0.5 text-[11px] font-semibold ring-1 ring-[#dfe5e2]"
        role="radiogroup"
      >
        <button
          aria-checked={fromArgentina}
          className={pillClass(fromArgentina)}
          onClick={() => writeVatPreference(true)}
          role="radio"
          title={t("vat.argentinaTitle", { percent: VAT_PERCENT })}
          type="button"
        >
          {t("vat.argentina")}
          <span className="block text-[9px] font-medium opacity-75">
            {t("vat.argentinaWithVat", { percent: VAT_PERCENT })}
          </span>
        </button>
        <button
          aria-checked={!fromArgentina}
          className={pillClass(!fromArgentina)}
          onClick={() => writeVatPreference(false)}
          role="radio"
          title={t("vat.abroadTitle")}
          type="button"
        >
          {t("vat.abroad")}
          <span className="block text-[9px] font-medium opacity-75">
            {t("vat.abroadNoVat")}
          </span>
        </button>
      </div>

      <button
        aria-label={t("vat.infoButtonLabel")}
        className="rounded-full p-1.5 text-[#52615d] transition-colors hover:bg-[#edf3ef] hover:text-[#1f2b27]"
        onClick={() => setInfoOpen(true)}
        type="button"
      >
        <Info size={16} />
      </button>

      {infoOpen ? (
        <div
          aria-labelledby="vat-info-title"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          role="dialog"
        >
          <button
            aria-label={t("vat.closeLabel")}
            className="absolute inset-0 cursor-default bg-black/40"
            onClick={() => setInfoOpen(false)}
            tabIndex={-1}
            type="button"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
              aria-label={t("vat.closeLabel")}
              className="absolute right-4 top-4 rounded-full p-1.5 text-[#66736f] transition-colors hover:bg-[#edf3ef] hover:text-[#1f2b27]"
              onClick={() => setInfoOpen(false)}
              type="button"
            >
              <X size={18} />
            </button>

            <h2
              className="pr-8 text-lg font-semibold text-[#1f2b27]"
              id="vat-info-title"
            >
              {t("vat.modalTitle")}
            </h2>

            <div className="mt-3 space-y-3 text-sm leading-6 text-[#52615d]">
              <p>
                {t.rich("vat.intro", {
                  percent: VAT_PERCENT,
                  strong: (chunks) => (
                    <strong className="text-[#1f2b27]">{chunks}</strong>
                  ),
                })}
              </p>
              <ul className="space-y-1.5">
                <li>
                  {t.rich("vat.residentArgentina", {
                    percent: VAT_PERCENT,
                    strong: (chunks) => (
                      <strong className="text-[#1f2b27]">{chunks}</strong>
                    ),
                  })}
                </li>
                <li>
                  {t.rich("vat.residentAbroad", {
                    strong: (chunks) => (
                      <strong className="text-[#1f2b27]">{chunks}</strong>
                    ),
                  })}
                </li>
              </ul>
              <p>
                {t.rich("vat.checkInNote", {
                  strong: (chunks) => (
                    <strong className="text-[#1f2b27]">{chunks}</strong>
                  ),
                })}
              </p>
            </div>

            <button
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-[#38645b] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2e5049]"
              onClick={() => setInfoOpen(false)}
              type="button"
            >
              {t("vat.understood")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
