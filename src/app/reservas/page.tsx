import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArgentinaVatToggle } from "@/components/ArgentinaVatToggle";
import { BookingLoader } from "@/components/BookingLoader";
import { BookingPriceObserver } from "@/components/BookingPriceObserver";
import { CloudbedsScriptLoader } from "@/components/CloudbedsScriptLoader";
import { publicConfig } from "@/lib/config";
import logoImage from "../../../assets/old-web-images/logo-sin-fondo-270.png";

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // The booking engine is meant to be reached through the home date-picker,
  // which forwards the chosen dates/guests as query params. Opening /reservas
  // directly (no params) drops people on an empty engine, so send them back to
  // the picker.
  const params = await searchParams;
  if (Object.keys(params).length === 0) {
    redirect("/#reservar");
  }

  return (
    <main className="reservation-page bg-[#F6F5F5] text-[#1f2b27]">
      <CloudbedsScriptLoader />
      <BookingPriceObserver />
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
              alt="Los Lagos Hotel"
              className="h-14 w-14 rounded-full bg-white object-contain p-1 ring-1 ring-[#e4e8e6]"
              height={56}
              priority
              src={logoImage}
              width={56}
            />
            <span className="hidden text-base font-semibold tracking-wide text-[#1f2b27] sm:inline">
              Los Lagos Hotel
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
          lang="es"
          mode="standard"
          property-code={publicConfig.propertyCode}
          style={{ display: "block", minHeight: "calc(100vh - 72px)" }}
        />
      </section>
    </main>
  );
}
