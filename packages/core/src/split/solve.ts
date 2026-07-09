import type { Calendar } from "../calendar/calendar";
import { compareDate, type ISODate } from "../calendar/date";
import type { VacationWindow } from "../types";
import { optimizeSingleBlock } from "../bridge/optimize";
import type { SplitScheme } from "./scheme";

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
