import { describe, expect, it } from "vitest";
import { easterSunday } from "../src/calendar/easter";
import { addDays } from "../src/calendar/date";

describe("easterSunday", () => {
  it("matches known Easter dates", () => {
    expect(easterSunday(2024)).toBe("2024-03-31");
    expect(easterSunday(2025)).toBe("2025-04-20");
    expect(easterSunday(2026)).toBe("2026-04-05");
    expect(easterSunday(2027)).toBe("2027-03-28");
  });

  it("derives Brazilian movable dates for 2026 (ground truth from folgaextra)", () => {
    const easter = easterSunday(2026); // 2026-04-05
    expect(addDays(easter, -48)).toBe("2026-02-16"); // Carnaval segunda
    expect(addDays(easter, -47)).toBe("2026-02-17"); // Carnaval terça
    expect(addDays(easter, -2)).toBe("2026-04-03"); // Sexta-feira Santa
    expect(addDays(easter, 60)).toBe("2026-06-04"); // Corpus Christi
  });
});
