export type NavLink = { href: string; label: string };

/** Primary site navigation — real routes shared by the header and footer. */
export const NAV_LINKS: NavLink[] = [
  { href: "/habitaciones", label: "Habitaciones" },
  { href: "/hotel", label: "El Hotel" },
  { href: "/experiencias", label: "Experiencias" },
  { href: "/ubicacion", label: "Ubicación" },
  { href: "/contacto", label: "Contacto" },
];

/**
 * Where every generic "Reservar" action points: the home date-picker.
 * The picker collects dates/guests and forwards them to /reservas as query
 * params — /reservas is not meant to be opened directly without them.
 */
export const BOOKING_HREF = "/#reservar";
