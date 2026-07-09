import type { Holiday } from "../types";
import { dayOfWeek, type ISODate } from "./date";

/** 7 booleans, index 0 = Sunday .. 6 = Saturday: which weekdays are worked. */
export type WorkingWeek = readonly [
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
];

/** Monday–Friday. */
export const DEFAULT_WORKING_WEEK: WorkingWeek = [
  false,
  true,
  true,
  true,
  true,
  true,
  false,
];

/** Read-only classification of any date against a working week + holidays. */
export interface Calendar {
  readonly workingWeek: WorkingWeek;
  /** Is this date a holiday? */
  isHoliday(date: ISODate): boolean;
  /** Rest day = a non-working weekday OR a holiday. */
  isRestDay(date: ISODate): boolean;
  /** Working day = a working weekday that is not a holiday. */
  isWorkingDay(date: ISODate): boolean;
}

export function createCalendar(
  workingWeek: WorkingWeek,
  holidays: readonly Holiday[],
): Calendar {
  const holidaySet = new Set(holidays.map((h) => h.date));
  return {
    workingWeek,
    isHoliday: (date) => holidaySet.has(date),
    isRestDay: (date) =>
      workingWeek[dayOfWeek(date)] === false || holidaySet.has(date),
    isWorkingDay: (date) =>
      workingWeek[dayOfWeek(date)] === true && !holidaySet.has(date),
  };
}
