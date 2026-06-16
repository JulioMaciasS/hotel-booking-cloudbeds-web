import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowRight, Bus, Clock, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/PageHero";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { HOTEL, trips } from "@/lib/site-data";
import { BOOKING_HREF } from "@/lib/nav";
import { buildPageMetadata } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale as Locale, "/experiencias", "experiences");
}

export default async function ExperienciasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("experiences");

  return (
    <main className="bg-[#1f2b27] text-white">
      <PageHero
        eyebrow={t("page.hero.eyebrow")}
        title={t("page.hero.title")}
        subtitle={t("page.hero.subtitle")}
        image={trips[0].image}
      />

      {/* Intro */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#6dbfaa]">
                {t("page.intro.eyebrow")}
              </p>
              <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
                {t("page.intro.title")}
              </h2>
              <p className="mt-4 text-base leading-8 text-white/70">
                {t("page.intro.description")}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur shrink-0">
              <Bus size={18} aria-hidden="true" />
              <span>{t("page.intro.transfersBadge")}</span>
            </div>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trips.map((trip) => (
              <article
                key={trip.key}
                className="group flex flex-col overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image
                    alt={t(`trips.${trip.key}.name`)}
                    className="object-cover transition duration-500 group-hover:scale-105"
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    src={trip.image}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-[#38645b] px-3 py-1 text-xs font-semibold text-white">
                    {t(`trips.${trip.key}.highlight`)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-semibold text-white">
                    {t(`trips.${trip.key}.name`)}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-white/65">
                    {t(`trips.${trip.key}.description`)}
                  </p>
                  <dl className="mt-4 flex flex-wrap gap-3 border-t border-white/10 pt-4 text-xs text-white/55">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} aria-hidden="true" />
                      <span>{t(`trips.${trip.key}.duration`)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} aria-hidden="true" />
                      <span>{t(`trips.${trip.key}.distance`)}</span>
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
            {t("page.help.title")}
          </h2>
          <p className="mt-4 text-base leading-8 text-white/70">
            {t("page.help.description")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-[#1f2b27] shadow transition hover:bg-[#edf2ef]"
              href={BOOKING_HREF}
            >
              {t("page.help.bookCta")}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              href={HOTEL.whatsappHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              <WhatsAppIcon size={16} />
              {t("page.help.whatsappCta")}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
