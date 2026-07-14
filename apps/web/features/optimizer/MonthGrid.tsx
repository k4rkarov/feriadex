"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { dayOfWeek } from "@feriadex/core";
import { t, type MessageKey } from "@feriadex/i18n";
import s from "./MonthGrid.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

/** Every "YYYY-MM" month between two dates, inclusive. */
export function monthsBetween(from: string, to: string): string[] {
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

/** Flex-wrap row that lays multiple `MonthGrid`s side by side. */
export function MonthsRow({ children }: { children: ReactNode }) {
  return <div className={s.months}>{children}</div>;
}

/**
 * One month's day grid: label, weekday header, empty-cell alignment padding.
 * `renderDay` renders each in-month day cell and owns its own `key`/classes/
 * interaction — shared by `CalendarView` (plan colors + holiday balloon) and
 * `HeatmapView` (efficiency colors + value tooltip), which differ enough in
 * styling and interaction that only this shell is worth sharing.
 */
export function MonthGrid({
  ym,
  renderDay,
}: {
  ym: string;
  renderDay: (iso: string, dayNum: number) => ReactNode;
}) {
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
            renderDay(iso, Number(iso.slice(-2)))
          ),
        )}
      </div>
    </div>
  );
}

/** Small anchored tooltip, nudged horizontally to stay inside the viewport. */
export function Balloon({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
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
