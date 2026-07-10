import type { Calendar } from "../calendar/calendar";
import { addDays, compareDate, eachDay, type ISODate } from "../calendar/date";
import type { VacationWindow } from "../types";

/**
 * How a day in a vacation window's continuous rest stretch is spent:
 * - `vacation` — a day inside the block (a spent vacation day),
 * - `extra` — a free flanking rest day (weekend / weekly rest),
 * - `extra-holiday` — a free flanking day that is a holiday.
 */
export type DayKind = "vacation" | "extra" | "extra-holiday";

export interface DayMark {
  date: ISODate;
  kind: DayKind;
}

/**
 * Classify every day of a window's continuous rest stretch
 * `[start − leadingFree … end + trailingFree]` for the calendar view.
 * Feeds the month-grid coloring (azul / roxo / vermelho).
 */
export function describeWindow(cal: Calendar, w: VacationWindow): DayMark[] {
  const first = addDays(w.startDate, -w.leadingFree);
  const last = addDays(w.endDate, w.trailingFree);
  return eachDay(first, last).map((date) => {
    const inBlock =
      compareDate(date, w.startDate) >= 0 && compareDate(date, w.endDate) <= 0;
    if (inBlock) return { date, kind: "vacation" };
    return { date, kind: cal.isHoliday(date) ? "extra-holiday" : "extra" };
  });
}
