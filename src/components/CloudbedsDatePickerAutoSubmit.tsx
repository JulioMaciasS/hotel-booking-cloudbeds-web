"use client";

import { useEffect } from "react";

const DISABLED_IN_DEVELOPMENT = process.env.NODE_ENV === "development";
const PICKER_SELECTOR = "cb-property-date-picker";
const CHECKOUT_SELECTOR =
  '[data-testid="property-date-picker-date-picker-checkout-input"]';
const SEARCH_SELECTOR =
  '[data-testid="property-date-picker-search-button"]';

function isSearchReady(picker: Element) {
  const checkout = picker.querySelector<HTMLButtonElement>(CHECKOUT_SELECTOR);
  const search = picker.querySelector<HTMLButtonElement>(SEARCH_SELECTOR);

  if (!checkout || !search) return false;

  const checkoutLabel = checkout.getAttribute("aria-label") ?? "";
  const hasCheckoutDate = checkoutLabel.includes(",");
  const searchDisabled =
    search.disabled || search.getAttribute("aria-disabled") === "true";

  return hasCheckoutDate && !searchDisabled;
}

/**
 * Cloudbeds intentionally requires a separate click after both dates are
 * selected. Its public component exposes no auto-submit option, so watch its
 * stable data-testid controls and click Search only when the picker changes
 * from an incomplete state to a complete date range.
 */
export function CloudbedsDatePickerAutoSubmit() {
  useEffect(() => {
    if (DISABLED_IN_DEVELOPMENT) return;

    let wasReady: boolean | null = null;
    let submitTimer: number | null = null;

    const inspect = () => {
      const picker = document.querySelector(PICKER_SELECTOR);
      if (!picker) return;

      const ready = isSearchReady(picker);
      const becameReady = wasReady === false && ready;
      wasReady = ready;

      if (!becameReady || submitTimer !== null) return;

      // Let Cloudbeds finish closing the calendar and committing its internal
      // date state before invoking the same native action as its Search button.
      submitTimer = window.setTimeout(() => {
        submitTimer = null;
        const currentPicker = document.querySelector(PICKER_SELECTOR);
        if (!currentPicker || !isSearchReady(currentPicker)) return;

        currentPicker
          .querySelector<HTMLButtonElement>(SEARCH_SELECTOR)
          ?.click();
      }, 100);
    };

    const pickerObserver = new MutationObserver(inspect);
    const bindPicker = () => {
      const picker = document.querySelector(PICKER_SELECTOR);
      if (!picker) return false;

      inspect();
      pickerObserver.observe(picker, {
        attributes: true,
        attributeFilter: ["aria-disabled", "aria-label", "disabled"],
        childList: true,
        subtree: true,
      });
      return true;
    };

    const mountObserver = new MutationObserver(() => {
      if (bindPicker()) mountObserver.disconnect();
    });

    if (!bindPicker()) {
      mountObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      mountObserver.disconnect();
      pickerObserver.disconnect();
      if (submitTimer !== null) window.clearTimeout(submitTimer);
    };
  }, []);

  return null;
}
