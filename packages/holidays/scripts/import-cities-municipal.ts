/**
 * Build-time importer for municipalities: city names (IBGE) + municipal
 * holidays (joaopbini), merged into ONE record per city, one file per UF.
 *
 *   node --experimental-strip-types packages/holidays/scripts/import-cities-municipal.ts
 *
 * - Cities: IBGE localidades API per UF → { ibge, name }. Authoritative, and
 *   the IBGE id is the key joaopbini uses for municipal holidays.
 * - Municipal: joaopbini per-year JSON, grouped by UF and keyed by ibge code.
 *   Names are often generic ("Feriado Municipal") — enrich over time by
 *   hand-editing the generated JSON directly (see docs/BACKLOG.md D8).
 *
 * Holidays are stored as `{ month, day, name }` (no year — municipal
 * holidays recur every year) and deduped across the fetched years: if a
 * given city+month/day carries two different names across years, the
 * generic "Feriado Municipal" loses to whichever real name is present.
 *
 * A small set of hand-curated recurring dates (well-known cases the open
 * dataset misses or lists only generically) is folded in at generation time
 * so it survives a full re-run — see CURATED below.
 *
 * Output (per-UF, one combined file, replaces the old separate cities/*.json):
 *   src/br/data/{UF}.json → { [ibge]: { name, holidays: [{month,day,name}] } }
 *
 * Data lives under src/br/ (not a shared top-level src/data/) so each
 * country's adapter owns its data — a future src/us/data/ etc. sits
 * alongside without collisions or a shared dumping ground.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const IBGE = "https://servicodados.ibge.gov.br/api/v1/localidades/estados";
const JOAO =
  "https://raw.githubusercontent.com/joaopbini/feriados-brasil/master/dados/feriados/municipal/json";
const YEARS = [2024, 2025, 2026];
const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const GENERIC = "Feriado Municipal";

const OUT = join(import.meta.dirname, "..", "src", "br", "data");

interface IbgeMun { id: number; nome: string }
interface JoaoRow { data: string; nome: string; uf: string; codigo_ibge: number | null }
interface HolidayRow { month: number; day: number; name: string }
interface CityRecord { name: string; holidays: HolidayRow[] }

/**
 * Well-known recurring municipal dates the open dataset misses or only
 * lists generically. Kept here (not as a runtime file) so a full
 * regeneration doesn't lose them — folded into the normal grouping step
 * below as if they were ordinary source rows.
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

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": "Feriadex-build" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return (await res.json()) as T;
}

/** Add one (month, day, name) row, keeping the more specific name on conflict. */
function addRow(bucket: Map<string, string>, month: number, day: number, name: string): void {
  const key = `${month}-${day}`;
  const existing = bucket.get(key);
  if (existing === undefined || existing === GENERIC) bucket.set(key, name);
}

// Movable feasts (date shifts every year via Easter) that some cities list as
// "municipal" holidays. Stored as {month,day} they'd recur on the WRONG date
// in any year outside the 3 fetched here, and are already computed precisely
// at the national/facultative level (packages/core easter.ts) — so they're
// dropped rather than mis-encoded as a fixed recurring date.
const MOVABLE_FEAST = /sexta.?feira (santa|da paix[ãa]o)|paix[ãa]o de cristo|corpus christi|corpo de deus|carnaval|quarta.?feira de cinzas|p[áa]scoa/i;

// Raw joaopbini rows, grouped by UF then IBGE code then "month-day" -> name.
const rowsByUf: Record<string, Record<number, Map<string, string>>> = {};
let skippedMovable = 0;
for (const year of YEARS) {
  let rows: JoaoRow[] = [];
  try {
    rows = await getJSON<JoaoRow[]>(`${JOAO}/${year}.json`);
  } catch (e) {
    console.warn(`skip municipal ${year}: ${(e as Error).message}`);
    continue;
  }
  for (const r of rows) {
    if (!r.codigo_ibge || !r.uf || !r.data) continue;
    if (MOVABLE_FEAST.test(r.nome)) {
      skippedMovable++;
      continue;
    }
    const [d, m] = r.data.split("/"); // DD/MM/YYYY
    const month = Number(m);
    const day = Number(d);
    const perUf = (rowsByUf[r.uf] ??= {});
    const bucket = (perUf[r.codigo_ibge] ??= new Map());
    addRow(bucket, month, day, r.nome);
  }
}
console.log(`Skipped ${skippedMovable} movable-feast rows (recur nationally, computed precisely elsewhere).`);

// Fold in curated overrides for cities that already have joaopbini rows.
// Cities with NO rows at all get their curated entries attached below,
// per-city, once we know which UF each ibge belongs to.
for (const [ibgeStr, entries] of Object.entries(CURATED)) {
  const ibge = Number(ibgeStr);
  for (const perUf of Object.values(rowsByUf)) {
    if (perUf[ibge]) {
      for (const c of entries) addRow(perUf[ibge], c.month, c.day, c.name);
      break;
    }
  }
}

await mkdir(OUT, { recursive: true });

let totalCities = 0;
let totalWithHolidays = 0;
for (const uf of UFS) {
  const muns = await getJSON<IbgeMun[]>(`${IBGE}/${uf}/municipios`);
  const perUf = rowsByUf[uf] ?? {};

  const out: Record<string, CityRecord> = {};
  for (const m of muns) {
    const bucket = perUf[m.id];
    // Curated entries for a city with no joaopbini rows at all: attach now.
    const curated = CURATED[m.id];
    const holidays: HolidayRow[] = [];
    const merged = bucket ?? new Map<string, string>();
    if (!bucket && curated) {
      for (const c of curated) addRow(merged, c.month, c.day, c.name);
    }
    for (const [key, name] of merged) {
      const [month, day] = key.split("-").map(Number) as [number, number];
      holidays.push({ month, day, name });
    }
    holidays.sort((a, b) => a.month - b.month || a.day - b.day);
    out[String(m.id)] = { name: m.nome, holidays };
    totalCities++;
    if (holidays.length) totalWithHolidays++;
  }

  await writeFile(join(OUT, `${uf}.json`), JSON.stringify(out));
  console.log(
    `${uf}: ${muns.length} cidades, ${Object.values(out).filter((c) => c.holidays.length).length} com feriado municipal`,
  );
}
console.log(`Done. ${totalCities} cidades, ${totalWithHolidays} com feriado municipal.`);
