# Los Lagos Hotel Cloudbeds Booking Website

Public booking website built with Next.js App Router, TypeScript, Tailwind CSS,
Vitest, Playwright, and pnpm.

## Configuration

Copy `.env.example` to `.env.local` when you need local overrides.

```env
NEXT_PUBLIC_CLOUDBEDS_PROPERTY_CODE=5fdNYA
NEXT_PUBLIC_BASE_CURRENCY=ARS
NEXT_PUBLIC_DISPLAY_CURRENCY=USD
```

The booking page embeds Cloudbeds Immersive Experience 2.0 with:

```html
<cb-immersive-experience mode="standard" property-code="5fdNYA" currency="ARS" />
```

The official script is injected once from:

```text
https://static1.cloudbeds.com/booking-engine/latest/static/js/immersive-experience/cb-immersive-experience.js
```

Cloudbeds setup reference:
<https://myfrontdesk.cloudbeds.com/hc/en-us/articles/32048321731739-Cloudbeds-Booking-Engine-Immersive-Experience-2-0-Everything-you-need-to-know>

## Development

```bash
pnpm install
pnpm dev
pnpm test
pnpm exec playwright test
pnpm build
```

## FX Rate API

`GET /api/public-fx-rate` returns a mocked active manual rate for now:

```json
{
  "baseCurrency": "ARS",
  "displayCurrency": "USD",
  "arsPerUsd": 1200,
  "active": true,
  "source": "mocked-hotel-manual-rate"
}
```

## Currency Conversion Limitations

- This is visual conversion only. The app scans rendered ARS price text and
  visually replaces it with USD using the hotel manual rate.
- Cloudbeds remains the source of truth in ARS. Reservation processing,
  availability, taxes, fees, payment rules, and final booking values are still
  controlled by Cloudbeds.
- Cloudbeds Immersive Experience is a web component. If Cloudbeds changes its
  DOM, class names, portals, or shadow DOM behavior, the visual conversion and
  currency selector hiding may need maintenance.
- If Cloudbeds renders prices inside a closed shadow DOM, those text nodes
  cannot be modified from this site.
- Cloudbeds Immersive Experience requires the deployed domain to be allowed in
  Cloudbeds. Localhost or preview domains may show a Cloudbeds loading error
  until they are configured in the property settings.
