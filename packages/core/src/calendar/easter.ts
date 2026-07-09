import type { ISODate } from "./date";

const pad = (n: number): string => String(n).padStart(2, "0");

/**
 * Easter Sunday for a Gregorian year (Anonymous Gregorian / Meeus algorithm).
 * Movable Brazilian dates derive from this: Carnaval (−48/−47), Ash Wednesday
 * (−46), Good Friday (−2), Corpus Christi (+60).
 */
export function easterSunday(year: number): ISODate {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${pad(month)}-${pad(day)}`;
}
