import { isAllowedStart, type Calendar, type ISODate } from "@feriadex/core";

/**
 * CLT Art. 134 §3 start-date gate: vacation may not begin in the 2 days
 * preceding a holiday or weekly rest (DSR). Argument order matches
 * `OptimizeOptions.allowStart`, so it can be passed straight to the optimizer.
 */
export const cltStartAllowed = (date: ISODate, cal: Calendar): boolean =>
  isAllowedStart(cal, date, 2);
