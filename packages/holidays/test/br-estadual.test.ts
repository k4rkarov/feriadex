import { describe, expect, it } from "vitest";
import { brStateHolidays } from "../src/br/estadual";
import { brProviderFor } from "../src/br/provider";

describe("brStateHolidays (computed, any year)", () => {
  it("computes RJ São Jorge for any year (incl. 2027), with its law cited", () => {
    const rj = brStateHolidays("RJ", 2027);
    expect(rj).toEqual([
      {
        date: "2027-04-23",
        name: "Dia de São Jorge (Lei nº 5.198/2008)",
        level: "regional",
        observance: "official",
      },
    ]);
  });

  it("computes PE Data Magna as a fixed March 6 (Lei nº 16.059/2017 replaced the old first-Sunday rule)", () => {
    expect(brStateHolidays("PE", 2026)[0]?.date).toBe("2026-03-06");
    expect(brStateHolidays("PE", 2027)[0]?.date).toBe("2027-03-06");
  });

  it("does not emit holidays removed during the 2026-07-13 legal-basis correction", () => {
    // PB: "Memória de João Pessoa" (Jul 26) was abolished by Lei nº 10.601/2015.
    expect(brStateHolidays("PB", 2026).some((h) => h.date.endsWith("-07-26"))).toBe(false);
    // PI: "Batalha do Jenipapo" (Mar 13) was never an actual state holiday.
    expect(brStateHolidays("PI", 2026).some((h) => h.date.endsWith("-03-13"))).toBe(false);
    // RO: "Dia do Evangélico" (Jun 18) was declared unconstitutional (STF ADI 3940/2020).
    expect(brStateHolidays("RO", 2026).some((h) => h.date.endsWith("-06-18"))).toBe(false);
  });

  it("returns [] for states with no fixed state holiday (ES, MT, PR)", () => {
    expect(brStateHolidays("ES", 2026)).toEqual([]);
    expect(brStateHolidays("MT", 2026)).toEqual([]);
    expect(brStateHolidays("PR", 2026)).toEqual([]);
  });

  it("returns [] for an unknown UF", () => {
    expect(brStateHolidays("ZZ", 2026)).toEqual([]);
  });
});

describe("brProviderFor", () => {
  it("merges national (computed) with state (computed) holidays", () => {
    const hs = brProviderFor("RJ").holidays(2027, 2027);
    expect(hs.some((h) => h.date === "2027-12-25" && h.level === "national")).toBe(true);
    expect(hs.some((h) => h.date === "2027-04-23" && h.level === "regional")).toBe(true);
  });
});
