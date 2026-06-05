import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { HOTEL } from "@/lib/site-data";
import contactImage from "../../../../assets/updated images/otros/recepcion 5 completa de frente 2.jpeg";

export const metadata: Metadata = {
  title: "Contacto | Los Lagos Hotel, El Calafate",
  description:
    "Contactá a Los Lagos Hotel en El Calafate por teléfono, WhatsApp o email. Recepción abierta las 24 horas, todos los días del año.",
};

export default function ContactoPage() {
  return (
    <main className="bg-[#f7f3ea] text-[#1f2b27]">
      <PageHero
        eyebrow="Contacto"
        title="¿Tenés alguna consulta?"
        subtitle="Escribinos y te respondemos a la brevedad. También podés llamarnos o escribirnos por WhatsApp."
        image={contactImage}
        imagePosition="center 50%"
      />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Contact details */}
            <div className="flex h-full flex-col divide-y divide-black/5 rounded-lg bg-white shadow-sm ring-1 ring-black/5">
              <a
                className="flex flex-1 items-center gap-4 px-5 py-4 transition hover:bg-[#f7faf8]"
                href={HOTEL.phoneHref}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf3ef] text-[#38645b]">
                  <Phone aria-hidden="true" size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1f2b27]">{HOTEL.phone}</p>
                  <p className="text-xs text-[#66736f]">Llamadas</p>
                </div>
              </a>
              <a
                className="flex flex-1 items-center gap-4 px-5 py-4 transition hover:bg-[#f7faf8]"
                href={HOTEL.whatsappHref}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf3ef] text-[#38645b]">
                  <WhatsAppIcon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1f2b27]">{HOTEL.whatsapp}</p>
                  <p className="text-xs text-[#66736f]">WhatsApp</p>
                </div>
              </a>
              <a
                className="flex flex-1 items-center gap-4 px-5 py-4 transition hover:bg-[#f7faf8]"
                href={`mailto:${HOTEL.email}`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf3ef] text-[#38645b]">
                  <Mail aria-hidden="true" size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1f2b27]">{HOTEL.email}</p>
                  <p className="text-xs text-[#66736f]">Email</p>
                </div>
              </a>
              <div className="flex flex-1 items-center gap-4 px-5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf3ef] text-[#38645b]">
                  <MapPin aria-hidden="true" size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1f2b27]">{HOTEL.street}</p>
                  <p className="text-xs text-[#66736f]">{HOTEL.cityLine}</p>
                </div>
              </div>
              <div className="flex flex-1 items-center gap-4 px-5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf3ef] text-[#38645b]">
                  <Clock aria-hidden="true" size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1f2b27]">Recepción 24 hs</p>
                  <p className="text-xs text-[#66736f]">Todos los días del año</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
