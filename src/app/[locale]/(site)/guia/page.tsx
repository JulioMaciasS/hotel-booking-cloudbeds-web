import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HotelMapWrapper } from "@/components/HotelMapWrapper";
import { OfflineGuide } from "@/components/OfflineGuide";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
};

export default async function GuiaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("location.map.guide");

  return (
    <main className="min-h-screen bg-[#f7f3ea] px-5 pb-16 pt-[117px] text-[#1f2b27] sm:px-8">
      <OfflineGuide />
      <section className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#38645b]">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#5f6e69]">
          {t("subtitle")}
        </p>

        <div className="mt-8 h-[calc(100dvh-15rem)] min-h-[32rem]">
          <HotelMapWrapper
            className="h-full min-h-[32rem]"
            defaultExpanded
            expandedDismissible={false}
          />
        </div>
      </section>
    </main>
  );
}
