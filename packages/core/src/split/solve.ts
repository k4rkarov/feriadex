import type { Calendar } from "../calendar/calendar";
import { compareDate, type ISODate } from "../calendar/date";
import type { VacationWindow } from "../types";
import { optimizeSingleBlock } from "../bridge/optimize";
import type { SplitConstraints, SplitScheme } from "./scheme";
import { partitionsInto } from "./partitions";

export interface SolveOptions {
  /** Legality/eligibility gate for each block's start date (e.g. CLT §3). */
  allowStart?: (startDate: ISODate, cal: Calendar) => boolean;
}

export interface SplitPlan {
  scheme: SplitScheme;
  /** One placed window per block, sorted by start date. */
  blocks: VacationWindow[];
  totalRestDays: number;
  totalWorkingDaysSpent: number;
}

function overlaps(w: VacationWindow, ranges: Array<[ISODate, ISODate]>): boolean {
  return ranges.some(
    ([s, e]) =>
      compareDate(w.startDate, e) <= 0 && compareDate(w.endDate, s) >= 0,
  );
}

/**
 * Place every block of a split scheme into its best non-overlapping window
 * within `[from, to]`, maximizing total rest.
 *
 * Strategy: greedy — largest blocks first, each taking its most efficient
 * free window. Greedy is good enough for the small block counts CLT allows
 * (<= 3); a globally optimal search can replace this later (BACKLOG C5)
 * without changing the signature.
 */
export function solveSplit(
  cal: Calendar,
  scheme: SplitScheme,
  from: ISODate,
  to: ISODate,
  opts: SolveOptions = {},
): SplitPlan {
  const parts = [...scheme.parts].sort((a, b) => b - a);
  const used: Array<[ISODate, ISODate]> = [];
  const blocks: VacationWindow[] = [];

  for (const lengthDays of parts) {
    const candidates = optimizeSingleBlock(cal, {
      lengthDays,
      from,
      to,
      limit: Infinity,
      allowStart: opts.allowStart,
    });
    const chosen = candidates.find((w) => !overlaps(w, used));
    if (!chosen) {
      throw new Error(
        `no non-overlapping window for a ${lengthDays}-day block in [${from}, ${to}]`,
      );
    }
    used.push([chosen.startDate, chosen.endDate]);
    blocks.push(chosen);
  }

  blocks.sort((a, b) => compareDate(a.startDate, b.startDate));
  return {
    scheme,
    blocks,
    totalRestDays: blocks.reduce((s, b) => s + b.totalRestDays, 0),
    totalWorkingDaysSpent: blocks.reduce((s, b) => s + b.workingDaysSpent, 0),
  };
}

/**
 * Find the best way to split `totalDays` into exactly `periods` blocks under a
 * policy: enumerate every valid partition (one block ≥ minMain, all ≥ minOther),
 * place each with `solveSplit`, and return the plan with the most total rest.
 * Returns null when no valid partition fits the window.
 */
export function bestSplit(
  cal: Calendar,
  totalDays: number,
  periods: number,
  from: ISODate,
  to: ISODate,
  constraints: SplitConstraints,
  opts: SolveOptions = {},
): SplitPlan | null {
  const partitions = partitionsInto(
    totalDays,
    periods,
    constraints.minOtherBlockDays,
  ).filter((p) => Math.max(...p) >= constraints.minMainBlockDays);

  let best: SplitPlan | null = null;
  for (const parts of partitions) {
    try {
      const plan = solveSplit(cal, { totalDays, parts }, from, to, opts);
      if (!best || plan.totalRestDays > best.totalRestDays) best = plan;
    } catch {
      // partition can't fit before the deadline — skip it
    }
  }
  return best;
}
