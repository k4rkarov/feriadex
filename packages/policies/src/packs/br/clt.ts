import type { LaborPolicy } from "../../policy";
import { cltStartAllowed } from "./start-rule";

/**
 * Brazil — CLT Art. 134.
 *
 * Legal floor: vacation may be split into up to 3 periods; one must be >= 14
 * consecutive days and the others >= 5. Up to 1/3 may be sold (abono
 * pecuniário). The `presets` are common HR (RH) parceling schemes; users can
 * edit them or build their own — the app validates against this floor.
 */
export const CLT: LaborPolicy = {
  id: "br-clt",
  countryCode: "BR",
  label: "Brasil — CLT Art. 134",
  maxPeriods: 3,
  minMainBlockDays: 14,
  minOtherBlockDays: 5,
  allowSellBack: true,
  maxSellBackFraction: 1 / 3,
  vacationStartAllowed: cltStartAllowed,
  presets: [
    { totalDays: 30, parts: [30] },
    { totalDays: 30, parts: [15, 15] },
    { totalDays: 30, parts: [14, 11, 5] },
    { totalDays: 30, parts: [20, 5, 5] },
    { totalDays: 30, parts: [15, 5, 10] },
    { totalDays: 30, parts: [14, 7, 9] },
    // 20 days scheduled + 10 days sold (abono pecuniário).
    { totalDays: 20, parts: [14, 6] },
    { totalDays: 20, parts: [15, 5] },
  ],
};
