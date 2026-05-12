import Link from "next/link";
import { BookingPriceObserver } from "@/components/BookingPriceObserver";
import { CloudbedsBookingEmbed } from "@/components/CloudbedsBookingEmbed";
import { ExchangeRateNotice } from "@/components/ExchangeRateNotice";

export default function ReservasPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="text-base font-semibold tracking-tight">
          Los Lagos Hotel
        </Link>
        <Link className="text-sm font-medium text-accent" href="/">
          Volver al inicio
        </Link>
      </header>

      <section className="mx-auto w-full max-w-6xl px-5 pb-8 pt-6 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Reservas
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
              Consulta disponibilidad, habitaciones y condiciones en el motor
              oficial de Cloudbeds.
            </p>
          </div>
          <ExchangeRateNotice arsPerUsd={1200} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
        <div className="booking-surface overflow-hidden rounded-[1.75rem] border border-border bg-surface-strong shadow-sm">
          <BookingPriceObserver />
          <CloudbedsBookingEmbed />
        </div>
      </section>
    </main>
  );
}
