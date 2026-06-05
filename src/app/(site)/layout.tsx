import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileBookingBar } from "@/components/MobileBookingBar";

/**
 * Shared chrome for every public marketing page (home + inner pages).
 * The booking engine route (/reservas) and legal pages live outside this group
 * and keep their own minimal headers.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      <MobileBookingBar />
    </>
  );
}
