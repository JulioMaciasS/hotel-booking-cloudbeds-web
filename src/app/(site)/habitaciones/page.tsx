import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { RoomsSection } from "@/components/RoomsSection";
import { FEATURES, ROOMS } from "@/lib/rooms";
import { BOOKING_HREF } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Habitaciones | Los Lagos Hotel, El Calafate",
  description:
    "Habitaciones dobles y triples, estándar y superior, en Los Lagos Hotel, El Calafate. Calefacción, Wi-Fi, TV y desayuno incluido en todas las tarifas.",
};

export default function HabitacionesPage() {
  return (
    <main className="bg-[#f7f3ea] text-[#1f2b27]">
      <PageHero
        eyebrow="Habitaciones"
        title="Habitaciones para cada viaje."
        subtitle="Doble o triple, estándar o superior. Espacios cálidos y bien equipados, pensados para descansar después de un día entre glaciares."
        image={ROOMS[2].photos[0]}
      />

      {/* Room selector */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
              Elegí tu habitación
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
              Cuatro tipos, una misma calidez.
            </h2>
            <p className="mt-4 text-base leading-8 text-[#5f6e69]">
              Mirá las fotos, las configuraciones de cama y lo que incluye cada
              tipo de habitación. Cuando quieras, consultá disponibilidad y tarifas
              en tiempo real.
            </p>
          </div>

          <div className="mt-10">
            <RoomsSection />
          </div>
        </div>
      </section>

      {/* Included in every room */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#38645b]">
            Incluido en todas las habitaciones
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm font-medium text-[#34423e]">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf3ef] text-[#38645b]">
                  <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1f2b27] px-5 py-20 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center">
          <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">
            Consultá disponibilidad y tarifas
          </h2>
          <p className="max-w-xl text-base leading-8 text-white/70">
            Reservá directo en este sitio y conseguí siempre la mejor tarifa, con
            desayuno incluido y confirmación inmediata.
          </p>
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-[#1f2b27] shadow transition hover:bg-[#edf2ef]"
            href={BOOKING_HREF}
          >
            Buscar fechas disponibles
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
