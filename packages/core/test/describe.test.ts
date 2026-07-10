import { describe, expect, it } from "vitest";
import { createCalendar, DEFAULT_WORKING_WEEK } from "../src/calendar/calendar";
import { evaluateWindow } from "../src/bridge/evaluate";
import { describeWindow } from "../src/bridge/describe";

describe("describeWindow", () => {
  it("marks block days vacation and flanking weekends extra", () => {
    const cal = createCalendar(DEFAULT_WORKING_WEEK, []);
    // Mon 2024-01-01 .. Fri 2024-01-05, weekends flank both sides.
    const w = evaluateWindow(cal, "2024-01-01", 5);
    const marks = describeWindow(cal, w);
    expect(marks).toHaveLength(9); // 2 + 5 + 2
    expect(marks.filter((m) => m.kind === "vacation")).toHaveLength(5);
    expect(marks.filter((m) => m.kind === "extra")).toHaveLength(4);
    expect(marks.filter((m) => m.kind === "extra-holiday")).toHaveLength(0);
    expect(marks[0]).toEqual({ date: "2023-12-30", kind: "extra" });
  });

  it("marks a flanking holiday as extra-holiday", () => {
    const cal = createCalendar(DEFAULT_WORKING_WEEK, [
      { date: "2023-12-29", name: "Feriado sexta", level: "national" },
    ]);
    // Holiday on Fri 2023-12-29 extends the leading free run before Mon 01-01.
    const w = evaluateWindow(cal, "2024-01-01", 5);
    const marks = describeWindow(cal, w);
    const holiday = marks.find((m) => m.date === "2023-12-29");
    expect(holiday?.kind).toBe("extra-holiday");
    // Continuous stretch now starts at the holiday.
    expect(marks[0]?.date).toBe("2023-12-29");
  });
});
