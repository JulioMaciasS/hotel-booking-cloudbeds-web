import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { buildPageMetadata, siteUrl } from "@/i18n/metadata";
import { Analytics } from "@/components/Analytics";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    metadataBase: new URL(siteUrl),
    ...(await buildPageMetadata(locale as Locale, "/", "home")),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering for this locale.
  setRequestLocale(locale);

  return (
    // suppressHydrationWarning: tooling/proxies and browser extensions inject
    // attributes onto <html> (e.g. tunnel/preview instrumentation), which would
    // otherwise trip React's hydration check. This suppresses only this node's
    // own attribute diff, not mismatches in its children.
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <Analytics />
        <NextIntlClientProvider>
          {children}
          <CookieConsentBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
