import { Suspense } from "react";
import {
  ArrowRight,
  BadgePercent,
  Coffee,
  ExternalLink,
  Handshake,
  MapPin,
  Mountain,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ReviewsSlider } from "@/components/ReviewsSlider";
import { HotelMapWrapper } from "@/components/HotelMapWrapper";
import { SectionDivider } from "@/components/SectionDivider";
import { ScrollCenterHandler } from "@/components/ScrollCenterHandler";
import { BookingLoader } from "@/components/BookingLoader";
import { BookingPriceObserver } from "@/components/BookingPriceObserver";
import { CloudbedsScriptLoader } from "@/components/CloudbedsScriptLoader";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { BookingIntentHandler } from "@/components/BookingIntentHandler";
import { JsonLd } from "@/components/JsonLd";
import { lodgingBusinessJsonLd } from "@/lib/structured-data";
import { publicConfig } from "@/lib/config";
import { HOTEL, reviews } from "@/lib/site-data";
import { ROOMS } from "@/lib/rooms";
import tripadvisorLogo from "@assets/logo/tripadvisor.png";
import googleMapsLogo from "@assets/logo/Google_Maps_icon_(2020).png";
import lobbyImage from "@assets/updated images/otros/recepcion 6 completa.jpg";

const benefits = [
  { icon: BadgePercent, key: "bestRate" },
  { icon: Coffee, key: "breakfast" },
  // Hidden until the excursions offering launches:
  // { icon: Compass, key: "excursions" },
  { icon: Handshake, key: "personalCare" },
] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const trm = await getTranslations("rooms");

  return (
    <main className="hotel-home bg-[#f7f3ea] text-[#1f2b27]">
      <JsonLd data={lodgingBusinessJsonLd()} />
      <Suspense fallback={null}>
        <BookingIntentHandler />
      </Suspense>
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
              {t("hero.eyebrow")}
            </p>
            <h1 className="text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
              {t("hero.title")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85 sm:text-xl">
              {t("hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-white/90">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-4 py-2 backdrop-blur">
                <MapPin size={14} /> {t("hero.badgeLocation")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-4 py-2 backdrop-blur">
                <Coffee size={14} /> {t("hero.badgeBreakfast")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-4 py-2 backdrop-blur">
                {t("hero.badgeDirect")}
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
                {t.rich("hero.socialProof", {
                  strong: (chunks) => (
                    <strong className="font-semibold text-white">{chunks}</strong>
                  ),
                })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOOKING WIDGET ── */}
      <section className="relative z-20 flow-root bg-white px-5 sm:px-8" id="reservar">
        <div className="relative -mt-20 mx-auto max-w-5xl">
          <cb-property-date-picker
            button-label={t("booking.buttonLabel")}
            currency={publicConfig.baseCurrency}
            custom-url="/reservas"
            data-testid="cloudbeds-date-picker"
            island={publicConfig.cloudbedsIsland}
            lang={locale}
            layout="horizontal"
            open-in-new-tab="false"
            property-code={publicConfig.propertyCode}
          />
          <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm font-medium text-[#38645b]">
            <BadgePercent size={16} aria-hidden="true" className="shrink-0" />
            {t("booking.helper")}
          </p>
        </div>
      </section>

      {/* ── ABOUT TEASER ── */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div className="reveal">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
              {t("about.eyebrow")}
            </p>
            <h2 className="max-w-2xl text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
              {t("about.title")}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#5f6e69]">
              {t("about.paragraph")}
            </p>
            <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-4">
              <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
                <dt className="text-sm text-[#66736f]">{t("about.checkIn")}</dt>
                <dd className="mt-1 text-xl font-semibold">{HOTEL.checkIn}</dd>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
                <dt className="text-sm text-[#66736f]">{t("about.checkOut")}</dt>
                <dd className="mt-1 text-xl font-semibold">{HOTEL.checkOut}</dd>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
                <dt className="text-sm text-[#66736f]">{t("about.rooms")}</dt>
                <dd className="mt-1 text-xl font-semibold">{HOTEL.rooms}</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-lg bg-[#38645b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2e5049]"
                href="/hotel"
              >
                {t("about.knowHotel")}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-lg border border-[#c8d4ce] bg-white px-5 py-3 text-sm font-semibold text-[#1f2b27] transition hover:bg-[#f0f4f2]"
                href="/contacto"
              >
                {t("about.contact")}
              </Link>
            </div>
          </div>
          <div className="reveal relative aspect-4/3 overflow-hidden rounded-lg bg-[#d8ddd8] shadow-xl">
            <Image
              alt={t("about.imageAlt")}
              className="object-cover"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              src={lobbyImage}
            />
          </div>
        </div>
      </section>

      <SectionDivider topColor="#ffffff" bottomColor="#f7f3ea" variant="hill" />

      {/* ── ROOMS TEASER ── */}
      <section className="bg-[#f7f3ea] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="reveal flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
                {t("rooms.eyebrow")}
              </p>
              <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
                {t("rooms.title")}
              </h2>
              <p className="mt-4 text-base leading-8 text-[#5f6e69]">
                {t("rooms.paragraph")}
              </p>
            </div>
            <Link
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#38645b] transition hover:text-[#2e5049]"
              href="/habitaciones"
            >
              {t("rooms.viewAll")}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="reveal mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ROOMS.map((room) => (
              <Link
                key={room.key}
                href={`/habitaciones?room=${room.key}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image
                    alt={trm(`items.${room.key}.name`)}
                    className="object-cover transition duration-500 group-hover:scale-105"
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    src={room.photos[0]}
                  />
                  <span
                    className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
                      room.tier === "superior"
                        ? "bg-[#38645b] text-white"
                        : "bg-white/90 text-[#38645b]"
                    }`}
                  >
                    {trm(`tiers.${room.tier}`)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-semibold text-[#1f2b27]">
                    {trm(`items.${room.key}.name`)}
                  </h3>
                  <span className="mt-1 flex items-center gap-1 text-xs text-[#66736f]">
                    <Users aria-hidden size={13} />
                    {trm("guests", { count: room.guests })}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#38645b]">
                    {t("rooms.viewDetail")}
                    <ArrowRight size={14} aria-hidden="true" className="transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Experiences teaser hidden until the excursions offering launches
          (the section + /experiencias page are preserved in git history). */}

      <SectionDivider topColor="#f7f3ea" bottomColor="#ffffff" variant="wave" />

      {/* ── WHY BOOK DIRECT ── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="reveal mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
              {t("whyDirect.eyebrow")}
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
              {t("whyDirect.title")}
            </h2>
            <p className="mt-4 text-base leading-8 text-[#5f6e69]">
              {t("whyDirect.paragraph")}
            </p>
          </div>

          <ul className="reveal mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon: Icon, key }) => (
              <li key={key} className="flex flex-col items-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf3ef] text-[#38645b]">
                  <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <p className="mt-4 text-base font-semibold text-[#1f2b27]">
                  {t(`benefits.${key}.title`)}
                </p>
                <p className="mt-1.5 text-sm leading-6 text-[#66736f]">
                  {t(`benefits.${key}.text`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SectionDivider topColor="#ffffff" bottomColor="#f7f3ea" variant="valley" />

      {/* ── REVIEWS ── */}
      <section className="bg-[#f7f3ea] py-24" id="opiniones">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="reveal flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
                {t("reviews.eyebrow")}
              </p>
              <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
                {t("reviews.title")}
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
                  <p className="text-xs text-[#5f6e69]">{t("reviews.tripadvisorCount", { count: 27 })}</p>
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
                  className="h-7 w-auto object-contain"
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
                  <p className="text-xs text-[#5f6e69]">{t("reviews.googleCount", { count: 107 })}</p>
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
                  <p className="text-xs text-[#5f6e69]">{t("reviews.bookingCount", { count: 295 })}</p>
                </div>
                <ExternalLink aria-hidden="true" className="absolute bottom-2.5 right-2.5 text-[#5f6e69]" size={14} />
              </a>
            </div>
          </div>

          <ReviewsSlider reviews={reviews} />
        </div>
      </section>

      <SectionDivider topColor="#f7f3ea" bottomColor="#ffffff" variant="hill" />

      {/* ── LOCATION TEASER ── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
              <HotelMapWrapper />
            </div>
            <div className="reveal">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
                {t("location.eyebrow")}
              </p>
              <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
                {t("location.title")}
              </h2>
              <p className="mt-4 text-base leading-8 text-[#5f6e69]">
                {t("location.paragraph")}
              </p>
              <div className="mt-6 rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#38645b]">
                  <MapPin size={15} aria-hidden="true" />
                  {t("location.addressLabel")}
                </h3>
                <p className="mt-2 text-base font-medium text-[#1f2b27]">{HOTEL.street}</p>
                <p className="text-sm text-[#5f6e69]">{HOTEL.cityLine}</p>
              </div>
              <Link
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#38645b] transition hover:text-[#2e5049]"
                href="/ubicacion"
              >
                {t("location.viewDistances")}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider topColor="#ffffff" bottomColor="#1f2b27" variant="wave" />

      {/* ── CTA BANNER ── */}
      <section className="bg-[#1f2b27] px-5 py-20 text-white sm:px-8">
        <div className="reveal mx-auto flex max-w-7xl flex-col items-center gap-6 text-center">
          <Mountain aria-hidden="true" size={32} className="text-[#6dbfaa]" />
          <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">
            {t("cta.title")}
          </h2>
          <p className="max-w-xl text-base leading-8 text-white/70">
            {t("cta.paragraph")}
          </p>
          <a
            className="inline-flex items-center gap-2 rounded-lg btn-book px-6 py-3.5 text-sm font-semibold shadow transition"
            href="#reservar"
          >
            {t("cta.button")}
          </a>
        </div>
      </section>
    </main>
  );
}
