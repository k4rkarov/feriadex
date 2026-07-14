import type { Calendar } from "../calendar/calendar";
import { compareDate, type ISODate } from "../calendar/date";
import type { VacationWindow } from "../types";
import { optimizeSingleBlock } from "../bridge/optimize";
import { bestAssignment } from "../bridge/overlap";
import type { SplitConstraints, SplitScheme } from "./scheme";
import { partitionsInto } from "./partitions";

export interface SolveOptions {
  /** Legality/eligibility gate for each block's start date (e.g. CLT §3). */
  allowStart?: (startDate: ISODate, cal: Calendar) => boolean;
  /**
   * Optional cache (block length → its rest-ranked candidates) shared across
   * multiple `solveSplit` calls over the same `[from, to]`/calendar — lets a
   * caller comparing many partitions (e.g. `bestSplit`, or ranking scheme
   * presets) avoid recomputing `optimizeSingleBlock` for a length that
   * recurs across partitions (very common — e.g. "5" appears in almost
   * every CLT partition of 30 days). Callers own the Map's lifetime.
   */
  candidateCache?: Map<number, VacationWindow[]>;
}

export interface SplitPlan {
  scheme: SplitScheme;
  /** One placed window per block, sorted by start date. */
  blocks: VacationWindow[];
  totalRestDays: number;
  totalWorkingDaysSpent: number;
}

/** Every candidate window for one block length, ranked by total rest (best first). */
function candidatesByRest(
  cal: Calendar,
  lengthDays: number,
  from: ISODate,
  to: ISODate,
  allowStart: SolveOptions["allowStart"],
): VacationWindow[] {
  return optimizeSingleBlock(cal, { lengthDays, from, to, limit: Infinity, allowStart }).sort(
    (a, b) => b.totalRestDays - a.totalRestDays || compareDate(a.startDate, b.startDate),
  );
}

/**
 * Cap on candidates considered per block, adaptive to block count so the
 * cross-block search (`bestAssignment`'s DFS, cost ~cap^blockCount before
 * pruning) stays fast even at PJ's max period count. In virtually every real
 * scenario the optimal combination sits within this many top-ranked
 * candidates per block; `solveSplit` still falls back to the full,
 * uncapped candidate lists if the capped search can't find ANY non-
 * overlapping placement, so the cap can only cost optimality in a
 * vanishingly rare edge case, never feasibility.
 */
function candidateCap(blockCount: number): number {
  return Math.max(8, Math.floor(60 / blockCount));
}

/**
 * Place every block of a split scheme into its best non-overlapping windows
 * within `[from, to]`, maximizing total rest across the whole set — a true
 * combinatorial search (`bestAssignment`, shared with the calendar's
 * per-period placement, BACKLOG G-A3), not a greedy largest-block-first
 * placement. See BACKLOG C5.
 */
export function solveSplit(
  cal: Calendar,
  scheme: SplitScheme,
  from: ISODate,
  to: ISODate,
  opts: SolveOptions = {},
): SplitPlan {
  const parts = scheme.parts;
  const cache = opts.candidateCache;
  const perBlock = parts.map((len) => {
    let list = cache?.get(len);
    if (!list) {
      list = candidatesByRest(cal, len, from, to, opts.allowStart);
      cache?.set(len, list);
    }
    return list;
  });
  const cap = candidateCap(parts.length);

  let assignment = bestAssignment(perBlock.map((c) => c.slice(0, cap)));
  if (!assignment) {
    // The top-`cap` candidates per block all mutually collide — rare, but
    // fall back to the full lists so a real placement is never missed.
    assignment = bestAssignment(perBlock);
  }
  if (!assignment) {
    throw new Error(
      `no non-overlapping placement for parts [${parts.join(",")}] in [${from}, ${to}]`,
    );
  }

  const blocks = assignment.picks
    .map((idx, i) => perBlock[i]![idx]!)
    .sort((a, b) => compareDate(a.startDate, b.startDate));

  return {
    scheme,
    blocks,
    totalRestDays: assignment.total,
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

  // Shared across every partition tried: block lengths repeat heavily
  // between partitions (e.g. "5" in nearly every 30-day/3-period CLT split).
  const candidateCache = opts.candidateCache ?? new Map<number, VacationWindow[]>();

  let best: SplitPlan | null = null;
  for (const parts of partitions) {
    try {
      const plan = solveSplit(cal, { totalDays, parts }, from, to, { ...opts, candidateCache });
      if (!best || plan.totalRestDays > best.totalRestDays) best = plan;
    } catch {
      // partition can't fit before the deadline — skip it
    }
  }
  return best;
}
