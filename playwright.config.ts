import { defineConfig, devices } from "@playwright/test";

const RESPONSIVE_SPEC = "**/responsive.spec.ts";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
    // Pin the browser locale so the default (Spanish) site is served at "/"
    // and next-intl's Accept-Language detection doesn't redirect to /en.
    locale: "es-AR",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    // Functional suite (booking flow, currency, etc.) — desktop Chrome only.
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: RESPONSIVE_SPEC,
    },

    // Responsive suite — same checks run across the breakpoint matrix.
    {
      name: "Mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: RESPONSIVE_SPEC,
    },
    // iPhone-SE / iPad sizes on the Chromium engine, so the suite needs only
    // one browser download (matching the repo's existing Chromium-only setup).
    // Real Mobile Safari is covered by the manual spot-checks in
    // RESPONSIVE-TESTING.md.
    {
      name: "Mobile small",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 667 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      },
      testMatch: RESPONSIVE_SPEC,
    },
    {
      name: "Tablet",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 820, height: 1180 },
        hasTouch: true,
        deviceScaleFactor: 2,
      },
      testMatch: RESPONSIVE_SPEC,
    },
    {
      name: "Desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
      testMatch: RESPONSIVE_SPEC,
    },
    {
      name: "Desktop wide",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1536, height: 864 } },
      testMatch: RESPONSIVE_SPEC,
    },
  ],
});
