import Image from "next/image";
import Link from "next/link";
import { BookingLoader } from "@/components/BookingLoader";
import { BookingPriceObserver } from "@/components/BookingPriceObserver";
import { CloudbedsScriptLoader } from "@/components/CloudbedsScriptLoader";
import { publicConfig } from "@/lib/config";
import logoImage from "../../../assets/old-web-images/logo-sin-fondo-270.png";

export default function ReservasPage() {
  return (
    <main className="reservation-page bg-white text-[#1f2b27]">
      <CloudbedsScriptLoader />
      <BookingPriceObserver />
      <BookingLoader
        waitForRemoval='[data-testid="main-layout-loader"]'
        selector='cb-immersive-experience [data-testid="landing-search-panel-date-picker-checkin-input"]'
      />

      <header
        className="reservation-shell-header sticky top-0 z-50 border-b border-[#e4e8e6] bg-white"
        data-testid="reservation-wrapper-header"
      >
        <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link className="flex items-center gap-3" href="/">
            <Image
              alt="Los Lagos Hotel"
              className="h-11 w-11 rounded-full bg-white object-contain p-1 ring-1 ring-[#e4e8e6]"
              height={44}
              priority
              src={logoImage}
              width={44}
            />
            <span className="text-base font-semibold tracking-wide">
              Los Lagos Hotel
            </span>
          </Link>
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
