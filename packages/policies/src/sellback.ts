import type { LaborPolicy } from "./policy";

/**
 * Max days that may be sold as abono pecuniário for an entitlement, per policy.
 * CLT Art. 143: up to 1/3 of the entitlement. Returns 0 when the policy
 * disallows sell-back (e.g. PJ).
 */
export function maxSellBackDays(
  policy: LaborPolicy,
  entitlementDays: number,
): number {
  if (!policy.allowSellBack) return 0;
  return Math.floor(entitlementDays * policy.maxSellBackFraction);
}
