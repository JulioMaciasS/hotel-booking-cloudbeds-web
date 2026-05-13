# Los Lagos Hotel Cloudbeds Booking Website

Public booking site built with Next.js App Router, TypeScript, Tailwind CSS,
Vitest, Playwright, and pnpm.

The app has two public routes:

- `/` is the Los Lagos Hotel public homepage with a Cloudbeds single-property
  date picker.
- `/reservas` embeds Cloudbeds Booking Engine Immersive Experience inside this
  site, so guests do not have to leave for the hosted Cloudbeds reservation URL.

## Configuration

Copy `.env.example` to `.env.local` when you need local overrides.

```env
NEXT_PUBLIC_CLOUDBEDS_PROPERTY_CODE=5fdNYA
NEXT_PUBLIC_BASE_CURRENCY=ARS
NEXT_PUBLIC_DISPLAY_CURRENCY=USD
```

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
  currency="ARS"
  lang="es"
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
curl -I http://127.0.0.1:3000
```

Cloudflare prints a public `https://...trycloudflare.com` URL. Add that host to
Cloudbeds Allowed Domains, then open the tunnel URL.

Cloudflare Quick Tunnel docs:
<https://developers.cloudflare.com/tunnel/setup/#quick-tunnels-development>

## FX Rate API

`GET /api/public-fx-rate` returns a mocked active manual rate for now:

```json
{
  "baseCurrency": "ARS",
  "displayCurrency": "USD",
  "arsPerUsd": 1400,
  "active": true,
  "source": "mocked-hotel-manual-rate"
}
```

## Bedding Selection

The `/reservas` page injects a visual bedding selector into matching Cloudbeds
accommodation cards. The current hard-coded mappings cover:

- Double rooms: `Matrimonial` or `Dos camas separadas`
- Triple rooms: `Matrimonial y cama individual` or `Tres camas individuales`
- Room classes: `standard` and `superior`

The selected value is stored in the DOM and in `sessionStorage` with
`data-hotel-*` attributes. This is ready for a future hotel API to read and
persist into Cloudbeds custom fields, but v1 does not submit or confirm bedding
through Cloudbeds automatically.

## Currency Conversion Limitations

- This is visual conversion only. The app scans rendered ARS price text and
  visually replaces it with dollar-formatted values using the hotel manual rate.
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
