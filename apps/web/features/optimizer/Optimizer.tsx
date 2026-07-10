"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, bestSplit, type WorkingWeek } from "@feriadex/core";
import {
  brCities,
  holidayLists,
  BR_STATES,
  type BrCity,
} from "@feriadex/holidays";
import { CLT, PJ } from "@feriadex/policies";
import { t } from "@feriadex/i18n";
import {
  buildCalendar,
  buildSchemes,
  computePeriods,
  DEFAULT_WEEK,
  loadHolidays,
  plusYearsISO,
  todayISO,
  type HolidaySets,
  type Scheme,
  type SplitConfig,
} from "./model";
import { InfoTip } from "../../components/InfoTip";
import { Toggle } from "../../components/Toggle";
import { SearchSelect } from "../../components/SearchSelect";
import { WorkingWeekPicker } from "./WorkingWeekPicker";
import { SplitEditor } from "./SplitEditor";
import { HolidayCounter } from "./HolidayCounter";
import { CalendarView } from "./CalendarView";
import s from "./Optimizer.module.css";

export function Optimizer() {
  const [uf, setUf] = useState(""); // starts empty → national-only
  const [cities, setCities] = useState<BrCity[]>([]);
  const [cityIbge, setCityIbge] = useState<number | null>(null);
  const [week, setWeek] = useState<WorkingWeek>(DEFAULT_WEEK);
  const [from, setFrom] = useState(todayISO());
  // Default window = next 12 months; end is one day short so a yearly holiday
  // on the exact boundary date isn't counted at both ends.
  const [to, setTo] = useState(addDays(plusYearsISO(todayISO(), 1), -1));
  const [followClt, setFollowClt] = useState(true);
  // Holiday dates the user unchecked (will work that day → not counted as off).
  const [excluded, setExcluded] = useState<ReadonlySet<string>>(new Set());
  const [sets, setSets] = useState<HolidaySets | null>(null);
  const [config, setConfig] = useState<SplitConfig | null>(null);

  const policy = followClt ? CLT : PJ;

  // Load the city list when the state changes.
  useEffect(() => {
    let live = true;
    brCities(uf).then((c) => {
      if (live) {
        setCities(c);
        setCityIbge(null);
      }
    });
    return () => {
      live = false;
    };
  }, [uf]);

  // Load holiday sets whenever state / city / period change.
  useEffect(() => {
    let live = true;
    loadHolidays(uf, cityIbge, from, to).then((res) => {
      if (live) setSets(res);
    });
    return () => {
      live = false;
    };
  }, [uf, cityIbge, from, to]);

  const lists = sets
    ? holidayLists(
        sets.national,
        sets.regional,
        sets.municipal,
        sets.facultative,
      )
    : null;

  // Valid split schemes (ranked), for the current inputs.
  const schemeData = useMemo(() => {
    if (!config || !sets) return null;
    const calendar = buildCalendar(week, sets, excluded);
    const allowStart = policy.vacationStartAllowed;
    const isPJ = policy.minMainBlockDays <= 1;

    let schemes: Scheme[];
    if (config.customParts) {
      schemes = [{ parts: config.customParts, isRH: false, maxRest: 0 }];
    } else if (isPJ) {
      const b = bestSplit(
        calendar,
        config.availableDays,
        config.periods,
        from,
        to,
        policy,
        { allowStart },
      );
      schemes = b ? [{ parts: b.scheme.parts, isRH: false, maxRest: 0 }] : [];
    } else {
      const rh = policy.presets
        .filter((p) => p.totalDays === config.availableDays)
        .map((p) => p.parts);
      schemes = buildSchemes(
        calendar,
        config.availableDays,
        config.periods,
        config.banco,
        policy.minMainBlockDays,
        policy.minOtherBlockDays,
        from,
        to,
        allowStart,
        rh,
      );
    }
    return schemes.length ? { schemes, cal: calendar, allowStart } : null;
  }, [config, sets, week, policy, from, to, excluded]);

  const [schemeIdx, setSchemeIdx] = useState(0);
  useEffect(() => setSchemeIdx(0), [schemeData]);

  // Per-period month options for the selected scheme (+ banco block).
  const periods = useMemo(() => {
    if (!schemeData || !config) return null;
    const sc = schemeData.schemes[Math.min(schemeIdx, schemeData.schemes.length - 1)];
    if (!sc) return null;
    const parts = config.banco > 0 ? [...sc.parts, config.banco] : sc.parts;
    const ps = computePeriods(schemeData.cal, parts, from, to, schemeData.allowStart);
    return ps.some((p) => p.options.length === 0) ? null : ps;
  }, [schemeData, schemeIdx, config, from, to]);

  const noFit = Boolean(config && sets && !periods);

  return (
    <section className={s.wrap}>
      <div className={s.controls}>
        <div className={s.field}>
          <span>
            {t("form.followClt")}
            <InfoTip text={t("form.followClt.info")} />
          </span>
          <div className={s.toggleWrap}>
            <Toggle
              checked={followClt}
              onChange={setFollowClt}
              label={t("form.followClt")}
            />
          </div>
        </div>

        <label className={s.field}>
          <span>
            {t("form.state")}
            <InfoTip text={t("form.state.info")} />
          </span>
          <SearchSelect
            value={uf}
            onChange={setUf}
            options={[
              { value: "", label: t("form.stateNone") },
              ...BR_STATES.map((st) => ({ value: st.uf, label: st.name })),
            ]}
          />
        </label>

        <label className={s.field}>
          <span>
            {t("form.city")}
            <InfoTip text={t("form.city.info")} />
          </span>
          <SearchSelect
            value={cityIbge != null ? String(cityIbge) : ""}
            onChange={(v) => setCityIbge(v ? Number(v) : null)}
            options={[
              { value: "", label: t("form.cityNone") },
              ...cities.map((c) => ({ value: String(c.ibge), label: c.name })),
            ]}
          />
        </label>
      </div>

      {lists && (
        <HolidayCounter
          lists={lists}
          excluded={excluded}
          onToggleDate={(date) =>
            setExcluded((prev) => {
              const next = new Set(prev);
              if (next.has(date)) next.delete(date);
              else next.add(date);
              return next;
            })
          }
          onToggleAll={(dates, include) =>
            setExcluded((prev) => {
              const next = new Set(prev);
              for (const d of dates) {
                if (include) next.delete(d);
                else next.add(d);
              }
              return next;
            })
          }
        />
      )}

      <div className={s.controls}>
        <div className={s.weekWrap}>
          <WorkingWeekPicker value={week} onChange={setWeek} />
        </div>
        <label className={s.field}>
          <span>{t("form.from")}</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className={s.field}>
          <span>{t("form.to")}</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>

      <div className={s.split}>
        <h2 className={s.h2}>
          {t("split.heading")}
          <InfoTip text={t("split.heading.info")} />
        </h2>
        <SplitEditor
          policy={policy}
          onChange={setConfig}
          schemes={schemeData?.schemes ?? []}
          selectedScheme={
            schemeData
              ? Math.min(schemeIdx, schemeData.schemes.length - 1)
              : 0
          }
          onSelectScheme={setSchemeIdx}
        />
        {noFit && <p className={s.error}>{t("result.noFit")}</p>}
        {periods && schemeData && (
          <CalendarView periods={periods} cal={schemeData.cal} />
        )}
      </div>
    </section>
  );
}
