import type { Holiday } from "@feriadex/core";

/**
 * A source of holidays for a jurisdiction. Implementations are pure and
 * synchronous where possible (national/movable dates are computed, not
 * fetched), so the app needs no network at runtime.
 */
export interface HolidayProvider {
  /** All holidays whose date falls in `[fromYear, toYear]` (inclusive). */
  holidays(fromYear: number, toYear: number): Holiday[];
}
