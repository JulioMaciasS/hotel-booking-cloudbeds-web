import {
  ArrowRight,
  BadgePercent,
  Coffee,
  ExternalLink,
  Handshake,
  Headphones,
  MapPin,
  Mountain,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReviewsSlider } from "@/components/ReviewsSlider";
import { HotelMapWrapper } from "@/components/HotelMapWrapper";
import { ScrollCenterHandler } from "@/components/ScrollCenterHandler";
import { BookingLoader } from "@/components/BookingLoader";
import { BookingPriceObserver } from "@/components/BookingPriceObserver";
import { CloudbedsScriptLoader } from "@/components/CloudbedsScriptLoader";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { publicConfig } from "@/lib/config";
import { HOTEL, reviews, trips } from "@/lib/site-data";
import { ROOMS } from "@/lib/rooms";
import tripadvisorLogo from "../../../assets/logo/tripadvisor.png";
import googleMapsLogo from "../../../assets/logo/Google_Maps_icon_(2020).png";
import lobbyImage from "../../../assets/updated images/otros/recepcion 6 completa.jpg";

const benefits = [
  {
    icon: BadgePercent,
    title: "Mejor tarifa",
    text: "El precio más bajo lo encontrás siempre acá, sin comisiones de terceros.",
  },
  {
    icon: Handshake,
    title: "Sin intermediarios",
    text: "Tratás directo con el hotel, sin recargos ni cargos ocultos.",
  },
  {
    icon: Headphones,
    title: "Atención 24 hs",
    text: "Recepción y soporte todos los días del año para ayudarte con todo.",
  },
  {
    icon: ShieldCheck,
    title: "Pago seguro",
    text: "Procesamos tu reserva de forma segura y con confirmación inmediata.",
  },
];

export default function HomePage() {
  return (
    <main className="hotel-home bg-[#f7f3ea] text-[#1f2b27]">
      <ScrollCenterHandler />
      <CloudbedsScriptLoader />
      <BookingPriceObserver />
      <BookingLoader
        coverNav
        selector='cb-property-date-picker [data-testid="property-date-picker-date-picker-checkin-input"]'
      />

      {/* ── HERO ── */}
      <section className="relative min-h-[82svh] overflow-hidden bg-[#1f2b27] text-white">
        <HeroSlideshow />
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/15 to-black/55" style={{ zIndex: 2 }} />
        <div className="absolute inset-0 bg-linear-to-r from-black/35 via-black/10 to-transparent" style={{ zIndex: 2 }} />

        <div
          className="relative mx-auto flex min-h-[82svh] w-full max-w-7xl items-center px-5 pb-28 pt-22 sm:px-8 lg:pb-36"
          id="inicio"
          style={{ zIndex: 3 }}
        >
          <div className="max-w-3xl [text-shadow:0_1px_18px_rgba(0,0,0,0.55)]">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-white/60">
              Hotel · El Calafate, Patagonia
            </p>
            <h1 className="text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
              Los Lagos Hotel
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85 sm:text-xl">
              Hotel familiar en el corazón de El Calafate, a tan solo 3 minutos
              andando del centro. Tu punto de partida hacia los glaciares, lagos
              y senderos de la Patagonia austral.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-white/90">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-4 py-2 backdrop-blur">
                <MapPin size={14} /> El Calafate · Patagonia
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-4 py-2 backdrop-blur">
                <Coffee size={14} /> Desayuno incluido
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-4 py-2 backdrop-blur">
                Reserva directa
              </span>
            </div>

            {/* Prueba social */}
            <div className="mt-8 flex items-center gap-2 text-sm text-white/85">
              <div className="flex gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    aria-hidden="true"
                    fill={i <= 4 ? "currentColor" : "none"}
                    size={15}
                    strokeWidth={i <= 4 ? 0 : 1.5}
                  />
                ))}
              </div>
              <span>
                <strong className="font-semibold text-white">4.3</strong> · +400
                opiniones verificadas
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOOKING WIDGET ── */}
      <section className="relative z-20 flow-root bg-white px-5 sm:px-8" id="reservar">
        <div className="relative -mt-20 mx-auto max-w-5xl">
          <cb-property-date-picker
            button-label="Buscar disponibilidad"
            currency={publicConfig.baseCurrency}
            custom-url="/reservas"
            data-testid="cloudbeds-date-picker"
            lang="es"
            layout="horizontal"
            open-in-new-tab="false"
            property-code={publicConfig.propertyCode}
          />
          <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm font-medium text-[#38645b]">
            <BadgePercent size={16} aria-hidden="true" className="shrink-0" />
            Reservá directo en este sitio y conseguí siempre la mejor tarifa, sin
            intermediarios ni comisiones.
          </p>
        </div>
      </section>

      {/* ── ABOUT TEASER ── */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
              El Calafate, Patagonia Austral
            </p>
            <h2 className="max-w-2xl text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
              Una base tranquila para conocer la Patagonia austral.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#5f6e69]">
              Somos un pequeño hotel familiar de excepcional ubicación, a tan solo
              3 minutos andando del centro de la ciudad, bares, restaurantes y
              agencias de viajes. Un alojamiento que combina sencillez, calidez,
              confort y servicio personalizado integral.
            </p>
            <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-4">
              <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
                <dt className="text-sm text-[#66736f]">Check-in</dt>
                <dd className="mt-1 text-xl font-semibold">{HOTEL.checkIn}</dd>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
                <dt className="text-sm text-[#66736f]">Check-out</dt>
                <dd className="mt-1 text-xl font-semibold">{HOTEL.checkOut}</dd>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
                <dt className="text-sm text-[#66736f]">Habitaciones</dt>
                <dd className="mt-1 text-xl font-semibold">{HOTEL.rooms}</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-lg bg-[#38645b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2e5049]"
                href="/hotel"
              >
                Conocé el hotel
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-lg border border-[#c8d4ce] bg-white px-5 py-3 text-sm font-semibold text-[#1f2b27] transition hover:bg-[#f0f4f2]"
                href="/contacto"
              >
                Contactar
              </Link>
            </div>
          </div>
          <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-[#d8ddd8] shadow-xl">
            <Image
              alt="Interior de Los Lagos Hotel"
              className="object-cover"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              src={lobbyImage}
            />
          </div>
        </div>
      </section>

      {/* ── ROOMS TEASER ── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
                Habitaciones
              </p>
              <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
                Doble o triple, estándar o superior.
              </h2>
              <p className="mt-4 text-base leading-8 text-[#5f6e69]">
                4 tipos de habitación con calefacción, Wi-Fi, TV y desayuno
                incluido. Elegí la que mejor se adapte a tu viaje.
              </p>
            </div>
            <Link
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#38645b] transition hover:text-[#2e5049]"
              href="/habitaciones"
            >
              Ver todas las habitaciones
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ROOMS.map((room) => (
              <Link
                key={room.name}
                href="/habitaciones"
                className="group flex flex-col overflow-hidden rounded-2xl bg-[#f7f3ea] ring-1 ring-black/5 transition hover:shadow-lg"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image
                    alt={room.name}
                    className="object-cover transition duration-500 group-hover:scale-105"
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    src={room.photos[0]}
                  />
                  <span
                    className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
                      room.tier === "Superior"
                        ? "bg-[#38645b] text-white"
                        : "bg-white/90 text-[#38645b]"
                    }`}
                  >
                    {room.tier}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-semibold text-[#1f2b27]">{room.name}</h3>
                  <span className="mt-1 flex items-center gap-1 text-xs text-[#66736f]">
                    <Users aria-hidden size={13} />
                    {room.guests} huéspedes
                  </span>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#38645b]">
                    Ver detalle
                    <ArrowRight size={14} aria-hidden="true" className="transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXPERIENCES TEASER ── */}
      <section className="bg-[#1f2b27] py-24 text-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#6dbfaa]">
                Experiencias
              </p>
              <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
                El glaciar Perito Moreno, a tu alcance.
              </h2>
              <p className="mt-4 text-base leading-8 text-white/70">
                Somos tu campamento base en El Calafate. El hotel organiza
                traslados y te ayuda a planificar cada excursión por la Patagonia.
              </p>
            </div>
            <Link
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#6dbfaa] transition hover:text-white"
              href="/experiencias"
            >
              Ver todas las experiencias
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.slice(0, 3).map((trip) => (
              <Link
                key={trip.name}
                href="/experiencias"
                className="group flex flex-col overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image
                    alt={trip.name}
                    className="object-cover transition duration-500 group-hover:scale-105"
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    src={trip.image}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-[#38645b] px-3 py-1 text-xs font-semibold text-white">
                    {trip.highlight}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-semibold text-white">{trip.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">{trip.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY BOOK DIRECT ── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
              Reservá directo
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
              Las mejores condiciones, siempre en este sitio.
            </h2>
            <p className="mt-4 text-base leading-8 text-[#5f6e69]">
              Reservar directamente con nosotros te da ventajas que ningún
              intermediario puede igualar.
            </p>
          </div>

          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex flex-col items-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf3ef] text-[#38645b]">
                  <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <p className="mt-4 text-base font-semibold text-[#1f2b27]">{title}</p>
                <p className="mt-1.5 text-sm leading-6 text-[#66736f]">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="bg-white py-24" id="opiniones">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
                Opiniones verificadas
              </p>
              <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
                Lo que dicen nuestros huéspedes.
              </h2>
            </div>
            {/* Platform badges */}
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:flex lg:w-auto lg:shrink-0">
              {/* TripAdvisor */}
              <a
                className="relative flex items-center gap-3 rounded-xl border border-[#00aa6c]/30 bg-[#00aa6c]/5 px-4 py-3 pr-9"
                href={HOTEL.tripadvisorUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Image src={tripadvisorLogo} alt="TripAdvisor" width={28} height={28} className="object-contain" />
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-[#1f2b27]">4.1</span>
                    <div className="flex gap-0.5 text-[#00aa6c]">
                      {[1, 2, 3, 4].map((i) => (
                        <Star key={i} aria-hidden="true" fill="currentColor" size={13} strokeWidth={0} />
                      ))}
                      <Star aria-hidden="true" fill="none" size={13} strokeWidth={1.5} />
                    </div>
                  </div>
                  <p className="text-xs text-[#5f6e69]">27 opiniones · TripAdvisor</p>
                </div>
                <ExternalLink aria-hidden="true" className="absolute bottom-2.5 right-2.5 text-[#5f6e69]" size={14} />
              </a>
              {/* Google Maps */}
              <a
                className="relative flex items-center gap-3 rounded-xl border border-[#4285F4]/30 bg-[#4285F4]/5 px-4 py-3 pr-9"
                href={HOTEL.googleMapsUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Image
                  src={googleMapsLogo}
                  alt="Google Maps"
                  width={20}
                  height={28}
                  className="object-contain"
                  style={{ width: "auto", height: "auto" }}
                />
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-[#1f2b27]">4.3</span>
                    <div className="flex gap-0.5 text-[#FBBC05]">
                      {[1, 2, 3, 4].map((i) => (
                        <Star key={i} aria-hidden="true" fill="currentColor" size={13} strokeWidth={0} />
                      ))}
                      <Star aria-hidden="true" fill="none" size={13} strokeWidth={1.5} />
                    </div>
                  </div>
                  <p className="text-xs text-[#5f6e69]">107 opiniones · Google</p>
                </div>
                <ExternalLink aria-hidden="true" className="absolute bottom-2.5 right-2.5 text-[#5f6e69]" size={14} />
              </a>
              {/* Booking.com */}
              <a
                className="relative flex items-center gap-3 rounded-xl border border-[#003580]/20 bg-[#003580]/5 px-4 py-3 pr-9"
                href={HOTEL.bookingUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span
                  aria-label="Booking.com"
                  className="flex h-7 items-center rounded px-2 text-xs font-bold tracking-tight text-white"
                  style={{ background: "#003580" }}
                >
                  booking
                </span>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-[#1f2b27]">8.5</span>
                    <div className="flex gap-0.5 text-[#003580]">
                      {[1, 2, 3, 4].map((i) => (
                        <Star key={i} aria-hidden="true" fill="currentColor" size={13} strokeWidth={0} />
                      ))}
                      <Star aria-hidden="true" fill="none" size={13} strokeWidth={1.5} />
                    </div>
                  </div>
                  <p className="text-xs text-[#5f6e69]">295 opiniones · Booking</p>
                </div>
                <ExternalLink aria-hidden="true" className="absolute bottom-2.5 right-2.5 text-[#5f6e69]" size={14} />
              </a>
            </div>
          </div>

          <ReviewsSlider reviews={reviews} />
        </div>
      </section>

      {/* ── LOCATION TEASER ── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
              <HotelMapWrapper />
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
                Cómo llegar
              </p>
              <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
                En el corazón de El Calafate.
              </h2>
              <p className="mt-4 text-base leading-8 text-[#5f6e69]">
                A solo 3 minutos a pie de la Av. del Libertador y a pasos del Lago
                Argentino. El punto de partida perfecto hacia el Glaciar Perito
                Moreno y toda la Patagonia austral.
              </p>
              <div className="mt-6 rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#38645b]">
                  <MapPin size={15} aria-hidden="true" />
                  Dirección
                </h3>
                <p className="mt-2 text-base font-medium text-[#1f2b27]">{HOTEL.street}</p>
                <p className="text-sm text-[#5f6e69]">{HOTEL.cityLine}</p>
              </div>
              <Link
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#38645b] transition hover:text-[#2e5049]"
                href="/ubicacion"
              >
                Ver distancias y cómo llegar
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-[#1f2b27] px-5 py-20 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center">
          <Mountain aria-hidden="true" size={32} className="text-[#6dbfaa]" />
          <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">
            ¿Listo para explorar la Patagonia?
          </h2>
          <p className="max-w-xl text-base leading-8 text-white/70">
            Reservá directamente con nosotros y asegurate la mejor tarifa disponible,
            con desayuno incluido y atención personalizada.
          </p>
          <a
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-[#1f2b27] shadow transition hover:bg-[#edf2ef]"
            href="#reservar"
          >
            Buscar fechas disponibles
          </a>
        </div>
      </section>
    </main>
  );
}
