import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bus, Clock, MapPin } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { HOTEL, trips } from "@/lib/site-data";
import { BOOKING_HREF } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Experiencias y excursiones | Los Lagos Hotel, El Calafate",
  description:
    "Glaciar Perito Moreno, minitrekking sobre el hielo, navegación por el Lago Argentino y El Chaltén. El hotel organiza traslados y te ayuda a planificar cada excursión.",
};

export default function ExperienciasPage() {
  return (
    <main className="bg-[#1f2b27] text-white">
      <PageHero
        eyebrow="Experiencias"
        title="Glaciares, lagos y montañas."
        subtitle="Somos tu campamento base en El Calafate. El hotel organiza traslados a los principales atractivos y te ayuda a planificar cada salida."
        image={trips[0].image}
      />

      {/* Intro */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#6dbfaa]">
                Excursiones en bus
              </p>
              <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Las salidas que no te podés perder.
              </h2>
              <p className="mt-4 text-base leading-8 text-white/70">
                Salidas diarias en temporada desde el centro de la ciudad. Nuestros
                recepcionistas te ayudan a planificar y reservar cada excursión.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur shrink-0">
              <Bus size={18} aria-hidden="true" />
              <span>Traslados desde el hotel</span>
            </div>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trips.map((trip) => (
              <article
                key={trip.name}
                className="group flex flex-col overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image
                    alt={trip.name}
                    className="object-cover transition duration-500 group-hover:scale-105"
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    src={trip.image}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-[#38645b] px-3 py-1 text-xs font-semibold text-white">
                    {trip.highlight}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-semibold text-white">{trip.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-white/65">
                    {trip.description}
                  </p>
                  <dl className="mt-4 flex flex-wrap gap-3 border-t border-white/10 pt-4 text-xs text-white/55">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} aria-hidden="true" />
                      <span>{trip.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} aria-hidden="true" />
                      <span>{trip.distance}</span>
                    </div>
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Booking help */}
      <section className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            ¿Querés ayuda para armar tu itinerario?
          </h2>
          <p className="mt-4 text-base leading-8 text-white/70">
            Consultá disponibilidad y precios de las excursiones directamente en la
            recepción del hotel o por WhatsApp. Reservá tu habitación y nosotros te
            ayudamos con el resto.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-[#1f2b27] shadow transition hover:bg-[#edf2ef]"
              href={BOOKING_HREF}
            >
              Reservar tu estadía
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              href={HOTEL.whatsappHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              <WhatsAppIcon size={16} />
              Escribinos por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
