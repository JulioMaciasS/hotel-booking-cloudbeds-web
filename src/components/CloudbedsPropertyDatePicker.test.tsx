import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CloudbedsPropertyDatePicker } from "./CloudbedsPropertyDatePicker";

vi.mock("@/i18n/navigation", () => ({
  getPathname: ({ locale, href }: { locale: string; href: string }) =>
    locale === "es" ? href : `/${locale}${href}`,
}));

describe("CloudbedsPropertyDatePicker responsive layout", () => {
  let root: Root | null = null;
  let mobile = true;
  let listeners: Set<() => void>;
  const removeListener = vi.fn((event: string, listener: () => void) => listeners.delete(listener));

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    mobile = true;
    listeners = new Set();
    vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
      matches: mobile && query === "(max-width: 767px)",
      addEventListener: (event: string, listener: () => void) => listeners.add(listener),
      removeEventListener: removeListener,
    })));
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  function render(locale = "es") {
    const host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    act(() => root!.render(<CloudbedsPropertyDatePicker
      buttonLabel="Buscar disponibilidad" currency="ARS" island="us2"
      locale={locale} propertyCode="5fdNYA"
    />));
    return host.querySelector("cb-property-date-picker")!;
  }

  it.each(["es", "en", "pt"])("uses the native vertical mobile layout in %s without changing booking attributes", locale => {
    const picker = render(locale);
    expect(picker.getAttribute("layout")).toBe("vertical");
    expect(picker.getAttribute("custom-url")).toBe(new URL(locale === "es" ? "/reservas" : `/${locale}/reservas`, window.location.origin).toString());
    expect(picker.getAttribute("button-label")).toBe("Buscar disponibilidad");
    expect(picker.getAttribute("currency")).toBe("ARS");
    expect(picker.getAttribute("property-code")).toBe("5fdNYA");
    expect(picker.getAttribute("open-in-new-tab")).toBe("false");
  });

  it("keeps the horizontal layout on desktop", () => {
    mobile = false;
    expect(render().getAttribute("layout")).toBe("horizontal");
  });

  it("updates the layout across the breakpoint without replacing the component and cleans up", () => {
    const picker = render();
    act(() => {
      mobile = false;
      listeners.forEach(listener => listener());
    });
    expect(document.querySelector("cb-property-date-picker")).toBe(picker);
    expect(picker.getAttribute("layout")).toBe("horizontal");
    act(() => {
      mobile = true;
      listeners.forEach(listener => listener());
    });
    expect(picker.getAttribute("layout")).toBe("vertical");
    act(() => root?.unmount());
    root = null;
    expect(removeListener).toHaveBeenCalled();
    expect(listeners.size).toBe(0);
  });
});
