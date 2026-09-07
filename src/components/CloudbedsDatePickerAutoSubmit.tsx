"use client";

import { useEffect } from "react";

const DISABLED_IN_DEVELOPMENT = process.env.NODE_ENV === "development";
const PICKER_SELECTOR = "cb-property-date-picker";
const CHECKIN_SELECTOR =
  '[data-testid="property-date-picker-date-picker-checkin-input"]';
const CHECKOUT_SELECTOR =
  '[data-testid="property-date-picker-date-picker-checkout-input"]';
const SEARCH_SELECTOR =
  '[data-testid="property-date-picker-search-button"]';

function getReadyRange(picker: Element) {
  const checkin = picker.querySelector<HTMLButtonElement>(CHECKIN_SELECTOR);
  const checkout = picker.querySelector<HTMLButtonElement>(CHECKOUT_SELECTOR);
  const search = picker.querySelector<HTMLButtonElement>(SEARCH_SELECTOR);

  if (!checkin || !checkout || !search) return null;

  const checkinLabel = checkin.getAttribute("aria-label") ?? "";
  const checkoutLabel = checkout.getAttribute("aria-label") ?? "";
  const hasCompleteRange =
    checkinLabel.includes(",") && checkoutLabel.includes(",");
  const searchDisabled =
    search.disabled || search.getAttribute("aria-disabled") === "true";

  if (!hasCompleteRange || searchDisabled) return null;

  return `${checkinLabel}\n${checkoutLabel}`;
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

    let initialized = false;
    let submittedRange: string | null = null;
    let pendingRange: string | null = null;
    let submitTimer: number | null = null;

    const inspect = () => {
      const picker = document.querySelector(PICKER_SELECTOR);
      if (!picker) return;

      const readyRange = getReadyRange(picker);

      // A pre-filled picker can be mounted while returning from the booking
      // engine. Treat that range as already handled instead of resubmitting it.
      if (!initialized) {
        initialized = true;
        submittedRange = readyRange;
        return;
      }

      if (!readyRange) {
        pendingRange = null;
        if (submitTimer !== null) {
          window.clearTimeout(submitTimer);
          submitTimer = null;
        }
        return;
      }

      if (readyRange === submittedRange || readyRange === pendingRange) return;

      pendingRange = readyRange;

      // Let Cloudbeds finish closing the calendar and committing its internal
      // date state before invoking the same native action as its Search button.
      submitTimer = window.setTimeout(() => {
        submitTimer = null;
        const currentPicker = document.querySelector(PICKER_SELECTOR);
        if (!currentPicker) {
          pendingRange = null;
          return;
        }

        const currentRange = getReadyRange(currentPicker);
        if (!currentRange || currentRange !== pendingRange) {
          pendingRange = null;
          inspect();
          return;
        }

        // Mark it before clicking. Cloudbeds temporarily disables and then
        // re-enables the button while loading; without this one-shot guard the
        // observer can click repeatedly and restart the search in Chrome.
        submittedRange = currentRange;
        pendingRange = null;

        currentPicker
          .querySelector<HTMLButtonElement>(SEARCH_SELECTOR)
          ?.click();
      }, 150);
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
