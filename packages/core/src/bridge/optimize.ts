import type { Calendar } from "../calendar/calendar";
import { addDays, compareDate, type ISODate } from "../calendar/date";
import type { VacationWindow } from "../types";
import { evaluateWindow } from "./evaluate";

export interface OptimizeOptions {
  /** Block length in calendar days. */
  lengthDays: number;
  /** Earliest allowed start date (inclusive). */
  from: ISODate;
  /** Latest allowed end date (inclusive). */
  to: ISODate;
  /** Max windows to return (default 10). Use Infinity for all. */
  limit?: number;
  /**
   * Optional legality/eligibility gate for a start date (e.g. CLT Art. 134 §3).
   * When provided, only start dates for which it returns true are considered.
   */
  allowStart?: (startDate: ISODate, cal: Calendar) => boolean;
}

/**
 * Rank windows: highest efficiency first; break ties by fewer working days
 * spent, then by earlier start date (deterministic).
 */
export function rankWindows(a: VacationWindow, b: VacationWindow): number {
  if (b.efficiency !== a.efficiency) return b.efficiency - a.efficiency;
  if (a.workingDaysSpent !== b.workingDaysSpent) {
    return a.workingDaysSpent - b.workingDaysSpent;
  }
  return compareDate(a.startDate, b.startDate);
}

/**
 * Scan every candidate start date in `[from, to]` for a single vacation block
 * and return the best windows, most efficient first.
 */
export function optimizeSingleBlock(
  cal: Calendar,
  opts: OptimizeOptions,
): VacationWindow[] {
  const { lengthDays, from, to, limit = 10, allowStart } = opts;
  const windows: VacationWindow[] = [];
  for (
    let start = from;
    compareDate(addDays(start, lengthDays - 1), to) <= 0;
    start = addDays(start, 1)
  ) {
    if (allowStart && !allowStart(start, cal)) continue;
    windows.push(evaluateWindow(cal, start, lengthDays));
  }
  windows.sort(rankWindows);
  return Number.isFinite(limit) ? windows.slice(0, limit) : windows;
}
