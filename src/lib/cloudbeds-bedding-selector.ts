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

function updateSelectedOption(wrapper: HTMLElement, selectedKey: string) {
  wrapper.dataset.hotelSelectedBedding = selectedKey;
  const selectedButton = wrapper.querySelector<HTMLButtonElement>(
    `[data-hotel-bedding-option="${selectedKey}"]`,
  );

  if (selectedButton?.dataset.hotelBeddingMaxRooms) {
    wrapper.dataset.hotelBeddingMaxRooms =
      selectedButton.dataset.hotelBeddingMaxRooms;
    wrapper.dataset.hotelBeddingLabel =
      selectedButton.dataset.hotelBeddingLabel ?? selectedKey;
  }

  const hiddenInput = wrapper.querySelector<HTMLInputElement>(
    "input[data-hotel-bedding-input='true']",
  );

  if (hiddenInput) {
    hiddenInput.value = selectedKey;
  }

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

  wrapper.className = "hotel-bedding-selector";
  wrapper.dataset.hotelBeddingSelector = cardId;
  wrapper.dataset.hotelBeddingRoomClass = config.roomClass;
  wrapper.dataset.hotelBeddingOccupancy = config.occupancy;
  wrapper.dataset.hotelSelectedBedding = selectedKey;

  wrapper.innerHTML = `
    <div class="hotel-bedding-header">
      <p class="hotel-bedding-title">Tipo de cama</p>
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

            return `
            <button
              aria-pressed="${option.key === selectedKey ? "true" : "false"}"
              aria-disabled="${maxRooms === 0 ? "true" : "false"}"
              class="hotel-bedding-option ${option.key === selectedKey ? "is-selected" : ""}"
              data-hotel-bedding-label="${escapeHtml(option.label)}"
              data-hotel-bedding-max-rooms="${maxRooms}"
              data-hotel-bedding-option="${escapeHtml(option.key)}"
              ${maxRooms === 0 ? "disabled" : ""}
              type="button"
            >
              ${buildBeddingIcon(option.beds)}
              <span class="hotel-bedding-name">${escapeHtml(option.label)}</span>
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
) {
  const testId = button.getAttribute("data-testid");
  const maxRooms = wrapper.dataset.hotelBeddingMaxRooms;

  if (!testId || !maxRooms) {
    return;
  }

  documentRef.documentElement.dataset.hotelActiveRatePlanTestId = testId;
  documentRef.documentElement.dataset.hotelActiveBeddingMaxRooms = maxRooms;
  documentRef.documentElement.dataset.hotelActiveBeddingLabel =
    wrapper.dataset.hotelBeddingLabel ?? wrapper.dataset.hotelSelectedBedding ?? "";
}

function bindRatePlanQuantityButtons(
  documentRef: Document,
  wrapper: HTMLElement,
) {
  const card = wrapper.closest("[data-testid^='accommodation-card-']");

  card
    ?.querySelectorAll<HTMLElement>(RATE_PLAN_QUANTITY_BUTTON_SELECTOR)
    .forEach((button) => {
      if (button.dataset.hotelBeddingLimitBound === "true") {
        return;
      }

      button.dataset.hotelBeddingLimitBound = "true";
      button.addEventListener(
        "click",
        () => setActiveQuantityLimit(documentRef, wrapper, button),
        true,
      );
    });
}

function limitText(label: string, maxRooms: number) {
  const roomLabel = maxRooms === 1 ? "habitación" : "habitaciones";

  return `Máximo para ${label}: ${maxRooms} ${roomLabel}`;
}

function applyQuantityInputLimit(
  documentRef: Document,
  input: HTMLInputElement,
  maxRooms: number,
  beddingLabel: string,
) {
  if (!Number.isFinite(maxRooms) || maxRooms < 1) {
    return;
  }

  const inputTestId = input.getAttribute("data-testid");

  if (!inputTestId?.endsWith("-quantity-input")) {
    return;
  }

  const stepperTestId = inputTestId.slice(0, -"-input".length);
  const plusButton = documentRef.querySelector<HTMLButtonElement>(
    `[data-testid="${stepperTestId}-plus-button"]`,
  );
  const currentValue = Number(input.value);
  const reachedBeddingLimit =
    Number.isFinite(currentValue) && currentValue >= maxRooms;

  input.readOnly = true;
  input.max = String(maxRooms);
  input.dataset.hotelBeddingQuantityLimit = String(maxRooms);
  input.setAttribute(
    "aria-label",
    `${input.getAttribute("aria-label") ?? "Cantidad"}. ${limitText(beddingLabel, maxRooms)}`,
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

  const popover = input.closest("[data-testid='guestselector-popover']");
  const quantityLabel = popover?.querySelector(
    ".cb-guestselector-quantity-text",
  );
  const quantityRow = quantityLabel?.parentElement;
  let note = popover?.querySelector<HTMLElement>(
    "[data-hotel-bedding-limit-note='true']",
  );

  if (!note && quantityRow) {
    note = documentRef.createElement("p");
    note.className = "hotel-bedding-limit-note";
    note.dataset.hotelBeddingLimitNote = "true";
    quantityRow.insertAdjacentElement("afterend", note);
  }

  if (note) {
    const nextText = limitText(beddingLabel, maxRooms);

    if (note.textContent !== nextText) {
      note.textContent = nextText;
    }
  }
}

function syncCloudbedsBeddingQuantityLimit(documentRef: Document) {
  const activeRatePlanTestId =
    documentRef.documentElement.dataset.hotelActiveRatePlanTestId;
  const activeMaxRooms = Number(
    documentRef.documentElement.dataset.hotelActiveBeddingMaxRooms,
  );
  const activeBeddingLabel =
    documentRef.documentElement.dataset.hotelActiveBeddingLabel ?? "esta opción";

  if (activeRatePlanTestId) {
    const popoverInput = documentRef.querySelector<HTMLInputElement>(
      `[data-testid="${activeRatePlanTestId}-quantity-input"]`,
    );

    if (popoverInput) {
      applyQuantityInputLimit(
        documentRef,
        popoverInput,
        activeMaxRooms,
        activeBeddingLabel,
      );
    }
  }

  documentRef
    .querySelectorAll<HTMLElement>("[data-hotel-bedding-selector]")
    .forEach((wrapper) => {
      const cardId = wrapper.dataset.hotelBeddingSelector;
      const maxRooms = Number(wrapper.dataset.hotelBeddingMaxRooms);
      const beddingLabel = wrapper.dataset.hotelBeddingLabel ?? "esta opción";

      if (!cardId) {
        return;
      }

      documentRef
        .querySelectorAll<HTMLInputElement>(
          `[data-testid^="rate-plan-quantity-stepper-${cardId}-"][data-testid$="-quantity-input"]`,
        )
        .forEach((input) =>
          applyQuantityInputLimit(
            documentRef,
            input,
            maxRooms,
            beddingLabel,
          ),
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

      bindRatePlanQuantityButtons(documentRef, wrapper);
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
