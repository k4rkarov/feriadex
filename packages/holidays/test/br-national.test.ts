import { describe, expect, it } from "vitest";
import { brNationalHolidays } from "../src/br/national";
import { brProvider } from "../src/br/provider";

describe("brNationalHolidays", () => {
  const y2026 = brNationalHolidays(2026);
  const byDate = new Map(y2026.map((h) => [h.date, h]));

  it("includes fixed official holidays, with their establishing law cited", () => {
    expect(byDate.get("2026-01-01")?.name).toBe("Confraternização Universal (Lei nº 662/1949)");
    expect(byDate.get("2026-04-21")?.name).toBe("Tiradentes");
    expect(byDate.get("2026-04-21")?.description).toBe("Lei nº 10.607/2002");
    expect(byDate.get("2026-12-25")?.name).toBe("Natal");
    expect(byDate.get("2026-12-25")?.description).toBe("Lei nº 662/1949");
  });

  it("computes movable dates for 2026 (known real dates)", () => {
    expect(byDate.get("2026-04-03")?.name).toBe("Sexta-feira Santa");
    expect(byDate.get("2026-02-16")?.name).toBe("Véspera de Carnaval");
    expect(byDate.get("2026-02-17")?.name).toBe("Carnaval");
    expect(byDate.get("2026-06-04")?.name).toBe("Corpus Christi");
  });

  it("tags Good Friday official and Carnaval optional", () => {
    expect(byDate.get("2026-04-03")?.observance).toBe("official");
    expect(byDate.get("2026-02-17")?.observance).toBe("optional");
  });

  it("emits Consciência Negra only from 2024", () => {
    expect(brNationalHolidays(2026).some((h) => h.date === "2026-11-20")).toBe(true);
    expect(brNationalHolidays(2023).some((h) => h.date === "2023-11-20")).toBe(false);
  });

  it("returns holidays sorted by date", () => {
    const dates = y2026.map((h) => h.date);
    expect(dates).toEqual([...dates].sort());
  });
});

describe("brProvider", () => {
  it("covers a multi-year range", () => {
    const hs = brProvider.holidays(2026, 2027);
    expect(hs.some((h) => h.date.startsWith("2026-"))).toBe(true);
    expect(hs.some((h) => h.date.startsWith("2027-"))).toBe(true);
    // 13 national entries per year (9 fixed official + Good Friday +
    // Consciência Negra + 4 optional − Good Friday counted once) × 2 years.
    expect(hs.length).toBe(brNationalHolidays(2026).length * 2);
  });
});
