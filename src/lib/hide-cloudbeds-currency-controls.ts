const STYLE_ID = "hotel-cloudbeds-dom-adjustments";
const CONTROL_SELECTOR = [
  "button",
  "[role='button']",
  "select",
  "[aria-label]",
  "[title]",
  "[data-testid]",
].join(",");

const CURRENCY_CONTROL_PATTERN =
  /(currency|moneda|divisa|selector de moneda|seleccionar moneda|currency selector)/i;
const FILTER_CONTROL_PATTERN = /\b(filters?|filtros?)\b/i;
const PROMO_CODE_PATTERN =
  /^(promo code|c[oó]digo promocional|a[nñ]adir c[oó]digo|add code|promo\/group code)/i;
const BRANDED_NAV_PATTERN = /(logo|brand|booking engine)/i;
const CLOUDBEDS_BRAND_TEXT_PATTERN = /^(cloudbeds|cloudbeds booking engine)$/i;
const CLOUDBEDS_NAV_ROOT_SELECTOR = [
  "#cb-bookingengine header",
  ".cb-bookingengine-root header",
  "#cb-bookingengine [role='banner']",
  ".cb-bookingengine-root [role='banner']",
  "#cb-bookingengine [data-testid*='nav' i]",
  ".cb-bookingengine-root [data-testid*='nav' i]",
  "#cb-bookingengine [data-testid*='header' i]",
  ".cb-bookingengine-root [data-testid*='header' i]",
  "#cb-bookingengine [class*='navbar' i]",
  ".cb-bookingengine-root [class*='navbar' i]",
  "#cb-bookingengine [class*='navigation' i]",
  ".cb-bookingengine-root [class*='navigation' i]",
].join(",");
const BRAND_CONTROL_SELECTOR = [
  "a",
  "img",
  "svg",
  "[aria-label]",
  "[title]",
  "[data-testid]",
  "[class]",
].join(",");

export function injectCloudbedsDomAdjustmentStyles(
  documentRef: Document = document,
) {
  if (documentRef.getElementById(STYLE_ID)) {
    return;
  }

  const style = documentRef.createElement("style");
  style.id = STYLE_ID;
  style.dataset.cbImmersiveExperienceRoot = "true";
  style.textContent = `
    :is(#cb-bookingengine, .cb-bookingengine-root, .cb-portal)
      :is([aria-label*="currency" i], [aria-label*="moneda" i], [title*="currency" i], [title*="moneda" i], [data-testid*="currency" i]) {
      display: none !important;
    }

    [data-hotel-currency-selector-hidden="true"] {
      display: none !important;
    }

    :is(#cb-bookingengine, .cb-bookingengine-root, .cb-portal)
      :is([aria-label^="promo code" i], [aria-label*="añadir código" i], [aria-label*="anadir codigo" i]) {
      display: none !important;
    }

    [data-hotel-cloudbeds-promo-hidden="true"] {
      display: none !important;
    }

    [data-hotel-cloudbeds-brand-hidden="true"] {
      display: none !important;
    }

    [data-hotel-cloudbeds-filter-visible="true"] {
      color: #1f2937 !important;
      opacity: 1 !important;
      -webkit-text-fill-color: #1f2937 !important;
    }

    [data-hotel-cloudbeds-filter-visible="true"] * {
      color: inherit !important;
      fill: currentColor !important;
      opacity: 1 !important;
      stroke: currentColor !important;
      -webkit-text-fill-color: currentColor !important;
    }

    :is(#cb-bookingengine, .cb-bookingengine-root)
      :is(
        button,
        [role="button"],
        a,
        [aria-label*="filter" i],
        [aria-label*="filtro" i],
        [title*="filter" i],
        [title*="filtro" i],
        [data-testid*="filter" i],
        [data-testid*="filtro" i],
        [class*="filter" i],
        [class*="filtro" i]
      )[data-hotel-cloudbeds-filter-visible="true"] {
      color: #1f2937 !important;
      opacity: 1 !important;
      -webkit-text-fill-color: #1f2937 !important;
    }

    :is(#cb-bookingengine, .cb-bookingengine-root)
      :is(
        header,
        [role="banner"],
        [data-testid*="nav" i],
        [data-testid*="header" i],
        [class*="navbar" i],
        [class*="navigation" i]
      ) {
      background: #ffffff;
      border-color: #e4e8e6;
    }

    :is(#cb-bookingengine, .cb-bookingengine-root)
      :is(
        header,
        [role="banner"],
        [data-testid*="nav" i],
        [data-testid*="header" i],
        [class*="navbar" i],
        [class*="navigation" i]
      )
      :is(
        [aria-label*="logo" i],
        [aria-label*="brand" i],
        [title*="logo" i],
        [title*="brand" i],
        [data-testid*="logo" i],
        [data-testid*="brand" i],
        [class*="logo" i],
        [class*="brand" i],
        img
      ) {
      display: none !important;
    }

    :is(#cb-bookingengine, .cb-bookingengine-root)
      :is(
        .leaflet-control-zoom a,
        .leaflet-bar a,
        [class*="leaflet-control-zoom"] a,
        [aria-label="Zoom in"],
        [aria-label="Zoom out"],
        [aria-label="Acercar"],
        [aria-label="Alejar"]
      ) {
      align-items: center !important;
      background: #ffffff !important;
      border-color: #cfd4dc !important;
      color: #1f2937 !important;
      display: flex !important;
      justify-content: center !important;
      opacity: 1 !important;
    }

    :is(#cb-bookingengine, .cb-bookingengine-root)
      :is(
        .leaflet-control-zoom a:hover,
        .leaflet-bar a:hover,
        [class*="leaflet-control-zoom"] a:hover,
        [aria-label="Zoom in"]:hover,
        [aria-label="Zoom out"]:hover,
        [aria-label="Acercar"]:hover,
        [aria-label="Alejar"]:hover
      ) {
      background: #f4f6f8 !important;
    }

    .hotel-bedding-selector {
      background: transparent !important;
      border: 0 !important;
      border-top: 1px solid #edf0ef !important;
      margin: 12px 0 0 !important;
      padding: 12px 0 0 !important;
      width: 100% !important;
    }

    .hotel-bedding-header {
      margin: 0 0 6px !important;
    }

    .hotel-bedding-title {
      color: #0f172a !important;
      font-size: 14px !important;
      font-weight: 700 !important;
      line-height: 1.35 !important;
      margin: 0 !important;
      text-transform: none !important;
    }

    .hotel-bedding-subtitle {
      display: none !important;
      color: #63716d !important;
      font-size: 12px !important;
      line-height: 1.4 !important;
      margin: 2px 0 0 !important;
    }

    .hotel-bedding-options {
      background: transparent !important;
      border: 0 !important;
      border-radius: 0 !important;
      display: grid !important;
      gap: 10px !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      padding: 0 !important;
    }

    .hotel-bedding-option {
      align-items: center !important;
      appearance: none !important;
      background: #ffffff !important;
      border: 1.5px solid #cfd6df !important;
      border-radius: 14px !important;
      box-shadow: none !important;
      color: #4b5563 !important;
      cursor: pointer !important;
      display: flex !important;
      flex-direction: column !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      gap: 7px !important;
      justify-content: center !important;
      min-height: 74px !important;
      padding: 12px 10px !important;
      text-align: center !important;
      transition:
        background 0.15s ease,
        border-color 0.15s ease,
        color 0.15s ease !important;
    }

    .hotel-bedding-icon {
      color: #6b7280 !important;
      display: block !important;
      flex: none !important;
      height: 22px !important;
      width: 40px !important;
    }

    .hotel-bedding-option.is-selected .hotel-bedding-icon {
      color: #32c0a0 !important;
    }

    .hotel-bedding-option:hover {
      background: #e9f9f4 !important;
      border-color: #32c0a0 !important;
    }

    .hotel-bedding-option.is-selected {
      background: #e9f9f4 !important;
      border-color: #32c0a0 !important;
      color: #157f68 !important;
    }

    .hotel-bedding-option:disabled {
      cursor: not-allowed !important;
      opacity: 0.42 !important;
    }

    .hotel-bedding-option:disabled:hover {
      background: #ffffff !important;
      border-color: #cfd6df !important;
    }

    .hotel-bedding-name {
      color: inherit !important;
      display: block !important;
      font-size: 14px !important;
      font-weight: 700 !important;
      line-height: 1.25 !important;
      margin: 0 !important;
    }

    .hotel-bedding-status {
      display: none !important;
      color: #6b7974 !important;
      font-size: 11px !important;
      line-height: 1.25 !important;
      margin-top: 3px !important;
    }

    .hotel-bedding-option.is-selected .hotel-bedding-status {
      color: #157f68 !important;
    }

    [data-hotel-bedding-native-quantity-row="true"],
    [data-hotel-bedding-native-max-note="true"] {
      display: none !important;
    }

    .hotel-bedding-counter-panel {
      display: grid !important;
      gap: 0 !important;
      margin: 0 !important;
      width: 100% !important;
    }

    .hotel-bedding-counter-list {
      display: grid !important;
      gap: 0 !important;
      width: 100% !important;
    }

    /* Mirror Cloudbeds' native Adults/Children rows: label left, stepper
       right, hairline divider between rows. */
    .hotel-bedding-counter-row {
      align-items: center !important;
      background: transparent !important;
      border: 0 !important;
      border-radius: 0 !important;
      display: flex !important;
      gap: 12px !important;
      justify-content: space-between !important;
      min-height: 0 !important;
      padding: 8px 0 !important;
    }

    .hotel-bedding-counter-row + .hotel-bedding-counter-row {
      border-top: 1px solid #dde0e4 !important;
    }

    .hotel-bedding-counter-row.is-unavailable {
      opacity: 0.5 !important;
    }

    .hotel-bedding-counter-name {
      color: #1e2330 !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      line-height: 1.3 !important;
      min-width: 0 !important;
    }

    /* White pill housing the −/value/+ trio, matching Cloudbeds' own
       guest steppers. */
    .hotel-bedding-counter-controls {
      align-items: center !important;
      background: #ffffff !important;
      border: 1px solid #d9dee7 !important;
      border-radius: 9999px !important;
      display: inline-flex !important;
      flex: none !important;
      gap: 0 !important;
      overflow: hidden !important;
      white-space: nowrap !important;
    }

    /* 35px transparent circular buttons with muted icons — identical to the
       native guest steppers. */
    .hotel-bedding-counter-button {
      align-items: center !important;
      appearance: none !important;
      background: transparent !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      color: #778295 !important;
      cursor: pointer !important;
      display: inline-flex !important;
      height: 35px !important;
      justify-content: center !important;
      line-height: 1 !important;
      padding: 0 !important;
      width: 35px !important;
    }

    .hotel-bedding-counter-button .hotel-bedding-counter-glyph {
      height: 14px !important;
      width: 14px !important;
    }

    .hotel-bedding-counter-button:hover:not(:disabled) {
      background: #f1f3f5 !important;
    }

    .hotel-bedding-counter-button:disabled {
      cursor: not-allowed !important;
      opacity: 0.4 !important;
    }

    .hotel-bedding-counter-count {
      color: #1e2330 !important;
      display: inline-block !important;
      font-size: 16px !important;
      font-weight: 500 !important;
      min-width: 24px !important;
      padding: 0 2px !important;
      text-align: center !important;
    }

    /* Muted, right-aligned summary in the same vein as Cloudbeds' "Max: N"
       captions. */
    .hotel-bedding-total {
      border-top: 1px solid #dde0e4 !important;
      color: #778295 !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      margin: 0 !important;
      padding: 8px 0 0 !important;
      text-align: right !important;
      white-space: nowrap !important;
    }


    .hotel-bedding-limit-note {
      color: #157f68 !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      line-height: 1.35 !important;
      margin: 0 8px 8px !important;
      text-align: right !important;
    }

    input[data-hotel-bedding-quantity-limit] {
      caret-color: transparent !important;
      cursor: default !important;
    }

    button[data-hotel-bedding-limit-reached="true"] {
      cursor: not-allowed !important;
      opacity: 0.5 !important;
    }

    @media (max-width: 400px) {
      .hotel-bedding-options {
        grid-template-columns: 1fr !important;
      }

      .hotel-bedding-counter-row {
        grid-template-columns: auto minmax(0, 1fr) !important;
      }

      .hotel-bedding-counter-controls {
        grid-column: 1 / -1 !important;
        justify-content: flex-end !important;
      }
    }
  `;

  documentRef.head.appendChild(style);
}

function getElementSignature(element: Element) {
  return [
    element.getAttribute("aria-label"),
    element.getAttribute("title"),
    element.getAttribute("data-testid"),
    element.getAttribute("class"),
    element.tagName.toLowerCase() === "select" ? element.textContent : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function hideCloudbedsCurrencyControls(documentRef: Document = document) {
  injectCloudbedsDomAdjustmentStyles(documentRef);
  hideCloudbedsBrandControls(documentRef);
  ensureCloudbedsFilterControlsVisible(documentRef);

  const candidates = documentRef.querySelectorAll(CONTROL_SELECTOR);

  for (const element of candidates) {
    if (element.closest("[data-hotel-currency-converted='true']")) {
      continue;
    }

    const signature = getElementSignature(element);

    if (!CURRENCY_CONTROL_PATTERN.test(signature)) {
      continue;
    }

    element.setAttribute("data-hotel-currency-selector-hidden", "true");
    element.setAttribute("hidden", "");
  }

  hideCloudbedsPromoCodeControls(documentRef);
}

export function ensureCloudbedsFilterControlsVisible(
  documentRef: Document = document,
) {
  const candidates = documentRef.querySelectorAll(
    [
      "#cb-bookingengine button",
      ".cb-bookingengine-root button",
      "#cb-bookingengine [role='button']",
      ".cb-bookingengine-root [role='button']",
      "#cb-bookingengine a",
      ".cb-bookingengine-root a",
      "#cb-bookingengine [aria-label]",
      ".cb-bookingengine-root [aria-label]",
      "#cb-bookingengine [title]",
      ".cb-bookingengine-root [title]",
      "#cb-bookingengine [data-testid]",
      ".cb-bookingengine-root [data-testid]",
    ].join(","),
  );

  for (const element of candidates) {
    const signature = [
      element.getAttribute("aria-label"),
      element.getAttribute("title"),
      element.getAttribute("data-testid"),
      element.getAttribute("class"),
      element.textContent,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (!FILTER_CONTROL_PATTERN.test(signature)) {
      continue;
    }

    element.setAttribute("data-hotel-cloudbeds-filter-visible", "true");
  }
}

export function hideCloudbedsBrandControls(documentRef: Document = document) {
  const navRoots = documentRef.querySelectorAll(CLOUDBEDS_NAV_ROOT_SELECTOR);

  for (const navRoot of navRoots) {
    const candidates = navRoot.querySelectorAll(BRAND_CONTROL_SELECTOR);

    for (const element of candidates) {
      if (element.closest(".leaflet-control-zoom, .leaflet-bar")) {
        continue;
      }

      const signature = [
        element.getAttribute("aria-label"),
        element.getAttribute("alt"),
        element.getAttribute("title"),
        element.getAttribute("data-testid"),
        element.getAttribute("class"),
        element.getAttribute("href"),
        element.textContent,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
      const text = element.textContent?.trim() ?? "";
      const href = element.getAttribute("href") ?? "";

      if (
        element.tagName.toLowerCase() !== "img" &&
        !BRANDED_NAV_PATTERN.test(signature) &&
        !CLOUDBEDS_BRAND_TEXT_PATTERN.test(text) &&
        !/cloudbeds\.com\/reservation/i.test(href)
      ) {
        continue;
      }

      const target = element.closest("a, button, [role='button']") ?? element;
      target.setAttribute("data-hotel-cloudbeds-brand-hidden", "true");
      target.setAttribute("hidden", "");
    }
  }
}

function getPromoCodeTarget(element: Element) {
  const interactiveParent = element.closest(
    "button, [role='button'], [data-testid], [class*='promo'], [class*='Promo']",
  );

  if (
    interactiveParent &&
    PROMO_CODE_PATTERN.test(
      [
        interactiveParent.getAttribute("aria-label"),
        interactiveParent.getAttribute("title"),
        interactiveParent.textContent,
      ]
        .filter(Boolean)
        .join(" ")
        .trim(),
    )
  ) {
    return interactiveParent;
  }

  return element;
}

export function hideCloudbedsPromoCodeControls(
  documentRef: Document = document,
) {
  const candidates = documentRef.querySelectorAll(
    [
      "[aria-label^='Promo code' i]",
      "[aria-label*='Añadir código' i]",
      "[aria-label*='Anadir codigo' i]",
      "[data-be-text='true']",
    ].join(","),
  );

  for (const element of candidates) {
    const signature = [
      element.getAttribute("aria-label"),
      element.textContent,
      element.getAttribute("class"),
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (!PROMO_CODE_PATTERN.test(signature)) {
      continue;
    }

    const target = getPromoCodeTarget(element);
    target.setAttribute("data-hotel-cloudbeds-promo-hidden", "true");
    target.setAttribute("hidden", "");
  }
}
