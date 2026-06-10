import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { HOTEL } from "@/lib/site-data";
import { getAlternates } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import contactImage from "@assets/updated images/otros/recepcion 5 completa de frente 2.jpeg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("contact.title"),
    description: t("contact.description"),
    alternates: getAlternates(locale as Locale, "/contacto"),
  };
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
