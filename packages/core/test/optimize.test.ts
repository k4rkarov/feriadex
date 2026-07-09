import { describe, expect, it } from "vitest";
import { createCalendar, DEFAULT_WORKING_WEEK } from "../src/calendar/calendar";
import { optimizeSingleBlock } from "../src/bridge/optimize";

describe("optimizeSingleBlock", () => {
  const cal = createCalendar(DEFAULT_WORKING_WEEK, []);

  it("ranks a Monday/Friday single day above mid-week (weekend bridge)", () => {
    // Search Mon..Fri of the first week of 2024, 1-day blocks.
    const windows = optimizeSingleBlock(cal, {
      lengthDays: 1,
      from: "2024-01-01", // Monday
      to: "2024-01-05", // Friday
      limit: Infinity,
    });
    expect(windows).toHaveLength(5);
    // Monday: weekend before -> total 3, efficiency 3. Wins on tiebreak (earlier).
    expect(windows[0]?.startDate).toBe("2024-01-01");
    expect(windows[0]?.efficiency).toBe(3);
    // Friday: weekend after -> total 3, efficiency 3. Second.
    expect(windows[1]?.startDate).toBe("2024-01-05");
    expect(windows[1]?.efficiency).toBe(3);
    // Mid-week day: efficiency 1.
    expect(windows.at(-1)?.efficiency).toBe(1);
  });

  it("returns results sorted by descending efficiency", () => {
    const windows = optimizeSingleBlock(cal, {
      lengthDays: 3,
      from: "2024-01-01",
      to: "2024-01-31",
      limit: 5,
    });
    for (let i = 1; i < windows.length; i++) {
      expect(windows[i - 1]!.efficiency).toBeGreaterThanOrEqual(
        windows[i]!.efficiency,
      );
    }
  });

  it("respects the limit", () => {
    const windows = optimizeSingleBlock(cal, {
      lengthDays: 2,
      from: "2024-01-01",
      to: "2024-01-31",
      limit: 3,
    });
    expect(windows).toHaveLength(3);
  });
});
