"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  convertArsToUsd,
  formatUsd,
  formatUsdWhole,
  isCalendarRateTextNode,
  isCloudbedsBarePriceTextNode,
  parseCloudbedsArsMoney,
  parseArsMoney,
  shouldConvertTextNode,
} from "@/lib/currency";
import {
  injectCloudbedsBeddingSelectors,
  setCloudbedsBeddingAvailability,
  syncCloudbedsBeddingSelections,
} from "@/lib/cloudbeds-bedding-selector";
import { fetchCloudbedsBeddingAvailability } from "@/lib/cloudbeds-bedding-availability-client";
import {
  hideCloudbedsCurrencyControls,
  injectCloudbedsDomAdjustmentStyles,
} from "@/lib/hide-cloudbeds-currency-controls";
import { relabelCloudbedsCurrencyText } from "@/lib/cloudbeds-currency-label";
import { applyCloudbedsVatDisplay } from "@/lib/cloudbeds-vat-adjust";
import { recordFxCustomFields } from "@/lib/cloudbeds-fx-customfields";
import { resolveFxRate, type ResolvedFxRate } from "@/lib/fx-rate-client";
import { VAT_CHANGE_EVENT, getFromArgentina } from "@/lib/vat";

const HOTEL_DOM_ADJUSTMENT_SELECTOR = [
  ".hotel-bedding-selector",
  ".hotel-bedding-counter-panel",
  "[data-hotel-bedding-counter-panel='true']",
  "[data-hotel-currency-converted='true']",
  "[data-no-currency-conversion='true']",
  ".hotel-iva-card-tag",
].join(",");
const MONEY_AMOUNT_PATTERN = String.raw`\d(?:[\d.,\s]*\d)?(?:\s*[kK])?`;
const BARE_NUMERIC_AMOUNT_PATTERN = String.raw`(?:\d{1,3}(?:[.,]\d{3})+|\d{4,})(?:[.,]\d{2})?`;
const ARS_PRICE_PATTERN = new RegExp(
  String.raw`(?:AR\$\s*|ARS\s*|\$\s*)${MONEY_AMOUNT_PATTERN}|${MONEY_AMOUNT_PATTERN}\s*(?:ARS|AR\$)|\b\d+(?:[.,]\d+)?\s*k\b|\b${BARE_NUMERIC_AMOUNT_PATTERN}\b`,
  "gi",
);

type ConvertedLabel = (value: string, original: string) => string;

function isHotelDomAdjustmentNode(node: Node) {
  const element =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement;

  return element?.closest(HOTEL_DOM_ADJUSTMENT_SELECTOR) !== null;
}

function isOnlyHotelDomAdjustmentMutation(mutation: MutationRecord) {
  if (mutation.type === "characterData") {
    return isHotelDomAdjustmentNode(mutation.target);
  }

  if (mutation.addedNodes.length === 0) {
    return false;
  }

  return Array.from(mutation.addedNodes).every(isHotelDomAdjustmentNode);
}

function shouldScanMutationBatch(mutations: MutationRecord[]) {
  for (const mutation of mutations) {
    if (isOnlyHotelDomAdjustmentMutation(mutation)) {
      continue;
    }

    if (mutation.type === "characterData" || mutation.addedNodes.length > 0) {
      return true;
    }
  }

  return false;
}

function replacePricesInTextNode(
  textNode: Text,
  arsPerUsd: number,
  convertedLabel: ConvertedLabel,
) {
  const text = textNode.textContent ?? "";
  const matches = Array.from(text.matchAll(ARS_PRICE_PATTERN));

  if (matches.length === 0) {
    return;
  }

  const fragment = document.createDocumentFragment();
  let cursor = 0;

  for (const match of matches) {
    const original = match[0];
    const index = match.index ?? 0;
    const isCloudbedsPriceText = isCloudbedsBarePriceTextNode(textNode);
    const amount =
      parseCloudbedsArsMoney(original, {
        allowBareNumber: isCloudbedsPriceText,
        normalizeScaledAmount: isCloudbedsPriceText,
      }) ?? parseArsMoney(original);
    const converted = convertArsToUsd(amount, arsPerUsd);

    if (converted === null) {
      continue;
    }

    if (index > cursor) {
      fragment.append(document.createTextNode(text.slice(cursor, index)));
    }

    const span = document.createElement("span");
    // Calendar "lowest rate" cells show whole dollars; priced quotes keep cents.
    const displayValue = isCalendarRateTextNode(textNode)
      ? formatUsdWhole(converted)
      : formatUsd(converted);

    span.textContent = displayValue;
    span.dataset.hotelCurrencyConverted = "true";
    span.dataset.originalCurrencyText = original;
    span.dataset.convertedCurrencyText = displayValue;
    span.dataset.arsPerUsd = String(arsPerUsd);
    span.setAttribute("aria-label", convertedLabel(displayValue, original));

    fragment.append(span);
    cursor = index + original.length;
  }

  if (!fragment.hasChildNodes()) {
    return;
  }

  if (cursor < text.length) {
    fragment.append(document.createTextNode(text.slice(cursor)));
  }

  textNode.replaceWith(fragment);
}

function scanForPrices(
  root: ParentNode,
  arsPerUsd: number,
  convertedLabel: ConvertedLabel,
) {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return shouldConvertTextNode(node)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });

  let nextNode = walker.nextNode();

  while (nextNode) {
    textNodes.push(nextNode as Text);
    nextNode = walker.nextNode();
  }

  for (const textNode of textNodes) {
    replacePricesInTextNode(textNode, arsPerUsd, convertedLabel);
  }
}

export function BookingPriceObserver() {
  const t = useTranslations("booking");

  useEffect(() => {
    const convertedLabel: ConvertedLabel = (value, original) =>
      t("priceObserver.convertedFrom", { value, original });
    const abortController = new AbortController();
    let observer: MutationObserver | null = null;

    injectCloudbedsDomAdjustmentStyles(document);

    // Availability is independent of the FX rate. Start it immediately so the
    // dated Cloudbeds counters normally arrive before a guest opens a quantity
    // stepper. Failure keeps the conservative static capacities as fallback.
    fetchCloudbedsBeddingAvailability(abortController.signal)
      .then((availability) => {
        if (availability && !abortController.signal.aborted) {
          setCloudbedsBeddingAvailability(availability, document);

          if (!availability.mappingComplete) {
            console.warn(
              "Cloudbeds returned rooms missing from the bedding capability map.",
            );
          }

          if (availability.source.startsWith("static:fallback:")) {
            console.warn(
              "Live bedding availability unavailable; using static fallback counters.",
              {
                reason: availability.fallbackReason,
                source: availability.source,
              },
            );
          }
        }
      })
      .catch((error: unknown) => {
        if ((error as Error | undefined)?.name !== "AbortError") {
          console.warn(
            "Live bedding availability unavailable; using static limits.",
            error,
          );
        }
      });

    async function startObserver() {
      // A missing rate must degrade to "prices stay in ARS", never disable the
      // whole layer: bedding selectors, currency-control hiding and the
      // residency (Factura T) flag don't depend on the rate at all.
      let rate: ResolvedFxRate | null = null;

      try {
        rate = await resolveFxRate(abortController.signal);
      } catch (error) {
        // Aborted on unmount (Fast Refresh / strict mode) — nothing to start.
        if ((error as Error | undefined)?.name === "AbortError") {
          return;
        }
      }

      if (abortController.signal.aborted) {
        return;
      }

      const convertDocument = () => {
        const fromArgentina = getFromArgentina();

        // Rate-independent adjustments — always applied.
        hideCloudbedsCurrencyControls(document);
        injectCloudbedsBeddingSelectors(document);
        syncCloudbedsBeddingSelections(document);

        // Rate-dependent adjustments. The currency relabel and the VAT math
        // only make sense once prices are actually converted to USD; without
        // them Cloudbeds' native ARS view stays untouched (and correct).
        if (rate) {
          scanForPrices(document.body, rate.arsPerUsd, convertedLabel);
          relabelCloudbedsCurrencyText(document);
          applyCloudbedsVatDisplay(fromArgentina, document);
        }

        // Records what it can: the full FX snapshot when a rate exists, or at
        // least the residency flag when it doesn't.
        recordFxCustomFields({
          arsPerUsd: rate?.arsPerUsd ?? null,
          fromArgentina,
        });
      };

      // Our own DOM writes — and especially the way the bedding counter
      // mirrors its total into Cloudbeds' native quantity stepper — make
      // Cloudbeds re-render. The observer below would otherwise see that
      // re-render as "new content" and react to it, driving an unbounded
      // convert → mutate → convert loop that freezes the tab (most visibly
      // when Cloudbeds refuses a quantity above its real availability and
      // keeps reverting the value we set). `applyAdjustments` runs a pass,
      // discards the mutations our own work queued (takeRecords), and ignores
      // further mutations for a short cooldown so Cloudbeds' asynchronous
      // re-render fallout cannot restart the loop.
      let isApplyingAdjustments = false;
      let cooldownTimer: ReturnType<typeof setTimeout> | null = null;
      let debounceTimer: ReturnType<typeof setTimeout> | null = null;
      let pendingScanAfterCooldown = false;

      const scheduleSettledAdjustments = () => {
        if (debounceTimer !== null) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
          debounceTimer = null;
          applyAdjustments();
        }, 300);
      };

      const applyAdjustments = () => {
        isApplyingAdjustments = true;

        if (cooldownTimer !== null) {
          clearTimeout(cooldownTimer);
        }

        try {
          convertDocument();
        } finally {
          // Drop the mutations our synchronous DOM writes just queued.
          observer?.takeRecords();
          cooldownTimer = setTimeout(() => {
            cooldownTimer = null;
            observer?.takeRecords();
            isApplyingAdjustments = false;

            // Cloudbeds can re-render the checkout/add-ons step while our
            // previous conversion pass is still inside this cooldown. Those
            // mutations are not self-inflicted DOM adjustments; dropping them
            // leaves the freshly-rendered cart in raw ARS until the user does
            // something else (for example toggling VAT). Queue one trailing
            // pass so the settled Cloudbeds DOM is converted.
            if (pendingScanAfterCooldown) {
              pendingScanAfterCooldown = false;
              applyAdjustments();
              scheduleSettledAdjustments();
            }
          }, 250);
        }
      };

      // The initial pass runs before the observer is attached, so it cannot
      // feed back into itself.
      convertDocument();

      window.addEventListener(VAT_CHANGE_EVENT, applyAdjustments, {
        signal: abortController.signal,
      });

      observer = new MutationObserver((mutations) => {
        if (!shouldScanMutationBatch(mutations)) {
          return;
        }

        // Mutations that arrive while we're applying our own adjustments (and
        // during the brief cooldown after) cannot be handled immediately
        // without risking a conversion/re-render loop. Do not drop meaningful
        // Cloudbeds updates, though: process one trailing pass once the
        // cooldown releases.
        if (isApplyingAdjustments) {
          pendingScanAfterCooldown = true;
          return;
        }

        // Run immediately for fast price conversion.
        applyAdjustments();

        // Also schedule a follow-up in case Cloudbeds does a final render
        // after we've already adjusted (e.g. summary card settling after
        // the add-to-cart animation finishes).
        scheduleSettledAdjustments();
      });

      observer.observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    startObserver().catch((error: unknown) => {
      if (!abortController.signal.aborted) {
        console.warn("Booking price observer failed to start.", error);
      }
    });

    return () => {
      abortController.abort();
      observer?.disconnect();
    };
  }, [t]);

  return null;
}
