import { createCalendar, DEFAULT_WORKING_WEEK, optimizeSingleBlock } from "@feriadex/core";
import { describe, expect, it } from "vitest";
import { cltStartAllowed } from "../src/packs/br/start-rule";

// Signature is (startDate, cal) to match OptimizeOptions.allowStart.
describe("cltStartAllowed (Art. 134 §3)", () => {
  const cal = createCalendar(DEFAULT_WORKING_WEEK, [
    { date: "2024-01-01", name: "Feriado", level: "national" },
  ]);

  it("blocks starts within 2 days before a weekly rest (Thu/Fri)", () => {
    // Week of 2024-01-08 (Mon). Sat/Sun are rest.
    expect(cltStartAllowed("2024-01-08", cal)).toBe(true); // Mon
    expect(cltStartAllowed("2024-01-09", cal)).toBe(true); // Tue
    expect(cltStartAllowed("2024-01-10", cal)).toBe(true); // Wed
    expect(cltStartAllowed("2024-01-11", cal)).toBe(false); // Thu (+2 = Sat)
    expect(cltStartAllowed("2024-01-12", cal)).toBe(false); // Fri (+1 = Sat)
  });

  it("blocks starting on a rest day or holiday", () => {
    expect(cltStartAllowed("2024-01-13", cal)).toBe(false); // Saturday
    expect(cltStartAllowed("2024-01-01", cal)).toBe(false); // holiday (Monday)
  });

  it("blocks starts 2 days before a mid-week holiday", () => {
    const c = createCalendar(DEFAULT_WORKING_WEEK, [
      { date: "2024-01-10", name: "Feriado quarta", level: "national" },
    ]);
    expect(cltStartAllowed("2024-01-08", c)).toBe(false); // Mon (+2 = Wed holiday)
    expect(cltStartAllowed("2024-01-09", c)).toBe(false); // Tue (+1 = Wed holiday)
  });

  it("integrates as an allowStart gate in the optimizer", () => {
    const windows = optimizeSingleBlock(cal, {
      lengthDays: 3,
      from: "2024-01-08",
      to: "2024-01-31",
      limit: Infinity,
      allowStart: cltStartAllowed,
    });
    expect(windows.every((w) => cltStartAllowed(w.startDate, cal))).toBe(true);
  });
});
