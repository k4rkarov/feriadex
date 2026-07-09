import { describe, expect, it } from "vitest";
import { maxSellBackDays } from "../src/sellback";
import { CLT } from "../src/packs/br/clt";
import { PJ } from "../src/packs/br/pj";

describe("maxSellBackDays", () => {
  it("CLT allows up to 1/3 (10 of 30)", () => {
    expect(maxSellBackDays(CLT, 30)).toBe(10);
    expect(maxSellBackDays(CLT, 15)).toBe(5);
  });

  it("PJ has no sell-back", () => {
    expect(maxSellBackDays(PJ, 30)).toBe(0);
  });
});
