import { describe, expect, it } from "vitest";
import { createCalendar, DEFAULT_WORKING_WEEK } from "../src/calendar/calendar";
import { validateScheme, type SplitConstraints } from "../src/split/scheme";
import { solveSplit } from "../src/split/solve";

// Brazilian CLT Art. 134 floor, used here to exercise validation.
const CLT: SplitConstraints = {
  maxPeriods: 3,
  minMainBlockDays: 14,
  minOtherBlockDays: 5,
};

describe("validateScheme (CLT floor)", () => {
  it("accepts legal schemes", () => {
    expect(validateScheme({ totalDays: 30, parts: [14, 11, 5] }, CLT).valid).toBe(true);
    expect(validateScheme({ totalDays: 30, parts: [15, 15] }, CLT).valid).toBe(true);
    expect(validateScheme({ totalDays: 30, parts: [30] }, CLT).valid).toBe(true);
    // Order does not matter.
    expect(validateScheme({ totalDays: 30, parts: [5, 11, 14] }, CLT).valid).toBe(true);
  });

  it("rejects an other-block below 5 days", () => {
    const r = validateScheme({ totalDays: 30, parts: [14, 12, 4] }, CLT);
    expect(r.valid).toBe(false);
    expect(r.errors.join(" ")).toContain("other block");
  });

  it("rejects when no block reaches the 14-day main minimum", () => {
    const r = validateScheme({ totalDays: 30, parts: [10, 10, 10] }, CLT);
    expect(r.valid).toBe(false);
  });

  it("rejects more than 3 periods", () => {
    const r = validateScheme({ totalDays: 30, parts: [14, 6, 5, 5] }, CLT);
    expect(r.valid).toBe(false);
  });

  it("rejects blocks that do not sum to the entitlement", () => {
    const r = validateScheme({ totalDays: 30, parts: [14, 11] }, CLT);
    expect(r.valid).toBe(false);
    expect(r.errors.join(" ")).toContain("sum");
  });
});

describe("solveSplit", () => {
  const cal = createCalendar(DEFAULT_WORKING_WEEK, [
    { date: "2024-09-07", name: "Independência", level: "national" },
    { date: "2024-11-15", name: "Proclamação da República", level: "national" },
  ]);

  it("places every block, non-overlapping, within the window", () => {
    const plan = solveSplit(
      cal,
      { totalDays: 30, parts: [15, 15] },
      "2024-01-01",
      "2024-12-31",
    );
    expect(plan.blocks).toHaveLength(2);
    expect(plan.blocks.every((b) => b.lengthDays === 15)).toBe(true);

    // Sorted by start date and non-overlapping.
    const [a, b] = plan.blocks;
    expect(a!.endDate < b!.startDate).toBe(true);

    // Aggregates are consistent with the blocks.
    expect(plan.totalRestDays).toBe(
      plan.blocks.reduce((s, w) => s + w.totalRestDays, 0),
    );
    expect(plan.totalWorkingDaysSpent).toBe(
      plan.blocks.reduce((s, w) => s + w.workingDaysSpent, 0),
    );
  });

  it("handles a three-way split", () => {
    const plan = solveSplit(
      cal,
      { totalDays: 30, parts: [14, 11, 5] },
      "2024-01-01",
      "2024-12-31",
    );
    expect(plan.blocks).toHaveLength(3);
    expect(plan.blocks.map((b) => b.lengthDays).sort((x, y) => x - y)).toEqual([
      5, 11, 14,
    ]);
  });

  it("beats greedy largest-block-first placement (BACKLOG C5)", () => {
    // A single Thursday holiday (2024-03-14) creates one clearly-best 4-day
    // window that overlaps the 1-day block's best pick. The old greedy
    // solver (largest block first, ranked by efficiency) took the 4-day
    // block right on the holiday and left the 1-day block a mediocre
    // leftover slot — total rest 6. The true optimum swaps the 4-day block
    // to an equally-good weekend-bridge window elsewhere, freeing the
    // holiday's bridge for the 1-day block — total rest 10.
    const holidayCal = createCalendar(DEFAULT_WORKING_WEEK, [
      { date: "2024-03-14", name: "H", level: "national" },
    ]);
    const plan = solveSplit(
      holidayCal,
      { totalDays: 5, parts: [4, 1] },
      "2024-03-04",
      "2024-03-29",
    );
    expect(plan.totalRestDays).toBe(10);
    expect(plan.totalRestDays).toBeGreaterThan(6); // what greedy found here
  });
});
