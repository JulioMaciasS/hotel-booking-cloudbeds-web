import { beforeEach, describe, expect, it } from "vitest";
import { recordFxCustomFields } from "./cloudbeds-fx-customfields";

describe("Cloudbeds custom-field writer", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    window.sessionStorage.clear();
  });

  it("fills the Cloudbeds-generated bedding preference field alias", () => {
    window.sessionStorage.setItem(
      "hotel-bedding-counts:227179928547456",
      JSON.stringify({
        dos_camas_separadas: 2,
        matrimonial: 1,
      }),
    );
    document.body.innerHTML = `
      <section>
        <div data-testid="shopping-cart-item-accommodation-227179928547456-236350098788544">
          Doble Estándar
        </div>
        <div class="form-field">
          <input
            data-testid="form-custom-field-cf_cf_bedding_preferenc-input"
            name="cf_cf_bedding_preferenc"
            value=""
          />
        </div>
      </section>
    `;

    const filled = recordFxCustomFields({
      arsPerUsd: null,
      documentRef: document,
      fromArgentina: false,
    });
    const field = document.querySelector<HTMLInputElement>(
      "input[name='cf_cf_bedding_preferenc']",
    );

    expect(filled).toBe(true);
    expect(field?.value).toBe(
      "227179928547456=matrimonial:1,dos_camas_separadas:2",
    );
    expect(field?.closest("[data-hotel-fx-field-hidden='true']")).not.toBeNull();
  });
});
