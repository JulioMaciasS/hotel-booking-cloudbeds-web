const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_STAY_NIGHTS = 90;

function parseDateOnly(value: string): number | null {
  if (!DATE_ONLY_PATTERN.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const milliseconds = Date.UTC(year, month - 1, day);
  const parsed = new Date(milliseconds);

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return milliseconds;
}

export type ValidatedStay =
  | { ok: true; checkin: string; checkout: string }
  | { ok: false; error: string };

export function validateStayDates(
  checkin: string | null,
  checkout: string | null,
): ValidatedStay {
  if (!checkin || !checkout) {
    return { ok: false, error: "checkin and checkout are required." };
  }

  const checkinMs = parseDateOnly(checkin);
  const checkoutMs = parseDateOnly(checkout);

  if (checkinMs === null || checkoutMs === null) {
    return { ok: false, error: "Dates must use YYYY-MM-DD." };
  }

  const nights = (checkoutMs - checkinMs) / 86_400_000;

  if (nights < 1) {
    return { ok: false, error: "checkout must be after checkin." };
  }

  if (nights > MAX_STAY_NIGHTS) {
    return {
      ok: false,
      error: `Stays longer than ${MAX_STAY_NIGHTS} nights are not supported.`,
    };
  }

  return { ok: true, checkin, checkout };
}
