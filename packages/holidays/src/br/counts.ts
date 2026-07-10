import type { Holiday } from "@feriadex/core";

export interface HolidayCounts {
  national: number;
  regional: number;
  municipal: number;
  facultative: number;
}

export interface HolidayLists {
  national: Holiday[];
  regional: Holiday[];
  municipal: Holiday[];
  facultative: Holiday[];
}

/** Distinct dates within a list, dropping dates already taken by a higher level. */
function dedupeByDate(list: readonly Holiday[], taken: Set<string>): Holiday[] {
  const seen = new Set<string>();
  const out: Holiday[] = [];
  for (const h of list) {
    if (taken.has(h.date) || seen.has(h.date)) continue;
    seen.add(h.date);
    out.push(h);
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/**
 * Holidays by level with precedence national > regional > municipal >
 * facultative, so a date shared across levels appears once at its highest
 * level. Feeds the clickable counter.
 */
export function holidayLists(
  national: readonly Holiday[],
  regional: readonly Holiday[],
  municipal: readonly Holiday[],
  facultative: readonly Holiday[],
): HolidayLists {
  const taken = new Set<string>();
  const nat = dedupeByDate(national, taken);
  nat.forEach((h) => taken.add(h.date));
  const reg = dedupeByDate(regional, taken);
  reg.forEach((h) => taken.add(h.date));
  const mun = dedupeByDate(municipal, taken);
  mun.forEach((h) => taken.add(h.date));
  const fac = dedupeByDate(facultative, taken);
  return { national: nat, regional: reg, municipal: mun, facultative: fac };
}

export function countHolidays(
  national: readonly Holiday[],
  regional: readonly Holiday[],
  municipal: readonly Holiday[],
  facultative: readonly Holiday[],
): HolidayCounts {
  const l = holidayLists(national, regional, municipal, facultative);
  return {
    national: l.national.length,
    regional: l.regional.length,
    municipal: l.municipal.length,
    facultative: l.facultative.length,
  };
}
