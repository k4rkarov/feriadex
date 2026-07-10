"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  names,
  onShare,
  copied,
}: {
  periods: PeriodOptions[];
  cal: Calendar;
  names: Map<string, string>;
  onShare: () => void;
  copied: boolean;
}) {
  const [activePeriod, setActivePeriod] = useState(0);
  const [openDay, setOpenDay] = useState<string | null>(null);
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

      <Months
        block={win}
        cal={cal}
        names={names}
        openDay={openDay}
        onToggle={(d) => setOpenDay((cur) => (cur === d ? null : d))}
      />
      <Legend />
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
    <div className={s.months}>
      {monthsBetween(first, last).map((ym) => (
        <Month
          key={ym}
          ym={ym}
          marks={marks}
          names={names}
          openDay={openDay}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

function Month({
  ym,
  marks,
  names,
  openDay,
  onToggle,
}: { ym: string; marks: Map<string, DayKind> } & DayProps) {
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
        {cells.map((iso, i) => {
          if (iso === null) return <div key={`e${i}`} className={s.empty} />;
          const cls = [
            s.day,
            dayOfWeek(iso) === 0 || dayOfWeek(iso) === 6 ? s.weekend : "",
            kindClass(marks.get(iso), s),
          ]
            .filter(Boolean)
            .join(" ");
          const name = names.get(iso);
          const num = Number(iso.slice(-2));
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
        })}
      </div>
    </div>
  );
}

function Balloon({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  // Nudge horizontally so the balloon stays inside the viewport at edges.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translateX(-50%)";
    const r = el.getBoundingClientRect();
    const m = 8;
    if (r.right > window.innerWidth - m) {
      el.style.transform = `translateX(calc(-50% - ${Math.ceil(r.right - window.innerWidth + m)}px))`;
    } else if (r.left < m) {
      el.style.transform = `translateX(calc(-50% + ${Math.ceil(m - r.left)}px))`;
    }
  }, [text]);
  return (
    <span className={s.balloon} ref={ref}>
      {text}
    </span>
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
