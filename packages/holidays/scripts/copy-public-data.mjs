#!/usr/bin/env node
/**
 * Copies packages/holidays/src/br/data/*.json (the package-owned
 * source of truth) into apps/web/public/data/holidays/ as content-hashed
 * static assets the app fetches at runtime, plus a manifest.json mapping
 * UF -> hashed filename (so browsers cache each file forever, same as a
 * webpack chunk would — see docs/ARCHITECTURE.md).
 *
 * Runs automatically via apps/web's predev/prebuild npm scripts; never run
 * by hand in normal development.
 */
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const SRC = join(import.meta.dirname, "..", "src", "br", "data");
const OUT = join(import.meta.dirname, "..", "..", "..", "apps", "web", "public", "data", "holidays");

/** Throws with a precise message if a UF file doesn't match the expected shape. */
function validate(uf, data) {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error(`${uf}.json: expected an object keyed by IBGE code`);
  }
  for (const [ibge, city] of Object.entries(data)) {
    if (typeof city?.name !== "string") {
      throw new Error(`${uf}.json[${ibge}]: missing/invalid "name"`);
    }
    if (!Array.isArray(city.holidays)) {
      throw new Error(`${uf}.json[${ibge}]: "holidays" must be an array`);
    }
    for (const h of city.holidays) {
      if (
        typeof h?.month !== "number" || h.month < 1 || h.month > 12 ||
        typeof h?.day !== "number" || h.day < 1 || h.day > 31 ||
        typeof h?.name !== "string"
      ) {
        throw new Error(`${uf}.json[${ibge}]: invalid holiday row ${JSON.stringify(h)}`);
      }
    }
  }
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => f.endsWith(".json"));
const manifest = {};

for (const file of files) {
  const uf = file.replace(/\.json$/, "");
  const raw = await readFile(join(SRC, file), "utf8");
  validate(uf, JSON.parse(raw));

  const hash = createHash("sha256").update(raw).digest("hex").slice(0, 8);
  const outName = `${uf}.${hash}.json`;
  await writeFile(join(OUT, outName), raw);
  manifest[uf] = outName;
}

await writeFile(join(OUT, "manifest.json"), JSON.stringify(manifest));
console.log(`copy-public-data: ${files.length} UF files -> ${OUT}`);
