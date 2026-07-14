import { addDays } from "@feriadex/core";

export interface ExportEvent {
  title: string;
  /** ISO start date (inclusive). */
  start: string;
  /** ISO end date (inclusive) — the last full day of the event. */
  end: string;
}

const toCompact = (iso: string): string => iso.replaceAll("-", "");

/** Escape text for an .ics field per RFC 5545 (§3.3.11). */
const escapeIcs = (text: string): string =>
  text.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");

/**
 * Google Calendar's event-creation URL — no API/auth needed, just a query
 * string. All-day events use an EXCLUSIVE end date (the day after the last
 * day), Google's own convention — same +1 day rule as the .ics DTEND below.
 */
export function toGoogleCalendarUrl(e: ExportEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${toCompact(e.start)}/${toCompact(addDays(e.end, 1))}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * A minimal, valid .ics (RFC 5545) with one all-day VEVENT per event — works
 * with Apple Calendar, Outlook, and any other calendar app, not just Google's.
 */
export function toIcsText(events: ExportEvent[]): string {
  const stamp = `${toCompact(new Date().toISOString().slice(0, 10))}T000000Z`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Feriadex//Vacation Plan//PT",
    "CALSCALE:GREGORIAN",
    ...events.flatMap((e) => [
      "BEGIN:VEVENT",
      `UID:${crypto.randomUUID()}@feriadex`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${toCompact(e.start)}`,
      `DTEND;VALUE=DATE:${toCompact(addDays(e.end, 1))}`,
      `SUMMARY:${escapeIcs(e.title)}`,
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

/** Triggers a browser download of the given text as a named file. */
export function downloadText(filename: string, text: string, mimeType: string): void {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
