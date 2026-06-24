import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/PageHero";
import { RoomsSection } from "@/components/RoomsSection";
import { FEATURES, ROOMS } from "@/lib/rooms";
import { BOOKING_HREF } from "@/lib/nav";
import { buildPageMetadata } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale as Locale, "/habitaciones", "rooms");
}

export default async function HabitacionesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("rooms");
  const tc = await getTranslations("common");

  return (
    <main className="bg-[#f7f3ea] text-[#1f2b27]">
      <PageHero
        eyebrow={t("page.hero.eyebrow")}
        title={t("page.hero.title")}
        subtitle={t("page.hero.subtitle")}
        image={ROOMS[2].photos[0]}
      />

      {/* Room selector */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="reveal max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
              {t("page.selector.eyebrow")}
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
              {t("page.selector.title")}
            </h2>
            <p className="mt-4 text-base leading-8 text-[#5f6e69]">
              {t("page.selector.description")}
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
            {t("page.included.eyebrow")}
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
            {FEATURES.map(({ icon: Icon, key }) => (
              <li key={key} className="flex items-center gap-2 text-sm font-medium text-[#34423e]">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf3ef] text-[#38645b]">
                  <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                </span>
                {t(`features.${key}`)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1f2b27] px-5 py-20 text-white sm:px-8">
        <div className="reveal mx-auto flex max-w-7xl flex-col items-center gap-6 text-center">
          <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">
            {t("page.cta.title")}
          </h2>
          <p className="max-w-xl text-base leading-8 text-white/70">
            {t("page.cta.description")}
          </p>
          <Link
            className="inline-flex items-center gap-2 rounded-lg btn-book px-6 py-3.5 text-sm font-semibold shadow transition"
            href={BOOKING_HREF}
          >
            {tc("actions.searchDates")}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
