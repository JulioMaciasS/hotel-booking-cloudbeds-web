import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="text-base font-semibold tracking-tight">
          Los Lagos Hotel
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-5 text-sm">
          <a className="text-muted hover:text-foreground" href="#habitaciones">
            Habitaciones
          </a>
          <Link
            className="rounded-full bg-accent px-4 py-2 font-medium text-white transition hover:bg-accent-strong"
            href="/reservas"
          >
            Reservar
          </Link>
        </nav>
      </header>

      <section className="mx-auto w-full max-w-6xl px-5 pb-12 sm:px-8">
        <div className="hero-landscape flex min-h-[72vh] items-end overflow-hidden rounded-[2rem]">
          <div className="max-w-2xl px-6 py-10 text-white sm:px-10 sm:py-14">
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Reservas directas en El Calafate
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-lg leading-8 text-white/90">
              Hospedate en el centro de El Calafate con acceso simple a la
              experiencia de reservas de Cloudbeds y precios visibles en USD.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-foreground transition hover:bg-sky-soft"
                href="/reservas"
              >
                Ver disponibilidad
              </Link>
              <a
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/45 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
                href="#hotel"
              >
                Conocer el hotel
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_0.8fr]"
        id="hotel"
      >
        <div>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Una base tranquila para explorar glaciares, lagos y senderos.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            Los Lagos Hotel acompana viajes de descanso y aventura en Santa
            Cruz. Este sitio integra la reserva directa con Cloudbeds para que
            puedas consultar disponibilidad sin salir de la web del hotel.
          </p>
        </div>
        <div className="grid gap-3 rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-sm text-muted">Ubicacion</span>
            <strong className="text-sm">El Calafate, Argentina</strong>
          </div>
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-sm text-muted">Check-in</span>
            <strong className="text-sm">14:00</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Check-out</span>
            <strong className="text-sm">12:00</strong>
          </div>
        </div>
      </section>

      <section
        className="border-y border-border bg-surface-strong"
        id="habitaciones"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-14 sm:px-8 lg:grid-cols-3">
          {["Doble Estandar", "Triple Estandar", "Doble Superior"].map(
            (room) => (
              <article
                className="rounded-2xl border border-border bg-surface p-6"
                key={room}
              >
                <h3 className="text-xl font-semibold tracking-tight">{room}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Consulta fechas, disponibilidad y condiciones finales desde el
                  motor de reservas oficial.
                </p>
              </article>
            ),
          )}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-5 px-5 py-14 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Reserva directa con confirmacion segura.
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            El proceso de reserva y pago se completa dentro de Cloudbeds.
          </p>
        </div>
        <Link
          className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white transition hover:bg-accent-strong"
          href="/reservas"
        >
          Ir a reservas
        </Link>
      </section>
    </main>
  );
}
