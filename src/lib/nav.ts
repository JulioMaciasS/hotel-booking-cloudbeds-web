/** Primary site navigation. Hrefs are locale-agnostic (the locale-aware
 *  `Link` from `@/i18n/navigation` adds any `/en` prefix); the `key` resolves
 *  the label via the `common.nav` message namespace. */
export type NavItem = { href: string; key: string };

export const NAV_LINKS: NavItem[] = [
  { href: "/", key: "home" },
  { href: "/habitaciones", key: "rooms" },
  { href: "/hotel", key: "hotel" },
  { href: "/experiencias", key: "experiences" },
  { href: "/ubicacion", key: "location" },
  { href: "/contacto", key: "contact" },
];

/**
 * Where every generic "Reservar" action points: the home date-picker.
 * The picker collects dates/guests and forwards them to /reservas as query
 * params — /reservas is not meant to be opened directly without them.
 */
export const BOOKING_HREF = "/#reservar";
