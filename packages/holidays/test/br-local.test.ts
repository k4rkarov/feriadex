import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { Holiday } from "@feriadex/core";
import { brCities } from "../src/br/cities";
import { brMunicipalHolidays } from "../src/br/municipal";
import { countHolidays } from "../src/br/counts";

// The loaders fetch a static JSON asset (no manifest/basePath in tests, and
// no network in unit tests) — stub global fetch to read the same on-disk
// files the generator writes, so behavior matches production exactly.
const DATA_DIR = join(import.meta.dirname, "..", "src", "br", "data");

beforeAll(() => {
  vi.stubGlobal("fetch", async (url: string) => {
    const name = url.split("/").pop()!;
    if (name === "manifest.json") {
      return { ok: false, json: async () => ({}) };
    }
    try {
      const raw = readFileSync(join(DATA_DIR, name), "utf8");
      return { ok: true, json: async () => JSON.parse(raw) };
    } catch {
      return { ok: false, json: async () => ({}) };
    }
  });
});

describe("brCities", () => {
  it("loads the IBGE city list for a UF", async () => {
    const rj = await brCities("RJ");
    expect(rj.length).toBe(92);
    expect(rj.some((c) => c.name === "Rio de Janeiro" && c.ibge === 3304557)).toBe(true);
  });

  it("returns [] for an unknown UF", async () => {
    expect(await brCities("ZZ")).toEqual([]);
  });
});

describe("brMunicipalHolidays", () => {
  it("loads Rio's municipal holidays for 2026 by IBGE code", async () => {
    const hs = await brMunicipalHolidays("RJ", 3304557, 2026, 2026);
    expect(hs.every((h) => h.level === "municipal")).toBe(true);
    expect(hs.some((h) => h.name.includes("São Sebastião"))).toBe(true);
    expect(hs.every((h) => h.date.startsWith("2026"))).toBe(true);
  });

  it("returns [] for a city without data", async () => {
    expect(await brMunicipalHolidays("RJ", 1, 2026, 2026)).toEqual([]);
  });
});

describe("countHolidays", () => {
  it("counts per level with precedence (no double-count)", () => {
    const national: Holiday[] = [
      { date: "2026-01-01", name: "Confraternização Universal", level: "national" },
    ];
    const regional: Holiday[] = [
      { date: "2026-07-09", name: "Revolução Constitucionalista", level: "regional" },
    ];
    // One date shared with national (must be dropped by precedence), one unique.
    const municipal: Holiday[] = [
      { date: "2026-01-01", name: "Feriado Municipal", level: "municipal" },
      { date: "2026-01-25", name: "Aniversário de São Paulo", level: "municipal" },
    ];
    const facultative: Holiday[] = [];

    const c = countHolidays(national, regional, municipal, facultative);
    expect(c.national).toBe(1);
    expect(c.regional).toBe(1);
    // The shared 2026-01-01 is claimed by national -> municipal keeps only its unique date.
    expect(c.municipal).toBe(1);
  });
});
