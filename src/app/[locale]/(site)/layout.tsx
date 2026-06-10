import { setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileBookingBar } from "@/components/MobileBookingBar";

/**
 * Shared chrome for every public marketing page (home + inner pages).
 * The booking engine route (/reservas) and legal pages live outside this group
 * and keep their own minimal headers.
 */
export default async function SiteLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  // Opt this segment into static rendering for the active locale.
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      <MobileBookingBar />
    </>
  );
}
