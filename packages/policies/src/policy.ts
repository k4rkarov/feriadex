import type {
  Calendar,
  ISODate,
  SplitConstraints,
  SplitScheme,
} from "@feriadex/core";

/**
 * A jurisdiction's labor policy: the split constraints (legal floor) plus
 * sell-back rules and the employer/common presets offered in the UI.
 */
export interface LaborPolicy extends SplitConstraints {
  id: string;
  countryCode: string;
  label: string;
  /** Whether the worker may sell part of the entitlement (abono pecuniário). */
  allowSellBack: boolean;
  /** Max fraction that may be sold (e.g. 1/3). */
  maxSellBackFraction: number;
  /** Ready-made schemes surfaced to the user (editable). */
  presets: SplitScheme[];
  /**
   * Legal gate for a vacation start date (e.g. CLT Art. 134 §3). Signature
   * matches `OptimizeOptions.allowStart`, so it is passed straight to the
   * optimizer/solver as `allowStart` — illegal starts are never proposed.
   */
  vacationStartAllowed?: (startDate: ISODate, cal: Calendar) => boolean;
}
