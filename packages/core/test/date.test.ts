import { describe, expect, it } from "vitest";
import { addDays, dayOfWeek, diffDays, eachDay } from "../src/calendar/date";

describe("date utils", () => {
  it("knows day of week (0=Sun..6=Sat)", () => {
    // 2024-01-01 is a Monday.
    expect(dayOfWeek("2024-01-01")).toBe(1);
    expect(dayOfWeek("2024-01-06")).toBe(6); // Saturday
    expect(dayOfWeek("2024-01-07")).toBe(0); // Sunday
  });

  it("adds days across month and year boundaries", () => {
    expect(addDays("2024-01-31", 1)).toBe("2024-02-01");
    expect(addDays("2023-12-31", 1)).toBe("2024-01-01");
    expect(addDays("2024-01-01", -1)).toBe("2023-12-31");
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29"); // leap year
  });

  it("computes day differences", () => {
    expect(diffDays("2024-01-10", "2024-01-01")).toBe(9);
    expect(diffDays("2024-01-01", "2024-01-10")).toBe(-9);
  });

  it("lists inclusive ranges", () => {
    expect(eachDay("2024-01-01", "2024-01-03")).toEqual([
      "2024-01-01",
      "2024-01-02",
      "2024-01-03",
    ]);
  });

  it("rejects malformed dates", () => {
    expect(() => addDays("2024-1-1", 1)).toThrow();
  });
});
