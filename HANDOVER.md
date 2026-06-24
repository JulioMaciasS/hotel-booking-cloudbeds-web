# Handover — Cloudbeds bedding selector & room-type assignment

> Purpose: let a different AI model continue this work cold. Written 2026-06-24.
> Everything in "Session work" below is **already committed on `main`** (commit `b4df2a3`).
> The only uncommitted file is `src/components/LanguageSwitcher.tsx` (user's unrelated work — leave it alone).

---

## 1. The next task (what to actually build)

**Goal:** When a guest finishes a booking, automatically assign the reservation to the **physical rooms that match the bed layout they chose** (e.g. they picked 1 "Matrimonial" + 1 "Dos camas separadas" within the *Doble Estándar* room type → assign one matrimonial-capable room and one twin-capable room).

The user named the Cloudbeds API operation **`postReservationToRoom`** ("research the api"). I did **not** research it yet — that's step 1.

### What works today vs. what's missing
- ✅ The selector already books the **correct number of rooms** of the correct room *type*: `syncNativeQuantityValue()` mirrors the per-bed total into Cloudbeds' native quantity stepper (`src/lib/cloudbeds-bedding-selector.ts`).
- ✅ The chosen distribution is captured client-side: hidden input `name="hotel_bedding_preference"` (value like `matrimonial:1;dos_camas_separadas:1`), sessionStorage (`hotel-bedding-counts:<cardId>`, `hotel-bedding-selection:<cardId>`), and a `hotel:bedding-selection-change` DOM event (detail includes `accommodationId`, `counts`, `totalSelected`, `title`, `occupancy`, `roomClass`).
- ❌ Cloudbeds is **never told which physical rooms / bed layouts** to use. It books N rooms of the parent type and auto-assigns physical rooms. The matrimonial-vs-twin choice currently dies in the browser.

### Research questions to answer first (in order)
1. **The API itself.** Confirm the exact Cloudbeds endpoint, version, params, and required OAuth scope / API-key permission for assigning a reservation to a specific room. Start at developers.cloudbeds.com. The repo already uses **API v1.3** with `x-api-key` auth (see §5). Candidate names to verify: `postReservationToRoom`, `putRoomAssignment`, `postRoomAssign`. Do **not** assume the shape — verify it.
2. **How to get the `reservationID` after checkout.** The booking is completed by the **third-party `<cb-immersive-experience>` web component** (loaded from `static1.cloudbeds.com`), not our code. Options to investigate: does the component emit a completion event / callback? Is there a confirmation redirect with a reservation param? Should we use **Cloudbeds webhooks** (`reservation/created`) server-side? Or poll `getReservations`? This is the biggest unknown.
3. **The physical-room mapping must become real.** `ROOM_BEDDING_CAPABILITIES` in `src/lib/cloudbeds-bedding-inventory.ts` is keyed by **placeholder IDs** (`<roomTypeID>-0`, `-1`, …) — see the comment "Confirm these suffixes once with an undated getRooms response before production." To assign a reservation you need **real `roomID`s** and which bed layouts each supports. Pull a live `getRooms` response and replace the placeholder keys with real `roomID`s. Until then, assignment is impossible.

### Suggested architecture (validate against findings)
- **Do the assignment server-side.** Physical `roomID`s are intentionally kept off the client (`calculateBeddingAvailability` "consumes physical IDs and never includes them in the returned object"). So a new API route (e.g. `src/app/api/assign-bedding/route.ts`) should: take a `reservationID` + the requested distribution, look up matching available `roomID`s per bed layout, and call the assignment endpoint with the same `x-api-key` auth as `cloudbeds-rooms.ts`.
- **Trigger:** webhook (`reservation/created`) is the most robust if the immersive component gives no client hook. If a client hook exists, it can `POST` the distribution + reservationID to our route.
- The chosen distribution may need to ride along on the reservation — see `src/lib/cloudbeds-fx-customfields.ts`, which already writes **custom fields onto the reservation** via the booking engine. The bed distribution could be stored the same way so the server can read it back when the webhook fires.

### Risks / gotchas for this task
- **Mapping accuracy is safety-critical**: assigning a guest to a twin room when they wanted a matrimonial bed is a real guest-experience failure. Confirm real `roomID`s with the property before shipping.
- **Race conditions**: the room must still be free at assignment time. Handle "no matching room available" gracefully (leave Cloudbeds' auto-assignment).
- **Flexible rooms** count toward *both* layouts (see inventory comment). Assigning one consumes it for both — your allocation logic must account for that.

---

## 2. Project snapshot

- **Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, next-intl (i18n), Tailwind. Package manager **pnpm**. Tests: **Vitest** (jsdom). E2E: Playwright.
- **What it is:** marketing + booking site for *Los Lagos Hotel*, El Calafate, Argentina. The `/reservas` page embeds the **Cloudbeds "immersive experience" booking engine** as a web component and layers custom behavior on top of it via DOM manipulation.
- **Locales:** `/es/...` (Spanish, primary) and `/en/...` (English). Site copy stays Spanish per project convention, but UI chrome is localized. Cloudbeds renders its own UI in the page's language.
- **Deploy:** AWS Amplify; push to `main` auto-deploys.

### Running & testing it
```bash
pnpm exec next dev          # dev server on :3100 (the user usually has this running)
pnpm vitest run             # unit tests (66 currently, all green)
npx tsc --noEmit -p tsconfig.json   # typecheck (clean)
pnpm lint
```
- The user exposes their local `:3100` via an **ephemeral Cloudflare quick-tunnel** (`pnpm tunnel`). **The tunnel URL changes every restart** — ask the user for the current one; don't reuse old URLs from the transcript.
- **Verifying in a browser:** the built-in `preview_*` tools can't start a 2nd `next dev` (Next.js dir-lock conflicts with the user's running server). Use the **Chrome MCP** against the user's tunnel (or `http://localhost:3100`, but Cloudbeds' engine may refuse non-whitelisted origins there).
- **First-visit gate:** `/reservas` shows a blocking **VAT residency prompt** ("Argentina / Abroad") before the widget; dismiss it by picking an option. The choice is stored in sessionStorage, so it only appears on a fresh origin.
- **Known flakiness:** the Cloudbeds widget sometimes gets stuck on "Loading…" for an automated browser after many rapid reloads (looks like Cloudbeds rate-limiting). It loads fine for the user. If it won't load, verify via unit tests + checking the injected `<style id="hotel-cloudbeds-dom-adjustments">` instead.

---

## 3. Architecture: how the Cloudbeds layer works (mental model)

The booking engine is a black-box third-party web component. We adapt it by **observing and mutating its DOM**:

- **`src/components/CloudbedsScriptLoader.tsx`** — injects the `cb-immersive-experience.js` script. Also installs a **cache-buster** (`?_hotel_cb=<token>` on Cloudbeds asset URLs via a patched `Node.appendChild`) and a one-shot reload on chunk-load errors.
- **`src/components/BookingPriceObserver.tsx`** — the heart. A single `MutationObserver` on `document.body` runs `convertDocument()` on DOM changes, which:
  1. hides Cloudbeds currency/promo/brand controls,
  2. injects the bedding selectors + syncs them,
  3. converts ARS prices → USD, relabels currency, applies Argentine VAT display,
  4. records FX custom fields.
  - **CRITICAL — self-induced-mutation guard:** `convertDocument` mutates the DOM (and drives Cloudbeds' native stepper), which would re-trigger the observer → infinite freeze. Fixed this session via `applyAdjustments()` + `isApplyingAdjustments` flag + `observer.takeRecords()` + a 250 ms cooldown. **Do not remove this guard.** See §4.
- **`src/lib/cloudbeds-bedding-selector.ts`** — builds/injects the "Tipo de cama" cards and the per-bed counter panel inside the quantity popover; mirrors totals into the native stepper; persists the distribution.
- **`src/lib/hide-cloudbeds-currency-controls.ts`** — all the injected CSS lives here (one big `<style>` string), plus the currency/promo/brand hiding logic.
- **`src/lib/currency.ts`, `cloudbeds-currency-label.ts`, `cloudbeds-vat-adjust.ts`, `vat.ts`, `fx-rate-client.ts`, `cloudbeds-fx-customfields.ts`** — pricing/VAT/FX layer (mostly out of scope for the next task, but `cloudbeds-fx-customfields.ts` is relevant — it writes custom fields onto the reservation).
- **Server-side Cloudbeds API:** `src/lib/cloudbeds-rooms.ts` (`getRooms`) + `src/app/api/bedding-availability/route.ts` + `src/lib/cloudbeds-bedding-inventory.ts` (digests rooms → per-layout availability **counts**, never exposing physical IDs).

---

## 4. What this session changed (all committed on `main`)

1. **Fixed a tab-freezing infinite loop.** The new per-bed counter's `syncNativeQuantityValue()` drives Cloudbeds' native stepper; Cloudbeds re-renders; the `MutationObserver` re-ran `convertDocument` → drove the stepper again → unbounded loop (reproduced: one click = 622k mutations). Fix in `BookingPriceObserver.tsx` (`applyAdjustments`/`isApplyingAdjustments`/`takeRecords`/cooldown) + made `syncNativeQuantityValue` not force-set a value Cloudbeds rejects (only force when no stepper buttons exist) + stopped an unbounded `aria-label` growth in `applyNativeQuantityLimit`.
2. **Recolored** the bedding UI from orange `#ff5a00` to Cloudbeds' teal (`#32c0a0` for graphics, `#157f68` for text, tints `#e9f9f4`/`#d7f3eb`) — all in `hide-cloudbeds-currency-controls.ts`.
3. **Tightened the total line:** hid Cloudbeds' redundant "Max: N" caption (tagged `data-hotel-bedding-native-max-note` in `ensureBeddingCounterPanel`, hidden via CSS), removed the 🛏️ emoji, made it a single non-bold, right-aligned muted caption.
4. **Made the +/− stepper match the native guest steppers:** rewrote the counter rows to mirror Adults/Children (label left, stepper right, hairline dividers), used the **exact FontAwesome minus/plus SVGs** Cloudbeds uses, and made the stepper a **white pill** (`#ffffff` bg, `#d9dee7` border, fully rounded, gray `#778295` icons).
5. **Localized the injected text** (the previous user request): the selector module was hardcoded Spanish; it now reads `document.documentElement.lang` and renders ES/EN. See §6 for the dictionary location and the EN wording (which the user may still want to tweak — e.g. "Two single beds" vs "Twin beds").

All verified: `tsc` clean, **66/66 vitest pass**, CSS confirmed live in the injected stylesheet. A full live screenshot of the final popover was **not** captured because the widget kept hanging on "Loading…" for the automated browser (see §2 flakiness) — worth confirming visually once it loads.

---

## 5. Key files & constants

| File | Role |
|---|---|
| `src/lib/cloudbeds-bedding-selector.ts` | Injects bed-type cards + per-bed counter; drives native stepper; persistence; **i18n dictionary `BEDDING_STRINGS` + `getBeddingStrings()`** |
| `src/lib/cloudbeds-bedding-inventory.ts` | `ROOM_BEDDING_CAPABILITIES` (⚠️ placeholder keys), `calculateBeddingAvailability` (counts only, hides IDs) |
| `src/lib/cloudbeds-rooms.ts` | `getRooms` via Cloudbeds API v1.3 — **the auth pattern to reuse** |
| `src/app/api/bedding-availability/route.ts` | Server route returning digested availability (graceful static fallback) |
| `src/components/BookingPriceObserver.tsx` | The MutationObserver + freeze guard |
| `src/lib/hide-cloudbeds-currency-controls.ts` | All injected CSS + control-hiding |
| `src/lib/cloudbeds-fx-customfields.ts` | Writes custom fields onto the reservation (relevant to passing bed distribution to the server) |
| `messages/{en,es}/booking.json` | next-intl strings for the React booking chrome (NOT the bedding selector — that's self-contained, see §6) |

**Cloudbeds API:** base `https://api.cloudbeds.com/api/v1.3/`, auth header `x-api-key: process.env.CLOUDBEDS_API_KEY`, `propertyIDs=process.env.CLOUDBEDS_PROPERTY_ID` (see `.env.example`).

**Room type IDs:**
| ID | Type | Bed options |
|---|---|---|
| `227179928547456` | Doble Estándar | matrimonial, dos_camas_separadas |
| `229741541683392` | Doble Superior | matrimonial, dos_camas_separadas |
| `229741180768384` | Triple Estándar Twin | tres_camas_individuales |
| `239441314484352` | Triple Estándar Matrimonial | matrimonial_cama_individual |
| `229741711368385` | Triple Superior | matrimonial_cama_individual, tres_camas_individuales |

**Bedding keys:** `matrimonial`, `dos_camas_separadas`, `matrimonial_cama_individual`, `tres_camas_individuales`.

**Client persistence:** sessionStorage `hotel-bedding-selection:<cardId>` & `hotel-bedding-counts:<cardId>`; hidden input `hotel_bedding_preference` (`data-hotel-bedding-input="true"`); event `hotel:bedding-selection-change`. `<cardId>` = Cloudbeds accommodation/room-type ID.

---

## 6. Gotchas & constraints

- **Don't break the observer freeze guard** (§4). Any new code that mutates Cloudbeds' DOM or drives its inputs must run inside `applyAdjustments` or it can re-introduce the freeze.
- **Atomic class names are unstable.** Cloudbeds' DOM uses generated classes like `d-74rd38`, `d-11rf9id`. Never hardcode them; match on `data-testid`, roles, text, or structure. (The native quantity input is `[data-testid$="-quantity-input"]`; stepper buttons end `-minus-button`/`-plus-button`.)
- **Physical room IDs are private to the server by design.** Keep assignment logic server-side.
- **`ROOM_BEDDING_CAPABILITIES` keys are placeholders** (`<typeID>-N`), so live `calculateBeddingAvailability` likely marks everything unmapped and the client falls back to static counts. Fixing this (real `roomID`s from a live `getRooms`) is a prerequisite for the assignment task **and** for accurate availability.
- **i18n for the bedding selector is self-contained**, not in `messages/*.json`. It's a vanilla-DOM module injected into a third-party widget, so it can't use next-intl hooks. `BEDDING_STRINGS` (ES/EN) + `getBeddingStrings(documentRef)` live in `cloudbeds-bedding-selector.ts` and key off `<html lang>`. If you add strings, add them there (or refactor to thread next-intl strings down from `BookingPriceObserver`, but that's more plumbing).
- **The computed "max rooms" can exceed Cloudbeds' real availability** for a type (our static/derived caps vs. live). This is now harmless (freeze fixed) but means the counter can let a guest pick more than Cloudbeds will sell; the native stepper then quietly caps lower. Related to the placeholder-mapping issue above.

---

## 7. Verification checklist for any change here
1. `npx tsc --noEmit -p tsconfig.json` → clean.
2. `pnpm vitest run` → all green (bedding logic is covered in `src/lib/cloudbeds-bedding-selector.test.ts` / `cloudbeds-bedding-inventory.test.ts`; tests read the total via `[data-hotel-bedding-total]`'s `data-selected`/`data-max`).
3. Ask the user for the **current tunnel URL**, open a room's quantity selector, confirm: localized labels, white-pill stepper, native value mirrors the per-bed total, no freeze (watch for runaway DOM mutations).
4. For the assignment task specifically: do it behind a flag and test against a real reservation in a Cloudbeds sandbox before touching production bookings.
