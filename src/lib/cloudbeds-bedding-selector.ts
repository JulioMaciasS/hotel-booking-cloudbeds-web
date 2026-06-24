type BeddingOption = {
  key: string;
  label: string;
  /** Maximum number of physical rooms that can provide this layout. */
  maxRooms: number;
  /**
   * Relative widths of each bed, used to draw a top-down layout icon. A double
   * (matrimonial) bed is `2`, a single bed is `1`.
   */
  beds: number[];
};

type BeddingConfig = {
  id?: string;
  title: string;
  roomClass: "standard" | "superior";
  occupancy: "double" | "triple";
  options: BeddingOption[];
};

export type CloudbedsBeddingAvailability = {
  mappingComplete: boolean;
  roomTypes: Record<
    string,
    {
      totalAvailable: number;
      options: Record<string, number>;
    }
  >;
};

const STORAGE_PREFIX = "hotel-bedding-selection:";
const COUNTS_STORAGE_PREFIX = "hotel-bedding-counts:";
let liveAvailability: CloudbedsBeddingAvailability | null = null;

function buildDoubleBeddingOptions(
  matrimonialMaxRooms: number,
  twinMaxRooms: number,
): BeddingOption[] {
  return [
    {
      key: "matrimonial",
      label: "Matrimonial",
      maxRooms: matrimonialMaxRooms,
      beds: [2],
    },
    {
      key: "dos_camas_separadas",
      label: "Dos camas separadas",
      maxRooms: twinMaxRooms,
      beds: [1, 1],
    },
  ];
}

const TRIPLE_MATRIMONIAL_OPTION: BeddingOption = {
  key: "matrimonial_cama_individual",
  label: "Matrimonial y cama individual",
  maxRooms: 2,
  beds: [2, 1],
};

const TRIPLE_TWIN_OPTION: BeddingOption = {
  key: "tres_camas_individuales",
  label: "Tres camas individuales",
  maxRooms: 2,
  beds: [1, 1, 1],
};

const TRIPLE_SUPERIOR_BEDDING_OPTIONS: BeddingOption[] = [
  { ...TRIPLE_MATRIMONIAL_OPTION, maxRooms: 1 },
  { ...TRIPLE_TWIN_OPTION, maxRooms: 1 },
];

const TRIPLE_BEDDING_OPTIONS: BeddingOption[] = [
  TRIPLE_MATRIMONIAL_OPTION,
  TRIPLE_TWIN_OPTION,
];

/**
 * Builds a small top-down SVG of the bed layout. Each bed is a rounded
 * rectangle (mattress) with one pillow per single, two for a double. Uses
 * `currentColor` so it follows the button's text colour and selected state.
 */
function buildBeddingIcon(beds: number[]): string {
  const width = 72;
  const height = 40;
  const margin = 5;
  const gap = 5;
  const bedTop = 6;
  const bedHeight = 28;
  const totalUnits = beds.reduce((sum, bed) => sum + bed, 0) || 1;
  const available = width - margin * 2 - gap * (beds.length - 1);
  const unit = available / totalUnits;

  let cursor = margin;
  let shapes = "";

  for (const bed of beds) {
    const bedWidth = unit * bed;
    shapes += `<rect x="${cursor.toFixed(1)}" y="${bedTop}" width="${bedWidth.toFixed(1)}" height="${bedHeight}" rx="3"/>`;

    const pillows = bed >= 2 ? 2 : 1;
    const pillowGap = 2;
    const pillowAreaWidth = bedWidth - 6;
    const pillowWidth =
      (pillowAreaWidth - pillowGap * (pillows - 1)) / pillows;
    let pillowCursor = cursor + 3;

    for (let index = 0; index < pillows; index += 1) {
      shapes += `<rect x="${pillowCursor.toFixed(1)}" y="${bedTop + 3}" width="${pillowWidth.toFixed(1)}" height="6" rx="2" fill="currentColor" stroke="none" opacity="0.35"/>`;
      pillowCursor += pillowWidth + pillowGap;
    }

    cursor += bedWidth + gap;
  }

  return `<svg class="hotel-bedding-icon" viewBox="0 0 ${width} ${height}" width="40" height="22" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${shapes}</svg>`;
}

/**
 * Escapes a string for safe interpolation into an HTML template literal. The
 * option keys/labels are hard-coded constants today, but `selectedKey`
 * round-trips through sessionStorage, so a poisoned value must never be able to
 * break out of an attribute and inject markup via the `innerHTML` build below.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type BeddingLocaleStrings = {
  bedTypeTitle: string;
  optionLabels: Record<string, string>;
  decrease: (label: string) => string;
  increase: (label: string) => string;
  total: (selected: number, max: number) => string;
  maxTotal: (rooms: number) => string;
};

// These selectors are injected as raw DOM into Cloudbeds' widget, so they can't
// use next-intl directly. We follow the page language (the `lang` set on the
// <html> element) the same way Cloudbeds localises its own controls, defaulting
// to Spanish.
const BEDDING_STRINGS: Record<"es" | "en", BeddingLocaleStrings> = {
  es: {
    bedTypeTitle: "Tipo de cama",
    optionLabels: {
      matrimonial: "Matrimonial",
      dos_camas_separadas: "Dos camas separadas",
      matrimonial_cama_individual: "Matrimonial y cama individual",
      tres_camas_individuales: "Tres camas individuales",
    },
    decrease: (label) => `Restar ${label}`,
    increase: (label) => `Sumar ${label}`,
    total: (selected, max) =>
      `Total: ${selected} de ${max} ${
        max === 1 ? "habitación disponible" : "habitaciones disponibles"
      }`,
    maxTotal: (rooms) =>
      `Máximo total: ${rooms} ${rooms === 1 ? "habitación" : "habitaciones"}`,
  },
  en: {
    bedTypeTitle: "Bed type",
    optionLabels: {
      matrimonial: "Double bed",
      dos_camas_separadas: "Two single beds",
      matrimonial_cama_individual: "Double + single bed",
      tres_camas_individuales: "Three single beds",
    },
    decrease: (label) => `Decrease ${label}`,
    increase: (label) => `Increase ${label}`,
    total: (selected, max) =>
      `Total: ${selected} of ${max} ${max === 1 ? "room" : "rooms"} available`,
    maxTotal: (rooms) =>
      `Maximum total: ${rooms} ${rooms === 1 ? "room" : "rooms"}`,
  },
};

function getBeddingStrings(documentRef: Document): BeddingLocaleStrings {
  const lang = (documentRef.documentElement.lang || "").toLowerCase();

  return lang.startsWith("en") ? BEDDING_STRINGS.en : BEDDING_STRINGS.es;
}

const BEDDING_CONFIGS: BeddingConfig[] = [
  {
    id: "227179928547456",
    title: "Doble Estandar",
    roomClass: "standard",
    occupancy: "double",
    // Rooms 01 and 03 can be matrimonial; all four rooms can be twin.
    options: buildDoubleBeddingOptions(2, 4),
  },
  {
    id: "229741541683392",
    title: "Doble Superior",
    roomClass: "superior",
    occupancy: "double",
    // All five rooms can be matrimonial; rooms 12, 14 and 15 can be twin.
    options: buildDoubleBeddingOptions(5, 3),
  },
  // The standard triple is split into two Cloudbeds room types, each with a
  // single fixed bed layout (matched by their full titles — see getBeddingConfig,
  // which prefers the most specific title match over the generic one below).
  {
    id: "229741180768384",
    title: "Triple Estandar Twin",
    roomClass: "standard",
    occupancy: "triple",
    options: [TRIPLE_TWIN_OPTION],
  },
  {
    id: "239441314484352",
    title: "Triple Estandar Matrimonial",
    roomClass: "standard",
    occupancy: "triple",
    options: [TRIPLE_MATRIMONIAL_OPTION],
  },
  // Generic standard triple — fallback for any unsuffixed "Triple Estandar".
  {
    title: "Triple Estandar",
    roomClass: "standard",
    occupancy: "triple",
    options: TRIPLE_BEDDING_OPTIONS,
  },
  {
    id: "229741711368385",
    title: "Triple Superior",
    roomClass: "superior",
    occupancy: "triple",
    options: TRIPLE_SUPERIOR_BEDDING_OPTIONS,
  },
];

function getOptionMaxRooms(config: BeddingConfig, option: BeddingOption) {
  if (!config.id || !liveAvailability) {
    return option.maxRooms;
  }

  const liveMax = liveAvailability.roomTypes[config.id]?.options[option.key];

  return typeof liveMax === "number" && Number.isFinite(liveMax) && liveMax >= 0
    ? liveMax
    : option.maxRooms;
}

function getRoomTypeMaxRooms(config: BeddingConfig) {
  if (config.id && liveAvailability) {
    const liveTotal = liveAvailability.roomTypes[config.id]?.totalAvailable;

    if (
      typeof liveTotal === "number" &&
      Number.isFinite(liveTotal) &&
      liveTotal >= 0
    ) {
      return liveTotal;
    }
  }

  return config.options.reduce(
    (maxRooms, option) => Math.max(maxRooms, option.maxRooms),
    0,
  );
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getAccommodationId(card: Element) {
  return card.getAttribute("data-testid")?.replace("accommodation-card-", "");
}

function getAccommodationTitle(card: Element) {
  return card.querySelector("h3")?.textContent?.trim() ?? "";
}

function getBeddingConfig(card: Element) {
  const accommodationId = getAccommodationId(card);
  const title = normalizeText(getAccommodationTitle(card));

  if (accommodationId) {
    const byId = BEDDING_CONFIGS.find((config) => config.id === accommodationId);

    if (byId) {
      return byId;
    }
  }

  // Prefer the most specific title match (e.g. "Triple Estandar Twin" wins over
  // the generic "Triple Estandar") by picking the longest config title that the
  // card title contains.
  const titleMatch = BEDDING_CONFIGS.filter((config) => {
    const normalizedTitle = normalizeText(config.title);
    return title === normalizedTitle || title.includes(normalizedTitle);
  }).sort(
    (a, b) => normalizeText(b.title).length - normalizeText(a.title).length,
  )[0];

  if (titleMatch) {
    return titleMatch;
  }

  // Last resort: occupancy + class, only when it points to a single config.
  const occupancyClassMatches = BEDDING_CONFIGS.filter((config) => {
    const matchesOccupancy = title.includes(
      config.occupancy === "double" ? "doble" : "triple",
    );
    const matchesClass = title.includes(
      config.roomClass === "standard" ? "estandar" : "superior",
    );

    return matchesOccupancy && matchesClass;
  });

  return occupancyClassMatches.length === 1
    ? occupancyClassMatches[0]
    : undefined;
}

function getStorageKey(cardId: string) {
  return `${STORAGE_PREFIX}${cardId}`;
}

function getCountsStorageKey(cardId: string) {
  return `${COUNTS_STORAGE_PREFIX}${cardId}`;
}

function readStoredSelection(cardId: string) {
  try {
    return window.sessionStorage.getItem(getStorageKey(cardId));
  } catch {
    return null;
  }
}

function writeStoredSelection(cardId: string, value: string) {
  try {
    window.sessionStorage.setItem(getStorageKey(cardId), value);
  } catch {
    // Storage can be unavailable in private or restricted browsing contexts.
  }
}

type BeddingCounts = Record<string, number>;

function createEmptyCounts(config: BeddingConfig): BeddingCounts {
  return Object.fromEntries(config.options.map((option) => [option.key, 0]));
}

function getCountsTotal(counts: BeddingCounts) {
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}

function clampCount(value: unknown) {
  const count = Number(value);

  return Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
}

function clampBeddingCounts(
  config: BeddingConfig,
  counts: BeddingCounts,
  totalMaxRooms: number,
) {
  const nextCounts = createEmptyCounts(config);

  for (const option of config.options) {
    nextCounts[option.key] = Math.min(
      clampCount(counts[option.key]),
      getOptionMaxRooms(config, option),
    );
  }

  let overflow = getCountsTotal(nextCounts) - totalMaxRooms;

  if (overflow > 0) {
    for (const option of [...config.options].reverse()) {
      const currentCount = nextCounts[option.key] ?? 0;
      const reduction = Math.min(currentCount, overflow);

      nextCounts[option.key] = currentCount - reduction;
      overflow -= reduction;

      if (overflow <= 0) {
        break;
      }
    }
  }

  return nextCounts;
}

function readStoredCounts(cardId: string, config: BeddingConfig) {
  try {
    const raw = window.sessionStorage.getItem(getCountsStorageKey(cardId));

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Record<string, unknown>;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return clampBeddingCounts(
      config,
      parsed as BeddingCounts,
      getRoomTypeMaxRooms(config),
    );
  } catch {
    return null;
  }
}

function writeStoredCounts(cardId: string, counts: BeddingCounts) {
  try {
    window.sessionStorage.setItem(
      getCountsStorageKey(cardId),
      JSON.stringify(counts),
    );
  } catch {
    // Storage can be unavailable in private or restricted browsing contexts.
  }
}

function clearStoredCounts(cardId: string) {
  try {
    window.sessionStorage.removeItem(getCountsStorageKey(cardId));
  } catch {
    // Storage can be unavailable in private or restricted browsing contexts.
  }
}

function serializeBeddingCounts(counts: BeddingCounts) {
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => `${key}:${count}`)
    .join(";");
}

function buildDefaultCounts(
  config: BeddingConfig,
  selectedKey: string | undefined,
  requestedTotal: number,
  totalMaxRooms: number,
) {
  const counts = createEmptyCounts(config);
  let remaining = Math.min(
    Math.max(1, clampCount(requestedTotal)),
    totalMaxRooms,
  );

  if (remaining <= 0) {
    return counts;
  }

  const preferredOption = config.options.find(
    (option) => option.key === selectedKey,
  );
  const orderedOptions = preferredOption
    ? [
        preferredOption,
        ...config.options.filter((option) => option.key !== preferredOption.key),
      ]
    : config.options;

  for (const option of orderedOptions) {
    const availableForOption = getOptionMaxRooms(config, option);
    const nextCount = Math.min(availableForOption, remaining);

    counts[option.key] = nextCount;
    remaining -= nextCount;

    if (remaining <= 0) {
      break;
    }
  }

  return counts;
}

function updateHiddenBeddingInput(wrapper: HTMLElement, value: string) {
  const hiddenInput = wrapper.querySelector<HTMLInputElement>(
    "input[data-hotel-bedding-input='true']",
  );

  if (hiddenInput) {
    hiddenInput.value = value;
  }
}

function updateSelectedOption(wrapper: HTMLElement, selectedKey: string) {
  wrapper.dataset.hotelSelectedBedding = selectedKey;
  const selectedButton = wrapper.querySelector<HTMLButtonElement>(
    `[data-hotel-bedding-option="${selectedKey}"]`,
  );

  if (selectedButton?.dataset.hotelBeddingMaxRooms) {
    wrapper.dataset.hotelBeddingOptionMaxRooms =
      selectedButton.dataset.hotelBeddingMaxRooms;
    wrapper.dataset.hotelBeddingLabel =
      selectedButton.dataset.hotelBeddingLabel ?? selectedKey;
  }

  updateHiddenBeddingInput(
    wrapper,
    wrapper.dataset.hotelBeddingCounts ?? selectedKey,
  );

  wrapper
    .querySelectorAll<HTMLButtonElement>("[data-hotel-bedding-option]")
    .forEach((button) => {
      const isSelected = button.dataset.hotelBeddingOption === selectedKey;

      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });
}

function createBeddingSelector(card: Element, config: BeddingConfig) {
  const cardId = getAccommodationId(card) ?? normalizeText(config.title);
  const storedSelection = readStoredSelection(cardId);
  const selectedKey = config.options.some(
    (option) =>
      option.key === storedSelection && getOptionMaxRooms(config, option) > 0,
  )
    ? storedSelection!
    : (config.options.find((option) => getOptionMaxRooms(config, option) > 0)
        ?.key ??
      config.options[0]?.key ??
      "");
  const wrapper = document.createElement("div");
  const strings = getBeddingStrings(card.ownerDocument ?? document);

  wrapper.className = "hotel-bedding-selector";
  wrapper.dataset.hotelBeddingSelector = cardId;
  wrapper.dataset.hotelBeddingRoomClass = config.roomClass;
  wrapper.dataset.hotelBeddingOccupancy = config.occupancy;
  wrapper.dataset.hotelSelectedBedding = selectedKey;
  wrapper.dataset.hotelBeddingMaxRooms = String(getRoomTypeMaxRooms(config));

  wrapper.innerHTML = `
    <div class="hotel-bedding-header">
      <p class="hotel-bedding-title">${escapeHtml(strings.bedTypeTitle)}</p>
    </div>
    <input
      data-hotel-bedding-input="true"
      name="hotel_bedding_preference"
      type="hidden"
      value="${escapeHtml(selectedKey)}"
    />
    <div class="hotel-bedding-options">
      ${config.options
        .map(
          (option) => {
            const maxRooms = getOptionMaxRooms(config, option);
            const label = strings.optionLabels[option.key] ?? option.label;

            return `
            <button
              aria-pressed="${option.key === selectedKey ? "true" : "false"}"
              aria-disabled="${maxRooms === 0 ? "true" : "false"}"
              class="hotel-bedding-option ${option.key === selectedKey ? "is-selected" : ""}"
              data-hotel-bedding-label="${escapeHtml(label)}"
              data-hotel-bedding-max-rooms="${maxRooms}"
              data-hotel-bedding-option="${escapeHtml(option.key)}"
              ${maxRooms === 0 ? "disabled" : ""}
              type="button"
            >
              ${buildBeddingIcon(option.beds)}
              <span class="hotel-bedding-name">${escapeHtml(label)}</span>
            </button>
          `;
          },
        )
        .join("")}
    </div>
  `;

  wrapper
    .querySelectorAll<HTMLButtonElement>("[data-hotel-bedding-option]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const nextSelection = button.dataset.hotelBeddingOption;

        if (!nextSelection || button.disabled) {
          return;
        }

        updateSelectedOption(wrapper, nextSelection);
        writeStoredSelection(cardId, nextSelection);
        clearStoredCounts(cardId);
        delete wrapper.dataset.hotelBeddingCounts;
        delete wrapper.dataset.hotelBeddingTotalSelected;
        updateHiddenBeddingInput(wrapper, nextSelection);
        document.dispatchEvent(
          new CustomEvent("hotel:bedding-selection-change", {
            detail: {
              accommodationId: getAccommodationId(card),
              bedding: nextSelection,
              maxRooms: Number(wrapper.dataset.hotelBeddingMaxRooms),
              occupancy: config.occupancy,
              roomClass: config.roomClass,
              title: config.title,
            },
          }),
        );
      });
    });

  return wrapper;
}

function syncWrapperAvailability(
  wrapper: HTMLElement,
  config: BeddingConfig,
) {
  wrapper.dataset.hotelBeddingMaxRooms = String(getRoomTypeMaxRooms(config));

  for (const option of config.options) {
    const button = wrapper.querySelector<HTMLButtonElement>(
      `[data-hotel-bedding-option="${option.key}"]`,
    );

    if (!button) {
      continue;
    }

    const maxRooms = getOptionMaxRooms(config, option);
    button.dataset.hotelBeddingMaxRooms = String(maxRooms);
    button.disabled = maxRooms === 0;
    button.setAttribute("aria-disabled", String(maxRooms === 0));
  }

  const selectedKey = wrapper.dataset.hotelSelectedBedding;
  const selectedButton = selectedKey
    ? wrapper.querySelector<HTMLButtonElement>(
        `[data-hotel-bedding-option="${selectedKey}"]`,
      )
    : null;
  const nextSelected =
    selectedButton && !selectedButton.disabled
      ? selectedKey
      : wrapper.querySelector<HTMLButtonElement>(
          "[data-hotel-bedding-option]:not(:disabled)",
        )?.dataset.hotelBeddingOption;

  if (nextSelected) {
    updateSelectedOption(wrapper, nextSelected);
  }
}

const RATE_PLAN_QUANTITY_BUTTON_SELECTOR = [
  "[data-testid^='rate-plan-guest-quantity-select-']",
  "[data-testid^='rate-plan-quantity-select-']",
].join(",");

function setActiveQuantityLimit(
  documentRef: Document,
  wrapper: HTMLElement,
  button: HTMLElement,
  config: BeddingConfig,
) {
  const testId = button.getAttribute("data-testid");
  const maxRooms = getRoomTypeMaxRooms(config);
  const selectorId = wrapper.dataset.hotelBeddingSelector;

  if (!testId || !selectorId) {
    return;
  }

  documentRef.documentElement.dataset.hotelActiveRatePlanTestId = testId;
  documentRef.documentElement.dataset.hotelActiveBeddingSelector = selectorId;
  documentRef.documentElement.dataset.hotelActiveBeddingMaxRooms =
    String(maxRooms);
  documentRef.documentElement.dataset.hotelActiveBeddingLabel = config.title;
}

function scheduleQuantityLimitSync(documentRef: Document) {
  const sync = () => syncCloudbedsBeddingQuantityLimit(documentRef);
  const win = documentRef.defaultView;

  if (!win) {
    setTimeout(sync, 0);
    return;
  }

  win.setTimeout(sync, 0);
  win.setTimeout(sync, 150);
}

function bindRatePlanQuantityButtons(
  documentRef: Document,
  wrapper: HTMLElement,
  config: BeddingConfig,
) {
  const card = wrapper.closest("[data-testid^='accommodation-card-']");

  card
    ?.querySelectorAll<HTMLElement>(RATE_PLAN_QUANTITY_BUTTON_SELECTOR)
    .forEach((button) => {
      if (button.dataset.hotelBeddingLimitBound === "true") {
        return;
      }

      button.dataset.hotelBeddingLimitBound = "true";
      button.addEventListener("click", () => {
        setActiveQuantityLimit(documentRef, wrapper, button, config);
        scheduleQuantityLimitSync(documentRef);
      });
    });
}

function getQuantityControls(documentRef: Document, input: HTMLInputElement) {
  const inputTestId = input.getAttribute("data-testid");

  if (!inputTestId?.endsWith("-quantity-input")) {
    return null;
  }

  const stepperTestId = inputTestId.slice(0, -"-input".length);

  return {
    inputTestId,
    minusButton: documentRef.querySelector<HTMLButtonElement>(
      `[data-testid="${stepperTestId}-minus-button"]`,
    ),
    plusButton: documentRef.querySelector<HTMLButtonElement>(
      `[data-testid="${stepperTestId}-plus-button"]`,
    ),
  };
}

function setInputValue(input: HTMLInputElement, value: number) {
  const nextValue = String(value);
  const ownValueSetter = Object.getOwnPropertyDescriptor(input, "value")?.set;
  const prototype = Object.getPrototypeOf(input) as HTMLInputElement;
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(
    prototype,
    "value",
  )?.set;

  if (prototypeValueSetter && ownValueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(input, nextValue);
  } else {
    input.value = nextValue;
  }

  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function syncNativeQuantityValue(
  documentRef: Document,
  input: HTMLInputElement,
  nextTotal: number,
  maxRooms: number,
) {
  const controls = getQuantityControls(documentRef, input);

  if (!controls || !Number.isFinite(maxRooms) || maxRooms < 1) {
    return;
  }

  const targetTotal = Math.min(Math.max(1, nextTotal), maxRooms);
  const currentTotal = clampCount(input.value);

  if (targetTotal > currentTotal) {
    for (let count = currentTotal; count < targetTotal; count += 1) {
      controls.plusButton?.click();
    }
  } else if (targetTotal < currentTotal) {
    for (let count = currentTotal; count > targetTotal; count -= 1) {
      controls.minusButton?.click();
    }
  }

  // If the stepper buttons exist we trust them. When Cloudbeds caps the
  // quantity at its real availability (below our computed limit), force-setting
  // the value here is futile — Cloudbeds reverts it on its next render, and
  // that revert re-triggers the observer, producing an endless tug-of-war.
  // Only force the value when there are no buttons to drive (so we are the
  // sole writer of the field).
  if (
    clampCount(input.value) !== targetTotal &&
    !controls.plusButton &&
    !controls.minusButton
  ) {
    setInputValue(input, targetTotal);
  }
}

function applyNativeQuantityLimit(
  documentRef: Document,
  input: HTMLInputElement,
  maxRooms: number,
) {
  const controls = getQuantityControls(documentRef, input);

  if (!controls || !Number.isFinite(maxRooms) || maxRooms < 1) {
    return;
  }

  const { inputTestId, plusButton } = controls;
  const currentValue = Number(input.value);
  const reachedBeddingLimit =
    Number.isFinite(currentValue) && currentValue >= maxRooms;

  input.readOnly = true;
  input.max = String(maxRooms);
  input.dataset.hotelBeddingQuantityLimit = String(maxRooms);

  // Capture Cloudbeds' original label once. This runs on every adjustment
  // pass, so appending to the live attribute would grow it without bound.
  if (input.dataset.hotelBeddingBaseAriaLabel === undefined) {
    input.dataset.hotelBeddingBaseAriaLabel =
      input.getAttribute("aria-label") ?? "Cantidad";
  }

  input.setAttribute(
    "aria-label",
    `${input.dataset.hotelBeddingBaseAriaLabel}. ${getBeddingStrings(documentRef).maxTotal(maxRooms)}`,
  );

  if (plusButton) {
    plusButton.dataset.hotelBeddingMaxRooms = String(maxRooms);
    plusButton.dataset.hotelBeddingInputTestId = inputTestId;

    if (plusButton.dataset.hotelBeddingLimitBound !== "true") {
      plusButton.dataset.hotelBeddingLimitBound = "true";
      plusButton.addEventListener(
        "click",
        (event) => {
          const limit = Number(plusButton.dataset.hotelBeddingMaxRooms);
          const relatedInputTestId = plusButton.dataset.hotelBeddingInputTestId;
          const relatedInput = relatedInputTestId
            ? documentRef.querySelector<HTMLInputElement>(
                `[data-testid="${relatedInputTestId}"]`,
              )
            : null;
          const value = Number(relatedInput?.value);

          if (
            Number.isFinite(limit) &&
            Number.isFinite(value) &&
            value >= limit
          ) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        },
        true,
      );
    }

    const addedAriaDisabled =
      plusButton.dataset.hotelBeddingAddedAriaDisabled === "true";

    if (reachedBeddingLimit) {
      if (!plusButton.hasAttribute("aria-disabled")) {
        plusButton.dataset.hotelBeddingAddedAriaDisabled = "true";
      }
      plusButton.setAttribute("aria-disabled", "true");
      plusButton.dataset.hotelBeddingLimitReached = "true";
    } else {
      plusButton.dataset.hotelBeddingLimitReached = "false";
      if (addedAriaDisabled) {
        plusButton.removeAttribute("aria-disabled");
        delete plusButton.dataset.hotelBeddingAddedAriaDisabled;
      }
    }
  }
}

function getCurrentPopoverCounts(panel: HTMLElement, config: BeddingConfig) {
  const counts = createEmptyCounts(config);

  for (const option of config.options) {
    const countElement = panel.querySelector<HTMLElement>(
      `[data-hotel-bedding-counter-count="${option.key}"]`,
    );

    counts[option.key] = clampCount(countElement?.textContent);
  }

  return counts;
}

function updateBeddingCountsState(
  documentRef: Document,
  wrapper: HTMLElement,
  config: BeddingConfig,
  counts: BeddingCounts,
  totalMaxRooms: number,
  emitChange = false,
) {
  const serializedCounts = serializeBeddingCounts(counts);
  const cardId = wrapper.dataset.hotelBeddingSelector;
  const totalSelected = getCountsTotal(counts);

  wrapper.dataset.hotelBeddingCounts = serializedCounts;
  wrapper.dataset.hotelBeddingTotalSelected = String(totalSelected);
  wrapper.dataset.hotelBeddingMaxRooms = String(totalMaxRooms);
  updateHiddenBeddingInput(
    wrapper,
    serializedCounts || wrapper.dataset.hotelSelectedBedding || "",
  );

  if (cardId) {
    writeStoredCounts(cardId, counts);
  }

  if (emitChange) {
    documentRef.dispatchEvent(
      new CustomEvent("hotel:bedding-selection-change", {
        detail: {
          accommodationId: cardId,
          counts,
          maxRooms: totalMaxRooms,
          occupancy: config.occupancy,
          roomClass: config.roomClass,
          title: config.title,
          totalSelected,
        },
      }),
    );
  }
}

function setTextIfChanged(element: HTMLElement | null, value: string) {
  if (element && element.textContent !== value) {
    element.textContent = value;
  }
}

function renderBeddingCounterPanel(
  documentRef: Document,
  panel: HTMLElement,
  wrapper: HTMLElement,
  config: BeddingConfig,
  input: HTMLInputElement,
  counts: BeddingCounts,
  totalMaxRooms: number,
  emitChange = false,
) {
  const totalSelected = getCountsTotal(counts);

  for (const option of config.options) {
    const optionMaxRooms = getOptionMaxRooms(config, option);
    const count = counts[option.key] ?? 0;
    const row = panel.querySelector<HTMLElement>(
      `[data-hotel-bedding-counter-row="${option.key}"]`,
    );
    const countElement = panel.querySelector<HTMLElement>(
      `[data-hotel-bedding-counter-count="${option.key}"]`,
    );
    const minusButton = panel.querySelector<HTMLButtonElement>(
      `[data-hotel-bedding-counter-option="${option.key}"][data-hotel-bedding-counter-action="decrement"]`,
    );
    const plusButton = panel.querySelector<HTMLButtonElement>(
      `[data-hotel-bedding-counter-option="${option.key}"][data-hotel-bedding-counter-action="increment"]`,
    );

    row?.classList.toggle("is-unavailable", optionMaxRooms <= 0);

    setTextIfChanged(countElement, String(count));

    if (minusButton) {
      minusButton.disabled = count <= 0 || totalSelected <= 1;
      minusButton.setAttribute("aria-disabled", String(minusButton.disabled));
    }

    if (plusButton) {
      plusButton.disabled =
        optionMaxRooms <= 0 ||
        count >= optionMaxRooms ||
        totalSelected >= totalMaxRooms;
      plusButton.setAttribute("aria-disabled", String(plusButton.disabled));
    }
  }

  const totalElement = panel.querySelector<HTMLElement>(
    "[data-hotel-bedding-total]",
  );

  if (totalElement) {
    totalElement.dataset.selected = String(totalSelected);
    totalElement.dataset.max = String(totalMaxRooms);
    setTextIfChanged(
      totalElement,
      getBeddingStrings(documentRef).total(totalSelected, totalMaxRooms),
    );
  }

  syncNativeQuantityValue(documentRef, input, totalSelected, totalMaxRooms);
  applyNativeQuantityLimit(documentRef, input, totalMaxRooms);
  updateBeddingCountsState(
    documentRef,
    wrapper,
    config,
    counts,
    totalMaxRooms,
    emitChange,
  );
}

function ensureAtLeastOneSelected(
  config: BeddingConfig,
  wrapper: HTMLElement,
  counts: BeddingCounts,
  totalMaxRooms: number,
) {
  if (getCountsTotal(counts) > 0 || totalMaxRooms <= 0) {
    return counts;
  }

  const selectedKey = wrapper.dataset.hotelSelectedBedding;
  const preferredOption =
    config.options.find(
      (option) =>
        option.key === selectedKey && getOptionMaxRooms(config, option) > 0,
    ) ??
    config.options.find((option) => getOptionMaxRooms(config, option) > 0);

  if (preferredOption) {
    counts[preferredOption.key] = 1;
  }

  return counts;
}

function getInitialPopoverCounts(
  wrapper: HTMLElement,
  config: BeddingConfig,
  input: HTMLInputElement,
  totalMaxRooms: number,
) {
  const cardId = wrapper.dataset.hotelBeddingSelector;
  const storedCounts = cardId ? readStoredCounts(cardId, config) : null;

  if (storedCounts && getCountsTotal(storedCounts) > 0) {
    return clampBeddingCounts(config, storedCounts, totalMaxRooms);
  }

  return buildDefaultCounts(
    config,
    wrapper.dataset.hotelSelectedBedding,
    clampCount(input.value),
    totalMaxRooms,
  );
}

// FontAwesome "far" minus/plus glyphs — the exact icons Cloudbeds' own
// quantity steppers use, so our counter buttons render identically.
const COUNTER_DECREMENT_ICON =
  '<svg class="hotel-bedding-counter-glyph" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true"><path d="M432 256c0 13.3-10.7 24-24 24L40 280c-13.3 0-24-10.7-24-24s10.7-24 24-24l368 0c13.3 0 24 10.7 24 24z"/></svg>';
const COUNTER_INCREMENT_ICON =
  '<svg class="hotel-bedding-counter-glyph" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true"><path d="M248 72c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 160L40 232c-13.3 0-24 10.7-24 24s10.7 24 24 24l160 0 0 160c0 13.3 10.7 24 24 24s24-10.7 24-24l0-160 160 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-160 0 0-160z"/></svg>';

function buildCounterPanelHtml(
  config: BeddingConfig,
  strings: BeddingLocaleStrings,
) {
  return `
    <div class="hotel-bedding-counter-list">
      ${config.options
        .map((option) => {
          const label = strings.optionLabels[option.key] ?? option.label;

          return `
          <div
            class="hotel-bedding-counter-row"
            data-hotel-bedding-counter-row="${escapeHtml(option.key)}"
          >
            <span class="hotel-bedding-counter-name">${escapeHtml(label)}</span>
            <span class="hotel-bedding-counter-controls">
              <button
                aria-label="${escapeHtml(strings.decrease(label))}"
                class="hotel-bedding-counter-button"
                data-hotel-bedding-counter-action="decrement"
                data-hotel-bedding-counter-option="${escapeHtml(option.key)}"
                type="button"
              >${COUNTER_DECREMENT_ICON}</button>
              <span
                class="hotel-bedding-counter-count"
                data-hotel-bedding-counter-count="${escapeHtml(option.key)}"
              >0</span>
              <button
                aria-label="${escapeHtml(strings.increase(label))}"
                class="hotel-bedding-counter-button"
                data-hotel-bedding-counter-action="increment"
                data-hotel-bedding-counter-option="${escapeHtml(option.key)}"
                type="button"
              >${COUNTER_INCREMENT_ICON}</button>
            </span>
          </div>
        `;
        })
        .join("")}
    </div>
    <p class="hotel-bedding-total" data-hotel-bedding-total></p>
  `;
}

function bindCounterPanel(
  documentRef: Document,
  panel: HTMLElement,
  wrapper: HTMLElement,
  config: BeddingConfig,
  input: HTMLInputElement,
) {
  if (panel.dataset.hotelBeddingCounterBound === "true") {
    return;
  }

  panel.dataset.hotelBeddingCounterBound = "true";
  panel.addEventListener("click", (event) => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>(
      "[data-hotel-bedding-counter-action]",
    );

    if (!button || button.disabled) {
      return;
    }

    const optionKey = button.dataset.hotelBeddingCounterOption;
    const option = config.options.find(({ key }) => key === optionKey);

    if (!option) {
      return;
    }

    const nextCounts = getCurrentPopoverCounts(panel, config);
    const currentCount = nextCounts[option.key] ?? 0;
    const currentTotal = getCountsTotal(nextCounts);
    const totalMaxRooms = clampCount(panel.dataset.hotelBeddingTotalMaxRooms);
    const optionMaxRooms = getOptionMaxRooms(config, option);

    if (button.dataset.hotelBeddingCounterAction === "increment") {
      if (currentTotal >= totalMaxRooms || currentCount >= optionMaxRooms) {
        return;
      }

      nextCounts[option.key] = currentCount + 1;
    } else {
      if (currentCount <= 0 || currentTotal <= 1) {
        return;
      }

      nextCounts[option.key] = currentCount - 1;
    }

    const clampedCounts = ensureAtLeastOneSelected(
      config,
      wrapper,
      clampBeddingCounts(config, nextCounts, totalMaxRooms),
      totalMaxRooms,
    );

    renderBeddingCounterPanel(
      documentRef,
      panel,
      wrapper,
      config,
      input,
      clampedCounts,
      totalMaxRooms,
      true,
    );
  });
}

function ensureBeddingCounterPanel(
  documentRef: Document,
  input: HTMLInputElement,
  wrapper: HTMLElement,
  config: BeddingConfig,
  totalMaxRooms: number,
) {
  const popover = input.closest(
    [
      "[data-testid='guestselector-popover']",
      "[data-testid*='guestselector-popover' i]",
      ".cb-guestselector-popover",
      "[role='dialog']",
    ].join(","),
  );

  if (!popover) {
    return;
  }

  const quantityLabel = popover.querySelector(
    ".cb-guestselector-quantity-text",
  );
  const quantityRow = quantityLabel?.parentElement;
  const signature = config.options.map((option) => option.key).join("|");
  let panel = popover.querySelector<HTMLElement>(
    "[data-hotel-bedding-counter-panel='true']",
  );

  quantityRow?.setAttribute("data-hotel-bedding-native-quantity-row", "true");

  if (!panel) {
    panel = documentRef.createElement("div");
    panel.className = "hotel-bedding-counter-panel";
    panel.dataset.hotelBeddingCounterPanel = "true";
    panel.dataset.noCurrencyConversion = "true";
    quantityRow?.insertAdjacentElement("afterend", panel);

    if (!quantityRow) {
      popover.prepend(panel);
    }
  }

  // Cloudbeds prints a "Max: N" caption beside the (now hidden) native room
  // stepper. Our "Total: X de N habitaciones disponibles" line already conveys
  // the limit, so hide it. Scope to the room-quantity section only (never the
  // guest steppers, which live in a separate section) by tagging the sibling
  // that is neither the native row nor our own panel.
  const quantitySection = quantityRow?.parentElement;

  if (quantitySection) {
    for (const child of Array.from(quantitySection.children)) {
      if (
        child === quantityRow ||
        child === panel ||
        child.querySelector("input")
      ) {
        continue;
      }

      child.setAttribute("data-hotel-bedding-native-max-note", "true");
    }
  }

  if (panel.dataset.hotelBeddingCounterSignature !== signature) {
    panel.innerHTML = buildCounterPanelHtml(config, getBeddingStrings(documentRef));
    panel.dataset.hotelBeddingCounterSignature = signature;
  }

  panel.dataset.hotelBeddingTotalMaxRooms = String(totalMaxRooms);
  bindCounterPanel(documentRef, panel, wrapper, config, input);

  const existingCounts =
    panel.dataset.hotelBeddingCounterInitialized === "true"
      ? getCurrentPopoverCounts(panel, config)
      : getInitialPopoverCounts(wrapper, config, input, totalMaxRooms);
  const clampedCounts = ensureAtLeastOneSelected(
    config,
    wrapper,
    clampBeddingCounts(config, existingCounts, totalMaxRooms),
    totalMaxRooms,
  );

  panel.dataset.hotelBeddingCounterInitialized = "true";
  renderBeddingCounterPanel(
    documentRef,
    panel,
    wrapper,
    config,
    input,
    clampedCounts,
    totalMaxRooms,
  );
}

function applyQuantityInputLimit(
  documentRef: Document,
  input: HTMLInputElement,
  wrapper: HTMLElement,
  config: BeddingConfig,
) {
  const totalMaxRooms = getRoomTypeMaxRooms(config);

  if (!Number.isFinite(totalMaxRooms) || totalMaxRooms < 1) {
    return;
  }

  applyNativeQuantityLimit(documentRef, input, totalMaxRooms);
  ensureBeddingCounterPanel(documentRef, input, wrapper, config, totalMaxRooms);
}

function syncCloudbedsBeddingQuantityLimit(documentRef: Document) {
  const activeRatePlanTestId =
    documentRef.documentElement.dataset.hotelActiveRatePlanTestId;
  const activeSelectorId =
    documentRef.documentElement.dataset.hotelActiveBeddingSelector;

  if (activeRatePlanTestId) {
    const popoverInput = documentRef.querySelector<HTMLInputElement>(
      `[data-testid="${activeRatePlanTestId}-quantity-input"]`,
    );
    const activeWrapper = activeSelectorId
      ? documentRef.querySelector<HTMLElement>(
          `[data-hotel-bedding-selector="${activeSelectorId}"]`,
        )
      : null;
    const activeCard = activeWrapper?.closest(
      "[data-testid^='accommodation-card-']",
    );
    const activeConfig = activeCard ? getBeddingConfig(activeCard) : undefined;

    if (popoverInput && activeWrapper && activeConfig) {
      applyQuantityInputLimit(
        documentRef,
        popoverInput,
        activeWrapper,
        activeConfig,
      );
    }
  }

  documentRef
    .querySelectorAll<HTMLElement>("[data-hotel-bedding-selector]")
    .forEach((wrapper) => {
      const cardId = wrapper.dataset.hotelBeddingSelector;
      const card = wrapper.closest("[data-testid^='accommodation-card-']");
      const config = card ? getBeddingConfig(card) : undefined;

      if (!cardId || !config) {
        return;
      }

      documentRef
        .querySelectorAll<HTMLInputElement>(
          `[data-testid^="rate-plan-quantity-stepper-${cardId}-"][data-testid$="-quantity-input"]`,
        )
        .forEach((input) =>
          applyQuantityInputLimit(documentRef, input, wrapper, config),
        );
    });
}

function findInsertionPoint(card: Element) {
  return (
    card.querySelector(".cb-view-details-button") ??
    card.querySelector("[data-testid*='view-details' i]") ??
    card.querySelector("button")
  );
}

export function injectCloudbedsBeddingSelectors(
  documentRef: Document = document,
) {
  const cards = documentRef.querySelectorAll(
    [
      ".cb-accommodation-card[data-testid^='accommodation-card-']",
      "[data-testid^='accommodation-card-']",
    ].join(","),
  );

  for (const card of cards) {
    if (card.querySelector("[data-hotel-bedding-selector]")) {
      continue;
    }

    const config = getBeddingConfig(card);

    if (!config) {
      continue;
    }

    const selector = createBeddingSelector(card, config);
    const insertionPoint = findInsertionPoint(card);

    if (insertionPoint) {
      insertionPoint.insertAdjacentElement("afterend", selector);
      continue;
    }

    const title = card.querySelector("h3");
    title?.parentElement?.append(selector);
  }
}

export function syncCloudbedsBeddingSelections(
  documentRef: Document = document,
) {
  documentRef
    .querySelectorAll<HTMLElement>("[data-hotel-bedding-selector]")
    .forEach((wrapper) => {
      const card = wrapper.closest("[data-testid^='accommodation-card-']");
      const config = card ? getBeddingConfig(card) : undefined;

      if (config) {
        syncWrapperAvailability(wrapper, config);
      }

      const selectedKey = wrapper.dataset.hotelSelectedBedding;

      if (selectedKey) {
        updateSelectedOption(wrapper, selectedKey);
      }

      if (config) {
        bindRatePlanQuantityButtons(documentRef, wrapper, config);
      }
    });

  syncCloudbedsBeddingQuantityLimit(documentRef);
}

/** Applies server-digested counters without ever exposing physical room IDs. */
export function setCloudbedsBeddingAvailability(
  availability: CloudbedsBeddingAvailability | null,
  documentRef: Document = document,
) {
  liveAvailability = availability;
  injectCloudbedsBeddingSelectors(documentRef);
  syncCloudbedsBeddingSelections(documentRef);
}
