"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  bestAssignment,
  dayOfWeek,
  describeWindow,
  restSpan,
  windowsOverlap,
  type Calendar,
  type DayKind,
  type VacationWindow,
} from "@feriadex/core";
import { t, type MessageKey } from "@feriadex/i18n";
import { brDate, type PeriodOptions } from "./model";
import { Balloon, MonthGrid, MonthsRow, monthsBetween } from "./MonthGrid";
import { HeatmapView } from "./HeatmapView";
import { downloadText, toGoogleCalendarUrl, toIcsText, type ExportEvent } from "../../lib/calendarExport";
import s from "./CalendarView.module.css";

// F1 heatmap disabled per owner feedback (2026-07-14): candidates skewed
// toward always landing on Mon/Tue/Wed starts, not useful in practice. Code
// kept (HeatmapView.tsx, MonthGrid extraction) in case it's revisited with a
// different framing — just not reachable from the UI for now.
const HEATMAP_ENABLED = false;

const extrasOf = (w: VacationWindow) => w.leadingFree + w.trailingFree;
const monthName = (iso: string) =>
  t(`month.${Number(iso.slice(5, 7)) - 1}` as MessageKey);

/** The full rest span (booked days + the free days it bridges) as one exportable event. */
function toExportEvent(win: VacationWindow, title: string): ExportEvent {
  const span = restSpan(win);
  return { title, start: span.start, end: span.end };
}

export function CalendarView({
  periods,
  cal,
  names,
  from,
  to,
  onShare,
  copied,
}: {
  periods: PeriodOptions[];
  cal: Calendar;
  names: Map<string, string>;
  from: string;
  to: string;
  onShare: () => void;
  copied: boolean;
}) {
  const [activePeriod, setActivePeriod] = useState(0);
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Best conflict-free choice across periods (no two windows share a rest day);
  // its picks seed the selection and its total is the honest "max possible".
  const assignment = useMemo(
    () => bestAssignment(periods.map((p) => p.options)),
    [periods],
  );

  const [sel, setSel] = useState<number[]>(
    () => assignment?.picks ?? periods.map(() => 0),
  );

  // Reset selections when the periods change (identity is memoized upstream).
  useEffect(() => {
    setActivePeriod(0);
    setSel(assignment?.picks ?? periods.map(() => 0));
  }, [periods, assignment]);

  const pi = Math.min(activePeriod, periods.length - 1);
  const period = periods[pi]!;
  const oi = Math.min(sel[pi] ?? 0, period.options.length - 1);
  const win = period.options[oi]!;

  const pickOption = (i: number) =>
    setSel((prev) => {
      const next = [...prev];
      next[pi] = i;
      return next;
    });

  // Best achievable total that all periods can hold at once (no overlap).
  const maxTotal =
    assignment?.total ??
    periods.reduce((sum, p) => sum + (p.options[0]?.totalRestDays ?? 0), 0);

  // Windows currently chosen by the OTHER periods — options that overlap any of
  // them are unpickable (would double-book a day). Keeps the plan conflict-free.
  const otherSelected = periods
    .map((p, i) => (i === pi ? null : p.options[Math.min(sel[i] ?? 0, p.options.length - 1)]))
    .filter((w): w is VacationWindow => w != null);
  // Extra days actually gained across the currently selected months.
  const diasExtras = periods.reduce((sum, p, i) => {
    const w = p.options[Math.min(sel[i] ?? 0, p.options.length - 1)];
    return sum + (w ? extrasOf(w) : 0);
  }, 0);

  const eventTitle = (n: number) => `${t("export.eventTitle")} ${n}`;
  const exportGoogleCalendar = () => {
    window.open(toGoogleCalendarUrl(toExportEvent(win, eventTitle(pi + 1))), "_blank");
  };
  const exportIcs = () => {
    const events =
      periods.length > 1
        ? periods.map((p, i) => {
            const w = p.options[Math.min(sel[i] ?? 0, p.options.length - 1)]!;
            return toExportEvent(w, eventTitle(i + 1));
          })
        : [toExportEvent(win, eventTitle(1))];
    downloadText("feriadex.ics", toIcsText(events), "text/calendar;charset=utf-8");
  };

  // Group this period's month options by year (side-by-side year groups).
  const years = [...new Set(period.options.map((o) => o.startDate.slice(0, 4)))];

  return (
    <div className={s.wrap}>
      <div className={s.periodTabs}>
        {periods.map((p, i) => {
          const w = p.options[Math.min(sel[i] ?? 0, p.options.length - 1)]!;
          return (
            <button
              key={i}
              type="button"
              className={i === pi ? s.periodActive : s.period}
              onClick={() => setActivePeriod(i)}
            >
              {t("cal.period")} {i + 1}
              <em>
                <span className={s.numFerias}>{p.length}</span>+
                <span className={s.numExtra}>{extrasOf(w)}</span>
              </em>
            </button>
          );
        })}
        <span className={s.badges}>
          <span className={s.actionsRow}>
            <button
              type="button"
              className={s.share}
              onClick={onShare}
              aria-label={t("share.copy")}
              title={copied ? t("share.copied") : t("share.copy")}
            >
              {copied ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="M8.6 13.5 15.4 17.5M15.4 6.5 8.6 10.5" />
                </svg>
              )}
            </button>
            <button
              type="button"
              className={s.share}
              onClick={exportGoogleCalendar}
              aria-label={t("export.googleCalendar")}
              title={t("export.googleCalendar")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M3 9h18M8 2v4M16 2v4" />
                <path d="M12 12v5M9.5 14.5h5" />
              </svg>
            </button>
            <button
              type="button"
              className={s.share}
              onClick={exportIcs}
              aria-label={t("export.ics")}
              title={t("export.ics")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3v12" />
                <path d="M7 10l5 5 5-5" />
                <path d="M4 19h16" />
              </svg>
            </button>
          </span>
          <span className={s.badgesRow}>
            <span className={s.extrasBadge}>
              {t("cal.extrasBadge")}: {diasExtras}
            </span>
            <span className={s.maxBadge}>
              {t("cal.maxLabel")}: +{maxTotal}
            </span>
          </span>
        </span>
      </div>

      {HEATMAP_ENABLED && (
        <div className={s.viewToggleRow}>
          <button
            type="button"
            className={s.viewToggle}
            onClick={() => setShowHeatmap((v) => !v)}
          >
            {showHeatmap ? t("heatmap.hide") : t("heatmap.show")}
          </button>
        </div>
      )}

      {HEATMAP_ENABLED && showHeatmap ? (
        <HeatmapView
          lengthDays={period.length}
          allWindows={period.allWindows}
          from={from}
          to={to}
        />
      ) : (
        <>
          <div className={s.optionTabs}>
            {years.map((year) => (
              <div key={year} className={s.yearGroup}>
                <span className={s.yearLabel}>{year}</span>
                <div className={s.monthTabs}>
                  {period.options.map((o, i) => {
                    if (o.startDate.slice(0, 4) !== year) return null;
                    const conflict =
                      i !== oi && otherSelected.some((w) => windowsOverlap(w, o));
                    return (
                      <button
                        key={o.startDate}
                        type="button"
                        className={i === oi ? s.optActive : s.opt}
                        onClick={() => pickOption(i)}
                        disabled={conflict}
                        title={conflict ? t("cal.optConflict") : undefined}
                      >
                        {monthName(o.startDate)}{" "}
                        <em className={s.numExtra}>+{extrasOf(o)}</em>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className={s.summary}>
            <span>
              {t("cal.inicio")} <strong>{brDate(win.startDate)}</strong>
            </span>
            <span>
              {t("cal.retorno")} <strong>{brDate(addDays(win.endDate, 1))}</strong>
            </span>
            <span>
              {t("cal.extras")} <strong>{extrasOf(win)}</strong>
            </span>
            <span>
              {t("cal.total")} <strong>{win.totalRestDays}</strong>
            </span>
          </div>

          <Months
            block={win}
            cal={cal}
            names={names}
            openDay={openDay}
            onToggle={(d) => setOpenDay((cur) => (cur === d ? null : d))}
          />
          <Legend />
        </>
      )}
    </div>
  );
}

interface DayProps {
  names: Map<string, string>;
  openDay: string | null;
  onToggle: (date: string) => void;
}

function Months({
  block,
  cal,
  names,
  openDay,
  onToggle,
}: { block: VacationWindow; cal: Calendar } & DayProps) {
  const marks = new Map<string, DayKind>(
    describeWindow(cal, block).map((m) => [m.date, m.kind]),
  );
  const first = addDays(block.startDate, -block.leadingFree);
  const last = addDays(block.endDate, block.trailingFree);
  return (
    <MonthsRow>
      {monthsBetween(first, last).map((ym) => (
        <MonthGrid
          key={ym}
          ym={ym}
          renderDay={(iso, num) => {
            const cls = [
              s.day,
              dayOfWeek(iso) === 0 || dayOfWeek(iso) === 6 ? s.weekend : "",
              kindClass(marks.get(iso), s),
            ]
              .filter(Boolean)
              .join(" ");
            const name = names.get(iso);
            if (!name) {
              return (
                <div key={iso} className={cls}>
                  {num}
                </div>
              );
            }
            return (
              <button
                key={iso}
                type="button"
                className={`${cls} ${s.dayBtn}`}
                onClick={() => onToggle(iso)}
              >
                {num}
                {openDay === iso && <Balloon text={name} />}
              </button>
            );
          }}
        />
      ))}
    </MonthsRow>
  );
}

function kindClass(kind: DayKind | undefined, styles: typeof s): string {
  if (kind === "vacation") return styles.vacation!;
  if (kind === "extra") return styles.extra!;
  if (kind === "extra-holiday") return styles.extraHoliday!;
  return "";
}

function Legend() {
  return (
    <div className={s.legend}>
      <span className={`${s.dot} ${s.vacation}`} /> {t("cal.legend.vacation")}
      <span className={`${s.dot} ${s.extra}`} /> {t("cal.legend.extra")}
      <span className={`${s.dot} ${s.extraHoliday}`} />{" "}
      {t("cal.legend.extraHoliday")}
    </div>
  );
}
