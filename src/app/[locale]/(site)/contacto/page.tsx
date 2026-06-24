import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { HOTEL } from "@/lib/site-data";
import { buildPageMetadata } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import contactImage from "@assets/updated images/otros/recepcion 5 completa de frente 2.jpeg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale as Locale, "/contacto", "contact");
}

export default async function ContactoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <main className="bg-[#f7f3ea] text-[#1f2b27]">
      <PageHero
        eyebrow={t("page.eyebrow")}
        title={t("page.title")}
        subtitle={t("page.subtitle")}
        image={contactImage}
        imagePosition="center 50%"
      />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* On mobile the form sits between the quick-contact actions and the
              passive address/hours (via order-*) so it isn't buried under five
              rows. On lg+ the two detail blocks recombine into the left column
              beside the form — a single continuous card (seam matches the row
              dividers), unchanged from before. */}
          <div className="reveal grid gap-x-10 gap-y-6 lg:grid-cols-2 lg:gap-y-0">
            {/* Quick contact — phone, WhatsApp, email (the tappable actions) */}
            <div className="order-1 flex flex-col divide-y divide-black/5 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5 lg:order-none lg:col-start-1 lg:row-start-1 lg:rounded-b-none">
              <a
                className="flex flex-1 items-center gap-4 px-5 py-4 transition hover:bg-[#f7faf8]"
                href={HOTEL.phoneHref}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf3ef] text-[#38645b]">
                  <Phone aria-hidden="true" size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1f2b27]">{HOTEL.phone}</p>
                  <p className="text-xs text-[#66736f]">{t("info.phone")}</p>
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
                  <p className="text-xs text-[#66736f]">{t("info.whatsapp")}</p>
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
                  <p className="text-xs text-[#66736f]">{t("info.email")}</p>
                </div>
              </a>
            </div>

            {/* Form — primary on desktop (right column), secondary on mobile */}
            <div className="order-2 rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2">
              <ContactForm />
            </div>

            {/* Address & reception hours — passive reference */}
            <div className="order-3 flex flex-col divide-y divide-black/5 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5 lg:order-none lg:col-start-1 lg:row-start-2 lg:rounded-t-none">
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
                  <p className="text-sm font-semibold text-[#1f2b27]">{t("info.reception")}</p>
                  <p className="text-xs text-[#66736f]">{t("info.receptionNote")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
