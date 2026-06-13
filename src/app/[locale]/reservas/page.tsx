import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArgentinaVatToggle } from "@/components/ArgentinaVatToggle";
import { BookingLoader } from "@/components/BookingLoader";
import { BookingPriceObserver } from "@/components/BookingPriceObserver";
import { CloudbedsScriptLoader } from "@/components/CloudbedsScriptLoader";
import { VatPreferencePrompt } from "@/components/VatPreferencePrompt";
import { Link, redirect } from "@/i18n/navigation";
import { publicConfig } from "@/lib/config";
import { getAlternates } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import logoImage from "@assets/old-web-images/logo-sin-fondo-270.png";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("metadata");

  return {
    title: t("reservas.title"),
    description: t("reservas.description"),
    alternates: getAlternates(locale as Locale, "/reservas"),
  };
}

export default async function ReservasPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("booking");

  // The booking engine is meant to be reached through the home date-picker,
  // which forwards the chosen dates/guests as query params. Opening /reservas
  // directly (no params) drops people on an empty engine, so send them back to
  // the picker.
  const search = await searchParams;
  if (Object.keys(search).length === 0) {
    redirect({ href: "/#reservar", locale });
  }

  return (
    <main className="reservation-page bg-[#F6F5F5] text-[#1f2b27]">
      <CloudbedsScriptLoader />
      <BookingPriceObserver />
      <VatPreferencePrompt />
      <BookingLoader
        waitForRemoval='[data-testid="main-layout-loader"]'
        selector='cb-immersive-experience [data-testid="landing-search-panel-date-picker-checkin-input"]'
      />

      <header
        className="reservation-shell-header sticky top-0 z-50 border-b border-black/[0.06] bg-white/72 backdrop-blur-xl"
        data-testid="reservation-wrapper-header"
      >
        <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between gap-3 px-5 sm:px-8">
          <Link className="flex items-center gap-3" href="/">
            <Image
              alt={t("page.logoAlt")}
              className="h-14 w-14 rounded-full bg-white object-contain p-1 ring-1 ring-[#e4e8e6]"
              height={56}
              priority
              src={logoImage}
              width={56}
            />
            <span className="hidden text-base font-semibold tracking-wide text-[#1f2b27] sm:inline">
              {t("page.brand")}
            </span>
          </Link>
          <ArgentinaVatToggle />
        </div>
      </header>

      <section className="cloudbeds-host reservation-embed-host" data-testid="cloudbeds-host" style={{ minHeight: "calc(100vh - 72px)" }}>
        <cb-immersive-experience
          currency={publicConfig.baseCurrency}
          data-testid="cloudbeds-standard-embed"
          hide-custom-footer="yes"
          hide-custom-header="yes"
          hide-property-info="yes"
          lang={locale}
          mode="standard"
          property-code={publicConfig.propertyCode}
          style={{ display: "block", minHeight: "calc(100vh - 72px)" }}
        />
      </section>
    </main>
  );
}
