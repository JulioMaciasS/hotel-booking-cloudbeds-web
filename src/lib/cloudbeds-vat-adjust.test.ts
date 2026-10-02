import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyCloudbedsVatDisplay } from "./cloudbeds-vat-adjust";

/** A converted price span, as produced by BookingPriceObserver. */
function usd(value: string, original: string): string {
  return `<span data-hotel-currency-converted="true" data-original-currency-text="${original}">${value}</span>`;
}

/** One "label … value" charge/summary row mirroring Cloudbeds' nesting depth. */
function row(label: string, valueHtml: string): string {
  return `
    <div class="cb-row"><div class="cb-line">
      <div><p>${label}</p></div>
      <div class="cb-spacer"></div>
      <div><div class="cb-value"><p>${valueHtml}</p></div></div>
    </div></div>`;
}

/**
 * The confirmation "Thank you for your order!" Charges card: an Accommodations
 * (net) line, an IVA line, and Total + Balance Due grand totals — but no
 * "Subtotal" label and no grand-total testid.
 */
function confirmationCard(
  opts: { amountPaid?: string; balance?: string } = {},
): string {
  const amountPaid = opts.amountPaid ?? "0.00";
  const balance = opts.balance ?? usd("$87.12", "ARS 126,324.00");

  return `
    <div data-testid="shopping-cart-card">
      <div><h4>Charges</h4></div>
      <div class="cb-rows">
        ${row("Accommodations", usd("$72.00", "104,400.00"))}
        ${row("Add-ons and Extras", "0.00")}
        ${row("Taxes and fees", usd("$15.12", "21,924.00"))}
        ${row("Total", usd("$87.12", "ARS 126,324.00"))}
        ${row("Amount Paid", amountPaid)}
        ${row("Balance Due", balance)}
      </div>
    </div>`;
}

function valueByLabel(label: string): string {
  const labelEl = Array.from(document.querySelectorAll("p")).find(
    (p) => p.textContent?.trim() === label,
  );
  const valueEl = labelEl
    ?.closest(".cb-line")
    ?.querySelector(".cb-value");
  return valueEl?.textContent?.trim() ?? "";
}

function taxRowHidden(): boolean {
  const hidden = document.querySelector('[data-hotel-iva-hidden="true"]');
  return hidden?.textContent?.includes("Taxes and fees") ?? false;
}

beforeEach(() => {
  document.documentElement.lang = "es";
});

afterEach(() => {
  document.body.innerHTML = "";
  document.documentElement.lang = "es";
});

describe("confirmation page VAT display", () => {
  it("strips IVA from the totals for a resident abroad", () => {
    document.body.innerHTML = confirmationCard();

    applyCloudbedsVatDisplay(false);

    expect(taxRowHidden()).toBe(true);
    expect(valueByLabel("Total")).toBe("$72.00");
    expect(valueByLabel("Balance Due")).toBe("$72.00");
    // Pre-tax breakdown lines and money already paid are never rewritten.
    expect(valueByLabel("Accommodations")).toBe("$72.00");
    expect(valueByLabel("Amount Paid")).toBe("0.00");
    expect(document.querySelector(".hotel-iva-note")).not.toBeNull();
    // The note anchors inside the Charges card, not at the end of <body>.
    expect(
      document
        .querySelector('[data-testid="shopping-cart-card"]')
        ?.querySelector(".hotel-iva-note"),
    ).not.toBeNull();
  });

  it("keeps Cloudbeds' IVA-inclusive totals for an Argentine resident", () => {
    document.body.innerHTML = confirmationCard();

    applyCloudbedsVatDisplay(true);

    expect(taxRowHidden()).toBe(false);
    expect(valueByLabel("Total")).toBe("$87.12");
    expect(valueByLabel("Balance Due")).toBe("$87.12");
    expect(document.querySelector(".hotel-iva-note")).toBeNull();
  });

  it("restores the IVA-inclusive view when switching back to Argentina", () => {
    document.body.innerHTML = confirmationCard();

    applyCloudbedsVatDisplay(false);
    applyCloudbedsVatDisplay(true);

    expect(taxRowHidden()).toBe(false);
    expect(valueByLabel("Total")).toBe("$87.12");
    expect(valueByLabel("Balance Due")).toBe("$87.12");
    expect(document.querySelector(".hotel-iva-note")).toBeNull();
  });

  it("derives the net from the original total on repeated passes (no compounding)", () => {
    document.body.innerHTML = confirmationCard();

    applyCloudbedsVatDisplay(false);
    applyCloudbedsVatDisplay(false);
    applyCloudbedsVatDisplay(false);

    expect(valueByLabel("Total")).toBe("$72.00");
    expect(valueByLabel("Balance Due")).toBe("$72.00");
  });

  it("leaves an already-paid balance untouched (prepaid booking)", () => {
    document.body.innerHTML = confirmationCard({
      amountPaid: usd("$87.12", "ARS 126,324.00"),
      balance: "0.00",
    });

    applyCloudbedsVatDisplay(false);

    // The grand total still drops, but a zero balance must not become $72.00.
    expect(valueByLabel("Total")).toBe("$72.00");
    expect(valueByLabel("Balance Due")).toBe("0.00");
    expect(valueByLabel("Amount Paid")).toBe("$87.12");
  });
});

/**
 * The booking-page shopping cart (Subtotal + Total + Deposit, with a grand-total
 * testid) must keep working unchanged after the confirmation-page refactor.
 */
function bookingCart(): string {
  return `
    <aside data-testid="shopping-cart">
      <div class="cb-rows">
        ${row("Subtotal", usd("$100.00", "ARS 145,000.00"))}
        ${row("Taxes and fees", usd("$21.00", "ARS 30,450.00"))}
        ${row(
          "Total",
          `<span data-testid="shopping-cart-grand-total">${usd("$121.00", "ARS 175,450.00")}</span>`,
        )}
        ${row("Deposit", usd("$60.50", "ARS 87,725.00"))}
      </div>
    </aside>`;
}

describe("booking page VAT display (regression)", () => {
  it("drops the total to the subtotal and scales the deposit when abroad", () => {
    document.body.innerHTML = bookingCart();

    applyCloudbedsVatDisplay(false);

    expect(taxRowHidden()).toBe(true);
    expect(valueByLabel("Total")).toBe("$100.00");
    expect(valueByLabel("Deposit")).toBe("$50.00");
  });

  it("restores the IVA-inclusive total and deposit for an Argentine resident", () => {
    document.body.innerHTML = bookingCart();

    applyCloudbedsVatDisplay(false);
    applyCloudbedsVatDisplay(true);

    expect(taxRowHidden()).toBe(false);
    expect(valueByLabel("Total")).toBe("$121.00");
    expect(valueByLabel("Deposit")).toBe("$60.50");
  });
});

describe("localized VAT summaries", () => {
  it.each(["Impostos e taxas", "Impostos", "Taxas e impostos"])("adjusts Portuguese %s, deposit and balance with the same tax rules", (taxLabel) => {
    document.documentElement.lang = "pt-BR";
    document.body.innerHTML = `<aside class="cb-rows">
      ${row("Subtotal", usd("$100.00", "ARS 145,000.00"))}
      ${row(taxLabel, usd("$21.00", "ARS 30,450.00"))}
      ${row("Total", usd("$121.00", "ARS 175,450.00"))}
      ${row("Saldo a pagar", usd("$121.00", "ARS 175,450.00"))}
      ${row("Pagar agora", usd("$60.50", "ARS 87,725.00"))}
      ${row("Valor pago", usd("$0.00", "ARS 0.00"))}
    </aside><article class="cb-rate-plan"><p>Preço a partir de</p><p class="cb-rate-plan-price">${usd("$100.00", "ARS 145,000.00")}</p></article>`;
    applyCloudbedsVatDisplay(false);
    applyCloudbedsVatDisplay(false);
    expect(valueByLabel("Total")).toBe("$100.00");
    expect(valueByLabel("Saldo a pagar")).toBe("$100.00");
    expect(valueByLabel("Pagar agora")).toBe("$50.00");
    expect(valueByLabel("Valor pago")).toBe("$0.00");
    expect(document.querySelector('[data-hotel-iva-hidden="true"]')?.textContent).toContain(taxLabel);
    expect(document.querySelector(".hotel-iva-card-tag")?.textContent).toBe("Isento de IVA");
    expect(document.querySelector(".hotel-iva-note")?.textContent).toBe("Isento de IVA — residente no exterior (não paga IVA de 21%).");
    applyCloudbedsVatDisplay(true);
    expect(valueByLabel("Total")).toBe("$121.00");
    expect(valueByLabel("Saldo a pagar")).toBe("$121.00");
    expect(valueByLabel("Pagar agora")).toBe("$60.50");
    expect(document.querySelector(".hotel-iva-note")).toBeNull();
    expect(document.querySelector(".hotel-iva-card-tag")?.textContent).toBe("+ IVA 21%");
  });

  it("updates the existing exemption note after a locale change", () => {
    document.body.innerHTML = bookingCart();
    applyCloudbedsVatDisplay(false);
    expect(document.querySelector(".hotel-iva-note")?.textContent).toContain("IVA exento");
    document.documentElement.lang = "en";
    applyCloudbedsVatDisplay(false);
    expect(document.querySelectorAll(".hotel-iva-note")).toHaveLength(1);
    expect(document.querySelector(".hotel-iva-note")?.textContent).toBe("VAT exempt — resident abroad (no 21% VAT).");
    expect(valueByLabel("Total")).toBe("$100.00");
  });
});

function rateRow(id: string, price = usd("$45.00", "ARS 68,850.00")) {
  return `<div class="cb-rate-plan" data-testid="rate-plan-227179928547456-${id}">
    <p>Precio desde</p>
    <p class="cb-rate-plan-price">${price}</p>
    <button data-testid="rate-plan-guest-quantity-select-227179928547456-${id}">Añadir</button>
  </div>`;
}

describe("VAT tags are scoped to real Cloudbeds rate prices", () => {
  it.each([
    ["es", "Precio desde", "+ IVA 21%", "IVA exento"],
    ["en", "Price from", "+ VAT 21%", "VAT exempt"],
    ["pt-BR", "Preço a partir de", "+ IVA 21%", "Isento de IVA"],
  ])("never annotates a calendar, hydration script or unrelated copy in %s", (locale, label, included, exempt) => {
    document.documentElement.lang = locale;
    document.body.innerHTML = `
      <script>self.__next_f.push([1, 'check-in a partir de las 14:00; ${label}'])</script>
      <style>/* ${label} */</style>
      <template><p>${label}</p>${usd("$39", "60 K")}</template>
      <section><p>Check-in a partir de las 14:00</p><p>${label}</p></section>
      <div class="cb-calendar-days" role="grid">
        <div class="cb-calendar-day" role="gridcell"><p data-testid="day-2026-10-02-lowest-rate-74970">${usd("$49", "75 K")}</p></div>
      </div>
      ${rateRow("236350098788544").replace("Precio desde", label)}
      ${rateRow("236350098788545").replace("Precio desde", label)}
    `;

    applyCloudbedsVatDisplay(true);
    applyCloudbedsVatDisplay(true);
    expect(document.querySelectorAll(".hotel-iva-card-tag")).toHaveLength(2);
    expect(document.querySelector(".cb-calendar-days .hotel-iva-card-tag")).toBeNull();
    expect(document.querySelector("section .hotel-iva-card-tag")).toBeNull();
    expect(document.querySelector("[data-testid*='lowest-rate']")?.textContent).toBe("$49");
    for (const price of document.querySelectorAll(".cb-rate-plan-price")) {
      expect(price.querySelector(".hotel-iva-card-tag")?.textContent).toBe(included);
      expect(price.querySelector("[data-hotel-currency-converted]")?.nextElementSibling?.className).toBe("hotel-iva-card-tag");
    }
    applyCloudbedsVatDisplay(false);
    expect(document.querySelectorAll(".hotel-iva-card-tag")).toHaveLength(2);
    expect(Array.from(document.querySelectorAll(".hotel-iva-card-tag")).map(el => el.textContent)).toEqual([exempt, exempt]);
  });

  it("cleans orphaned and duplicate tags and anchors only to the selling price", () => {
    const staleTag = '<span class="hotel-iva-card-tag">+ IVA 21%</span>';
    document.body.innerHTML = `
      <div class="cb-calendar-day"><p>${usd("$49", "75 K")}${staleTag}</p></div>
      ${staleTag}
      <div class="cb-rate-plan">
        <p>Precio desde${staleTag}</p>
        <p class="text-decoration">${usd("$50.00", "76,500.00")}${staleTag}</p>
        <p class="cb-rate-plan-price">${usd("$45.00", "68,850.00")}${staleTag}${staleTag}</p>
        <span data-hotel-cloudbeds-best-rate-badge="true">Mejor precio</span>
      </div>`;

    applyCloudbedsVatDisplay(true);
    applyCloudbedsVatDisplay(true);
    expect(document.querySelectorAll(".hotel-iva-card-tag")).toHaveLength(1);
    expect(document.querySelector(".cb-rate-plan-price")?.textContent).toBe("$45.00+ IVA 21%");
    expect(document.querySelector(".text-decoration")?.textContent).toBe("$50.00");
    expect(document.querySelector("[data-hotel-cloudbeds-best-rate-badge]")?.textContent).toBe("Mejor precio");
  });

  it("waits for a converted rate price instead of falling back to the calendar", () => {
    document.body.innerHTML = `<div class="cb-calendar-day">${usd("$49", "75 K")}</div>${rateRow("236350098788544", "68,850.00")}`;
    applyCloudbedsVatDisplay(true);
    expect(document.querySelector(".hotel-iva-card-tag")).toBeNull();
    document.querySelector(".cb-rate-plan-price")!.innerHTML = usd("$45.00", "68,850.00");
    applyCloudbedsVatDisplay(true);
    expect(document.querySelectorAll(".hotel-iva-card-tag")).toHaveLength(1);

    // Cloudbeds replaces only the price while streaming its next results.
    document.querySelector(".cb-rate-plan-price")!.innerHTML = "73,440.00";
    applyCloudbedsVatDisplay(true);
    expect(document.querySelector(".hotel-iva-card-tag")).toBeNull();
    document.querySelector(".cb-rate-plan-price")!.innerHTML = usd("$48.00", "73,440.00");
    applyCloudbedsVatDisplay(true);
    expect(document.querySelector(".cb-rate-plan-price")?.textContent).toBe("$48.00+ IVA 21%");
  });

  it.each(["hidden", 'aria-hidden="true"', 'data-hotel-cloudbeds-rate-plan-hidden="true"'])("skips %s rate rows and removes their old tags", (hiddenAttribute) => {
    document.body.innerHTML = `<section ${hiddenAttribute}>${rateRow("278686453629056")}</section>${rateRow("236350098788544")}`;
    document.querySelector("section .cb-rate-plan-price")!.insertAdjacentHTML("beforeend", '<span class="hotel-iva-card-tag">+ IVA 21%</span>');
    applyCloudbedsVatDisplay(true);
    expect(document.querySelector("section .hotel-iva-card-tag")).toBeNull();
    expect(document.querySelectorAll(".hotel-iva-card-tag")).toHaveLength(1);
  });

  it("accepts complete rate-row testids without misidentifying quantity controls", () => {
    document.body.innerHTML = rateRow("base").replace('class="cb-rate-plan"', "") +
      `<div data-testid="rate-plan-quantity-select-227179928547456-236350098788544"><p class="cb-rate-plan-price">${usd("$45.00", "68,850.00")}</p></div>`;
    applyCloudbedsVatDisplay(true);
    expect(document.querySelectorAll(".hotel-iva-card-tag")).toHaveLength(1);
    expect(document.querySelector("[data-testid='rate-plan-227179928547456-base'] .hotel-iva-card-tag")).not.toBeNull();
    expect(document.querySelector("[data-testid^='rate-plan-quantity-select'] .hotel-iva-card-tag")).toBeNull();
  });

  it("does not mistake a price testid inside a real rate row for another row", () => {
    document.body.innerHTML = rateRow("236350098788544").replace(
      'class="cb-rate-plan-price"',
      'class="cb-rate-plan-price" data-testid="rate-plan-price-227179928547456-236350098788544"',
    );
    applyCloudbedsVatDisplay(true);
    expect(document.querySelectorAll(".hotel-iva-card-tag")).toHaveLength(1);
    expect(document.querySelector(".cb-rate-plan-price")?.textContent).toBe("$45.00+ IVA 21%");
  });
});
