import { describe, expect, it } from "vitest";
import { brCities } from "../src/br/cities";
import { brMunicipalHolidays } from "../src/br/municipal";
import { countHolidays } from "../src/br/counts";
import { brNationalHolidays } from "../src/br/national";
import { brStateHolidays } from "../src/br/estadual";

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
  it("counts per level with precedence (no double-count)", async () => {
    const all = brNationalHolidays(2026);
    const national = all.filter((h) => h.observance !== "optional");
    const facultative = all.filter((h) => h.observance === "optional");
    const regional = brStateHolidays("PE", 2026);
    const municipal = await brMunicipalHolidays("PE", 2611606, 2026, 2026); // Recife
    const c = countHolidays(national, regional, municipal, facultative);
    expect(c.national).toBeGreaterThan(0);
    expect(c.regional).toBeGreaterThan(0);
    expect(c.municipal).toBeGreaterThan(0);
    // A date shared across levels is counted once (municipal excludes nat/reg).
    const natDates = new Set(national.map((h) => h.date));
    expect([...new Set(municipal.map((h) => h.date))].some((d) => natDates.has(d)))
      .toBe(true); // Recife municipal includes e.g. Sexta-feira Santa (national)
    expect(c.municipal).toBeLessThan(new Set(municipal.map((h) => h.date)).size);
  });
});
