import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ArgentinaVatToggle } from "./ArgentinaVatToggle";

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = ((key: string) => key) as ((key: string) => string) & {
      rich: (key: string) => string;
    };
    t.rich = (key: string) => key;
    return t;
  },
}));

declare global {
  // React uses this test flag to suppress act() environment warnings.
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

function renderComponent() {
  const host = document.createElement("div");
  document.body.appendChild(host);

  const root = createRoot(host);
  act(() => {
    root.render(<ArgentinaVatToggle />);
  });

  return { host, root };
}

function click(element: Element) {
  act(() => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

describe("ArgentinaVatToggle", () => {
  let root: Root | null = null;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
      root = null;
    }
    document.body.innerHTML = "";
    document.body.style.overflow = "";
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders the VAT info modal as a full-screen body portal above the reservation navbar", () => {
    ({ root } = renderComponent());

    const infoButton = document.querySelector(
      'button[aria-label="vat.infoButtonLabel"]',
    );
    expect(infoButton).not.toBeNull();

    click(infoButton!);

    const dialog = document.querySelector<HTMLElement>(
      '[data-testid="vat-info-dialog"]',
    );
    expect(dialog).not.toBeNull();
    expect(dialog?.parentElement).toBe(document.body);
    expect(dialog?.classList.contains("fixed")).toBe(true);
    expect(dialog?.classList.contains("inset-0")).toBe(true);
    expect(dialog?.classList.contains("bg-black/55")).toBe(true);
    expect(dialog?.style.zIndex).toBe("2147483647");
    expect(document.body.style.overflow).toBe("hidden");

    const backdrop = dialog?.querySelector('[data-testid="vat-info-backdrop"]');
    expect(backdrop).not.toBeNull();

    click(backdrop!);

    expect(
      document.querySelector('[data-testid="vat-info-dialog"]'),
    ).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });
});
