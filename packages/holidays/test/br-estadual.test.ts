import { describe, expect, it } from "vitest";
import { brStateHolidays, stateHolidayCoverage } from "../src/br/estadual";
import { brProviderFor } from "../src/br/provider";

describe("brStateHolidays", () => {
  it("returns PE state holidays for 2026 (ground truth from folgaextra)", () => {
    const pe = brStateHolidays("PE", 2026);
    const byDate = new Map(pe.map((h) => [h.date, h.name]));
    expect(byDate.get("2026-03-06")).toBe("Revolução Pernambucana");
    expect(pe.every((h) => h.level === "regional")).toBe(true);
  });

  it("filters by UF and year", () => {
    expect(brStateHolidays("PE", 2026).every((h) => h.date.startsWith("2026"))).toBe(true);
    expect(brStateHolidays("ZZ", 2026)).toHaveLength(0); // unknown UF
  });

  it("reports coverage bounded by the baked dataset", () => {
    const c = stateHolidayCoverage();
    expect(c.fromYear).toBeLessThanOrEqual(2026);
    expect(c.toYear).toBeGreaterThanOrEqual(2026);
  });
});

describe("brProviderFor", () => {
  it("merges national (computed) with state (baked) holidays", () => {
    const hs = brProviderFor("PE").holidays(2026, 2026);
    // National computed (Natal) + state baked (Revolução Pernambucana).
    expect(hs.some((h) => h.date === "2026-12-25" && h.level === "national")).toBe(true);
    expect(hs.some((h) => h.date === "2026-03-06" && h.level === "regional")).toBe(true);
  });
});
