import { addDays, compareDate, type ISODate } from "../calendar/date";
import type { VacationWindow } from "../types";

/**
 * The full rest span a window occupies on the calendar: the booked vacation
 * days plus the leading/trailing free days it borrows (weekends/holidays).
 * Two spans that touch the same day cannot both be realized simultaneously —
 * the shared day would otherwise be counted as rest twice.
 */
export function restSpan(w: VacationWindow): { start: ISODate; end: ISODate } {
  return {
    start: addDays(w.startDate, -w.leadingFree),
    end: addDays(w.endDate, w.trailingFree),
  };
}

/** Do two windows' rest spans intersect (share at least one calendar day)? */
export function windowsOverlap(a: VacationWindow, b: VacationWindow): boolean {
  const sa = restSpan(a);
  const sb = restSpan(b);
  return compareDate(sa.start, sb.end) <= 0 && compareDate(sb.start, sa.end) <= 0;
}

export interface Assignment {
  /** Chosen option index into each period's option list (same order). */
  picks: number[];
  /** Sum of `totalRestDays` across the chosen, non-overlapping windows. */
  total: number;
}

/**
 * Pick exactly one window per period so that no two chosen windows overlap,
 * maximizing the summed rest. This is the honest "best achievable at the same
 * time" — summing each period's best independently over-counts when the best
 * windows collide. DFS with pruning; period counts are tiny (≤ 6) and options
 * per period are one-per-month, so the search stays small.
 *
 * Returns `null` if no conflict-free choice exists for every period.
 */
export function bestAssignment(optionLists: VacationWindow[][]): Assignment | null {
  const n = optionLists.length;
  if (n === 0) return { picks: [], total: 0 };
  if (optionLists.some((opts) => opts.length === 0)) return null;

  let best: Assignment | null = null;
  const chosen: number[] = [];
  const chosenWindows: VacationWindow[] = [];

  // Optimistic remaining rest per period (its top option), for a bound.
  const suffixMax: number[] = new Array(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    const top = optionLists[i]!.reduce((m, w) => Math.max(m, w.totalRestDays), 0);
    suffixMax[i] = suffixMax[i + 1]! + top;
  }

  const dfs = (i: number, acc: number): void => {
    if (i === n) {
      if (!best || acc > best.total) best = { picks: [...chosen], total: acc };
      return;
    }
    // Prune: even taking the best of every remaining period can't beat `best`.
    if (best && acc + suffixMax[i]! <= best.total) return;

    for (let j = 0; j < optionLists[i]!.length; j++) {
      const w = optionLists[i]![j]!;
      if (chosenWindows.some((c) => windowsOverlap(c, w))) continue;
      chosen.push(j);
      chosenWindows.push(w);
      dfs(i + 1, acc + w.totalRestDays);
      chosen.pop();
      chosenWindows.pop();
    }
  };

  dfs(0, 0);
  return best;
}
