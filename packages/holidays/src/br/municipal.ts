import type { Holiday } from "@feriadex/core";
import { DEFAULT_BASE_URL, loadUfData } from "./data-loader";

const pad = (n: number): string => String(n).padStart(2, "0");

/**
 * Municipal holidays for a city (by IBGE code) in a year range. Holidays are
 * stored year-free (`{month, day, name}`, they recur every year) and
 * expanded to ISO dates on demand for the requested range. Lazy per-UF.
 */
export async function brMunicipalHolidays(
  uf: string,
  ibge: number,
  fromYear: number,
  toYear: number,
  baseUrl: string = DEFAULT_BASE_URL,
): Promise<Holiday[]> {
  const data = await loadUfData(uf, baseUrl);
  const city = data[String(ibge)];
  if (!city) return [];

  const out: Holiday[] = [];
  for (const h of city.holidays) {
    for (let y = fromYear; y <= toYear; y++) {
      out.push({
        date: `${y}-${pad(h.month)}-${pad(h.day)}`,
        name: h.name,
        level: "municipal",
        observance: "official",
      });
    }
  }

  return out.sort((a, b) => (a.date < b.date ? -1 : 1));
}
