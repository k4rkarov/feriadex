import type { LaborPolicy } from "../../policy";

/**
 * PJ / free regime (Brazil).
 *
 * A contractor (PJ) is not bound by CLT Art. 134: they may organize vacation
 * freely — any number of periods, any block sizes, and no start-day
 * restriction (§3 does not apply). Constraints are effectively off; the only
 * check kept is internal consistency (blocks summing to the declared total,
 * enforced by `validateScheme`). Presets are just convenient starting points.
 */
export const PJ: LaborPolicy = {
  id: "br-pj",
  countryCode: "BR",
  label: "PJ / livre",
  maxPeriods: Number.MAX_SAFE_INTEGER,
  minMainBlockDays: 1,
  minOtherBlockDays: 1,
  allowSellBack: false,
  maxSellBackFraction: 0,
  // No §3 start restriction for PJ.
  vacationStartAllowed: undefined,
  presets: [
    { totalDays: 30, parts: [30] },
    { totalDays: 30, parts: [15, 15] },
    { totalDays: 30, parts: [10, 10, 10] },
  ],
};
