/**
 * Integer partitions of `total` into exactly `count` parts, each ≥ `minEach`,
 * as non-increasing arrays (so each multiset appears once).
 * e.g. partitionsInto(30, 2, 5) → [[25,5],[24,6],…,[15,15]].
 */
export function partitionsInto(
  total: number,
  count: number,
  minEach: number,
): number[][] {
  const res: number[][] = [];
  const rec = (remaining: number, slots: number, acc: number[]): void => {
    if (slots === 1) {
      if (remaining >= minEach && (acc.length === 0 || remaining <= acc[acc.length - 1]!))
        res.push([...acc, remaining]);
      return;
    }
    const cap = acc.length ? acc[acc.length - 1]! : remaining;
    const maxVal = Math.min(cap, remaining - minEach * (slots - 1));
    for (let v = maxVal; v >= minEach; v--) {
      rec(remaining - v, slots - 1, [...acc, v]);
    }
  };
  if (count >= 1 && total >= minEach * count) rec(total, count, []);
  return res;
}
