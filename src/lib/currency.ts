const ARS_MARKER_PATTERN = /(?:^|\s)(?:ARS|AR\$|\$)|(?:ARS|AR\$)(?:\s|$)/i;
const USD_MARKER_PATTERN = /(?:^|\s)(?:USD|US\$|U\$S)(?:\s|$)/i;
const NUMBER_PATTERN =
  /(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?/;

function normalizeMoneyText(input: string) {
  return input.replace(/\u00a0/g, " ").trim();
}

function parseArgentineNumber(input: string): number | null {
  const normalized = input.trim();

  if (!normalized || /-/.test(normalized)) {
    return null;
  }

  const withoutThousands = normalized.replace(/\./g, "");
  const withDecimalPoint = withoutThousands.replace(",", ".");
  const value = Number(withDecimalPoint);

  return Number.isFinite(value) ? value : null;
}

export function parseArsMoney(input: string): number | null {
  const normalized = normalizeMoneyText(input);

  if (
    !ARS_MARKER_PATTERN.test(normalized) ||
    USD_MARKER_PATTERN.test(normalized) ||
    /-\s*\d/.test(normalized)
  ) {
    return null;
  }

  const amount = normalized.match(NUMBER_PATTERN)?.[0];

  if (!amount) {
    return null;
  }

  return parseArgentineNumber(amount);
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
    return "USD 0.00";
  }

  return `USD ${amount.toLocaleString("en-US", {
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

  return parseArsMoney(text) !== null;
}
