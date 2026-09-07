import { HOTEL } from "@/lib/site-data";
import { REVIEW_SUMMARY } from "@/lib/review-summary";
import { siteUrl } from "@/i18n/metadata";

/**
 * schema.org `LodgingBusiness` for the hotel. Powers rich results in Google
 * (star rating, address, price band, contact). The aggregate rating is a
 * review-count-weighted blend of Google, Booking and Expedia, normalised to a
 * 5-point scale. The source figures live in `site-data.ts` and the exact result
 * is also displayed on the page.
 */
export function lodgingBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": `${siteUrl}/#hotel`,
    name: HOTEL.name,
    url: siteUrl,
    image: `${siteUrl}/opengraph-image`,
    telephone: HOTEL.phone,
    email: HOTEL.email,
    priceRange: "$$",
    currenciesAccepted: "USD, ARS",
    address: {
      "@type": "PostalAddress",
      streetAddress: HOTEL.street,
      addressLocality: "El Calafate",
      addressRegion: "Santa Cruz",
      postalCode: "Z9405",
      addressCountry: "AR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -50.3357896,
      longitude: -72.2666423,
    },
    checkinTime: HOTEL.checkIn,
    checkoutTime: HOTEL.checkOut,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: REVIEW_SUMMARY.rating.toFixed(1),
      reviewCount: REVIEW_SUMMARY.reviewCount,
      bestRating: "5",
      worstRating: "1",
    },
    sameAs: [HOTEL.expediaUrl, HOTEL.bookingUrl, HOTEL.googleMapsUrl],
  };
}

/**
 * schema.org `FAQPage` from the hotel page's Q&A pairs — eligible for the FAQ
 * rich result (expandable questions under the search listing).
 */
export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}
