"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
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
        ¿Dónde residís?
      </span>

      <div
        aria-label="Residencia para el cálculo del IVA"
        className="inline-flex items-center rounded-full bg-[#f1f5f3] p-0.5 text-[11px] font-semibold ring-1 ring-[#dfe5e2]"
        role="radiogroup"
      >
        <button
          aria-checked={fromArgentina}
          className={pillClass(fromArgentina)}
          onClick={() => writeVatPreference(true)}
          role="radio"
          title={`Residente en Argentina — precios con IVA ${VAT_PERCENT}%`}
          type="button"
        >
          Argentina
          <span className="block text-[9px] font-medium opacity-75">
            con IVA {VAT_PERCENT}%
          </span>
        </button>
        <button
          aria-checked={!fromArgentina}
          className={pillClass(!fromArgentina)}
          onClick={() => writeVatPreference(false)}
          role="radio"
          title="Residente en el exterior — exento de IVA"
          type="button"
        >
          Exterior
          <span className="block text-[9px] font-medium opacity-75">
            sin IVA
          </span>
        </button>
      </div>

      <button
        aria-label="Información sobre el IVA"
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
            aria-label="Cerrar"
            className="absolute inset-0 cursor-default bg-black/40"
            onClick={() => setInfoOpen(false)}
            tabIndex={-1}
            type="button"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
              aria-label="Cerrar"
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
              IVA y residentes en el exterior
            </h2>

            <div className="mt-3 space-y-3 text-sm leading-6 text-[#52615d]">
              <p>
                En Argentina el alojamiento tiene un IVA del {VAT_PERCENT}%. Las
                personas{" "}
                <strong className="text-[#1f2b27]">
                  residentes en el exterior
                </strong>{" "}
                están exentas de pagarlo (Decreto 1043/2016) cuando abonan con
                medios de pago del exterior.
              </p>
              <ul className="space-y-1.5">
                <li>
                  <strong className="text-[#1f2b27]">
                    Residente en Argentina:
                  </strong>{" "}
                  los precios incluyen el IVA ({VAT_PERCENT}%).
                </li>
                <li>
                  <strong className="text-[#1f2b27]">
                    Residente en el exterior:
                  </strong>{" "}
                  los precios se muestran sin IVA.
                </li>
              </ul>
              <p>
                Al hacer el check-in se verificará tu{" "}
                <strong className="text-[#1f2b27]">DNI o pasaporte</strong> para
                confirmar que se seleccionó la tarifa correcta. Si corresponde
                otra condición, se ajustará la diferencia.
              </p>
            </div>

            <button
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-[#38645b] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2e5049]"
              onClick={() => setInfoOpen(false)}
              type="button"
            >
              Entendido
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
