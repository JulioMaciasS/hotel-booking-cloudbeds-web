import Image from "next/image";
import Link from "next/link";
import { BookingPriceObserver } from "@/components/BookingPriceObserver";
import { CloudbedsScriptLoader } from "@/components/CloudbedsScriptLoader";
import { publicConfig } from "@/lib/config";
import logoImage from "../../../assets/old-web-images/logo-sin-fondo-270.png";

export default function ReservasPage() {
  return (
    <main className="reservation-page bg-white text-[#1f2b27]">
      <CloudbedsScriptLoader />
      <BookingPriceObserver />

      <header
        className="reservation-shell-header sticky top-0 z-50 border-b border-[#e4e8e6] bg-white"
        data-testid="reservation-wrapper-header"
      >
        <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-5 sm:px-8">
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
          <nav className="hidden items-center gap-7 text-sm font-medium text-[#52615d] md:flex">
            <Link className="transition hover:text-[#1f2b27]" href="/#hotel">
              Hotel
            </Link>
            <Link
              className="transition hover:text-[#1f2b27]"
              href="/#habitaciones"
            >
              Habitaciones
            </Link>
            <Link className="transition hover:text-[#1f2b27]" href="/#ubicacion">
              Ubicacion
            </Link>
          </nav>
          <Link
            className="rounded-lg bg-[#1f2b27] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#31413d]"
            href="/"
          >
            Volver al hotel
          </Link>
        </div>
      </header>

      <section className="cloudbeds-host reservation-embed-host" data-testid="cloudbeds-host">
        <cb-immersive-experience
          currency={publicConfig.baseCurrency}
          data-testid="cloudbeds-standard-embed"
          hide-custom-footer="yes"
          hide-custom-header="yes"
          hide-property-info="yes"
          lang="es"
          mode="standard"
          property-code={publicConfig.propertyCode}
        />
      </section>
    </main>
  );
}
