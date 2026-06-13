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
  syncCloudbedsBeddingSelections,
} from "@/lib/cloudbeds-bedding-selector";
import {
  hideCloudbedsCurrencyControls,
  injectCloudbedsDomAdjustmentStyles,
} from "@/lib/hide-cloudbeds-currency-controls";
import { relabelCloudbedsCurrencyText } from "@/lib/cloudbeds-currency-label";
import { applyCloudbedsVatDisplay } from "@/lib/cloudbeds-vat-adjust";
import { recordFxCustomFields } from "@/lib/cloudbeds-fx-customfields";
import { resolveFxRate, type ResolvedFxRate } from "@/lib/fx-rate-client";
import { VAT_CHANGE_EVENT, getFromArgentina } from "@/lib/vat";

const MONEY_AMOUNT_PATTERN = String.raw`\d(?:[\d.,\s]*\d)?(?:\s*[kK])?`;
const BARE_NUMERIC_AMOUNT_PATTERN = String.raw`(?:\d{1,3}(?:[.,]\d{3})+|\d{4,})(?:[.,]\d{2})?`;
const ARS_PRICE_PATTERN = new RegExp(
  String.raw`(?:AR\$\s*|ARS\s*|\$\s*)${MONEY_AMOUNT_PATTERN}|${MONEY_AMOUNT_PATTERN}\s*(?:ARS|AR\$)|\b\d+(?:[.,]\d+)?\s*k\b|\b${BARE_NUMERIC_AMOUNT_PATTERN}\b`,
  "gi",
);

type ConvertedLabel = (value: string, original: string) => string;

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
  }, [t]);

  return null;
}
