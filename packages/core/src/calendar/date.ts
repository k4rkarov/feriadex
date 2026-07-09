/**
 * Day-granular, timezone-safe date utilities.
 *
 * This is the single date seam for the whole engine (ADR #6): dates are plain
 * `YYYY-MM-DD` strings and all math happens at UTC midnight, so there is no
 * timezone/DST drift. Swapping to `date-fns`/`Temporal` later means changing
 * only this file.
 */

/** A calendar date in `YYYY-MM-DD` form (no time, no zone). */
export type ISODate = string;

const MS_PER_DAY = 86_400_000;
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

function assertISO(date: ISODate): void {
  if (!ISO_RE.test(date)) {
    throw new Error(`Invalid ISO date "${date}" (expected YYYY-MM-DD)`);
  }
}

/** Parse an ISO date into a UTC-midnight `Date`. */
export function toUTC(date: ISODate): Date {
  assertISO(date);
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d));
}

/** Format a `Date` as an ISO date (UTC). */
export function toISO(date: Date): ISODate {
  return date.toISOString().slice(0, 10);
}

/** Add (or subtract, with a negative `days`) calendar days. */
export function addDays(date: ISODate, days: number): ISODate {
  return toISO(new Date(toUTC(date).getTime() + days * MS_PER_DAY));
}

/** Day of week: 0 = Sunday .. 6 = Saturday. */
export function dayOfWeek(date: ISODate): number {
  return toUTC(date).getUTCDay();
}

/** `a - b` in whole days (positive when `a` is later). */
export function diffDays(a: ISODate, b: ISODate): number {
  return Math.round((toUTC(a).getTime() - toUTC(b).getTime()) / MS_PER_DAY);
}

/** Comparator: negative if `a < b`, 0 if equal, positive if `a > b`. */
export function compareDate(a: ISODate, b: ISODate): number {
  return diffDays(a, b);
}

/** Inclusive list of dates from `from` to `to`. */
export function eachDay(from: ISODate, to: ISODate): ISODate[] {
  const out: ISODate[] = [];
  for (let d = from; compareDate(d, to) <= 0; d = addDays(d, 1)) out.push(d);
  return out;
}
