import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, MapPin, Mountain } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { HotelMapWrapper } from "@/components/HotelMapWrapper";
import { HOTEL, distances } from "@/lib/site-data";
import { BOOKING_HREF } from "@/lib/nav";
import locationImage from "../../../../assets/updated images/otros/exterior del lateral del hotel con cartel en el centro.jpg";

export const metadata: Metadata = {
  title: "Ubicación y cómo llegar | Los Lagos Hotel, El Calafate",
  description:
    "Los Lagos Hotel está en 25 de Mayo 220, a 3 minutos del centro de El Calafate y a pasos del Lago Argentino. Distancias al aeropuerto, la terminal y el Glaciar Perito Moreno.",
};

export default function UbicacionPage() {
  return (
    <main className="bg-[#f7f3ea] text-[#1f2b27]">
      <PageHero
        eyebrow="Cómo llegar"
        title="En el corazón de El Calafate."
        subtitle="A solo 3 minutos a pie de la Av. del Libertador y a pasos del Lago Argentino. El punto de partida perfecto hacia la Patagonia austral."
        image={locationImage}
        imagePosition="center 55%"
      />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Map */}
            <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
              <HotelMapWrapper />
            </div>

            {/* Info panel */}
            <div className="flex flex-col gap-6">
              {/* Address */}
              <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#38645b]">
                  <MapPin size={15} aria-hidden="true" />
                  Dirección
                </h2>
                <p className="mt-2 text-base font-medium text-[#1f2b27]">{HOTEL.street}</p>
                <p className="text-sm text-[#5f6e69]">{HOTEL.cityLine}</p>
                <a
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#38645b] hover:underline"
                  href={HOTEL.googleMapsUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ExternalLink size={13} />
                  Abrir en Google Maps
                </a>
              </div>

              {/* Distances */}
              <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#38645b]">
                  <Mountain size={15} aria-hidden="true" />
                  Distancias
                </h2>
                <ul className="space-y-3">
                  {distances.map(({ label, value, time, modeIcon: ModeIcon, modeLabel, icon: Icon }) => (
                    <li key={label} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2 text-[#5f6e69]">
                        <Icon aria-hidden="true" className="shrink-0 text-[#38645b]" size={14} />
                        <span className="truncate">{label}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <span className="text-right">
                          <span className="block font-semibold text-[#1f2b27]">{value}</span>
                          <span className="block text-xs text-[#8fa09a]">{time}</span>
                        </span>
                        <span
                          aria-label={modeLabel}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#edf3ef] text-[#38645b]"
                          title={modeLabel}
                        >
                          <ModeIcon aria-hidden="true" size={12} />
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-[#38645b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2e5049]"
              href={BOOKING_HREF}
            >
              Reservar ahora
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-lg border border-[#c8d4ce] bg-white px-5 py-3 text-sm font-semibold text-[#1f2b27] transition hover:bg-[#f0f4f2]"
              href="/contacto"
            >
              Contactar al hotel
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
