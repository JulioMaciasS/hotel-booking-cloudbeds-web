// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { hideCloudbedsCurrencyControls } from "./hide-cloudbeds-currency-controls";

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
});
