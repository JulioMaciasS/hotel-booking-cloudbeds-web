# Los Lagos Hotel Cloudbeds Booking Website

Public booking site built with Next.js App Router, TypeScript, Tailwind CSS,
Vitest, Playwright, and pnpm.

The app has two public routes:

- `/` is the Los Lagos Hotel public homepage with a Cloudbeds single-property
  date picker.
- `/reservas` embeds Cloudbeds Booking Engine Immersive Experience inside this
  site, so guests do not have to leave for the hosted Cloudbeds reservation URL.

## Languages (i18n)

The site is bilingual via [`next-intl`](https://next-intl.dev) with SEO-friendly,
URL-based locales:

- **Spanish** (`es`, default) is served at the unprefixed URLs (`/`,
  `/habitaciones`, …) so the existing URLs/SEO are preserved.
- **English** (`en`) lives under `/en/*` (`/en`, `/en/habitaciones`, …).
- First-time visitors are routed by their browser `Accept-Language`; the choice
  is remembered in a cookie. A header switch (`LanguageSwitcher`) toggles locale
  on the current page. The Cloudbeds embed receives `lang={locale}`.

All routes are statically pre-rendered per locale (except `/reservas`, which is
dynamic). Pages live under `src/app/[locale]/`. Copy is stored as message
catalogs in `messages/<locale>/<namespace>.json`; code-side data files
(`src/lib/site-data.ts`, `src/lib/rooms.ts`) keep only media/structure and
resolve text through those catalogs. Routing/config lives in `src/i18n/` and
`src/proxy.ts`.

## Configuration

Copy `.env.example` to `.env.local` when you need local overrides.

```env
NEXT_PUBLIC_CLOUDBEDS_PROPERTY_CODE=5fdNYA
NEXT_PUBLIC_CLOUDBEDS_ISLAND=us2
NEXT_PUBLIC_BASE_CURRENCY=ARS
NEXT_PUBLIC_DISPLAY_CURRENCY=USD
NEXT_PUBLIC_VAT_RATE=0.21
```

## VAT (IVA) toggle and FX recording

On `/reservas`, an "¿Desde dónde reservás?" toggle (`ArgentinaVatToggle`) lets the
guest mark whether they are an Argentine resident or a resident abroad. Argentine
residents pay 21% IVA on lodging; residents abroad are exempt
(Decreto 1043/2016). The toggle default is detected from the browser
timezone/locale (`America/Argentina/*` → Argentina) and is overridable; the
choice is stored in `localStorage` and broadcast via a `hotel-vat-change` event.

The choice only changes how prices are **displayed** — the same visual layer that
already converts ARS → USD ([BookingPriceObserver](src/components/BookingPriceObserver.tsx)).
In resident-abroad mode, [cloudbeds-vat-adjust](src/lib/cloudbeds-vat-adjust.ts)
hides the "Impuestos y tasas" line and drops the summary Total to the Subtotal;
in resident mode Cloudbeds' default IVA-inclusive view is kept. The amount
Cloudbeds actually charges is governed by its own tax configuration.

No payment is taken in the booking engine — staff send a paylink manually
afterwards — so the recorded custom fields are the source of truth for what to
charge. With each reservation,
[cloudbeds-fx-customfields](src/lib/cloudbeds-fx-customfields.ts) records the FX
rate plus the **full price breakdown** (net / IVA / gross, in ARS + USD) into
Cloudbeds **custom fields**. The full breakdown is stored regardless of the
toggle so staff can charge either amount.

The toggle also drives the **Comfiar "Factura T" flag**: it writes `SI` when the
guest is an IVA-exempt resident abroad and `NO` for an Argentine resident, into
Comfiar's existing custom field. Comfiar runs its IVA tax post-adjustment on the
folio when that field reads `SI`, so the resident-abroad exemption is applied
without manually capturing nationality.

All fields must be configured in Cloudbeds with *display on the booking engine*
enabled. The app matches each field by its **internal name** ("Nombre interno",
rendered as the input `name` / `data-testid`) — not the display title — because
the title can be mislabelled or duplicated. The app auto-fills and hides them
(and the "Información adicional" heading). Match these env vars to the internal
names:

```env
NEXT_PUBLIC_CB_FIELD_FX_RATE=cf_fx_ars_usd
NEXT_PUBLIC_CB_FIELD_PRICE_NO_VAT_ARS=cf_precio_sin_iva_ars
NEXT_PUBLIC_CB_FIELD_PRICE_NO_VAT_USD=cf_precio_sin_iva_usd
NEXT_PUBLIC_CB_FIELD_VAT_ARS=cf_iva_ars
NEXT_PUBLIC_CB_FIELD_VAT_USD=cf_iva_usd
NEXT_PUBLIC_CB_FIELD_PRICE_ARS=cf_precio_ars_con_iva
NEXT_PUBLIC_CB_FIELD_PRICE_USD=cf_precio_usd_con_iva
NEXT_PUBLIC_CB_FIELD_FACTURA_T=cf_factura_t
```

If the custom fields are not present, recording silently no-ops.

The homepage date picker uses `custom-url="/reservas"` so selected dates are
passed into the in-site booking page:

```html
<cb-property-date-picker
  property-code="5fdNYA"
  layout="horizontal"
  button-label="Buscar disponibilidad"
  custom-url="/reservas"
  open-in-new-tab="false"
/>
```

The `/reservas` page keeps a lightweight Los Lagos Hotel wrapper/header above
the documented Cloudbeds immersive web component. The Cloudbeds component keeps
its own booking navigation so it reads as a secondary booking bar, while scoped
DOM/CSS adjustments hide likely Cloudbeds logo/brand elements, currency
controls, and the promo-code entry point. A client-only loader injects the
official Cloudbeds script after hydration:

```html
<cb-immersive-experience
  mode="standard"
  property-code="5fdNYA"
  island="us2"
  currency="ARS"
  lang="es"  // set dynamically to the active locale (es | en)
  hide-custom-header="yes"
  hide-custom-footer="yes"
  hide-property-info="yes"
/>
```

The official script is injected once from:

```text
https://static1.cloudbeds.com/booking-engine/latest/static/js/immersive-experience/cb-immersive-experience.js
```

Cloudbeds setup reference:
<https://myfrontdesk.cloudbeds.com/hc/en-us/articles/32048321731739-Cloudbeds-Booking-Engine-Immersive-Experience-2-0-Everything-you-need-to-know>

Cloudbeds Premium Embeds require the website origin to be authorized in
Cloudbeds PMS under Booking Engine → Embeds → Premium → Whitelisted domains.
Add the production domain and any stable staging/preview domain used for QA.
Temporary tunnel hostnames such as `*.trycloudflare.com` may need to be updated
whenever the tunnel URL changes.

Cloudbeds date picker reference:
<https://myfrontdesk.cloudbeds.com/hc/en-us/articles/41401465418523-Single-Property-Calendar-Date-Picker-Embed>

## Development

```bash
pnpm install
pnpm dev
pnpm test
pnpm exec playwright test
pnpm build
```

### Local HTTPS tunnel

For Cloudbeds embed testing, expose the local Next.js server through a temporary
HTTPS Cloudflare Quick Tunnel.

Install `cloudflared` once:

```bash
brew install cloudflared
```

Then run the app and tunnel in two terminals:

```bash
pnpm dev
```

```bash
pnpm tunnel
```

If the tunnel returns `502 Bad Gateway`, confirm the local app is running:

```bash
curl -I http://127.0.0.1:3100
```

Cloudflare prints a public `https://...trycloudflare.com` URL. Add that host to
Cloudbeds Allowed Domains, then open the tunnel URL.

Cloudflare Quick Tunnel docs:
<https://developers.cloudflare.com/tunnel/setup/#quick-tunnels-development>

## FX Rate API

`GET /api/public-fx-rate` proxies the live USD→ARS rate from a Supabase Edge
Function (`FX_RATE_URL`) with a 2-minute upstream cache and a layered safety
policy ([fx-rate.ts](src/lib/fx-rate.ts)):

- **Sanity band** — rates outside `[FX_RATE_MIN, FX_RATE_MAX]` (defaults
  200–100000) are rejected, so a corrupt upstream value can never reach the UI.
- **Freshness** — rates older than `FX_RATE_MAX_AGE_HOURS` (48) are served
  flagged `stale: true`; older than `FX_RATE_HARD_MAX_AGE_HOURS` (168) they are
  rejected outright.
- **Last-known-good** — if the upstream fails, the route serves the last
  accepted rate (flagged stale) instead of going dark; the browser additionally
  keeps its own copy in `localStorage` for up to 72 h
  ([fx-rate-client.ts](src/lib/fx-rate-client.ts), with retry + backoff).
- **Degraded mode** — with no usable rate anywhere, `active: false` is returned
  and the client leaves prices in ARS (it never converts with a guessed rate).
  Rate-independent adjustments (bedding selectors, currency-control hiding, the
  Factura T residency flag) still apply.

```json
{
  "baseCurrency": "ARS",
  "displayCurrency": "USD",
  "arsPerUsd": 1460,
  "active": true,
  "stale": false,
  "asOf": "2026-06-07T13:29:35.691Z",
  "ageHours": 1.2,
  "source": "supabase-latest-confirmed-fx-rate"
}
```

### FX diagnostics

Silent failures in the conversion layer (missing rate, fallback used, custom
field not found, VAT not applied, summary snapshot) are reported through
[fx-diagnostics.ts](src/lib/fx-diagnostics.ts): always to the browser console,
and — when `NEXT_PUBLIC_FX_DIAGNOSTICS=on` — beaconed to
`POST /api/fx-diagnostics`, which writes structured log lines for the hosting
platform's log search/alerts. Events are rate-limited per page load.

## Bedding Selection

The `/reservas` page injects a visual bedding selector into matching Cloudbeds
accommodation cards. The current hard-coded mappings cover:

- Double rooms: `Matrimonial` or `Dos camas separadas`
- `Triple Estandar Twin`: only `Tres camas individuales`
- `Triple Estandar Matrimonial`: only `Matrimonial y cama individual`
- Triple Superior (and any unsuffixed standard triple): both triple layouts
- Matching prefers the most specific room-title match

The card-level bedding buttons are treated as a visual preference/default for
the first room added. Once the Cloudbeds "add room" popover opens, the guest
can allocate the selected quantity across every compatible bedding layout using
per-layout counters. The Cloudbeds quantity input is kept as the real total
room count, while the bedding distribution is stored separately in the DOM and
`sessionStorage` using `data-hotel-*` attributes. It is not yet persisted into a
reservation custom field and `postRoomAssign` is not yet run after booking.

On `/reservas?checkin=YYYY-MM-DD&checkout=YYYY-MM-DD`, the browser calls
`GET /api/bedding-availability`. That server-only route calls Cloudbeds v1.3
`getRooms` using `CLOUDBEDS_PROPERTY_ID` and `CLOUDBEDS_API_KEY`, converts the
returned physical `roomID` values through the fixed capability map in
`cloudbeds-bedding-inventory.ts`, and sends only per-room-type option counters
to the browser. Physical room IDs and the API key never reach the client.
If the server credentials are missing or Cloudbeds is temporarily unavailable,
the endpoint returns `source: "static:fallback:..."` with the fixed physical
capacity map instead of failing the UI with a 5xx response.

Flexible rooms count toward both compatible options. The popover shows the
total selected rooms against the dated `totalAvailable` value for that room
type, while each bedding counter still stops at its own compatible-room count.
This intentionally allows mixed bedding requests without assigning a specific
physical room during shopping. An option with zero compatible rooms is disabled.
The native Cloudbeds quantity input is read-only/hidden and is synchronized to
the total selected across all bedding counters.

The following physical capacities remain as a fallback when the live API is
not configured or temporarily unavailable:

- Doble Estandar: 2 matrimonial or 4 twin
- Doble Superior: 5 matrimonial or 3 twin
- Triple Superior: 1 of either layout
- Split standard triples: 2 rooms in their fixed layout

Cloudbeds documents dated `getRooms` as returning **unassigned rooms**, not a
transactional hold or a guarantee of sellable inventory. The counter is a live
snapshot and may change before checkout. Unknown room IDs fail closed (they are
not counted) and `mappingComplete: false` is logged so the server-side map can
be updated. The map must be checked after rooms are added, deleted, reordered,
or moved between room types. The four Doble Estandar roomID suffixes must be
confirmed once against an undated `getRooms` response because the supplied
dated payload contained no rooms of that type.

## Currency Conversion Limitations

- This is visual conversion only. The app scans rendered ARS price text and
  visually replaces it with dollar-formatted values using the live rate served
  by `/api/public-fx-rate`. The actual charge happens in ARS through Cloudbeds.
- Bare numbers with no thousands separator or decimals (years, IDs) are never
  treated as prices, and the `/1000` unscaling is bounded to plausible amounts.
- Cloudbeds date-picker calendar prices such as `100k` are treated as ARS only
  inside Cloudbeds DOM/portal roots and converted visually to dollar-formatted
  values.
- Large Cloudbeds price fields such as `277,700,600.00` or
  `ARS 277,700,600.00` are treated as Cloudbeds-scaled ARS display values and
  normalized before conversion when they appear in Cloudbeds price contexts.
- Cloudbeds remains the source of truth in ARS. Reservation processing,
  availability, taxes, fees, payment rules, and final booking values are still
  controlled by Cloudbeds.
- Cloudbeds Immersive Experience is a web component. If Cloudbeds changes its
  DOM, class names, portals, or shadow DOM behavior, the visual conversion and
  logo/brand hiding may need maintenance.
- If Cloudbeds renders prices inside a closed shadow DOM, those text nodes
  cannot be modified from this site.
- Cloudbeds Immersive Experience requires the deployed domain to be allowed in
  Cloudbeds. Localhost or preview domains may show a Cloudbeds loading error
  until they are configured in the property settings.
- The CSS/DOM adjustments are intentionally scoped to Cloudbeds roots and
  should be treated as maintenance-sensitive compatibility code, not as a stable
  Cloudbeds API.
