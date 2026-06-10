import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/PageHero";
import { HOTEL, services } from "@/lib/site-data";
import { BOOKING_HREF } from "@/lib/nav";
import { getAlternates } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import facadeImage from "@assets/updated images/otros/fachada frente del hotel 2_ai_edited.png";
import galDesayuno from "@assets/updated images/otros/desayuno 2.jpg";
import galComedor from "@assets/updated images/otros/comedor 1.jpg";
import galJardin from "@assets/updated images/otros/jardin 3.jpg";
import galRecepcion from "@assets/updated images/otros/recepcion 1.jpg";
import galBiblioteca from "@assets/updated images/otros/biblioteca 1.jpg";
import galJardin2 from "@assets/updated images/otros/jardin 5.jpg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("hotel.title"),
    description: t("hotel.description"),
    alternates: getAlternates(locale as Locale, "/hotel"),
  };
}

const gallery = [
  { src: galDesayuno, key: "breakfast" },
  { src: galComedor, key: "diningRoom" },
  { src: galJardin, key: "garden" },
  { src: galRecepcion, key: "reception" },
  { src: galBiblioteca, key: "library" },
  { src: galJardin2, key: "outdoor" },
];

const faqKeys = [
  "schedule",
  "breakfast",
  "vat",
  "cancellation",
  "excursions",
  "parking",
  "directBooking",
];

export default async function HotelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("hotel");

  return (
    <main className="bg-[#f7f3ea] text-[#1f2b27]">
      <PageHero
        eyebrow={t("page.hero.eyebrow")}
        title={t("page.hero.title")}
        subtitle={t("page.hero.subtitle")}
        image={facadeImage}
        imagePosition="center 60%"
      />

      {/* Story + stats */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
            {t("page.story.eyebrow")}
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
            {t("page.story.title")}
          </h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-[#5f6e69]">
            <p>{t("page.story.paragraph1")}</p>
            <p>{t("page.story.paragraph2")}</p>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-white p-4 text-center shadow-sm ring-1 ring-black/5">
              <dt className="text-sm text-[#66736f]">{t("page.story.stats.checkIn")}</dt>
              <dd className="mt-1 text-xl font-semibold">{HOTEL.checkIn}</dd>
            </div>
            <div className="rounded-lg bg-white p-4 text-center shadow-sm ring-1 ring-black/5">
              <dt className="text-sm text-[#66736f]">{t("page.story.stats.checkOut")}</dt>
              <dd className="mt-1 text-xl font-semibold">{HOTEL.checkOut}</dd>
            </div>
            <div className="rounded-lg bg-white p-4 text-center shadow-sm ring-1 ring-black/5">
              <dt className="text-sm text-[#66736f]">{t("page.story.stats.rooms")}</dt>
              <dd className="mt-1 text-xl font-semibold">{HOTEL.rooms}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
              {t("page.gallery.eyebrow")}
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
              {t("page.gallery.title")}
            </h2>
            <p className="mt-4 text-base leading-8 text-[#5f6e69]">
              {t("page.gallery.intro")}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {gallery.map(({ src, key }) => (
              <div
                key={key}
                className="group relative aspect-4/3 overflow-hidden rounded-2xl ring-1 ring-black/5"
              >
                <Image
                  alt={t(`page.gallery.items.${key}.alt`)}
                  className="object-cover transition duration-500 group-hover:scale-105"
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  src={src}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute bottom-3 left-3 translate-y-1 text-sm font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {t(`page.gallery.items.${key}.caption`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
              {t("page.servicesSection.eyebrow")}
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
              {t("page.servicesSection.title")}
            </h2>
          </div>
          <ul className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ icon: Icon, key }) => (
              <li key={key} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf3ef] text-[#38645b]"
                >
                  <Icon size={17} strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1f2b27]">
                    {t(`services.${key}.name`)}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-[#66736f]">
                    {t(`services.${key}.description`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
              {t("page.faq.eyebrow")}
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
              {t("page.faq.title")}
            </h2>
          </div>

          <div className="mt-10 divide-y divide-black/5 rounded-2xl bg-[#f7f3ea] ring-1 ring-black/5">
            {faqKeys.map((key) => (
              <details key={key} className="group px-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-semibold text-[#1f2b27] [&::-webkit-details-marker]:hidden">
                  {t(`page.faq.items.${key}.q`)}
                  <ChevronDown
                    aria-hidden="true"
                    className="shrink-0 text-[#38645b] transition-transform duration-200 group-open:rotate-180"
                    size={18}
                  />
                </summary>
                <p className="pb-4 text-sm leading-7 text-[#5f6e69]">
                  {t(`page.faq.items.${key}.a`)}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-[#38645b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2e5049]"
              href={BOOKING_HREF}
            >
              {t("page.faq.ctaBook")}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-lg border border-[#c8d4ce] bg-white px-5 py-3 text-sm font-semibold text-[#1f2b27] transition hover:bg-[#f0f4f2]"
              href="/contacto"
            >
              {t("page.faq.ctaContact")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
