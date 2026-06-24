import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/PageHero";
import { BOOKING_HREF } from "@/lib/nav";
import { buildPageMetadata } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import guideImage from "@assets/updated images/otros/fachada lateral hotel + jardin.jpg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale as Locale, "/que-hacer", "guide");
}

const itemKeys = [0, 1, 2, 3, 4, 5] as const;

export default async function QueHacerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guide");
  const distanceLabel = t("page.distanceLabel");

  return (
    <main className="bg-[#f7f3ea] text-[#1f2b27]">
      <PageHero
        eyebrow={t("page.hero.eyebrow")}
        title={t("page.hero.title")}
        subtitle={t("page.hero.subtitle")}
        image={guideImage}
        imagePosition="center 55%"
      />

      {/* Intro + attractions grid */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="reveal mx-auto max-w-3xl text-base leading-8 text-[#5f6e69]">
            {t("page.intro")}
          </p>

          <ul className="reveal mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {itemKeys.map((i) => (
              <li
                key={i}
                className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
              >
                <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-[#edf3ef] px-2.5 py-1 text-xs font-semibold text-[#38645b]">
                  <MapPin size={13} strokeWidth={2} aria-hidden="true" />
                  <span className="sr-only">{distanceLabel}: </span>
                  {t(`page.items.${i}.distance`)}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[#1f2b27]">
                  {t(`page.items.${i}.name`)}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#5f6e69]">
                  {t(`page.items.${i}.description`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Planning note + CTAs */}
      <section className="bg-white py-24">
        <div className="reveal mx-auto max-w-3xl px-5 sm:px-8">
          <div className="rounded-2xl bg-[#f7f3ea] p-8 ring-1 ring-black/5 sm:p-10">
            <h2 className="text-2xl font-semibold leading-tight text-[#1f2b27] sm:text-3xl">
              {t("page.planning.title")}
            </h2>
            <p className="mt-4 text-base leading-8 text-[#5f6e69]">
              {t("page.planning.text")}
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
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
