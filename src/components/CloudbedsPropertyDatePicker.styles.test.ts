import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

// jsdom cannot lay out containers. Exercise the actual rules inside each
// container condition against the four-child structure observed in Cloudbeds.
function containerRules(width: number) {
  const marker = `@container landing-date-picker (max-width: ${width}px)`;
  const from = css.indexOf(marker);
  if (from < 0) throw new Error(`Missing ${marker}`);
  const start = css.indexOf("{", from);
  let depth = 1;
  let end = start + 1;
  while (depth > 0 && end < css.length) {
    if (css[end] === "{") depth++;
    if (css[end] === "}") depth--;
    end++;
  }
  return css.slice(start + 1, end - 1);
}

function renderAtContainerWidth(width: number, horizontal = false) {
  document.body.innerHTML = `
    <style>${width <= 1023 ? containerRules(1023) : ""}
      ${width <= 340 ? containerRules(340) : ""}</style>
    <main class="hotel-home"><cb-property-date-picker>
      <div data-testid="property-date-picker"><div class="${horizontal ? "native-horizontal-wrapper" : "chakra-stack"}">
        <div data-testid="property-date-picker-date-picker">
          <div id="calendar-decoration"><span class="calendar-icon"></span></div>
          <button data-testid="property-date-picker-date-picker-checkin-input"><span class="date-field-content"><p>Check-in</p><span class="date-field-width-reference"></span></span></button>
          <div id="arrow-decoration"><span class="arrow-icon"></span></div>
          <button data-testid="property-date-picker-date-picker-checkout-input"><span class="date-field-content"><p>Check-out</p></span></button>
        </div>
        ${horizontal ? "</div>" : ""}
        <button data-testid="property-date-picker-search-button">Consultar disponibilidade</button>
        ${horizontal ? "" : "</div>"}
      </div>
    </cb-property-date-picker></main>
    <cb-immersive-experience><button data-testid="property-date-picker-date-picker-checkin-input">Booking flow</button></cb-immersive-experience>`;
  const row = document.querySelector('[data-testid="property-date-picker-date-picker"]')!;
  const arrival = row.querySelector("button")!;
  const departure = row.querySelectorAll("button")[1];
  return { row, arrival, departure };
}

afterEach(() => { document.body.innerHTML = ""; });

describe("Landing date picker compact presentation", () => {
  it("uses the actual component container, not a viewport-only breakpoint", () => {
    expect(css).toContain("container: landing-date-picker / inline-size");
    expect(css).not.toContain("@media (max-width: 767px)");
  });

  it.each([341, 390, 600, 767, 900, 1023])("keeps both native date buttons on the same row at container width %i", width => {
    const { row, arrival, departure } = renderAtContainerWidth(width);
    expect(row.children.length).toBe(4);
    expect(getComputedStyle(document.querySelector("#calendar-decoration")!).display).toBe("none");
    expect(getComputedStyle(arrival).gridColumn).toBe("1");
    expect(getComputedStyle(departure).gridColumn).toBe("3");
    expect(getComputedStyle(arrival).gridRow).toBe("1");
    expect(getComputedStyle(departure).gridRow).toBe("1");
    expect(getComputedStyle(arrival).minHeight).toBe("56px");
    expect(getComputedStyle(row.querySelector(".date-field-width-reference")!).display).toBe("none");
    expect(getComputedStyle(document.querySelector('[data-testid="property-date-picker-search-button"]')!).width).toBe("100%");
    expect(getComputedStyle(document.querySelector('cb-immersive-experience button')!).minHeight).not.toBe("56px");
  });

  it.each([248, 280, 320, 340])("uses whole-width date rows in a narrow %ipx container", width => {
    const { arrival, departure } = renderAtContainerWidth(width);
    expect(getComputedStyle(arrival).gridColumn).toBe("1");
    expect(getComputedStyle(departure).gridColumn).toBe("1");
    expect(getComputedStyle(departure).gridRow).toBe("2");
    expect(getComputedStyle(document.querySelector("#arrow-decoration")!).display).toBe("none");
  });

  it("leaves the wide desktop date controls to the native component", () => {
    const { arrival } = renderAtContainerWidth(1024);
    expect(getComputedStyle(arrival).gridColumn).toBe("");
    expect(getComputedStyle(arrival).minHeight).not.toBe("56px");
  });

  it("stacks the search button in the horizontal tablet markup without relying on Chakra classes", () => {
    renderAtContainerWidth(900, true);
    const card = document.querySelector('[data-testid="property-date-picker"]')!;
    expect(card.querySelector(".chakra-stack")).toBeNull();
    expect(getComputedStyle(card).display).toBe("flex");
    expect(getComputedStyle(card).flexDirection).toBe("column");
    expect(getComputedStyle(card.children[0]).width).toBe("100%");
    expect(card.children[1].getAttribute("data-testid")).toBe("property-date-picker-search-button");
    expect(getComputedStyle(card.children[1]).width).toBe("100%");
  });
});
