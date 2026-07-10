import type { Holiday } from "@feriadex/core";

type MunMap = Record<string, { date: string; name: string }[]>;

const pad = (n: number): string => String(n).padStart(2, "0");

/**
 * Curated recurring municipal holidays by IBGE code (fixed dates, any year).
 * Complements the baked open dataset for well-known cases it misses or
 * that fall outside its year range.
 */
const CURATED: Record<number, { month: number; day: number; name: string }[]> = {
  2611606: [{ month: 6, day: 24, name: "São João (Lei nº 9.777/1967)" }], // Recife
  3304557: [
    { month: 1, day: 20, name: "São Sebastião — Padroeiro (Lei nº 1.271/1988)" },
  ], // Rio de Janeiro
  3550308: [{ month: 1, day: 25, name: "Aniversário de São Paulo" }], // São Paulo

  // RJ municipalities (strictly municipal dates — national/estadual excluded).
  3304151: [
    { month: 1, day: 4, name: "Emancipação de Quissamã" },
    { month: 2, day: 17, name: "N. Sra. do Desterro (Padroeira)" },
  ], // Quissamã
  3301009: [
    { month: 1, day: 15, name: "Santo Amaro" },
    { month: 3, day: 28, name: "Fundação de Campos" },
    { month: 8, day: 6, name: "Santíssimo Salvador (Padroeiro)" },
  ], // Campos dos Goytacazes
  3303401: [
    { month: 5, day: 18, name: "Fundação de Nova Friburgo" },
    { month: 6, day: 24, name: "São João (Padroeiro)" },
  ], // Nova Friburgo
  3300704: [
    { month: 8, day: 15, name: "N. Sra. da Assunção (Padroeira)" },
    { month: 11, day: 13, name: "Fundação de Cabo Frio" },
  ], // Cabo Frio
  3303906: [
    { month: 3, day: 16, name: "Fundação de Petrópolis" },
    { month: 6, day: 29, name: "Chegada dos Colonos Alemães" },
    { month: 10, day: 19, name: "São Pedro de Alcântara (Padroeiro)" },
  ], // Petrópolis
  3305802: [
    { month: 6, day: 13, name: "Santo Antônio" },
    { month: 7, day: 6, name: "Aniversário de Teresópolis" },
    { month: 10, day: 15, name: "Santa Teresa" },
  ], // Teresópolis
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
