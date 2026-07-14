"use client";

import { useState } from "react";
import type { VacationWindow } from "@feriadex/core";
import { t } from "@feriadex/i18n";
import { brDate } from "./model";
import { Balloon, MonthGrid, MonthsRow, monthsBetween } from "./MonthGrid";
import s from "./HeatmapView.module.css";

const HEAT_STEPS = 4;

/**
 * Read-only annual view of every possible start date for one block length,
 * colored by total rest (BACKLOG F1). Complements the month-by-month picker:
 * that view answers "which month should I pick", this one answers "show me
 * the whole year at a glance". No selection here — tap/click a day for its
 * exact numbers, same interaction the calendar already uses for holiday names.
 */
export function HeatmapView({
  lengthDays,
  allWindows,
  from,
  to,
}: {
  lengthDays: number;
  allWindows: VacationWindow[];
  from: string;
  to: string;
}) {
  const [openDay, setOpenDay] = useState<string | null>(null);

  const byDate = new Map(allWindows.map((w) => [w.startDate, w]));
  const values = allWindows.map((w) => w.totalRestDays);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  const bucket = (v: number) =>
    max === min ? 0 : Math.min(HEAT_STEPS - 1, Math.floor(((v - min) / (max - min)) * HEAT_STEPS));

  return (
    <div className={s.wrap}>
      <p className={s.heading}>
        {t("heatmap.heading")} {lengthDays}
        {t("heatmap.days")}
      </p>

      <MonthsRow>
        {monthsBetween(from, to).map((ym) => (
          <MonthGrid
            key={ym}
            ym={ym}
            renderDay={(iso, num) => {
              const w = byDate.get(iso);
              if (!w || iso < from || iso > to) {
                return (
                  <div key={iso} className={s.muted}>
                    {num}
                  </div>
                );
              }
              const heatClass = s[`heat${bucket(w.totalRestDays)}`];
              return (
                <button
                  key={iso}
                  type="button"
                  className={`${s.day} ${heatClass}`}
                  onClick={() => setOpenDay((cur) => (cur === iso ? null : iso))}
                >
                  {num}
                  {openDay === iso && (
                    <Balloon text={`${brDate(iso)} — +${w.totalRestDays} ${t("heatmap.restDays")}`} />
                  )}
                </button>
              );
            }}
          />
        ))}
      </MonthsRow>

      <div className={s.legend}>
        <span>{t("heatmap.legendLow")}</span>
        <span className={s.legendRamp}>
          {Array.from({ length: HEAT_STEPS }, (_, i) => (
            <span key={i} className={`${s.legendSwatch} ${s[`heat${i}`]}`} />
          ))}
        </span>
        <span>{t("heatmap.legendHigh")}</span>
      </div>
    </div>
  );
}
