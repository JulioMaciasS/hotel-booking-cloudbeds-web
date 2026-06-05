import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { HOTEL } from "@/lib/site-data";
import { BOOKING_HREF, NAV_LINKS } from "@/lib/nav";
import logoImage from "../../assets/old-web-images/logo-sin-fondo-270.png";

export function SiteFooter() {
  return (
    <footer className="bg-[#141e1c] px-5 py-14 text-sm text-white/60 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link className="flex items-center gap-3" href="/">
              <Image
                alt={HOTEL.name}
                className="h-10 w-10 rounded-full bg-white/90 object-contain p-1"
                height={40}
                src={logoImage}
                width={40}
              />
              <span className="text-base font-semibold text-white">{HOTEL.name}</span>
            </Link>
            <p className="mt-4 max-w-sm leading-7">
              Pequeño hotel familiar en El Calafate, Patagonia. A 200 metros del
              centro, con desayuno incluido y atención personalizada para cada
              huésped.
            </p>
            <address className="mt-5 not-italic space-y-1.5">
              <p className="flex items-start gap-2">
                <MapPin aria-hidden="true" className="mt-0.5 shrink-0 text-[#6dbfaa]" size={14} />
                {HOTEL.street}, {HOTEL.cityLine}
              </p>
              <a className="flex items-center gap-2 transition hover:text-white" href={HOTEL.phoneHref}>
                <Phone aria-hidden="true" className="shrink-0 text-[#6dbfaa]" size={14} />
                {HOTEL.phone}
              </a>
              <a className="flex items-center gap-2 transition hover:text-white" href={`mailto:${HOTEL.email}`}>
                <Mail aria-hidden="true" className="shrink-0 text-[#6dbfaa]" size={14} />
                {HOTEL.email}
              </a>
            </address>
          </div>

          {/* Navigation */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
              Navegación
            </p>
            <nav>
              <ul className="space-y-2">
                {NAV_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link className="transition hover:text-white" href={href}>
                      {label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link className="transition hover:text-white" href="/#opiniones">
                    Opiniones
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
              Reseñas &amp; Mapas
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  className="flex items-center gap-2 transition hover:text-white"
                  href={HOTEL.tripadvisorUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ExternalLink aria-hidden="true" size={13} />
                  TripAdvisor · 4.1/5
                </a>
              </li>
              <li>
                <a
                  className="flex items-center gap-2 transition hover:text-white"
                  href={HOTEL.googleMapsUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ExternalLink aria-hidden="true" size={13} />
                  Ver en Google Maps
                </a>
              </li>
              <li>
                <a
                  className="flex items-center gap-2 transition hover:text-white"
                  href={HOTEL.whatsappHref}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <WhatsAppIcon size={13} />
                  WhatsApp
                </a>
              </li>
            </ul>
            <Link
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[#38645b] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#2e5049]"
              href={BOOKING_HREF}
            >
              Reservar ahora
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 border-t border-white/10 pt-8 text-center text-xs text-white/30 sm:flex-row sm:justify-between">
          <p>© 2026 {HOTEL.name} · El Calafate, Patagonia, Argentina</p>
          <div className="flex gap-4">
            <Link href="/terminos" className="transition hover:text-white/60">
              Términos y Condiciones
            </Link>
            <Link href="/privacidad" className="transition hover:text-white/60">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
