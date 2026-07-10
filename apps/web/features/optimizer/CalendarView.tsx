"use client";

import { useEffect, useState } from "react";
import {
  addDays,
  dayOfWeek,
  describeWindow,
  type Calendar,
  type DayKind,
  type VacationWindow,
} from "@feriadex/core";
import { t, type MessageKey } from "@feriadex/i18n";
import { brDate, type PeriodOptions } from "./model";
import s from "./CalendarView.module.css";

const pad = (n: number) => String(n).padStart(2, "0");
const extrasOf = (w: VacationWindow) => w.leadingFree + w.trailingFree;
const monthName = (iso: string) =>
  t(`month.${Number(iso.slice(5, 7)) - 1}` as MessageKey);

function monthsBetween(from: string, to: string): string[] {
  const out: string[] = [];
  let d = `${from.slice(0, 7)}-01`;
  const end = to.slice(0, 7);
  while (d.slice(0, 7) <= end) {
    out.push(d.slice(0, 7));
    const [y, m] = d.split("-").map(Number) as [number, number];
    d = m === 12 ? `${y + 1}-01-01` : `${y}-${pad(m + 1)}-01`;
  }
  return out;
}

export function CalendarView({
  periods,
  cal,
}: {
  periods: PeriodOptions[];
  cal: Calendar;
}) {
  const [activePeriod, setActivePeriod] = useState(0);
  const [sel, setSel] = useState<number[]>(() => periods.map(() => 0));

  // Reset selections when the periods change (identity is memoized upstream).
  useEffect(() => {
    setActivePeriod(0);
    setSel(periods.map(() => 0));
  }, [periods]);

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

  // Best achievable total: the top (most-rest) option of every period.
  const maxTotal = periods.reduce(
    (sum, p) => sum + (p.options[0]?.totalRestDays ?? 0),
    0,
  );
  // Extra days actually gained across the currently selected months.
  const diasExtras = periods.reduce((sum, p, i) => {
    const w = p.options[Math.min(sel[i] ?? 0, p.options.length - 1)];
    return sum + (w ? extrasOf(w) : 0);
  }, 0);

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
          <span className={s.extrasBadge}>
            {t("cal.extrasBadge")}: {diasExtras}
          </span>
          <span className={s.maxBadge}>
            {t("cal.maxLabel")}: +{maxTotal}
          </span>
        </span>
      </div>

      <div className={s.optionTabs}>
        {years.map((year) => (
          <div key={year} className={s.yearGroup}>
            <span className={s.yearLabel}>{year}</span>
            <div className={s.monthTabs}>
              {period.options.map((o, i) =>
                o.startDate.slice(0, 4) === year ? (
                  <button
                    key={o.startDate}
                    type="button"
                    className={i === oi ? s.optActive : s.opt}
                    onClick={() => pickOption(i)}
                  >
                    {monthName(o.startDate)}{" "}
            <em className={s.numExtra}>+{extrasOf(o)}</em>
                  </button>
                ) : null,
              )}
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

      <Months block={win} cal={cal} />
      <Legend />
    </div>
  );
}

function Months({ block, cal }: { block: VacationWindow; cal: Calendar }) {
  const marks = new Map<string, DayKind>(
    describeWindow(cal, block).map((m) => [m.date, m.kind]),
  );
  const first = addDays(block.startDate, -block.leadingFree);
  const last = addDays(block.endDate, block.trailingFree);
  return (
    <div className={s.months}>
      {monthsBetween(first, last).map((ym) => (
        <Month key={ym} ym={ym} marks={marks} />
      ))}
    </div>
  );
}

function Month({ ym, marks }: { ym: string; marks: Map<string, DayKind> }) {
  const [year, month] = ym.split("-").map(Number) as [number, number];
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstWeekday = dayOfWeek(`${ym}-01`);
  const cells: (string | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${ym}-${pad(d)}`);

  return (
    <div className={s.month}>
      <div className={s.monthLabel}>
        {t(`month.${month - 1}` as MessageKey)} {year}
      </div>
      <div className={s.grid}>
        {[0, 1, 2, 3, 4, 5, 6].map((w) => (
          <div key={`h${w}`} className={s.dow}>
            {t(`weekday.${w}` as MessageKey)}
          </div>
        ))}
        {cells.map((iso, i) =>
          iso === null ? (
            <div key={`e${i}`} className={s.empty} />
          ) : (
            <div
              key={iso}
              className={[
                s.day,
                dayOfWeek(iso) === 0 || dayOfWeek(iso) === 6 ? s.weekend : "",
                kindClass(marks.get(iso), s),
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {Number(iso.slice(-2))}
            </div>
          ),
        )}
      </div>
    </div>
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
