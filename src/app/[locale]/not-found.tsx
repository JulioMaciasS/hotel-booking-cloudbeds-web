import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BOOKING_HREF } from "@/lib/nav";
import logoImage from "@assets/old-web-images/logo-sin-fondo-270.png";

export default function NotFound() {
  const t = useTranslations("notFound");
  const tc = useTranslations("common");

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f3ea]">
      <main className="flex flex-1 items-center justify-center px-5 py-16 sm:px-8">
        <div className="w-full max-w-md text-center">
          <Image
            alt={tc("brand")}
            className="mx-auto h-16 w-16 rounded-full bg-white object-contain p-1.5 ring-1 ring-[#e4e8e6]"
            height={64}
            priority
            src={logoImage}
            width={64}
          />

          <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#1f2b27] sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#5f6e69]">{t("body")}</p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#38645b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2e5049] sm:w-auto"
              href="/"
            >
              <ArrowLeft size={16} />
              {t("backHome")}
            </Link>
            <Link
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#c8d4ce] bg-white px-6 py-3 text-sm font-semibold text-[#1f2b27] transition hover:bg-[#f0f4f2] sm:w-auto"
              href={BOOKING_HREF}
            >
              <CalendarDays size={16} />
              {tc("actions.book")}
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-[#141e1c] px-5 py-6 text-center text-xs text-white/30">
        {t("footer", { year: 2026 })}
      </footer>
    </div>
  );
}
