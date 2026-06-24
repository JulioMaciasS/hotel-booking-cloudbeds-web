import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Content-Security-Policy is shipped in two parts on purpose:
//
//  - An ENFORCED policy limited to directives that cannot break the embedded
//    Cloudbeds engine or the Leaflet map. The site uses no <object>/<embed>,
//    never sets a <base>, and must never be framed by a third party, so these
//    are safe to block outright and give real clickjacking protection today.
//
//  - A REPORT-ONLY policy carrying the full resource allowlist. Cloudbeds
//    renders into OUR document and pulls scripts/styles/fonts/XHR from CDN and
//    API hosts we cannot fully enumerate up front, so enforcing a guessed
//    allowlist risks breaking live bookings. Report-Only logs violations to the
//    browser console without blocking. Review the violations against real
//    booking traffic, widen the allowlist to cover any legitimate host, then
//    rename this header to `Content-Security-Policy` to start enforcing.
//
//  The non-obvious hosts below were found by driving a real booking through the
//  engine and reading the Report-Only violations:
//    - *.launchdarkly.com — Cloudbeds' engine uses LaunchDarkly for feature
//      flags (app.launchdarkly.com goals + clientstream.launchdarkly.com eval).
//    - *.i.posthog.com — our own PostHog analytics (see src/lib/analytics.ts):
//      api host us.i.posthog.com + lazy-loaded modules from us-assets.i.posthog.com
//      (the wildcard also covers the eu.* region). Only active when
//      NEXT_PUBLIC_POSTHOG_KEY is set, so it never showed up in dev capture.
//    - fonts.googleapis.com / fonts.gstatic.com — Cloudbeds' widget requests
//      Google-hosted Mulish font assets in addition to its static1 CDN fonts.
//    - googletagmanager.com / google-analytics.com — Cloudbeds' widget emits
//      its own booking-engine analytics events after the property loads.
const enforcedCsp = [
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  // Auto-upgrade any stray http subresource to https (the site is https-only).
  // Lives here, not in Report-Only, where this directive is ignored per spec.
  "upgrade-insecure-requests",
].join("; ");

const reportOnlyCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  // Cloudbeds' bundle injects inline and eval'd chunks and cannot carry a
  // nonce, so script/style need 'unsafe-inline'/'unsafe-eval' for its hosts.
  // PostHog lazy-loads its recorder/surveys modules from *-assets.i.posthog.com.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static1.cloudbeds.com https://*.cloudbeds.com https://*.i.posthog.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://static1.cloudbeds.com https://*.cloudbeds.com https://fonts.googleapis.com",
  // Property photos, Cloudbeds media and map tiles come from many hosts.
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://static1.cloudbeds.com https://*.cloudbeds.com https://fonts.gstatic.com",
  // 'self' (our /api/* — the FX rate is proxied server-side to Supabase),
  // Cloudbeds' API hosts, LaunchDarkly (Cloudbeds feature flags), and PostHog.
  "connect-src 'self' https://*.cloudbeds.com https://*.launchdarkly.com https://*.i.posthog.com https://www.google-analytics.com https://*.google-analytics.com",
  "frame-src 'self' https://*.cloudbeds.com",
  "form-action 'self' https://*.cloudbeds.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: enforcedCsp },
  { key: "Content-Security-Policy-Report-Only", value: reportOnlyCsp },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

// Only advertise HSTS from production over HTTPS. Sending it in dev would let a
// local HTTPS tunnel (see the `tunnel` script) pin HSTS on *.trycloudflare.com.
if (process.env.NODE_ENV === "production") {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  });
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "*.loslagoshotel.com.ar", "*.trycloudflare.com"],
  images: {
    qualities: [75, 90],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
