/**
 * Build-time importer for Brazilian STATE (estadual) holidays.
 *
 * Downloads the open, MIT-licensed dataset from joaopbini/feriados-brasil and
 * bakes a normalized `src/data/estadual.json` into this package. Run once at
 * build time (see DATA_LICENSE.md) — the app ships the baked file and makes no
 * network call at runtime.
 *
 *   node --experimental-strip-types packages/holidays/scripts/import-estadual.ts
 *
 * National + movable holidays are NOT taken from the dataset — they are
 * computed (Computus) in `src/br/national.ts`, which is always correct.
 * Municipal holidays are large (~1.7 MB/year) and are handled separately
 * (chunked / lazy) when the app exists.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const REPO =
  "https://raw.githubusercontent.com/joaopbini/feriados-brasil/master/dados/feriados";
const YEARS = Array.from({ length: 12 }, (_, i) => 2024 + i);

interface SourceRow {
  data: string; // "DD/MM/YYYY"
  nome: string;
  uf: string;
}
interface StateRow {
  date: string; // "YYYY-MM-DD"
  name: string;
  uf: string;
}

function toISO(br: string): string {
  const [d, m, y] = br.split("/");
  return `${y}-${m}-${d}`;
}

const out: StateRow[] = [];
for (const year of YEARS) {
  const res = await fetch(`${REPO}/estadual/json/${year}.json`);
  if (!res.ok) {
    console.warn(`skip ${year}: HTTP ${res.status}`);
    continue;
  }
  const rows = (await res.json()) as SourceRow[];
  for (const r of rows) {
    if (!r.data || !r.uf || !r.nome) continue;
    out.push({ date: toISO(r.data), name: r.nome, uf: r.uf });
  }
}

out.sort((a, b) =>
  a.date < b.date ? -1 : a.date > b.date ? 1 : a.uf < b.uf ? -1 : 1,
);

const dir = join(import.meta.dirname, "..", "src", "data");
await mkdir(dir, { recursive: true });
await writeFile(join(dir, "estadual.json"), JSON.stringify(out));
console.log(
  `wrote ${out.length} state holidays (${YEARS[0]}–${YEARS.at(-1)}) to src/data/estadual.json`,
);
