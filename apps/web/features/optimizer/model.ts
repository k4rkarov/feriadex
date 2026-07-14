import {
  createCalendar,
  optimizeSingleBlock,
  partitionsInto,
  type Calendar,
  type Holiday,
  type VacationWindow,
  type WorkingWeek,
} from "@feriadex/core";
import {
  brMunicipalHolidays,
  brNationalHolidays,
  brStateHolidays,
} from "@feriadex/holidays";
import { asset } from "../../lib/asset";

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

export interface HolidaySets {
  national: Holiday[];
  regional: Holiday[];
  municipal: Holiday[];
  facultative: Holiday[];
}

/**
 * Split configuration emitted by the editor. `customParts` (PJ only) overrides
 * the auto split — when present, those exact block sizes are used; otherwise
 * the app finds the best split of `availableDays` into `periods` blocks.
 */
export interface SplitConfig {
  availableDays: number;
  periods: number;
  /** Explicit block sizes (PJ custom only). Null → app generates schemes. */
  customParts: number[] | null;
  /** Banco de horas: extra days off, placed as a separate optimized block. */
  banco: number;
}

export interface Scheme {
  parts: number[];
  /** Matches one of the employer (RH) example schemes. */
  isRH: boolean;
  /** Best achievable total rest (sum of each block's best window; estimate). */
  maxRest: number;
}

/**
 * All valid vacation partitions of `availableDays` into `periods` blocks under
 * the floor (one block ≥ minMain, others ≥ minOther), ranked by best
 * achievable rest. RH example schemes are flagged. Overlap between periods is
 * not accounted for in the ranking (independent per-period estimate).
 */
export function buildSchemes(
  cal: Calendar,
  availableDays: number,
  periods: number,
  banco: number,
  minMain: number,
  minOther: number,
  from: string,
  to: string,
  allowStart: ((startDate: string, cal: Calendar) => boolean) | undefined,
  rhPresets: number[][],
): Scheme[] {
  const partitions = partitionsInto(availableDays, periods, minOther).filter(
    (p) => Math.max(...p) >= minMain,
  );
  const cache = new Map<number, number>();
  const bestRest = (len: number): number => {
    if (!cache.has(len)) {
      const top = optimizeSingleBlock(cal, {
        lengthDays: len,
        from,
        to,
        limit: 1,
        allowStart,
      })[0];
      cache.set(len, top ? top.totalRestDays : 0);
    }
    return cache.get(len)!;
  };
  const bancoRest = banco > 0 ? bestRest(banco) : 0;
  const key = (p: number[]) => [...p].sort((a, b) => a - b).join(",");
  const rhKeys = new Set(rhPresets.map(key));
  return partitions
    .map((parts) => ({
      parts,
      isRH: rhKeys.has(key(parts)),
      maxRest: parts.reduce((s, l) => s + bestRest(l), 0) + bancoRest,
    }))
    .sort((a, b) => b.maxRest - a.maxRest || Number(b.isRH) - Number(a.isRH));
}

/**
 * Load national (computed, always incl. optional points) + state + municipal
 * (if a city is chosen) holidays for the period. Municipal is fetched lazily.
 */
export async function loadHolidays(
  uf: string,
  cityIbge: number | null,
  from: string,
  to: string,
): Promise<HolidaySets> {
  const fy = Number(from.slice(0, 4));
  const ty = Number(to.slice(0, 4));
  const national: Holiday[] = [];
  const facultative: Holiday[] = [];
  const regional: Holiday[] = [];
  for (let y = fy; y <= ty; y++) {
    for (const h of brNationalHolidays(y)) {
      (h.observance === "optional" ? facultative : national).push(h);
    }
    regional.push(...brStateHolidays(uf, y));
  }
  const municipal =
    cityIbge != null
      ? await brMunicipalHolidays(uf, cityIbge, fy, ty, asset("/data/holidays"))
      : [];
  // Count/consider only occurrences within the actual [from, to] window
  // (ISO strings compare lexicographically), so a 12-month span crossing two
  // calendar years isn't double-counted.
  const inRange = (h: Holiday) => h.date >= from && h.date <= to;
  return {
    national: national.filter(inRange),
    regional: regional.filter(inRange),
    municipal: municipal.filter(inRange),
    facultative: facultative.filter(inRange),
  };
}

/**
 * Calendar from a working week + all holidays, minus any dates the user
 * unchecked (e.g. "I'll work on Independência this year").
 */
export function buildCalendar(
  week: WorkingWeek,
  sets: HolidaySets,
  excluded: ReadonlySet<string>,
): Calendar {
  const hs: Holiday[] = [
    ...sets.national,
    ...sets.regional,
    ...sets.municipal,
    ...sets.facultative,
  ].filter((h) => !excluded.has(h.date));
  return createCalendar(week, hs);
}

export interface PeriodOptions {
  /** Block length in days. */
  length: number;
  /** Best window per start-month, ranked by total rest (most first). */
  options: VacationWindow[];
}

/**
 * For each block size, the best placement per start-month across the window,
 * ranked by total rest. Lets the user pick which month to take each period
 * (e.g. "Jul +3", "Ago +3"), instead of a single greedy placement.
 */
export function computePeriods(
  cal: Calendar,
  parts: number[],
  from: string,
  to: string,
  allowStart?: (startDate: string, cal: Calendar) => boolean,
): PeriodOptions[] {
  return parts.map((length) => {
    const all = optimizeSingleBlock(cal, {
      lengthDays: length,
      from,
      to,
      limit: Infinity,
      allowStart,
    });
    const byMonth = new Map<string, VacationWindow>();
    for (const w of all) {
      const key = w.startDate.slice(0, 7);
      const cur = byMonth.get(key);
      if (!cur || w.totalRestDays > cur.totalRestDays) byMonth.set(key, w);
    }
    const options = [...byMonth.values()].sort(
      (a, b) =>
        b.totalRestDays - a.totalRestDays ||
        (a.startDate < b.startDate ? -1 : 1),
    );
    return { length, options };
  });
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
