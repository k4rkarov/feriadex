import { describe, expect, it } from "vitest";
import { createCalendar, DEFAULT_WORKING_WEEK } from "../src/calendar/calendar";

describe("calendar", () => {
  const cal = createCalendar(DEFAULT_WORKING_WEEK, [
    { date: "2024-01-01", name: "Confraternização Universal", level: "national" },
  ]);

  it("treats weekends as rest days", () => {
    expect(cal.isRestDay("2024-01-06")).toBe(true); // Saturday
    expect(cal.isRestDay("2024-01-07")).toBe(true); // Sunday
    expect(cal.isWorkingDay("2024-01-06")).toBe(false);
  });

  it("treats a holiday on a weekday as a rest day, not a working day", () => {
    // 2024-01-01 is a Monday holiday.
    expect(cal.isHoliday("2024-01-01")).toBe(true);
    expect(cal.isRestDay("2024-01-01")).toBe(true);
    expect(cal.isWorkingDay("2024-01-01")).toBe(false);
  });

  it("treats a normal weekday as a working day", () => {
    expect(cal.isWorkingDay("2024-01-02")).toBe(true); // Tuesday
    expect(cal.isRestDay("2024-01-02")).toBe(false);
  });
});
