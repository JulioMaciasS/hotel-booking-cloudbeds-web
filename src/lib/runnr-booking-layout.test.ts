import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { syncRunnrBookingLayout, watchRunnrBookingLayout } from "./runnr-booking-layout";

const rect = (left: number, top: number, width: number, height: number) =>
  ({ x: left, y: top, left, top, width, height, right: left + width, bottom: top + height, toJSON() {} }) as DOMRect;
function box(selector: string, bounds: DOMRect) {
  vi.spyOn(document.querySelector(selector)!, "getBoundingClientRect").mockReturnValue(bounds);
}
beforeEach(() => {
  document.body.innerHTML = `<main class="reservation-page"><button id="native-action">Add</button><div id="banner" style="position:fixed"><button data-testid="shopping-cart-banner-confirm-button">Reserve</button></div></main><div id="runnrai-container"><button class="wdc-launcher" aria-label="Chat"><span class="wdc-launcher--text">Chat</span></button><div class="wdc-chat-window"><input id="chat-input" /></div></div>`;
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
  vi.stubGlobal("innerHeight", 844);
  box(".wdc-launcher", rect(330, 700, 48, 48));
  box("#native-action", rect(20, 100, 120, 40));
  box("#banner", rect(0, 760, 390, 84));
  box('[data-testid="shopping-cart-banner-confirm-button"]', rect(202, 778, 172, 48));
});
afterEach(() => {
  document.body.innerHTML = "";
  delete document.documentElement.dataset.runnrBookingBlocked;
  document.documentElement.style.removeProperty("--runnr-booking-bottom");
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Runnr mobile booking layout", () => {
  it("measures the entire native cart banner without changing native controls or chat", () => {
    const original = document.body.innerHTML;
    syncRunnrBookingLayout();
    expect(document.documentElement.style.getPropertyValue("--runnr-booking-bottom")).toBe("96px");
    expect(document.documentElement.dataset.runnrBookingBlocked).toBeUndefined();
    expect(document.body.innerHTML).toBe(original);
  });

  it("adapts to a taller banner and removes the offset when the banner disappears", () => {
    box("#banner", rect(0, 710, 390, 134));
    syncRunnrBookingLayout();
    expect(document.documentElement.style.getPropertyValue("--runnr-booking-bottom")).toBe("146px");
    document.querySelector("#banner")!.remove();
    syncRunnrBookingLayout();
    expect(document.documentElement.style.getPropertyValue("--runnr-booking-bottom")).toBe("16px");
  });

  it("also measures a banner portaled outside the booking host", () => {
    document.body.appendChild(document.getElementById("banner")!);
    syncRunnrBookingLayout();
    expect(document.documentElement.style.getPropertyValue("--runnr-booking-bottom")).toBe("96px");
  });

  it("suppresses the launcher for a portal dialog but does not unmount the conversation", () => {
    document.body.insertAdjacentHTML("beforeend", '<div role="dialog" id="selector">Guests</div>');
    box("#selector", rect(0, 0, 390, 844));
    const chat = document.querySelector(".wdc-chat-window");
    syncRunnrBookingLayout();
    expect(document.documentElement.dataset.runnrBookingBlocked).toBe("true");
    expect(chat?.isConnected).toBe(true);
    document.querySelector("#selector")!.remove();
    syncRunnrBookingLayout();
    expect(document.documentElement.dataset.runnrBookingBlocked).toBeUndefined();
  });

  it("ignores hidden dialogs and Runnr's own dialog", () => {
    document.body.insertAdjacentHTML("beforeend", '<div role="dialog" hidden id="hidden-dialog">Old dialog</div>');
    box("#hidden-dialog", rect(0, 0, 390, 844));
    document.querySelector(".wdc-chat-window")!.setAttribute("role", "dialog");
    box(".wdc-chat-window", rect(0, 0, 390, 844));
    syncRunnrBookingLayout();
    expect(document.documentElement.dataset.runnrBookingBlocked).toBeUndefined();
  });

  it("hides on a control collision and recovers when scrolling clears it", () => {
    box("#native-action", rect(312, 710, 64, 40));
    syncRunnrBookingLayout();
    expect(document.documentElement.dataset.runnrBookingBlocked).toBe("true");
    box("#native-action", rect(312, 300, 64, 40));
    syncRunnrBookingLayout();
    expect(document.documentElement.dataset.runnrBookingBlocked).toBeUndefined();
  });

  it("suppresses the launcher while editing booking fields, not when typing in chat", () => {
    document.querySelector(".reservation-page")!.insertAdjacentHTML("beforeend", '<input id="guest-name" />');
    (document.getElementById("guest-name") as HTMLInputElement).focus();
    syncRunnrBookingLayout();
    expect(document.documentElement.dataset.runnrBookingBlocked).toBe("true");
    (document.getElementById("chat-input") as HTMLInputElement).focus();
    syncRunnrBookingLayout();
    expect(document.documentElement.dataset.runnrBookingBlocked).toBeUndefined();
  });

  it("does not change marketing or desktop behavior", () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    syncRunnrBookingLayout();
    expect(document.documentElement.style.getPropertyValue("--runnr-booking-bottom")).toBe("");
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    document.querySelector("main")!.className = "marketing-page";
    syncRunnrBookingLayout();
    expect(document.documentElement.style.getPropertyValue("--runnr-booking-bottom")).toBe("");
  });

  it("cleans observers and layout state without removing widget or native nodes", () => {
    vi.spyOn(window, "requestAnimationFrame").mockReturnValue(42);
    const cancel = vi.spyOn(window, "cancelAnimationFrame");
    const stop = watchRunnrBookingLayout();
    window.dispatchEvent(new Event("resize"));
    stop();
    expect(cancel).toHaveBeenCalledWith(42);
    expect(document.documentElement.style.getPropertyValue("--runnr-booking-bottom")).toBe("");
    expect(document.querySelector(".wdc-chat-window")?.isConnected).toBe(true);
    expect(document.querySelector("#native-action")?.textContent).toBe("Add");
  });
});
