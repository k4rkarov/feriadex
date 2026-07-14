import { describe, expect, it } from "vitest";
import { toGoogleCalendarUrl, toIcsText } from "./calendarExport";

describe("toGoogleCalendarUrl", () => {
  it("uses an exclusive end date (day after the last day)", () => {
    const url = toGoogleCalendarUrl({ title: "Férias", start: "2026-07-06", end: "2026-07-10" });
    expect(url).toBe(
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=F%C3%A9rias&dates=20260706%2F20260711",
    );
  });

  it("handles a single-day event", () => {
    const url = toGoogleCalendarUrl({ title: "Feriado", start: "2026-01-01", end: "2026-01-01" });
    expect(url).toContain("dates=20260101%2F20260102");
  });
});

describe("toIcsText", () => {
  it("produces a valid VCALENDAR with one VEVENT per event, exclusive DTEND", () => {
    const ics = toIcsText([
      { title: "Período 1", start: "2026-07-06", end: "2026-07-19" },
      { title: "Período 2", start: "2026-12-14", end: "2026-12-20" },
    ]);
    expect(ics).toMatch(/^BEGIN:VCALENDAR\r\n/);
    expect(ics).toMatch(/\r\nEND:VCALENDAR$/);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain("DTSTART;VALUE=DATE:20260706");
    expect(ics).toContain("DTEND;VALUE=DATE:20260720"); // exclusive: day after the 19th
    expect(ics).toContain("SUMMARY:Período 1");
  });

  it("escapes commas, semicolons, and backslashes in the title", () => {
    const ics = toIcsText([{ title: "Férias, período; extra\\especial", start: "2026-01-01", end: "2026-01-01" }]);
    expect(ics).toContain("SUMMARY:Férias\\, período\\; extra\\\\especial");
  });
});
