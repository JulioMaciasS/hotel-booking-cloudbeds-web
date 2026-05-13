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
      color: #1f2b27 !important;
      font-size: 12px !important;
      font-weight: 700 !important;
      line-height: 1.35 !important;
      margin: 0 !important;
      text-transform: uppercase !important;
    }

    .hotel-bedding-subtitle {
      display: none !important;
      color: #63716d !important;
      font-size: 12px !important;
      line-height: 1.4 !important;
      margin: 2px 0 0 !important;
    }

    .hotel-bedding-options {
      background: #f6f8f7 !important;
      border: 1px solid #dfe5e2 !important;
      border-radius: 10px !important;
      display: grid !important;
      gap: 4px !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      padding: 4px !important;
    }

    .hotel-bedding-option {
      appearance: none !important;
      background: transparent !important;
      border: 1px solid transparent !important;
      border-radius: 8px !important;
      box-shadow: none !important;
      color: #34423e !important;
      cursor: pointer !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      min-height: 42px !important;
      padding: 9px 10px !important;
      text-align: center !important;
      transition:
        background 0.15s ease,
        border-color 0.15s ease,
        color 0.15s ease !important;
    }

    .hotel-bedding-option:hover {
      background: #ffffff !important;
      border-color: #cfd8d4 !important;
    }

    .hotel-bedding-option.is-selected {
      background: #e7f0ed !important;
      border-color: #38645b !important;
      color: #1f2b27 !important;
    }

    .hotel-bedding-name {
      color: inherit !important;
      display: block !important;
      font-size: 13px !important;
      font-weight: 600 !important;
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
      color: #38645b !important;
    }

    @media (max-width: 400px) {
      .hotel-bedding-options {
        grid-template-columns: 1fr !important;
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
