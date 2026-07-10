import { describe, expect, it } from "vitest";
import { brStateHolidays } from "../src/br/estadual";
import { brProviderFor } from "../src/br/provider";

describe("brStateHolidays (computed, any year)", () => {
  it("computes RJ São Jorge for any year (incl. 2027)", () => {
    const rj = brStateHolidays("RJ", 2027);
    expect(rj).toEqual([
      {
        date: "2027-04-23",
        name: "Dia de São Jorge",
        level: "regional",
        observance: "official",
      },
    ]);
  });

  it("computes PE Data Magna as the first Sunday of March", () => {
    // 2026-03-01 is a Sunday → first Sunday of March 2026.
    expect(brStateHolidays("PE", 2026)[0]?.date).toBe("2026-03-01");
    // 2027-03-07 is the first Sunday of March 2027.
    expect(brStateHolidays("PE", 2027)[0]?.date).toBe("2027-03-07");
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
