// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
  hideCloudbedsCurrencyControls,
  protectCloudbedsTechnicalRatePlan,
} from "./hide-cloudbeds-currency-controls";
import {
  CLOUDBEDS_PUBLIC_RATE_PLAN_ID,
  CLOUDBEDS_TECHNICAL_GHS_RATE_PLAN_ID,
} from "./cloudbeds-rate-plan-guard";

describe("Cloudbeds DOM adjustments", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("hides the current mobile promo-code button markup", () => {
    document.body.innerHTML = `
      <section id="cb-bookingengine">
        <button data-testid="header-search-panel-promocode-button" type="button">
          <p data-be-text="true" aria-label="Add promo code">Añadir código</p>
        </button>
      </section>
    `;

    hideCloudbedsCurrencyControls(document);

    const promoButton = document.querySelector(
      "[data-testid='header-search-panel-promocode-button']",
    );
    expect(promoButton?.getAttribute("data-hotel-cloudbeds-promo-hidden")).toBe(
      "true",
    );
    expect(promoButton?.hasAttribute("hidden")).toBe(true);
  });

  it("hides only the technical room type when a filter portal mounts later", () => {
    document.body.innerHTML = '<section id="cb-bookingengine"></section>';
    hideCloudbedsCurrencyControls(document);

    document.body.insertAdjacentHTML(
      "beforeend",
      `
        <div class="cb-portal">
          <div data-testid="accommodation-type-filter-options-list">
            <label data-testid="accommodation-type-filter-checkbox-227179928547456">
              Doble Estándar
            </label>
            <label data-testid="accommodation-type-filter-checkbox-258282401603712">
              Ajuste técnico — no vender
            </label>
          </div>
        </div>
      `,
    );

    // This is the same idempotent pass the existing MutationObserver triggers
    // when Cloudbeds inserts its filter portal.
    hideCloudbedsCurrencyControls(document);

    const normalRoom = document.querySelector(
      "[data-testid='accommodation-type-filter-checkbox-227179928547456']",
    );
    const technicalRoom = document.querySelector(
      "[data-testid='accommodation-type-filter-checkbox-258282401603712']",
    );

    expect(normalRoom?.hasAttribute("hidden")).toBe(false);
    expect(
      technicalRoom?.getAttribute("data-hotel-cloudbeds-room-type-hidden"),
    ).toBe("true");
    expect(technicalRoom?.hasAttribute("hidden")).toBe(true);
  });

  it("adds a localized best-price badge when Cloudbeds omits its native badge", () => {
    document.documentElement.lang = "en";
    document.body.innerHTML = `
      <article data-testid="accommodation-card-227179928547456">
        <section
          class="cb-rate-plan"
          data-testid="rate-plan-227179928547456-${CLOUDBEDS_TECHNICAL_GHS_RATE_PLAN_ID}"
        >Tarifa técnica GHS</section>
        <section
          class="cb-rate-plan"
          data-testid="rate-plan-227179928547456-${CLOUDBEDS_PUBLIC_RATE_PLAN_ID}"
        >
          <h4
            data-testid="package-display-name-227179928547456-${CLOUDBEDS_PUBLIC_RATE_PLAN_ID}"
          >No reembolsable</h4>
        </section>
      </article>
    `;

    protectCloudbedsTechnicalRatePlan(document);
    protectCloudbedsTechnicalRatePlan(document);

    const badges = document.querySelectorAll(
      "[data-hotel-cloudbeds-best-rate-badge='true']",
    );
    expect(badges).toHaveLength(1);
    expect(badges[0]?.textContent).toBe("Best price");
  });

  it("hides the technical rate and opens the public offers panel", () => {
    document.body.innerHTML = `
      <article data-testid="accommodation-card-227179928547456">
        <div data-testid="featured-rate-slot">
          <section
            class="cb-rate-plan"
            data-testid="rate-plan-227179928547456-${CLOUDBEDS_TECHNICAL_GHS_RATE_PLAN_ID}"
          >
            Tarifa técnica GHS
            <span
              class="cloudbeds-best-rate-badge"
              data-testid="bestrate-badge-227179928547456-${CLOUDBEDS_TECHNICAL_GHS_RATE_PLAN_ID}"
            >Mejor precio</span>
          </section>
        </div>
        <div class="chakra-accordion__item">
          <button aria-expanded="false" type="button">Mostrar ofertas</button>
          <div class="chakra-collapse">
            <section
              class="cb-rate-plan"
              data-testid="rate-plan-227179928547456-${CLOUDBEDS_PUBLIC_RATE_PLAN_ID}"
            >
              <button
                data-testid="package-display-name-227179928547456-${CLOUDBEDS_PUBLIC_RATE_PLAN_ID}"
                type="button"
              >No reembolsable</button>
            </section>
          </div>
        </div>
      </article>
    `;

    const accordionButton = document.querySelector<HTMLButtonElement>(
      "button[aria-expanded='false']",
    );
    let expansions = 0;
    accordionButton?.addEventListener("click", () => {
      expansions += 1;
    });

    protectCloudbedsTechnicalRatePlan(document);
    protectCloudbedsTechnicalRatePlan(document);

    const technicalRate = document.querySelector(
      `[data-testid$="-${CLOUDBEDS_TECHNICAL_GHS_RATE_PLAN_ID}"]`,
    );
    const publicRate = document.querySelector<HTMLElement>(
      `[data-testid$="-${CLOUDBEDS_PUBLIC_RATE_PLAN_ID}"]`,
    );

    expect(technicalRate?.hasAttribute("hidden")).toBe(true);
    expect(
      technicalRate?.getAttribute("data-hotel-cloudbeds-rate-plan-hidden"),
    ).toBe("true");
    expect(publicRate?.dataset.hotelCloudbedsPublicRatePromoted).toBe("true");
    const copiedBadge = publicRate?.querySelector<HTMLElement>(
      "[data-hotel-cloudbeds-best-rate-badge='true']",
    );
    expect(copiedBadge?.textContent).toBe("Mejor precio");
    expect(copiedBadge?.classList.contains("cloudbeds-best-rate-badge")).toBe(
      true,
    );
    expect(
      publicRate?.querySelectorAll(
        "[data-hotel-cloudbeds-best-rate-badge='true']",
      ),
    ).toHaveLength(1);
    expect(expansions).toBe(1);
    expect(accordionButton?.dataset.hotelPublicRateExpansionAttempted).toBe(
      "true",
    );
  });

  it("removes the technical rate if it somehow reached the cart", () => {
    document.body.innerHTML = `
      <aside>
        <div data-testid="shopping-cart-item-accommodation-227179928547456-${CLOUDBEDS_TECHNICAL_GHS_RATE_PLAN_ID}">
          Tarifa técnica GHS
          <button
            data-testid="shopping-cart-item-remove-button-accommodation-227179928547456-${CLOUDBEDS_TECHNICAL_GHS_RATE_PLAN_ID}"
            type="button"
          >Quitar</button>
        </div>
      </aside>
    `;
    const removeButton = document.querySelector<HTMLButtonElement>("button");
    let removals = 0;
    removeButton?.addEventListener("click", () => {
      removals += 1;
    });

    protectCloudbedsTechnicalRatePlan(document);
    protectCloudbedsTechnicalRatePlan(document);

    expect(removals).toBe(1);
    expect(removeButton?.dataset.hotelTechnicalRateRemovalAttempted).toBe(
      "true",
    );
  });
});
