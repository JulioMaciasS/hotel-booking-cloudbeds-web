type BeddingOption = {
  key: string;
  label: string;
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

const STORAGE_PREFIX = "hotel-bedding-selection:";

const DOUBLE_BEDDING_OPTIONS: BeddingOption[] = [
  { key: "matrimonial", label: "Matrimonial", beds: [2] },
  { key: "dos_camas_separadas", label: "Dos camas separadas", beds: [1, 1] },
];

const TRIPLE_BEDDING_OPTIONS: BeddingOption[] = [
  {
    key: "matrimonial_cama_individual",
    label: "Matrimonial y cama individual",
    beds: [2, 1],
  },
  {
    key: "tres_camas_individuales",
    label: "Tres camas individuales",
    beds: [1, 1, 1],
  },
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

const BEDDING_CONFIGS: BeddingConfig[] = [
  {
    id: "227179928547456",
    title: "Doble Estandar",
    roomClass: "standard",
    occupancy: "double",
    options: DOUBLE_BEDDING_OPTIONS,
  },
  {
    id: "229741541683392",
    title: "Doble Superior",
    roomClass: "superior",
    occupancy: "double",
    options: DOUBLE_BEDDING_OPTIONS,
  },
  {
    id: "229741180768384",
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
    options: TRIPLE_BEDDING_OPTIONS,
  },
];

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

  return BEDDING_CONFIGS.find((config) => {
    const normalizedTitle = normalizeText(config.title);

    if (title === normalizedTitle || title.includes(normalizedTitle)) {
      return true;
    }

    const matchesOccupancy = title.includes(config.occupancy === "double" ? "doble" : "triple");
    const matchesClass = title.includes(
      config.roomClass === "standard" ? "estandar" : "superior",
    );

    return matchesOccupancy && matchesClass;
  });
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
  const selectedKey =
    readStoredSelection(cardId) ??
    config.options[0]?.key ??
    "";
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
      value="${selectedKey}"
    />
    <div class="hotel-bedding-options">
      ${config.options
        .map(
          (option) => `
            <button
              aria-pressed="${option.key === selectedKey ? "true" : "false"}"
              class="hotel-bedding-option ${option.key === selectedKey ? "is-selected" : ""}"
              data-hotel-bedding-option="${option.key}"
              type="button"
            >
              ${buildBeddingIcon(option.beds)}
              <span class="hotel-bedding-name">${option.label}</span>
            </button>
          `,
        )
        .join("")}
    </div>
  `;

  wrapper
    .querySelectorAll<HTMLButtonElement>("[data-hotel-bedding-option]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const nextSelection = button.dataset.hotelBeddingOption;

        if (!nextSelection) {
          return;
        }

        updateSelectedOption(wrapper, nextSelection);
        writeStoredSelection(cardId, nextSelection);
        document.dispatchEvent(
          new CustomEvent("hotel:bedding-selection-change", {
            detail: {
              accommodationId: getAccommodationId(card),
              bedding: nextSelection,
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
      const selectedKey = wrapper.dataset.hotelSelectedBedding;

      if (selectedKey) {
        updateSelectedOption(wrapper, selectedKey);
      }
    });
}
