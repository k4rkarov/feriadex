/**
 * Build-time importer for CITY lists (IBGE) and MUNICIPAL holidays (joaopbini).
 *
 * Both sources are static/public JSON with no rate limit; fetched once at build
 * and baked into per-UF JSON. No runtime dependency, nothing consumed live.
 *
 *   node --experimental-strip-types packages/holidays/scripts/import-cities-municipal.ts
 *
 * - Cities: IBGE localidades API per UF → { ibge, name }. Authoritative, and
 *   the IBGE id is the key joaopbini uses for municipal holidays.
 * - Municipal: joaopbini per-year JSON, grouped by UF and keyed by ibge code.
 *   Names are often generic ("Feriado Municipal") — enrich capitals later.
 *
 * Output (per-UF, matches the agreed layout):
 *   src/data/cities/{UF}.json     → [{ ibge, name }]
 *   src/data/municipal/{UF}.json  → { [ibge]: [{ date, name }] }
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

const OUT = join(import.meta.dirname, "..", "src", "data");

const toISO = (br: string): string => {
  const [d, m, y] = br.split("/");
  return `${y}-${m}-${d}`;
};

interface IbgeMun { id: number; nome: string }
interface City { ibge: number; name: string }
interface JoaoRow { data: string; nome: string; uf: string; codigo_ibge: number | null }
interface MunRow { date: string; name: string }

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": "Feriadex-build" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return (await res.json()) as T;
}

// Municipal holidays grouped by UF then IBGE code.
const municipalByUf: Record<string, Record<number, MunRow[]>> = {};
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
    (municipalByUf[r.uf] ??= {})[r.codigo_ibge] ??= [];
    municipalByUf[r.uf][r.codigo_ibge].push({ date: toISO(r.data), name: r.nome });
  }
}

await mkdir(join(OUT, "cities"), { recursive: true });
await mkdir(join(OUT, "municipal"), { recursive: true });

let totalCities = 0;
let totalMun = 0;
for (const uf of UFS) {
  const muns = await getJSON<IbgeMun[]>(`${IBGE}/${uf}/municipios`);
  const cities: City[] = muns
    .map((m) => ({ ibge: m.id, name: m.nome }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  await writeFile(join(OUT, "cities", `${uf}.json`), JSON.stringify(cities));
  totalCities += cities.length;

  const mun = municipalByUf[uf] ?? {};
  await writeFile(join(OUT, "municipal", `${uf}.json`), JSON.stringify(mun));
  totalMun += Object.keys(mun).length;
  console.log(`${uf}: ${cities.length} cidades, ${Object.keys(mun).length} com municipal`);
}
console.log(`Done. ${totalCities} cidades, ${totalMun} cidades com feriado municipal.`);
