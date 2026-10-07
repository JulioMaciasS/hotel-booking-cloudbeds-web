// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
  hideCloudbedsCurrencyControls,
  injectCloudbedsDomAdjustmentStyles,
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
    document.documentElement.lang = "es";
  });

  it.each(["es", "en", "pt-BR"])("orders room categories by stable IDs in %s without replacing native nodes", (language) => {
    document.documentElement.lang = language;
    const nativeIds = ["227179928547456", "229741180768384", "239441314484352", "229741541683392", "229741711368385"];
    document.body.innerHTML = `<section class="cb-bookingengine-root"><ul style="display:flex;flex-direction:column">${nativeIds.map(id => `<li><div class="cb-accommodation-card" data-testid="accommodation-card-${id}"><button type="button">Select</button></div></li>`).join("")}</ul></section><ul><li id="unrelated">Other content</li></ul>`;
    const originalItems = Array.from(document.querySelectorAll(".cb-bookingengine-root li"));
    const button = originalItems[3].querySelector("button")!;
    let clicks = 0;
    button.addEventListener("click", () => { clicks += 1; });

    injectCloudbedsDomAdjustmentStyles(document);
    injectCloudbedsDomAdjustmentStyles(document);

    expect(originalItems.map(item => getComputedStyle(item).order)).toEqual(["1", "3", "4", "2", "5"]);
    expect(Array.from(document.querySelectorAll(".cb-bookingengine-root li"))).toEqual(originalItems);
    expect(originalItems.every(item => item.isConnected)).toBe(true);
    button.click();
    expect(clicks).toBe(1);
    expect(getComputedStyle(document.getElementById("unrelated")!).order).not.toBe("99");
    expect(document.querySelectorAll("#hotel-cloudbeds-dom-adjustments")).toHaveLength(1);
  });

  it("keeps ordering replacement and filtered lists without another observer pass", () => {
    injectCloudbedsDomAdjustmentStyles(document);
    document.body.innerHTML = `<section id="cb-bookingengine"><ul><li><div class="cb-accommodation-card" data-testid="accommodation-card-229741711368385"></div></li><li><div class="cb-accommodation-card" data-testid="accommodation-card-229741541683392"></div></li><li><div class="cb-accommodation-card" data-testid="accommodation-card-new-category"></div></li></ul></section>`;
    expect(Array.from(document.querySelectorAll("li"), item => getComputedStyle(item).order)).toEqual(["5", "2", "99"]);
    document.querySelector("ul")!.innerHTML = `<li><div class="cb-accommodation-card" data-testid="accommodation-card-227179928547456"></div></li>`;
    expect(getComputedStyle(document.querySelector("li")!).order).toBe("1");
  });

  it("recognizes Portuguese currency and promo controls without hiding filters or booking actions", () => {
    document.documentElement.lang = "pt-BR";
    document.body.innerHTML = `
      <section id="cb-bookingengine">
        <button aria-label="Selecionar moeda">USD</button>
        <button aria-label="Adicionar código promocional">Adicionar código</button>
        <button aria-label="Cupom de desconto">Cupom</button>
        <button aria-label="Filtros">Filtros</button>
        <button aria-label="Reservar">Reservar</button>
      </section>`;
    hideCloudbedsCurrencyControls(document);
    for (const label of ["Selecionar moeda", "Adicionar código promocional", "Cupom de desconto"]) {
      expect(document.querySelector(`[aria-label="${label}"]`)?.hasAttribute("hidden")).toBe(true);
    }
    expect(document.querySelector('[aria-label="Filtros"]')?.hasAttribute("hidden")).toBe(false);
    expect(document.querySelector('[aria-label="Reservar"]')?.hasAttribute("hidden")).toBe(false);
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

  it.each([["es", "Mejor precio"], ["en", "Best price"], ["pt-BR", "Melhor preço"]])("adds a localized best-price badge in %s when Cloudbeds omits its native badge", (language, badge) => {
    document.documentElement.lang = language;
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
    expect(badges[0]?.textContent).toBe(badge);
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
