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
const enforcedCsp = [
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
].join("; ");

const reportOnlyCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  // Cloudbeds' bundle injects inline and eval'd chunks and cannot carry a
  // nonce, so script/style need 'unsafe-inline'/'unsafe-eval' for its hosts.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static1.cloudbeds.com https://*.cloudbeds.com",
  "style-src 'self' 'unsafe-inline' https://static1.cloudbeds.com https://*.cloudbeds.com",
  // Property photos, Cloudbeds media and map tiles come from many hosts.
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://static1.cloudbeds.com https://*.cloudbeds.com",
  // The browser only calls our own /api/* (the FX rate is proxied server-side
  // to Supabase); Cloudbeds' engine talks to its own API hosts.
  "connect-src 'self' https://*.cloudbeds.com",
  "frame-src 'self' https://*.cloudbeds.com",
  "form-action 'self' https://*.cloudbeds.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
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
  allowedDevOrigins: ["127.0.0.1", "*.trycloudflare.com"],
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
