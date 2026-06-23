import { beforeEach, describe, expect, it } from "vitest";
import {
  injectCloudbedsBeddingSelectors,
  setCloudbedsBeddingAvailability,
  syncCloudbedsBeddingSelections,
} from "./cloudbeds-bedding-selector";

function renderCard(id: string, title: string) {
  document.body.innerHTML = `
    <article class="cb-accommodation-card" data-testid="accommodation-card-${id}">
      <h3>${title}</h3>
      <button class="cb-view-details-button" type="button">Ver detalles</button>
      <button
        class="cb-select-button"
        data-testid="rate-plan-guest-quantity-select-${id}-base"
        type="button"
      >
        Añadir
      </button>
    </article>
  `;

  const addButton = document.querySelector<HTMLButtonElement>(
    `[data-testid="rate-plan-guest-quantity-select-${id}-base"]`,
  );

  addButton?.addEventListener("click", () => {
    const popover = document.createElement("div");
    popover.className = `cb-guestselector-popover cb-guestselector-popover-${id}`;
    popover.dataset.testid = "guestselector-popover";
    popover.innerHTML = `
      <div>
        <p class="cb-guestselector-quantity-text">Cantidad</p>
        <div>
          <button
            aria-label="minus"
            data-testid="rate-plan-guest-quantity-select-${id}-base-quantity-minus-button"
            type="button"
          >-</button>
          <input
            data-testid="rate-plan-guest-quantity-select-${id}-base-quantity-input"
            value="1"
          />
          <button
            aria-label="add"
            data-testid="rate-plan-guest-quantity-select-${id}-base-quantity-plus-button"
            type="button"
          >+</button>
        </div>
      </div>
    `;

    const input = popover.querySelector<HTMLInputElement>("input");
    const plus = popover.querySelector<HTMLButtonElement>("[aria-label='add']");
    plus?.addEventListener("click", () => {
      if (input) {
        input.value = String(Number(input.value) + 1);
      }
    });

    document.body.append(popover);
  });

  injectCloudbedsBeddingSelectors(document);
  syncCloudbedsBeddingSelections(document);

  return document.querySelector<HTMLElement>(
    `[data-testid="accommodation-card-${id}"]`,
  )!;
}

function openQuantityPopover(card: HTMLElement, id: string) {
  card
    .querySelector<HTMLButtonElement>(
      `[data-testid="rate-plan-guest-quantity-select-${id}-base"]`,
    )
    ?.click();
  syncCloudbedsBeddingSelections(document);

  return {
    input: document.querySelector<HTMLInputElement>(
      `[data-testid="rate-plan-guest-quantity-select-${id}-base-quantity-input"]`,
    )!,
    plus: document.querySelector<HTMLButtonElement>(
      `[data-testid="rate-plan-guest-quantity-select-${id}-base-quantity-plus-button"]`,
    )!,
  };
}

describe("Cloudbeds bedding quantity limits", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    setCloudbedsBeddingAvailability(null, document);
    document.documentElement.removeAttribute("data-hotel-active-rate-plan-test-id");
    document.documentElement.removeAttribute("data-hotel-active-bedding-max-rooms");
    document.documentElement.removeAttribute("data-hotel-active-bedding-label");
    window.sessionStorage.clear();
  });

  it("limits Doble Estandar matrimonial rooms to two", () => {
    const id = "227179928547456";
    const card = renderCard(id, "Doble Estandar");
    const { input, plus } = openQuantityPopover(card, id);

    expect(input.readOnly).toBe(true);
    expect(input.max).toBe("2");
    expect(document.body.textContent).toContain(
      "Máximo para Matrimonial: 2 habitaciones",
    );

    plus.click();
    expect(input.value).toBe("2");
    plus.click();
    expect(input.value).toBe("2");
  });

  it("allows all four Doble Estandar rooms when twin is selected", () => {
    const id = "227179928547456";
    const card = renderCard(id, "Doble Estandar");

    card
      .querySelector<HTMLButtonElement>(
        "[data-hotel-bedding-option='dos_camas_separadas']",
      )
      ?.click();

    const { input, plus } = openQuantityPopover(card, id);

    expect(input.max).toBe("4");
    plus.click();
    plus.click();
    plus.click();
    expect(input.value).toBe("4");
    plus.click();
    expect(input.value).toBe("4");
  });

  it("limits Doble Superior twin rooms to three", () => {
    const id = "229741541683392";
    const card = renderCard(id, "Doble Superior");

    card
      .querySelector<HTMLButtonElement>(
        "[data-hotel-bedding-option='dos_camas_separadas']",
      )
      ?.click();

    const { input, plus } = openQuantityPopover(card, id);

    expect(input.max).toBe("3");
    plus.click();
    plus.click();
    expect(input.value).toBe("3");
    plus.click();
    expect(input.value).toBe("3");
  });

  it("uses dated backend counters and disables an unavailable layout", () => {
    const id = "229741541683392";

    setCloudbedsBeddingAvailability(
      {
        mappingComplete: true,
        roomTypes: {
          [id]: {
            totalAvailable: 2,
            options: {
              matrimonial: 2,
              dos_camas_separadas: 0,
            },
          },
        },
      },
      document,
    );

    const card = renderCard(id, "Doble Superior");
    const twinButton = card.querySelector<HTMLButtonElement>(
      "[data-hotel-bedding-option='dos_camas_separadas']",
    );
    const { input, plus } = openQuantityPopover(card, id);

    expect(twinButton?.disabled).toBe(true);
    expect(input.max).toBe("2");
    plus.click();
    plus.click();
    expect(input.value).toBe("2");
  });
});
