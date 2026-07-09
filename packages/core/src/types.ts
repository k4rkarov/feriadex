import type { ISODate } from "./calendar/date";

/** A non-working calendar day from some jurisdiction. */
export interface Holiday {
  date: ISODate;
  name: string;
  level?: "national" | "regional" | "municipal";
  /**
   * `"official"` = a legal holiday. `"optional"` = a widely-observed optional
   * point (ponto facultativo, e.g. Carnaval, Corpus Christi) that is not a
   * federal holiday but is commonly a day off. Defaults to official.
   */
  observance?: "official" | "optional";
}

/**
 * A candidate vacation block placed on the calendar.
 *
 * - `workingDaysSpent` — days inside the block you would otherwise work
 *   (the real cost). Weekends/holidays inside the block cost nothing.
 * - `leadingFree` / `trailingFree` — rest days immediately before/after the
 *   block that extend the continuous break "for free".
 * - `efficiency` — `totalRestDays / workingDaysSpent`: rest gained per working
 *   day sacrificed. Higher is better.
 */
export interface VacationWindow {
  startDate: ISODate;
  endDate: ISODate;
  lengthDays: number;
  workingDaysSpent: number;
  leadingFree: number;
  trailingFree: number;
  totalRestDays: number;
  efficiency: number;
}
