import { validateScheme } from "@feriadex/core";
import { describe, expect, it } from "vitest";
import { CLT } from "../src/packs/br/clt";

describe("CLT pack", () => {
  it("every shipped preset is valid under the CLT floor", () => {
    for (const preset of CLT.presets) {
      const r = validateScheme(preset, CLT);
      expect(r.valid, `${preset.parts.join("+")}: ${r.errors.join(", ")}`).toBe(
        true,
      );
    }
  });

  it("caps sell-back at one third", () => {
    expect(CLT.allowSellBack).toBe(true);
    expect(CLT.maxSellBackFraction).toBeCloseTo(1 / 3);
  });
});
