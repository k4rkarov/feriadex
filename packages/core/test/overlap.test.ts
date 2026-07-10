import { describe, expect, it } from "vitest";
import type { VacationWindow } from "../src/types";
import {
  bestAssignment,
  restSpan,
  windowsOverlap,
} from "../src/bridge/overlap";

/** Minimal window factory; only the fields overlap logic reads matter. */
function win(
  startDate: string,
  endDate: string,
  opts: { leadingFree?: number; trailingFree?: number; rest?: number } = {},
): VacationWindow {
  const leadingFree = opts.leadingFree ?? 0;
  const trailingFree = opts.trailingFree ?? 0;
  return {
    startDate,
    endDate,
    lengthDays: 1,
    workingDaysSpent: 1,
    leadingFree,
    trailingFree,
    totalRestDays: opts.rest ?? 1,
    efficiency: 1,
  };
}

describe("restSpan", () => {
  it("extends the booked range by leading/trailing free days", () => {
    const s = restSpan(win("2026-07-06", "2026-07-10", { leadingFree: 2, trailingFree: 2 }));
    expect(s).toEqual({ start: "2026-07-04", end: "2026-07-12" });
  });
});

describe("windowsOverlap", () => {
  it("is false for clearly separate months", () => {
    expect(windowsOverlap(win("2026-07-06", "2026-07-10"), win("2026-09-07", "2026-09-11"))).toBe(false);
  });

  it("is true when booked ranges intersect", () => {
    expect(windowsOverlap(win("2026-07-06", "2026-07-15"), win("2026-07-13", "2026-07-20"))).toBe(true);
  });

  it("is true when only the borrowed rest spans touch", () => {
    // A ends Fri 10th, borrows the weekend (trailing 2 -> through 12th).
    // B starts Mon 13th but borrows that same weekend (leading 2 -> from 11th).
    const a = win("2026-07-06", "2026-07-10", { trailingFree: 2 });
    const b = win("2026-07-13", "2026-07-17", { leadingFree: 2 });
    expect(windowsOverlap(a, b)).toBe(true);
  });

  it("is false when rest spans are adjacent but disjoint", () => {
    const a = win("2026-07-06", "2026-07-10");
    const b = win("2026-07-11", "2026-07-15");
    expect(windowsOverlap(a, b)).toBe(false);
  });
});

describe("bestAssignment", () => {
  it("returns an empty assignment for no periods", () => {
    expect(bestAssignment([])).toEqual({ picks: [], total: 0 });
  });

  it("picks each period's top option when none overlap", () => {
    const res = bestAssignment([
      [win("2026-03-02", "2026-03-16", { rest: 20 }), win("2026-04-06", "2026-04-20", { rest: 10 })],
      [win("2026-09-07", "2026-09-13", { rest: 9 }), win("2026-10-05", "2026-10-11", { rest: 5 })],
    ]);
    expect(res).toEqual({ picks: [0, 0], total: 29 });
  });

  it("avoids overlap even when it means a lower-ranked option", () => {
    // Period 1's best (rest 20) collides with period 2's best (rest 9);
    // the honest optimum takes period 2's second option instead.
    const res = bestAssignment([
      [win("2026-07-01", "2026-07-15", { rest: 20 })],
      [
        win("2026-07-10", "2026-07-20", { rest: 9 }), // overlaps period 1
        win("2026-11-02", "2026-11-08", { rest: 5 }), // clear
      ],
    ]);
    expect(res).toEqual({ picks: [0, 1], total: 25 });
  });

  it("returns null when a period cannot avoid overlap", () => {
    const res = bestAssignment([
      [win("2026-07-01", "2026-07-15", { rest: 20 })],
      [win("2026-07-05", "2026-07-12", { rest: 9 })], // only option overlaps
    ]);
    expect(res).toBeNull();
  });
});
