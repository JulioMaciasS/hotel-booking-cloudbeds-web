import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getAlternates } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";

const HOTEL_EMAIL = "loslagoshotelcalafate@gmail.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("terms.title"),
    description: t("terms.description"),
    alternates: getAlternates(locale as Locale, "/terminos"),
  };
}

const richTags = {
  strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
  email: () => (
    <a
      href={`mailto:${HOTEL_EMAIL}`}
      className="text-[#38645b] underline underline-offset-2"
    >
      {HOTEL_EMAIL}
    </a>
  ),
  coprec: (chunks: React.ReactNode) => (
    <a
      href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario"
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#38645b] underline underline-offset-2"
    >
      {chunks}
    </a>
  ),
};

export default async function TerminosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  const sections = t.raw("terms.sections") as Array<{
    heading: string;
    body?: string;
    body2?: string;
    intro?: string;
    items?: string[];
    outro?: string;
  }>;

  return (
    <div className="min-h-screen bg-[#f7f3ea]">
      {/* Header */}
      <header className="border-b border-black/5 bg-white px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#38645b] transition hover:text-[#2e5049]"
          >
            <ArrowLeft size={16} />
            {t("nav.backHome")}
          </Link>
          <span className="text-sm text-[#5f6e69]">{t("nav.brand")}</span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#38645b]">
          {t("eyebrow")}
        </p>
        <h1 className="text-3xl font-semibold text-[#1f2b27] sm:text-4xl">
          {t("terms.title")}
        </h1>
        <p className="mt-3 text-sm text-[#5f6e69]">
          {t("lastUpdatedLabel", { date: t("lastUpdated") })}
        </p>

        <div className="prose-custom mt-10 space-y-10 text-[#3b4c46]">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
                {section.heading}
              </h2>

              {section.body && (
                <p className="leading-7">
                  {t.rich(`terms.sections.${i}.body`, richTags)}
                </p>
              )}

              {section.intro && (
                <p className="leading-7">
                  {t.rich(`terms.sections.${i}.intro`, richTags)}
                </p>
              )}

              {section.items && (
                <ul
                  className={`${section.intro ? "mt-3 " : ""}list-disc space-y-2 pl-5 leading-7`}
                >
                  {section.items.map((_, j) => (
                    <li key={j}>
                      {t.rich(`terms.sections.${i}.items.${j}`, richTags)}
                    </li>
                  ))}
                </ul>
              )}

              {section.outro && (
                <p className="mt-3 leading-7">
                  {t.rich(`terms.sections.${i}.outro`, richTags)}
                </p>
              )}

              {section.body2 && (
                <p className="mt-3 leading-7">
                  {t.rich(`terms.sections.${i}.body2`, richTags)}
                </p>
              )}
            </section>
          ))}
        </div>

        {/* Bottom nav */}
        <div className="mt-14 flex flex-col gap-3 border-t border-black/5 pt-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-medium text-[#38645b] transition hover:text-[#2e5049]"
          >
            <ArrowLeft size={15} />
            {t("nav.backHome")}
          </Link>
          <Link
            href="/privacidad"
            className="text-[#5f6e69] underline underline-offset-2 transition hover:text-[#1f2b27]"
          >
            {t("terms.toPrivacy")}
          </Link>
        </div>
      </main>

      {/* Mini footer */}
      <footer className="bg-[#141e1c] px-5 py-6 text-center text-xs text-white/30">
        © {new Date().getFullYear()} Los Lagos Hotel · El Calafate, Patagonia,
        Argentina
      </footer>
    </div>
  );
}
