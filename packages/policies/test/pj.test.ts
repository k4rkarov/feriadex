import { validateScheme } from "@feriadex/core";
import { describe, expect, it } from "vitest";
import { PJ } from "../src/packs/br/pj";
import { CLT } from "../src/packs/br/clt";

describe("PJ (free) policy", () => {
  it("accepts schemes the CLT would reject", () => {
    // 5 tiny periods, none reaching 14 — illegal under CLT, fine for PJ.
    const scheme = { totalDays: 30, parts: [6, 6, 6, 6, 6] };
    expect(validateScheme(scheme, CLT).valid).toBe(false);
    expect(validateScheme(scheme, PJ).valid).toBe(true);
  });

  it("still enforces internal consistency (sum to total)", () => {
    expect(validateScheme({ totalDays: 30, parts: [10, 10] }, PJ).valid).toBe(false);
  });

  it("has no start-day restriction (§3 does not apply)", () => {
    expect(PJ.vacationStartAllowed).toBeUndefined();
  });
});
