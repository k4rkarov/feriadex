import { describe, expect, it } from "vitest";
import { partitionsInto } from "../src/split/partitions";
import { bestSplit } from "../src/split/solve";
import { createCalendar, DEFAULT_WORKING_WEEK } from "../src/calendar/calendar";

const CLT = { maxPeriods: 3, minMainBlockDays: 14, minOtherBlockDays: 5 };

describe("partitionsInto", () => {
  it("gives non-increasing multisets summing to total", () => {
    const ps = partitionsInto(30, 2, 5);
    expect(ps).toContainEqual([15, 15]);
    expect(ps).toContainEqual([25, 5]);
    expect(ps.every((p) => p[0]! >= p[1]!)).toBe(true); // non-increasing
    expect(ps.every((p) => p.reduce((a, b) => a + b, 0) === 30)).toBe(true);
  });

  it("respects minEach and count", () => {
    const ps = partitionsInto(30, 3, 5);
    expect(ps.every((p) => p.length === 3 && p.every((x) => x >= 5))).toBe(true);
    expect(ps).toContainEqual([20, 5, 5]);
    expect(ps).toContainEqual([14, 11, 5]);
  });

  it("returns nothing when impossible", () => {
    expect(partitionsInto(10, 3, 5)).toEqual([]);
  });
});

describe("bestSplit", () => {
  const cal = createCalendar(DEFAULT_WORKING_WEEK, [
    { date: "2026-04-21", name: "Tiradentes", level: "national" },
    { date: "2026-09-07", name: "Independência", level: "national" },
  ]);

  it("finds a valid 3-way split maximizing rest", () => {
    const plan = bestSplit(cal, 30, 3, "2026-01-01", "2026-12-31", CLT);
    expect(plan).not.toBeNull();
    expect(plan!.blocks).toHaveLength(3);
    // Every block respects the CLT floor (one ≥14, others ≥5).
    const lens = plan!.blocks.map((b) => b.lengthDays).sort((a, b) => b - a);
    expect(lens[0]!).toBeGreaterThanOrEqual(14);
    expect(lens.slice(1).every((x) => x >= 5)).toBe(true);
  });

  it("returns null when no valid partition exists", () => {
    expect(bestSplit(cal, 10, 3, "2026-01-01", "2026-12-31", CLT)).toBeNull();
  });
});
