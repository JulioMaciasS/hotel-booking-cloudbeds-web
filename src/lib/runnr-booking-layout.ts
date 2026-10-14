const LAUNCHER = "#runnrai-container .wdc-launcher";
const CART_ACTION = '[data-testid="shopping-cart-banner-confirm-button"]';
const CONTROL_SELECTOR =
  'button, a, input, select, textarea, [role="button"], [role="combobox"], [role="checkbox"], [role="radio"], [tabindex="0"]';
const MIN_GAP = 12;

function visible(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  const style = element.ownerDocument.defaultView!.getComputedStyle(element);
  return rect.width > 0 && rect.height > 0 &&
    style.display !== "none" && style.visibility !== "hidden" &&
    style.opacity !== "0" && !element.closest('[hidden], [aria-hidden="true"]');
}

export function syncRunnrBookingLayout(documentRef: Document = document) {
  const root = documentRef.documentElement;
  const windowRef = documentRef.defaultView!;
  const booking = documentRef.querySelector(".reservation-page");
  const mobile = windowRef.matchMedia("(max-width: 1023px)").matches;
  if (!booking || !mobile) {
    delete root.dataset.runnrBookingBlocked;
    root.style.removeProperty("--runnr-booking-bottom");
    return;
  }

  const viewport = windowRef.visualViewport;
  const viewportBottom = (viewport?.offsetTop ?? 0) +
    (viewport?.height ?? windowRef.innerHeight);
  let bottom = 16;
  // Cloudbeds can portal the banner outside its host element.
  for (const action of documentRef.querySelectorAll(CART_ACTION)) {
    if (!visible(action)) continue;
    // Measure the whole native fixed banner, not just its button. Do not move
    // or mutate Cloudbeds nodes, and do not assume a fixed banner height.
    let ancestor: Element | null = action;
    while (ancestor && ancestor !== booking) {
      if (windowRef.getComputedStyle(ancestor).position === "fixed") {
        const rect = ancestor.getBoundingClientRect();
        if (rect.top < viewportBottom && rect.bottom > 0) {
          bottom = Math.max(bottom, viewportBottom - rect.top + MIN_GAP);
        }
        break;
      }
      ancestor = ancestor.parentElement;
    }
  }
  const offset = `${Math.ceil(bottom)}px`;
  if (root.style.getPropertyValue("--runnr-booking-bottom") !== offset) {
    root.style.setProperty("--runnr-booking-bottom", offset);
  }

  const modalOpen = Array.from(documentRef.querySelectorAll(
    '[role="dialog"], [aria-modal="true"]',
  )).some(element => !element.closest("#runnrai-container") && visible(element));
  const focused = documentRef.activeElement;
  const editingBooking = focused instanceof windowRef.HTMLElement &&
    focused.matches('input, select, textarea, [contenteditable="true"]') &&
    !focused.closest("#runnrai-container");
  const launcher = documentRef.querySelector(LAUNCHER);
  let collision = false;
  if (launcher) {
    // Its box remains measurable while visibility:hidden, so it can recover
    // automatically after scrolling a covered native control out of the way.
    const box = launcher.getBoundingClientRect();
    collision = Array.from(documentRef.querySelectorAll(CONTROL_SELECTOR)).some(element => {
      if (element.closest("#runnrai-container") || element.contains(launcher) || !visible(element)) return false;
      const rect = element.getBoundingClientRect();
      return rect.left < box.right && rect.right > box.left &&
        rect.top < box.bottom && rect.bottom > box.top;
    });
  }
  const blocked = modalOpen || editingBooking || collision;
  if (blocked) {
    if (root.dataset.runnrBookingBlocked !== "true") root.dataset.runnrBookingBlocked = "true";
  } else {
    delete root.dataset.runnrBookingBlocked;
  }
}

/** Watches only layout signals; never reloads Runnr or touches booking data. */
export function watchRunnrBookingLayout(documentRef: Document = document) {
  const windowRef = documentRef.defaultView!;
  let frame: number | null = null;
  const schedule = () => {
    if (frame !== null) return;
    frame = windowRef.requestAnimationFrame(() => {
      frame = null;
      syncRunnrBookingLayout(documentRef);
    });
  };
  const observer = new windowRef.MutationObserver(schedule);
  observer.observe(documentRef.body, {
    childList: true, subtree: true, attributes: true,
    attributeFilter: ["class", "style", "hidden", "aria-hidden", "aria-expanded"],
  });
  windowRef.addEventListener("resize", schedule);
  documentRef.addEventListener("scroll", schedule, { capture: true, passive: true });
  documentRef.addEventListener("focusin", schedule);
  documentRef.addEventListener("focusout", schedule);
  windowRef.visualViewport?.addEventListener("resize", schedule);
  windowRef.visualViewport?.addEventListener("scroll", schedule);
  syncRunnrBookingLayout(documentRef);
  return () => {
    observer.disconnect();
    if (frame !== null) windowRef.cancelAnimationFrame(frame);
    windowRef.removeEventListener("resize", schedule);
    documentRef.removeEventListener("scroll", schedule, true);
    documentRef.removeEventListener("focusin", schedule);
    documentRef.removeEventListener("focusout", schedule);
    windowRef.visualViewport?.removeEventListener("resize", schedule);
    windowRef.visualViewport?.removeEventListener("scroll", schedule);
    delete documentRef.documentElement.dataset.runnrBookingBlocked;
    documentRef.documentElement.style.removeProperty("--runnr-booking-bottom");
  };
}
