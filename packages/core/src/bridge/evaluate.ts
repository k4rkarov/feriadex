import type { Calendar } from "../calendar/calendar";
import { addDays, eachDay, type ISODate } from "../calendar/date";
import type { VacationWindow } from "../types";

/** Count consecutive rest days starting at `from`, stepping by `dir` (±1). */
function countRestRun(cal: Calendar, from: ISODate, dir: 1 | -1): number {
  let n = 0;
  let d = from;
  while (cal.isRestDay(d)) {
    n++;
    d = addDays(d, dir);
  }
  return n;
}

/**
 * Evaluate a vacation block of `lengthDays` calendar days starting at
 * `startDate`. Vacation is counted in calendar days (dias corridos), matching
 * Brazilian CLT; the block cost is the working days it overlaps.
 */
export function evaluateWindow(
  cal: Calendar,
  startDate: ISODate,
  lengthDays: number,
): VacationWindow {
  if (!Number.isInteger(lengthDays) || lengthDays < 1) {
    throw new Error(`lengthDays must be a positive integer, got ${lengthDays}`);
  }
  const endDate = addDays(startDate, lengthDays - 1);

  let workingDaysSpent = 0;
  for (const d of eachDay(startDate, endDate)) {
    if (cal.isWorkingDay(d)) workingDaysSpent++;
  }

  const leadingFree = countRestRun(cal, addDays(startDate, -1), -1);
  const trailingFree = countRestRun(cal, addDays(endDate, 1), 1);
  const totalRestDays = lengthDays + leadingFree + trailingFree;
  const efficiency =
    workingDaysSpent > 0 ? totalRestDays / workingDaysSpent : Infinity;

  return {
    startDate,
    endDate,
    lengthDays,
    workingDaysSpent,
    leadingFree,
    trailingFree,
    totalRestDays,
    efficiency,
  };
}
