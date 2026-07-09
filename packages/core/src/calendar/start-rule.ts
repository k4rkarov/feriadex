import type { Calendar } from "./calendar";
import { addDays, type ISODate } from "./date";

/**
 * Whether a vacation may legally START on `date`.
 *
 * Generic rule modeling CLT Art. 134 §3 (Decreto-Lei 1.535/77): vacation must
 * not begin within the `blackoutDays` days preceding a holiday or weekly rest
 * day (DSR), and the start day itself must be a working day. With a Mon–Fri
 * week and a 2-day blackout this yields Mon/Tue/Wed, shifting earlier when a
 * holiday lands mid-week. The jurisdiction-specific blackout lives in the
 * policy pack (see @feriadex/policies).
 */
export function isAllowedStart(
  cal: Calendar,
  date: ISODate,
  blackoutDays = 2,
): boolean {
  if (cal.isRestDay(date)) return false;
  for (let k = 1; k <= blackoutDays; k++) {
    if (cal.isRestDay(addDays(date, k))) return false;
  }
  return true;
}
