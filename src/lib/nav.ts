/** Primary site navigation. Hrefs are locale-agnostic (the locale-aware
 *  `Link` from `@/i18n/navigation` adds any `/en` prefix); the `key` resolves
 *  the label via the `common.nav` message namespace. */
export type NavItem = { href: string; key: string };

export const NAV_LINKS: NavItem[] = [
  { href: "/", key: "home" },
  { href: "/habitaciones", key: "rooms" },
  { href: "/hotel", key: "hotel" },
  // Hidden until the Experiencias / excursions offering launches:
  // { href: "/experiencias", key: "experiences" },
  { href: "/ubicacion", key: "location" },
  { href: "/contacto", key: "contact" },
];

/**
 * Where every generic "Reservar" action points: the home date-picker, scrolled
 * to the centre of the viewport. Uses a `?book` intent rather than the
 * `#reservar` hash on purpose — a cross-page hash navigation fires a native
 * top-aligned jump that fights (and, with a cached picker, beats) the centring.
 * Same-page clicks are centred immediately by ScrollCenterHandler; arrivals from
 * another page are centred by BookingIntentHandler once the picker loads. The
 * picker collects dates/guests and forwards them to /reservas.
 */
export const BOOKING_HREF = "/?book=1";
