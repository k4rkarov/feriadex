import type { Holiday } from "@feriadex/core";

type MunMap = Record<string, { date: string; name: string }[]>;

const pad = (n: number): string => String(n).padStart(2, "0");

/**
 * Curated recurring municipal holidays by IBGE code (fixed dates, any year).
 * Complements the baked joaopbini dataset for well-known cases it misses or
 * that fall outside its year range.
 */
const CURATED: Record<number, { month: number; day: number; name: string }[]> = {
  2611606: [{ month: 6, day: 24, name: "São João (Lei nº 9.777/1967)" }], // Recife
  3304557: [
    { month: 1, day: 20, name: "São Sebastião — Padroeiro (Lei nº 1.271/1988)" },
  ], // Rio de Janeiro
  3550308: [{ month: 1, day: 25, name: "Aniversário de São Paulo" }], // São Paulo
};

/**
 * Municipal holidays for a city (by IBGE code) in a year range: the baked
 * dataset merged with curated recurring dates, deduped by date. Lazy per-UF.
 */
export async function brMunicipalHolidays(
  uf: string,
  ibge: number,
  fromYear: number,
  toYear: number,
): Promise<Holiday[]> {
  let map: MunMap = {};
  try {
    const mod = await import(`../data/municipal/${uf}.json`);
    map = ((mod as { default?: MunMap }).default ?? mod) as MunMap;
  } catch {
    map = {};
  }

  const byDate = new Map<string, string>();
  for (const r of map[String(ibge)] ?? []) {
    const y = Number(r.date.slice(0, 4));
    if (y >= fromYear && y <= toYear) byDate.set(r.date, r.name);
  }
  for (const c of CURATED[ibge] ?? []) {
    for (let y = fromYear; y <= toYear; y++) {
      const date = `${y}-${pad(c.month)}-${pad(c.day)}`;
      if (!byDate.has(date)) byDate.set(date, c.name);
    }
  }

  return [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, name]) => ({
      date,
      name,
      level: "municipal" as const,
      observance: "official" as const,
    }));
}
