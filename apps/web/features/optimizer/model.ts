import {
  createCalendar,
  type Calendar,
  type WorkingWeek,
} from "@feriadex/core";
import { brProviderFor } from "@feriadex/holidays";

/** Mon–Fri default working week (index 0 = Sunday). */
export const DEFAULT_WEEK: WorkingWeek = [
  false,
  true,
  true,
  true,
  true,
  true,
  false,
];

export const todayISO = (): string => new Date().toISOString().slice(0, 10);

export const plusYearsISO = (iso: string, n: number): string => {
  const d = new Date(iso);
  d.setFullYear(d.getFullYear() + n);
  return d.toISOString().slice(0, 10);
};

/** `YYYY-MM-DD` → `DD/MM/YYYY`. */
export const brDate = (iso: string): string => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

/**
 * Build a calendar for a state over a period. `includeOptional` decides whether
 * optional points (Carnaval, Corpus Christi) count as days off.
 */
export function buildCalendar(
  uf: string,
  workingWeek: WorkingWeek,
  from: string,
  to: string,
  includeOptional: boolean,
): Calendar {
  const holidays = brProviderFor(uf)
    .holidays(Number(from.slice(0, 4)), Number(to.slice(0, 4)))
    .filter((h) => includeOptional || h.observance !== "optional");
  return createCalendar(workingWeek, holidays);
}

/** Parse "14, 11, 5" into `[14, 11, 5]` (ignores blanks/non-numbers). */
export function parseParts(input: string): number[] {
  return input
    .split(/[,\s]+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n));
}
