import { describe, expect, it } from "vitest";
import { createCalendar, DEFAULT_WORKING_WEEK } from "../src/calendar/calendar";
import { dayOfWeek } from "../src/calendar/date";
import { isAllowedStart } from "../src/calendar/start-rule";
import { optimizeSingleBlock } from "../src/bridge/optimize";

describe("isAllowedStart (CLT Art. 134 §3)", () => {
  it("allows only Mon–Wed in a plain Mon–Fri week", () => {
    const cal = createCalendar(DEFAULT_WORKING_WEEK, []);
    expect(isAllowedStart(cal, "2024-01-01")).toBe(true); // Mon
    expect(isAllowedStart(cal, "2024-01-02")).toBe(true); // Tue
    expect(isAllowedStart(cal, "2024-01-03")).toBe(true); // Wed
    expect(isAllowedStart(cal, "2024-01-04")).toBe(false); // Thu (Sat in 2 days)
    expect(isAllowedStart(cal, "2024-01-05")).toBe(false); // Fri (Sat next day)
    expect(isAllowedStart(cal, "2024-01-06")).toBe(false); // Sat (rest day)
  });

  it("shifts the blackout earlier around a mid-week holiday", () => {
    const cal = createCalendar(DEFAULT_WORKING_WEEK, [
      { date: "2024-01-04", name: "Feriado" }, // Thursday
    ]);
    expect(isAllowedStart(cal, "2024-01-01")).toBe(true); // Mon
    expect(isAllowedStart(cal, "2024-01-02")).toBe(false); // Tue (holiday in 2 days)
    expect(isAllowedStart(cal, "2024-01-03")).toBe(false); // Wed (holiday next day)
  });

  it("keeps the optimizer from ever proposing a Thu/Fri start", () => {
    const cal = createCalendar(DEFAULT_WORKING_WEEK, []);
    const windows = optimizeSingleBlock(cal, {
      lengthDays: 5,
      from: "2024-01-01",
      to: "2024-03-31",
      limit: Infinity,
      allowStart: (date, c) => isAllowedStart(c, date),
    });
    expect(windows.length).toBeGreaterThan(0);
    // Every start must be Mon(1), Tue(2) or Wed(3).
    expect(windows.every((w) => [1, 2, 3].includes(dayOfWeek(w.startDate)))).toBe(
      true,
    );
  });
});
