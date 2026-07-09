import type { Holiday } from "@feriadex/core";
import type { HolidayProvider } from "../provider";
import { brNationalHolidays } from "./national";
import { brStateHolidays } from "./estadual";

function collect(fromYear: number, toYear: number, uf?: string): Holiday[] {
  const out: Holiday[] = [];
  for (let y = fromYear; y <= toYear; y++) {
    out.push(...brNationalHolidays(y));
    if (uf) out.push(...brStateHolidays(uf, y));
  }
  return out;
}

/**
 * Brazil holiday provider (national only). National + movable dates are
 * computed at runtime; no network.
 */
export const brProvider: HolidayProvider = {
  holidays: (fromYear, toYear) => collect(fromYear, toYear),
};

/**
 * Brazil provider for a specific state: national (computed) + state (baked
 * dataset). Municipal is added later (chunked/lazy) when the app exists.
 */
export function brProviderFor(uf: string): HolidayProvider {
  return { holidays: (fromYear, toYear) => collect(fromYear, toYear, uf) };
}
