import type { Holiday } from "@feriadex/core";
import raw from "../data/estadual.json";

interface StateRow {
  date: string; // "YYYY-MM-DD"
  name: string;
  uf: string;
}

const rows = raw as StateRow[];

/**
 * State (estadual) holidays for a UF and year, from the baked dataset
 * (joaopbini/feriados-brasil, MIT — see DATA_LICENSE.md). Regenerate with
 * `scripts/import-estadual.ts` when upstream publishes new years.
 */
export function brStateHolidays(uf: string, year: number): Holiday[] {
  const prefix = `${year}-`;
  return rows
    .filter((r) => r.uf === uf && r.date.startsWith(prefix))
    .map((r) => ({
      date: r.date,
      name: r.name,
      level: "regional" as const,
      observance: "official" as const,
    }));
}

/** Year range covered by the baked state dataset (inclusive). */
export function stateHolidayCoverage(): { fromYear: number; toYear: number } {
  const years = rows.map((r) => Number(r.date.slice(0, 4)));
  return { fromYear: Math.min(...years), toYear: Math.max(...years) };
}
