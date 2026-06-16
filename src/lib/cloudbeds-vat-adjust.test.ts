import { afterEach, describe, expect, it } from "vitest";
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

afterEach(() => {
  document.body.innerHTML = "";
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
