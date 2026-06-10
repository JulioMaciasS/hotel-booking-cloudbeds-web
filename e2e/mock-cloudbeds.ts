import type { Page } from "@playwright/test";

const cloudbedsScriptUrl =
  "https://static1.cloudbeds.com/booking-engine/latest/static/js/immersive-experience/cb-immersive-experience.js";

/**
 * Default ARS-per-USD rate used by the test suites. The live rate now comes
 * from a Supabase endpoint via `/api/public-fx-rate`, so tests must mock that
 * route to stay deterministic. Currency assertions assume this value
 * (e.g. 100000 ARS → $71.43, 120000 ARS → $85.71).
 */
export const MOCK_ARS_PER_USD = 1400;

/**
 * Intercept `/api/public-fx-rate` and return a fixed rate, so price-conversion
 * behaviour doesn't depend on the live FX endpoint.
 */
export async function mockFxRate(
  page: Page,
  arsPerUsd: number = MOCK_ARS_PER_USD,
): Promise<void> {
  await page.route("**/api/public-fx-rate", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        baseCurrency: "ARS",
        displayCurrency: "USD",
        arsPerUsd,
        active: true,
        source: "test-mock",
        updatedAt: "2026-06-01T00:00:00.000Z",
      }),
    });
  });
}

/**
 * Intercept the third-party Cloudbeds booking-engine script and replace it with
 * lightweight custom elements, so pages that embed the engine render
 * deterministically offline. Shared by the functional and responsive suites.
 */
export async function mockCloudbeds(page: Page): Promise<void> {
  await mockFxRate(page);
  await page.route(cloudbedsScriptUrl, async (route) => {
    await route.fulfill({
      contentType: "application/javascript",
      body: `
        if (!customElements.get("cb-property-date-picker")) {
          class MockCloudbedsDatePicker extends HTMLElement {
            connectedCallback() {
              this.innerHTML = \`
                <form data-testid="mock-date-picker" style="display:flex;gap:8px;flex-wrap:wrap;max-width:100%">
                  <button data-testid="mock-checkin-button" type="button">Check-in</button>
                  <button type="button">Buscar disponibilidad</button>
                </form>
              \`;
            }
          }
          customElements.define("cb-property-date-picker", MockCloudbedsDatePicker);
        }

        if (!customElements.get("cb-immersive-experience")) {
          class MockCloudbedsImmersive extends HTMLElement {
            connectedCallback() {
              this.innerHTML = \`
                <section id="cb-bookingengine" class="cb-bookingengine-root" data-testid="mock-cloudbeds" style="max-width:100%">
                  <h2>Doble Estandar</h2>
                  <button class="cb-view-details-button" type="button">Ver detalles</button>
                </section>
              \`;
            }
          }
          customElements.define("cb-immersive-experience", MockCloudbedsImmersive);
        }
      `,
    });
  });
}
