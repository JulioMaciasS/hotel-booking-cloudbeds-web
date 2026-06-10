# Responsive Test Plan

Goal: verify that every public page of the Los Lagos Hotel site renders correctly
across phone, tablet, and desktop widths — no horizontal overflow, the right
navigation affordance for each breakpoint, and key content/CTAs reachable.

The plan is backed by an automated Playwright suite (`e2e/responsive.spec.ts`)
that runs every check on three device profiles. Manual spot-checks are listed at
the end for things automation can't judge (visual polish, real-device gestures).

## Breakpoints under test

The site uses Tailwind's `lg` (1024px) as the main mobile↔desktop switch
(`SiteHeader` swaps the desktop nav for a hamburger, `MobileBookingBar` is
`lg:hidden`). The viewport matrix brackets that boundary:

| Profile      | Viewport     | Emulated device   | Why                                  |
| ------------ | ------------ | ----------------- | ------------------------------------ |
| Mobile       | 393 × 852    | Pixel 7           | Common modern phone, below `lg`/`sm` |
| Mobile small | 375 × 667    | iPhone SE         | Smallest realistic width             |
| Tablet       | 820 × 1180   | iPad Air portrait | Between `sm` and `lg`                |
| Desktop      | 1280 × 800   | Desktop Chrome    | Laptop, above `lg`                   |
| Desktop wide | 1536 × 864   | Desktop Chrome    | Large monitor, `2xl`                 |

## Pages under test

All public routes, each with the Cloudbeds script mocked (reused from
`booking.spec.ts`) so booking pages render deterministically offline:

- `/` — home (hero slideshow, date picker, rooms, reviews, map)
- `/habitaciones` — rooms listing
- `/hotel` — about / services
- `/experiencias` — excursions
- `/ubicacion` — location + interactive map
- `/contacto` — contact form
- `/reservas?checkin=…&checkout=…` — Cloudbeds embed
- `/privacidad` — legal
- `/terminos` — legal
- `/<unknown>` — 404 / not-found

## What we assert (per page × per viewport)

1. **No horizontal overflow** — `document.documentElement.scrollWidth` must not
   exceed the viewport width (small tolerance for sub-pixel rounding). This is
   the single most common responsive bug and catches stray wide elements,
   unwrapped text, and fixed-width images.
2. **No individual element wider than the viewport** — scans the DOM for any
   element whose bounding box overflows the right edge, and reports the
   offenders by tag/class so a failure is actionable.
3. **Navigation affordance matches breakpoint:**
   - `< lg`: hamburger button visible, desktop nav links hidden; tapping the
     hamburger opens the drawer and the nav links become reachable.
   - `≥ lg`: desktop nav links visible, hamburger hidden.
4. **Header CTA ("Reservar") is visible** at every breakpoint.
5. **Mobile booking bar** (`MobileBookingBar`) — appears after scrolling on
   `< lg`, and is absent on `≥ lg`.
6. **Hero / primary heading is visible** above the fold on load.
7. **Images stay within their container** (no image wider than the viewport).
8. **Tap targets** on mobile — primary CTAs are at least ~40px tall.

## Running

```bash
pnpm e2e                          # all specs, all projects
pnpm e2e responsive               # responsive spec only
pnpm e2e --project="Mobile"       # single profile
```

CI runs the same command; the suite is deterministic because the third-party
Cloudbeds script is intercepted and mocked.

## Manual spot-checks (not automated)

- Real-device scroll/zoom behaviour and momentum (iOS Safari, Android Chrome).
- Landscape phone orientation.
- The Leaflet map drag/zoom on touch.
- Font rendering and visual rhythm at each breakpoint.
- Dynamic toolbar / safe-area insets on notched phones (the booking bar uses
  `env(safe-area-inset-bottom)`).
