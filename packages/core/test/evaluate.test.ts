import { describe, expect, it } from "vitest";
import { createCalendar, DEFAULT_WORKING_WEEK } from "../src/calendar/calendar";
import { evaluateWindow } from "../src/bridge/evaluate";

describe("evaluateWindow", () => {
  it("counts working days and flanking free days (no holidays)", () => {
    const cal = createCalendar(DEFAULT_WORKING_WEEK, []);
    // Mon 2024-01-01 .. Fri 2024-01-05 (5 calendar days).
    const w = evaluateWindow(cal, "2024-01-01", 5);
    expect(w.endDate).toBe("2024-01-05");
    expect(w.workingDaysSpent).toBe(5);
    expect(w.leadingFree).toBe(2); // Sat/Sun before
    expect(w.trailingFree).toBe(2); // Sat/Sun after
    expect(w.totalRestDays).toBe(9); // 5 + 2 + 2
    expect(w.efficiency).toBeCloseTo(9 / 5);
  });

  it("does not charge working days for a holiday inside the block", () => {
    const cal = createCalendar(DEFAULT_WORKING_WEEK, [
      { date: "2024-01-01", name: "Feriado", level: "national" },
    ]);
    const w = evaluateWindow(cal, "2024-01-01", 5);
    expect(w.workingDaysSpent).toBe(4); // Monday holiday is free
    expect(w.totalRestDays).toBe(9);
    expect(w.efficiency).toBeCloseTo(9 / 4);
  });

  it("rejects invalid lengths", () => {
    const cal = createCalendar(DEFAULT_WORKING_WEEK, []);
    expect(() => evaluateWindow(cal, "2024-01-01", 0)).toThrow();
    expect(() => evaluateWindow(cal, "2024-01-01", 1.5)).toThrow();
  });
});
