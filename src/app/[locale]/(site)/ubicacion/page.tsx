import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, ExternalLink, MapPin, Mountain, Plane } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { LocationGallery } from "@/components/LocationGallery";
import { HotelMapWrapper } from "@/components/HotelMapWrapper";
import { HOTEL, distances } from "@/lib/site-data";
import { BOOKING_HREF } from "@/lib/nav";
import { buildPageMetadata } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import locationImage from "@assets/updated images/otros/exterior del lateral del hotel con cartel en el centro.jpg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale as Locale, "/ubicacion", "location");
}

export default async function UbicacionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("location");
  const distanceLabels = t.raw("distances") as { label: string; modeLabel: string }[];

  return (
    <main className="bg-[#f7f3ea] text-[#1f2b27]">
      <PageHero
        eyebrow={t("page.hero.eyebrow")}
        title={t("page.hero.title")}
        subtitle={t("page.hero.subtitle")}
        image={locationImage}
        imagePosition="center 55%"
      />

      <section className="pt-16 sm:pt-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Map */}
            <div className="h-full min-h-[30rem] overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
              <HotelMapWrapper className="h-full min-h-[30rem]" />
            </div>

            {/* Info panel */}
            <div className="reveal flex flex-col gap-6">
              {/* Address */}
              <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#38645b]">
                  <MapPin size={15} aria-hidden="true" />
                  {t("page.address.heading")}
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
                  {t("page.address.openInMaps")}
                </a>
              </div>

              {/* Distances */}
              <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#38645b]">
                  <Mountain size={15} aria-hidden="true" />
                  {t("page.distancesHeading")}
                </h2>
                <ul className="space-y-3">
                  {distances.map(({ value, time, modeIcon: ModeIcon, icon: Icon }, i) => {
                    const { label, modeLabel } = distanceLabels[i];
                    return (
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
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          {/* Getting here / transfers — full width below the map */}
          <div className="reveal mt-8 rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-7">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#38645b]">
              <Plane size={16} aria-hidden="true" />
              {t("page.gettingHere.heading")}
            </h2>
            <div className="mt-4 grid gap-x-8 gap-y-3 text-sm leading-6 text-[#5f6e69] sm:grid-cols-2">
              <p>
                <span className="font-medium text-[#1f2b27]">
                  {t("page.gettingHere.airport.title")}
                </span>{" "}
                — {t("page.gettingHere.airport.text")}
              </p>
              <p>
                <span className="font-medium text-[#1f2b27]">
                  {t("page.gettingHere.bus.title")}
                </span>{" "}
                — {t("page.gettingHere.bus.text")}
              </p>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#8fa09a]">
              {t("page.gettingHere.note")}
            </p>
          </div>
        </div>
      </section>

      {/* Gallery — a look around the property */}
      <LocationGallery />

      {/* Book / Contact */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-lg btn-book px-5 py-3 text-sm font-semibold transition"
              href={BOOKING_HREF}
            >
              {t("page.cta.book")}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-lg border border-[#c8d4ce] bg-white px-5 py-3 text-sm font-semibold text-[#1f2b27] transition hover:bg-[#f0f4f2]"
              href="/contacto"
            >
              {t("page.cta.contact")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
