import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "*.trycloudflare.com"],
  images: {
    qualities: [75, 90],
  },
};

export default withNextIntl(nextConfig);
