import { redirect } from "@/i18n/navigation";

/**
 * The Experiencias / excursions section is not live yet — it will return once
 * the offering launches. Until then this route redirects to the home page so
 * the unfinished content isn't reachable directly. The original page is kept in
 * git history; re-enable it together with the entries in `nav.ts`, `sitemap.ts`
 * and the home-page experiences teaser.
 */
export default async function ExperienciasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/", locale });
}
