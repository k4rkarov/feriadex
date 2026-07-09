/**
 * Split-scheme model + validation. Kept generic here (core depends on nothing);
 * concrete jurisdiction values live in `@feriadex/policies` packs.
 */

/** An order-independent partition of a vacation entitlement into blocks. */
export interface SplitScheme {
  /** Total entitlement being scheduled (e.g. 30). */
  totalDays: number;
  /** Block lengths in calendar days. Order does not matter (a multiset). */
  parts: number[];
}

/** Hard constraints a valid scheme must satisfy (e.g. Brazilian CLT floor). */
export interface SplitConstraints {
  /** Maximum number of blocks. */
  maxPeriods: number;
  /** At least one block must be >= this. */
  minMainBlockDays: number;
  /** Every other block must be >= this. */
  minOtherBlockDays: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** Validate a split scheme against constraints. */
export function validateScheme(
  scheme: SplitScheme,
  c: SplitConstraints,
): ValidationResult {
  const errors: string[] = [];
  const { parts, totalDays } = scheme;

  if (parts.length === 0) {
    errors.push("scheme has no blocks");
  }
  if (parts.some((p) => !Number.isInteger(p) || p <= 0)) {
    errors.push("all blocks must be positive integers");
  }

  const sum = parts.reduce((a, b) => a + b, 0);
  if (sum !== totalDays) {
    errors.push(`blocks sum to ${sum}, expected totalDays ${totalDays}`);
  }
  if (parts.length > c.maxPeriods) {
    errors.push(`too many blocks: ${parts.length} > ${c.maxPeriods}`);
  }

  const sorted = [...parts].sort((a, b) => b - a);
  const main = sorted[0];
  if (main !== undefined && main < c.minMainBlockDays) {
    errors.push(
      `main block must be >= ${c.minMainBlockDays} days, got ${main}`,
    );
  }
  if (sorted.slice(1).some((p) => p < c.minOtherBlockDays)) {
    errors.push(`every other block must be >= ${c.minOtherBlockDays} days`);
  }

  return { valid: errors.length === 0, errors };
}
