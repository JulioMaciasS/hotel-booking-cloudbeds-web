import { expect, test } from "@playwright/test";

const cloudbedsScriptUrl =
  "https://static1.cloudbeds.com/booking-engine/latest/static/js/immersive-experience/cb-immersive-experience.js";

test.beforeEach(async ({ page }) => {
  await page.route(cloudbedsScriptUrl, async (route) => {
    await route.fulfill({
      contentType: "application/javascript",
      body: `
        if (!customElements.get("cb-immersive-experience")) {
          class MockCloudbedsImmersive extends HTMLElement {
            connectedCallback() {
              this.innerHTML = \`
                <section id="cb-bookingengine" class="cb-bookingengine-root" data-testid="mock-cloudbeds">
                  <header>
                    <button type="button" aria-label="Seleccionar moneda">ARS</button>
                  </header>
                  <article>
                    <h2>Doble Estandar</h2>
                    <p>ARS 120.000</p>
                    <p>$ 240.000,50</p>
                    <p>AR$ 1.200.000</p>
                  </article>
                </section>
              \`;

              const portal = document.createElement("div");
              portal.className = "cb-portal";
              portal.innerHTML = '<button type="button" aria-label="Currency selector">USD</button>';
              document.body.append(portal);
            }
          }

          customElements.define("cb-immersive-experience", MockCloudbedsImmersive);
        }
      `,
    });
  });
});

test("landing page links to reservas", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Reservas directas en El Calafate" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Ver disponibilidad" }).click();
  await expect(page).toHaveURL(/\/reservas$/);
  await expect(page.getByRole("heading", { name: "Reservas" })).toBeVisible();
});

test("reservas page converts mocked Cloudbeds ARS prices to USD", async ({
  page,
}) => {
  await page.goto("/reservas");

  await expect(page.getByTestId("mock-cloudbeds")).toBeVisible();
  await expect(page.getByText("USD 100.00")).toBeVisible();
  await expect(page.getByText("USD 200.00")).toBeVisible();
  await expect(page.getByText("USD 1,000.00")).toBeVisible();

  await expect(
    page.locator("[data-hotel-currency-converted='true']"),
  ).toHaveCount(3);
  await expect(page.getByText("USD USD")).toHaveCount(0);
});

test("reservas page hides mocked Cloudbeds currency controls", async ({
  page,
}) => {
  await page.goto("/reservas");

  await expect(page.getByTestId("mock-cloudbeds")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Seleccionar moneda" }),
  ).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Currency selector" }),
  ).toBeHidden();
});

test("reservas page explains visual conversion limitations", async ({
  page,
}) => {
  await page.goto("/reservas");

  await expect(page.getByText("Precios mostrados en USD")).toBeVisible();
  await expect(
    page.getByText("Cloudbeds procesa internamente la reserva en ARS"),
  ).toBeVisible();
});
