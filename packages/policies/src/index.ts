// Public entry for @feriadex/policies.

import { CLT } from "./packs/br/clt";
import { PJ } from "./packs/br/pj";

export type { LaborPolicy } from "./policy";
export { CLT } from "./packs/br/clt";
export { PJ } from "./packs/br/pj";
export { cltStartAllowed } from "./packs/br/start-rule";
export { maxSellBackDays } from "./sellback";

/** Brazilian work regimes offered in the UI. */
export const BR_POLICIES = [CLT, PJ] as const;
