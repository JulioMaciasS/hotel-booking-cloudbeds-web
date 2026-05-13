const ARS_MARKER_PATTERN = /(?:^|\s)(?:ARS|AR\$|\$)|(?:ARS|AR\$)(?:\s|$)/i;
const USD_MARKER_PATTERN = /(?:^|\s)(?:USD|US\$|U\$S)(?:\s|$)/i;
const NUMBER_PATTERN = /\d(?:[\d.,\s]*\d)?(?:\s*[kK])?/;
const BARE_K_PRICE_PATTERN = /^\s*\d+(?:[.,]\d+)?\s*k\s*$/i;
const BARE_NUMERIC_PRICE_PATTERN =
  /^\s*(?:\d{1,3}(?:[.,]\d{3})+|\d{4,})(?:[.,]\d{2})?\s*$/;
const CLOUDBEDS_SCALED_BARE_PRICE_THRESHOLD = 100_000_000;
const CLOUDBEDS_SCALED_BARE_PRICE_DIVISOR = 1000;
const CLOUDBEDS_PRICE_ROOT_SELECTOR = [
  "cb-property-date-picker",
  "cb-immersive-experience",
  "#cb-bookingengine",
  ".cb-bookingengine-root",
  ".cb-portal",
  ".chakra-portal",
  "[data-testid*='property-date-picker' i]",
  "[data-testid*='calendar' i]",
  "[id*='chakra' i]",
].join(",");
const CLOUDBEDS_BARE_PRICE_CONTEXT_SELECTOR = [
  "[data-testid*='price' i]",
  "[data-testid*='subtotal' i]",
  "[data-testid*='total' i]",
  "[data-testid*='taxes' i]",
  "[data-testid*='fees' i]",
  "[class*='price' i]",
  ".cb-rate-plan-price",
].join(",");

function normalizeMoneyText(input: string) {
  return input.replace(/\u00a0/g, " ").trim();
}

function parseMoneyNumber(input: string): number | null {
  const normalized = input.trim();

  if (!normalized || /[-−]/.test(normalized)) {
    return null;
  }

  const isK = /\s*k$/i.test(normalized);
  let clean = normalized.replace(/\s/g, "").replace(/[^\d.,]/g, "");
  const lastComma = clean.lastIndexOf(",");
  const lastDot = clean.lastIndexOf(".");

  if (!clean) {
    return null;
  }

  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      clean = clean.replace(/\./g, "").replace(",", ".");
    } else {
      clean = clean.replace(/,/g, "");
    }
  } else if (lastComma !== -1) {
    const decimals = clean.length - lastComma - 1;
    clean =
      isK || decimals === 2 ? clean.replace(",", ".") : clean.replace(/,/g, "");
  } else if (lastDot !== -1) {
    const decimals = clean.length - lastDot - 1;

    if (!isK && decimals !== 2) {
      clean = clean.replace(/\./g, "");
    }
  }

  const value = Number(clean);

  if (!Number.isFinite(value)) {
    return null;
  }

  return isK ? value * 1000 : value;
}

export function parseArsMoney(input: string): number | null {
  const normalized = normalizeMoneyText(input);

  if (
    !ARS_MARKER_PATTERN.test(normalized) ||
    USD_MARKER_PATTERN.test(normalized) ||
    /[-−]\s*\d/.test(normalized)
  ) {
    return null;
  }

  const amount = normalized.match(NUMBER_PATTERN)?.[0];

  if (!amount) {
    return null;
  }

  return parseMoneyNumber(amount);
}

function normalizeCloudbedsBarePriceAmount(amount: number) {
  if (amount >= CLOUDBEDS_SCALED_BARE_PRICE_THRESHOLD) {
    return amount / CLOUDBEDS_SCALED_BARE_PRICE_DIVISOR;
  }

  return amount;
}

function parseBareNumericCloudbedsPrice(
  normalized: string,
  allowBareNumber: boolean,
): number | null {
  if (!allowBareNumber || !BARE_NUMERIC_PRICE_PATTERN.test(normalized)) {
    return null;
  }

  const parsed = parseMoneyNumber(normalized);

  if (parsed === null || parsed < 1000) {
    return null;
  }

  return normalizeCloudbedsBarePriceAmount(parsed);
}

export function parseCloudbedsArsMoney(
  input: string,
  options: {
    allowBareNumber?: boolean;
    normalizeScaledAmount?: boolean;
  } = {},
): number | null {
  const normalized = normalizeMoneyText(input);
  const explicitArsAmount = parseArsMoney(normalized);

  if (explicitArsAmount !== null) {
    return options.normalizeScaledAmount
      ? normalizeCloudbedsBarePriceAmount(explicitArsAmount)
      : explicitArsAmount;
  }

  if (USD_MARKER_PATTERN.test(normalized)) {
    return null;
  }

  if (BARE_K_PRICE_PATTERN.test(normalized)) {
    return parseMoneyNumber(normalized);
  }

  const bareNumericPrice = parseBareNumericCloudbedsPrice(
    normalized,
    options.allowBareNumber ?? false,
  );

  if (bareNumericPrice !== null) {
    return bareNumericPrice;
  }

  return null;
}

export function convertArsToUsd(
  arsAmount: number | null,
  arsPerUsd: number,
): number | null {
  if (
    arsAmount === null ||
    !Number.isFinite(arsAmount) ||
    !Number.isFinite(arsPerUsd) ||
    arsPerUsd <= 0
  ) {
    return null;
  }

  return arsAmount / arsPerUsd;
}

export function formatUsd(amount: number): string {
  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatArsRate(amount: number): string {
  return `ARS ${amount.toLocaleString("es-AR", {
    maximumFractionDigits: 0,
  })}`;
}

export function shouldConvertTextNode(node: Node): boolean {
  if (node.nodeType !== Node.TEXT_NODE) {
    return false;
  }

  const parent = node.parentElement;

  if (!parent) {
    return false;
  }

  if (
    parent.closest(
      [
        "[data-hotel-currency-converted='true']",
        "[data-no-currency-conversion='true']",
        "script",
        "style",
        "noscript",
        "textarea",
        "select",
      ].join(","),
    )
  ) {
    return false;
  }

  const text = node.textContent ?? "";

  if (!text.trim() || USD_MARKER_PATTERN.test(text)) {
    return false;
  }

  if (parseArsMoney(text) !== null) {
    return true;
  }

  const isInsideCloudbeds = parent.closest(CLOUDBEDS_PRICE_ROOT_SELECTOR) !== null;

  if (!isInsideCloudbeds) {
    return false;
  }

  return (
    parseCloudbedsArsMoney(text, {
      allowBareNumber: isCloudbedsBarePriceTextNode(node),
    }) !== null
  );
}

export function isCloudbedsBarePriceTextNode(node: Node): boolean {
  if (node.nodeType !== Node.TEXT_NODE) {
    return false;
  }

  const parent = node.parentElement;

  if (!parent || parent.closest(CLOUDBEDS_PRICE_ROOT_SELECTOR) === null) {
    return false;
  }

  if (parent.closest(CLOUDBEDS_BARE_PRICE_CONTEXT_SELECTOR)) {
    return true;
  }

  const text = normalizeMoneyText(node.textContent ?? "");

  return /[.,]/.test(text) && BARE_NUMERIC_PRICE_PATTERN.test(text);
}
