import { beforeEach, describe, expect, it } from "vitest";
import {
  injectCloudbedsBeddingSelectors,
  readCloudbedsBeddingPreference,
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
    const minus = popover.querySelector<HTMLButtonElement>("[aria-label='minus']");
    const plus = popover.querySelector<HTMLButtonElement>("[aria-label='add']");
    minus?.addEventListener("click", () => {
      if (input) {
        input.value = String(Math.max(1, Number(input.value) - 1));
      }
    });
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

function getCounterButton(
  option: string,
  action: "decrement" | "increment",
) {
  return document.querySelector<HTMLButtonElement>(
    `[data-hotel-bedding-counter-option="${option}"][data-hotel-bedding-counter-action="${action}"]`,
  )!;
}

function getCounterCount(option: string) {
  return document.querySelector<HTMLElement>(
    `[data-hotel-bedding-counter-count="${option}"]`,
  )!.textContent;
}

function getTotalSelected() {
  return document.querySelector<HTMLElement>("[data-hotel-bedding-total]")!
    .dataset.selected;
}

function getTotalMax() {
  return document.querySelector<HTMLElement>("[data-hotel-bedding-total]")!
    .dataset.max;
}

describe("Cloudbeds bedding quantity limits", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    setCloudbedsBeddingAvailability(null, document);
    document.documentElement.removeAttribute("data-hotel-active-rate-plan-test-id");
    document.documentElement.removeAttribute("data-hotel-active-bedding-selector");
    document.documentElement.removeAttribute("data-hotel-active-bedding-max-rooms");
    document.documentElement.removeAttribute("data-hotel-active-bedding-label");
    window.sessionStorage.clear();
  });

  it("limits Doble Estandar matrimonial rooms to two", () => {
    const id = "227179928547456";
    const card = renderCard(id, "Doble Estandar");
    const { input } = openQuantityPopover(card, id);
    const matrimonialPlus = getCounterButton("matrimonial", "increment");

    expect(input.readOnly).toBe(true);
    expect(input.max).toBe("4");
    expect(getCounterCount("matrimonial")).toBe("1");
    expect(getTotalSelected()).toBe("1");
    expect(getTotalMax()).toBe("4");

    matrimonialPlus.click();
    expect(getCounterCount("matrimonial")).toBe("2");
    expect(input.value).toBe("2");
    matrimonialPlus.click();
    expect(getCounterCount("matrimonial")).toBe("2");
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

    const { input } = openQuantityPopover(card, id);
    const twinPlus = getCounterButton("dos_camas_separadas", "increment");

    expect(input.max).toBe("4");
    expect(getCounterCount("dos_camas_separadas")).toBe("1");
    twinPlus.click();
    twinPlus.click();
    twinPlus.click();
    expect(getCounterCount("dos_camas_separadas")).toBe("4");
    expect(getTotalSelected()).toBe("4");
    expect(input.value).toBe("4");
    twinPlus.click();
    expect(input.value).toBe("4");
  });

  it("limits Doble Superior twin rooms to three while allowing a mixed total", () => {
    const id = "229741541683392";
    const card = renderCard(id, "Doble Superior");

    card
      .querySelector<HTMLButtonElement>(
        "[data-hotel-bedding-option='dos_camas_separadas']",
      )
      ?.click();

    const { input } = openQuantityPopover(card, id);
    const matrimonialPlus = getCounterButton("matrimonial", "increment");
    const twinPlus = getCounterButton("dos_camas_separadas", "increment");

    expect(input.max).toBe("5");
    expect(getCounterCount("dos_camas_separadas")).toBe("1");
    twinPlus.click();
    twinPlus.click();
    expect(getCounterCount("dos_camas_separadas")).toBe("3");
    expect(input.value).toBe("3");
    twinPlus.click();
    expect(getCounterCount("dos_camas_separadas")).toBe("3");
    expect(input.value).toBe("3");

    matrimonialPlus.click();
    expect(getCounterCount("matrimonial")).toBe("1");
    expect(getCounterCount("dos_camas_separadas")).toBe("3");
    expect(getTotalSelected()).toBe("4");
    expect(input.value).toBe("4");
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
    const twinPlus = getCounterButton("dos_camas_separadas", "increment");
    const matrimonialPlus = getCounterButton("matrimonial", "increment");

    expect(twinButton?.disabled).toBe(true);
    expect(input.max).toBe("2");
    expect(twinPlus.disabled).toBe(true);
    expect(getCounterCount("matrimonial")).toBe("1");
    matrimonialPlus.click();
    expect(getCounterCount("matrimonial")).toBe("2");
    expect(input.value).toBe("2");
    plus.click();
    expect(input.value).toBe("2");
  });

  it("reads stored bedding counts after room cards unmount on checkout", () => {
    window.sessionStorage.setItem(
      "hotel-bedding-counts:227179928547456",
      JSON.stringify({
        dos_camas_separadas: 2,
        matrimonial: 1,
      }),
    );
    document.body.innerHTML = `
      <div data-testid="shopping-cart-card">
        <div data-testid="shopping-cart-item-accommodation-227179928547456-236350098788544">
          Doble Estándar
        </div>
      </div>
    `;

    expect(readCloudbedsBeddingPreference(document)).toBe(
      "227179928547456=matrimonial:1,dos_camas_separadas:2",
    );
  });

  it("does not serialize stale stored bedding counts for removed cart items", () => {
    window.sessionStorage.setItem(
      "hotel-bedding-counts:227179928547456",
      JSON.stringify({
        dos_camas_separadas: 2,
        matrimonial: 1,
      }),
    );
    window.sessionStorage.setItem(
      "hotel-bedding-counts:229741541683392",
      JSON.stringify({
        matrimonial: 1,
      }),
    );
    document.body.innerHTML = `
      <div data-testid="shopping-cart-card">
        <div data-testid="shopping-cart-item-accommodation-229741541683392-236350098788544">
          Doble Superior
        </div>
      </div>
    `;

    expect(readCloudbedsBeddingPreference(document)).toBe(
      "229741541683392=matrimonial:1",
    );
  });
});
