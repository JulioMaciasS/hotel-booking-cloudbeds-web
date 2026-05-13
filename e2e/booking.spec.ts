import { expect, test } from "@playwright/test";

const cloudbedsScriptUrl =
  "https://static1.cloudbeds.com/booking-engine/latest/static/js/immersive-experience/cb-immersive-experience.js";

test.beforeEach(async ({ page }) => {
  await page.route(cloudbedsScriptUrl, async (route) => {
    await route.fulfill({
      contentType: "application/javascript",
      body: `
        if (!customElements.get("cb-property-date-picker")) {
          class MockCloudbedsDatePicker extends HTMLElement {
            connectedCallback() {
              this.innerHTML = \`
                <form data-testid="mock-date-picker">
                  <button data-testid="mock-checkin-button" type="button">Check-in</button>
                  <button type="button">Buscar disponibilidad</button>
                </form>
              \`;

              this.querySelector("[data-testid='mock-checkin-button']").addEventListener("click", () => {
                let calendar = document.querySelector("[data-testid='mock-date-picker-calendar']");

                if (!calendar) {
                  calendar = document.createElement("div");
                  calendar.className = "cb-portal";
                  calendar.setAttribute("data-testid", "mock-date-picker-calendar");
                  calendar.innerHTML = '<button type="button"><span>100k</span></button>';
                  document.body.append(calendar);
                }
              });

              this.querySelector("button:last-of-type").addEventListener("click", () => {
                const target = new URL(
                  this.getAttribute("custom-url") || "https://hotels.cloudbeds.com/reservation/5fdNYA",
                  window.location.href
                );
                target.searchParams.set("checkin", "2026-06-01");
                target.searchParams.set("checkout", "2026-06-03");
                target.searchParams.set("widget_source", "mock-date-picker");
                window.location.href = target.toString();
              });
            }
          }

          customElements.define("cb-property-date-picker", MockCloudbedsDatePicker);
        }

        if (!customElements.get("cb-immersive-experience")) {
          class MockCloudbedsImmersive extends HTMLElement {
            connectedCallback() {
              this.innerHTML = \`
                <section id="cb-bookingengine" class="cb-bookingengine-root" data-testid="mock-cloudbeds">
                  <header class="cb-navigation-header" data-testid="mock-cloudbeds-shell-nav" aria-label="Booking navigation">
                    <a data-testid="mock-cloudbeds-logo" href="https://hotels.cloudbeds.com/reservation/5fdNYA">Cloudbeds</a>
                    <a data-testid="mock-cloudbeds-nav-item" href="#rooms">Habitaciones</a>
                    <button type="button" aria-label="Seleccionar moneda">ARS</button>
                    <p class="chakra-text cb-text d-16ge5kn" data-be-text="true" aria-label="Promo code: Añadir código">Añadir código</p>
                  </header>
                  <article class="cb-accommodation-card" data-testid="accommodation-card-227179928547456">
                    <button
                      aria-label="Filtros"
                      data-testid="mock-filter-button"
                      style="color: transparent; opacity: 0.15;"
                      type="button"
                    >
                      <svg aria-hidden="true" data-testid="mock-filter-icon" height="16" viewBox="0 0 16 16" width="16">
                        <path d="M2 4h12M4 8h8M6 12h4" fill="none" stroke="currentColor" stroke-width="2"></path>
                      </svg>
                      <span>Filtros</span>
                    </button>
                    <h2>Doble Estandar</h2>
                    <h3>Doble Estandar</h3>
                    <button class="cb-view-details-button" type="button">Ver detalles</button>
                    <p>ARS 120.000</p>
                    <p>$ 240.000,50</p>
                    <p>AR$ 1.200.000</p>
                    <p>120.000 ARS</p>
                    <p class="cb-rate-plan-price" data-testid="mock-bare-rate-price">277,700,600.00</p>
                  </article>
                  <article class="cb-accommodation-card" data-testid="accommodation-card-229741180768384">
                    <h3>Triple Estandar</h3>
                    <button class="cb-view-details-button" type="button">Ver detalles</button>
                  </article>
                  <aside data-testid="mock-shopping-cart">
                    <p data-testid="shopping-cart-grand-total">ARS 277,700,600.00</p>
                  </aside>
                  <nav class="leaflet-control-zoom leaflet-bar" data-testid="mock-map-controls">
                    <a aria-label="Zoom in" href="#">+</a>
                    <a aria-label="Zoom out" href="#">-</a>
                  </nav>
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

test("home page renders hotel content and the horizontal date picker", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Los Lagos Hotel" }),
  ).toBeVisible();
  await expect(page.getByTestId("cloudbeds-date-picker")).toBeVisible();
  await expect(page.getByTestId("mock-date-picker")).toBeVisible();
  await expect(page.locator("cb-immersive-experience")).toHaveCount(0);
  await expect(page.getByText("Ir directo a reservas")).toHaveCount(0);
});

test("home page converts Cloudbeds date-picker calendar k prices to dollars", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByTestId("mock-checkin-button").click();
  await expect(page.getByTestId("mock-date-picker-calendar")).toBeVisible();
  await expect(page.getByText("$71.43")).toBeVisible();
  await expect(
    page.getByTestId("mock-date-picker-calendar").locator(
      "[data-hotel-currency-converted='true']",
    ),
  ).toHaveCount(1);
});

test("home page date picker sends guests to /reservas without a hosted Cloudbeds redirect", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Buscar disponibilidad" }).click();
  await expect(page).toHaveURL(/\/reservas\?/);
  expect(new URL(page.url()).origin).toBe("http://localhost:3000");
  await expect(page).toHaveURL(/checkin=2026-06-01/);
  await expect(page).toHaveURL(/checkout=2026-06-03/);
  await expect(page.getByTestId("cloudbeds-standard-embed")).toBeVisible();
});

test("reservas page renders the Cloudbeds immersive component with official hide attributes", async ({
  page,
}) => {
  await page.goto("/reservas");

  const embed = page.getByTestId("cloudbeds-standard-embed");
  await expect(page.getByTestId("reservation-wrapper-header")).toBeVisible();
  await expect(page.getByRole("link", { name: "Los Lagos Hotel" })).toBeVisible();
  await expect(embed).toBeVisible();
  await expect(page.getByTestId("mock-cloudbeds")).toBeVisible();
  await expect(embed).toHaveAttribute("hide-custom-header", "yes");
  await expect(embed).toHaveAttribute("hide-custom-footer", "yes");
  await expect(embed).toHaveAttribute("hide-property-info", "yes");
  await expect(embed).toHaveAttribute("currency", "ARS");
});

test("reservas page keeps Cloudbeds nav visible while hiding brand, currency, and promo controls", async ({
  page,
}) => {
  await page.goto("/reservas");

  await expect(page.getByTestId("mock-cloudbeds")).toBeVisible();
  await expect(page.getByTestId("mock-cloudbeds-shell-nav")).toBeVisible();
  await expect(page.getByTestId("mock-cloudbeds-logo")).toBeHidden();
  await expect(page.getByTestId("mock-cloudbeds-nav-item")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Seleccionar moneda" }),
  ).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Currency selector" }),
  ).toBeHidden();
  await expect(page.getByLabel("Promo code: Añadir código")).toBeHidden();
  await expect(page.getByText("Añadir código")).toBeHidden();
});

test("reservas page converts mocked Cloudbeds ARS prices to dollars once", async ({
  page,
}) => {
  await page.goto("/reservas");

  await expect(page.getByTestId("mock-cloudbeds")).toBeVisible();
  await expect(page.getByText("$85.71")).toHaveCount(2);
  await expect(page.getByText("$171.43")).toBeVisible();
  await expect(page.getByText("$857.14")).toBeVisible();
  await expect(page.getByText("$198.36")).toHaveCount(2);

  await expect(
    page.locator("[data-hotel-currency-converted='true']"),
  ).toHaveCount(6);
  await expect(page.getByText("USD $")).toHaveCount(0);
});

test("reservas page adds bedding selectors to Cloudbeds room cards", async ({
  page,
}) => {
  await page.goto("/reservas");

  const doubleCard = page.getByTestId("accommodation-card-227179928547456");
  const tripleCard = page.getByTestId("accommodation-card-229741180768384");
  const doubleBeddingSelector = doubleCard.locator(
    "[data-hotel-bedding-selector]",
  );

  await expect(doubleCard.getByText("Tipo de cama")).toBeVisible();
  await expect(doubleBeddingSelector).toHaveCSS("margin-top", "12px");
  await expect(doubleBeddingSelector).toHaveCSS("padding-top", "12px");
  await expect(doubleBeddingSelector).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  await expect(doubleCard.getByText("Preferencia de cama")).toHaveCount(0);
  await expect(
    doubleCard.getByText("Selecciona la distribucion preferida"),
  ).toHaveCount(0);
  await expect(doubleCard.getByRole("button", { name: /Matrimonial/ })).toBeVisible();
  await expect(
    doubleCard.getByRole("button", { name: /Dos camas separadas/ }),
  ).toBeVisible();
  await expect(
    doubleCard.getByRole("button", { name: /Matrimonial/ }),
  ).toHaveCSS("box-shadow", "none");
  await expect(
    doubleCard.getByRole("button", { name: /Matrimonial/ }),
  ).toHaveCSS("border-color", "rgb(56, 100, 91)");

  await doubleCard.getByRole("button", { name: /Dos camas separadas/ }).click();
  await expect(
    doubleCard.getByRole("button", { name: /Dos camas separadas/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    doubleCard.locator("[data-hotel-bedding-selector]"),
  ).toHaveAttribute("data-hotel-selected-bedding", "dos_camas_separadas");

  await expect(
    tripleCard.getByRole("button", { name: /Matrimonial y cama individual/ }),
  ).toBeVisible();
  await expect(
    tripleCard.getByRole("button", { name: /Tres camas individuales/ }),
  ).toBeVisible();
});

test("reservas page keeps Cloudbeds filters button text and icon visible", async ({
  page,
}) => {
  await page.goto("/reservas");

  const filterButton = page.getByTestId("mock-filter-button");
  await expect(page.getByTestId("mock-cloudbeds")).toBeVisible();
  await expect(filterButton).toBeVisible();
  await expect(filterButton).toHaveCSS("color", "rgb(31, 41, 55)");
  await expect(filterButton).toHaveCSS("opacity", "1");
  await expect(page.getByTestId("mock-filter-icon")).toHaveCSS(
    "color",
    "rgb(31, 41, 55)",
  );
});

test("reservas page keeps map zoom control backgrounds visible", async ({
  page,
}) => {
  await page.goto("/reservas");

  await expect(page.getByTestId("mock-map-controls")).toBeVisible();
  await expect(page.getByLabel("Zoom in")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  await expect(page.getByLabel("Zoom out")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
});
