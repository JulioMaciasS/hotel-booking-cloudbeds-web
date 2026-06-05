"use client";

import { useEffect } from "react";
import {
  convertArsToUsd,
  formatUsd,
  isCloudbedsBarePriceTextNode,
  parseCloudbedsArsMoney,
  parseArsMoney,
  shouldConvertTextNode,
} from "@/lib/currency";
import {
  injectCloudbedsBeddingSelectors,
  syncCloudbedsBeddingSelections,
} from "@/lib/cloudbeds-bedding-selector";
import {
  hideCloudbedsCurrencyControls,
  injectCloudbedsDomAdjustmentStyles,
} from "@/lib/hide-cloudbeds-currency-controls";
import { relabelCloudbedsCurrencyText } from "@/lib/cloudbeds-currency-label";
import { applyCloudbedsVatDisplay } from "@/lib/cloudbeds-vat-adjust";
import { recordFxCustomFields } from "@/lib/cloudbeds-fx-customfields";
import { VAT_CHANGE_EVENT, getFromArgentina } from "@/lib/vat";

type FxRateResponse = {
  arsPerUsd: number;
  active: boolean;
};

const MONEY_AMOUNT_PATTERN = String.raw`\d(?:[\d.,\s]*\d)?(?:\s*[kK])?`;
const BARE_NUMERIC_AMOUNT_PATTERN = String.raw`(?:\d{1,3}(?:[.,]\d{3})+|\d{4,})(?:[.,]\d{2})?`;
const ARS_PRICE_PATTERN = new RegExp(
  String.raw`(?:AR\$\s*|ARS\s*|\$\s*)${MONEY_AMOUNT_PATTERN}|${MONEY_AMOUNT_PATTERN}\s*(?:ARS|AR\$)|\b\d+(?:[.,]\d+)?\s*k\b|\b${BARE_NUMERIC_AMOUNT_PATTERN}\b`,
  "gi",
);

function replacePricesInTextNode(textNode: Text, arsPerUsd: number) {
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
    const displayValue = formatUsd(converted);

    span.textContent = displayValue;
    span.dataset.hotelCurrencyConverted = "true";
    span.dataset.originalCurrencyText = original;
    span.dataset.convertedCurrencyText = displayValue;
    span.dataset.arsPerUsd = String(arsPerUsd);
    span.setAttribute(
      "aria-label",
      `${displayValue}, convertido visualmente desde ${original}`,
    );

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

function scanForPrices(root: ParentNode, arsPerUsd: number) {
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
    replacePricesInTextNode(textNode, arsPerUsd);
  }
}

export function BookingPriceObserver() {
  useEffect(() => {
    const abortController = new AbortController();
    let observer: MutationObserver | null = null;

    injectCloudbedsDomAdjustmentStyles(document);

    async function startObserver() {
      let rate: FxRateResponse;

      try {
        const response = await fetch("/api/public-fx-rate", {
          cache: "no-store",
          signal: abortController.signal,
        });

        if (!response.ok) {
          return;
        }

        rate = (await response.json()) as FxRateResponse;
      } catch (error) {
        // Aborted on unmount (Fast Refresh / strict mode) or a network error —
        // nothing to start. Swallow aborts quietly; surface real failures.
        if (
          !abortController.signal.aborted &&
          (error as Error | undefined)?.name !== "AbortError"
        ) {
          console.warn("Booking price observer failed to fetch FX rate.", error);
        }
        return;
      }

      if (!rate.active || !Number.isFinite(rate.arsPerUsd)) {
        return;
      }

      const convertDocument = () => {
        const fromArgentina = getFromArgentina();

        scanForPrices(document.body, rate.arsPerUsd);
        relabelCloudbedsCurrencyText(document);
        hideCloudbedsCurrencyControls(document);
        injectCloudbedsBeddingSelectors(document);
        syncCloudbedsBeddingSelections(document);
        applyCloudbedsVatDisplay(fromArgentina, document);
        recordFxCustomFields({ arsPerUsd: rate.arsPerUsd, fromArgentina });
      };

      convertDocument();

      window.addEventListener(VAT_CHANGE_EVENT, convertDocument, {
        signal: abortController.signal,
      });

      // Debounce timer: after rapid Cloudbeds DOM updates settle we run one
      // final convertDocument(). This ensures the VAT/price adjustments land
      // on the final rendered state rather than an intermediate skeleton.
      let debounceTimer: ReturnType<typeof setTimeout> | null = null;

      observer = new MutationObserver((mutations) => {
        let shouldScan = false;

        for (const mutation of mutations) {
          if (
            mutation.type === "characterData" ||
            mutation.addedNodes.length > 0
          ) {
            shouldScan = true;
            break;
          }
        }

        if (!shouldScan) {
          return;
        }

        // Run immediately for fast price conversion.
        convertDocument();

        // Also schedule a follow-up in case Cloudbeds does a final render
        // after we've already adjusted (e.g. summary card settling after
        // the add-to-cart animation finishes).
        if (debounceTimer !== null) {
          clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
          debounceTimer = null;
          convertDocument();
        }, 300);
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
  }, []);

  return null;
}
