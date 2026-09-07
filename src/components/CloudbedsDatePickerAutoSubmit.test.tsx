import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CloudbedsDatePickerAutoSubmit } from "./CloudbedsDatePickerAutoSubmit";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

function addPicker({ ready = false } = {}) {
  const picker = document.createElement("cb-property-date-picker");
  const checkin = document.createElement("button");
  const checkout = document.createElement("button");
  const search = document.createElement("button");

  checkin.dataset.testid =
    "property-date-picker-date-picker-checkin-input";
  checkin.setAttribute(
    "aria-label",
    ready ? "Check-in, 10 sep 2026" : "Check-in",
  );
  checkout.dataset.testid =
    "property-date-picker-date-picker-checkout-input";
  checkout.setAttribute(
    "aria-label",
    ready ? "Check-out, 12 sep 2026" : "Check-out",
  );
  search.dataset.testid = "property-date-picker-search-button";
  search.disabled = !ready;
  picker.append(checkin, checkout, search);
  document.body.appendChild(picker);

  return { checkin, checkout, search };
}

function renderComponent() {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);

  act(() => root.render(<CloudbedsDatePickerAutoSubmit />));
  return root;
}

describe("CloudbedsDatePickerAutoSubmit", () => {
  let root: Root | null = null;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (root) act(() => root?.unmount());
    root = null;
    document.body.innerHTML = "";
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("submits once when checkout completes the date range", async () => {
    const { checkin, checkout, search } = addPicker();
    const click = vi.spyOn(search, "click");
    root = renderComponent();

    checkin.setAttribute("aria-label", "Check-in, 10 sep 2026");
    checkout.setAttribute("aria-label", "Check-out, 12 sep 2026");
    search.disabled = false;
    await act(async () => Promise.resolve());
    act(() => vi.advanceTimersByTime(150));

    expect(click).toHaveBeenCalledTimes(1);
  });

  it("does not click the same range again when Cloudbeds toggles loading", async () => {
    const { checkin, checkout, search } = addPicker();
    const click = vi.spyOn(search, "click");
    root = renderComponent();

    checkin.setAttribute("aria-label", "Check-in, 10 sep 2026");
    checkout.setAttribute("aria-label", "Check-out, 12 sep 2026");
    search.disabled = false;
    await act(async () => Promise.resolve());
    act(() => vi.advanceTimersByTime(150));

    search.disabled = true;
    search.disabled = false;
    await act(async () => Promise.resolve());
    act(() => vi.advanceTimersByTime(300));

    expect(click).toHaveBeenCalledTimes(1);
  });

  it("does not submit a date range that was already complete on mount", () => {
    const { search } = addPicker({ ready: true });
    const click = vi.spyOn(search, "click");
    root = renderComponent();

    act(() => vi.advanceTimersByTime(200));

    expect(click).not.toHaveBeenCalled();
  });
});
