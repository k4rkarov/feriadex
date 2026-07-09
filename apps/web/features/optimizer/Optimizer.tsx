"use client";

import { useState } from "react";
import {
  optimizeSingleBlock,
  solveSplit,
  type SplitPlan,
  type SplitScheme,
  type VacationWindow,
  type WorkingWeek,
} from "@feriadex/core";
import { BR_STATES } from "@feriadex/holidays";
import { BR_POLICIES } from "@feriadex/policies";
import { t } from "@feriadex/i18n";
import {
  brDate,
  buildCalendar,
  DEFAULT_WEEK,
  plusYearsISO,
  todayISO,
} from "./model";
import { WorkingWeekPicker } from "./WorkingWeekPicker";
import { SplitEditor } from "./SplitEditor";
import s from "./Optimizer.module.css";

export function Optimizer() {
  const [uf, setUf] = useState("PE");
  const [days, setDays] = useState(15);
  const [week, setWeek] = useState<WorkingWeek>(DEFAULT_WEEK);
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(plusYearsISO(todayISO(), 1));
  const [includeOptional, setIncludeOptional] = useState(true);
  const [policyId, setPolicyId] = useState(BR_POLICIES[0].id);
  const [windows, setWindows] = useState<VacationWindow[] | null>(null);
  const [plan, setPlan] = useState<SplitPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const policy = BR_POLICIES.find((p) => p.id === policyId) ?? BR_POLICIES[0];
  const calendar = () => buildCalendar(uf, week, from, to, includeOptional);
  const allowStart = policy.vacationStartAllowed;

  const optimize = () => {
    setPlan(null);
    setError(null);
    const w = optimizeSingleBlock(calendar(), {
      lengthDays: days,
      from,
      to,
      limit: 5,
      allowStart,
    });
    if (w.length === 0) setError(t("result.noFit"));
    setWindows(w);
  };

  const computeSplit = (scheme: SplitScheme) => {
    setWindows(null);
    setError(null);
    try {
      setPlan(solveSplit(calendar(), scheme, from, to, { allowStart }));
    } catch {
      // solveSplit throws when a block cannot fit before the deadline (C8).
      setPlan(null);
      setError(t("result.noFit"));
    }
  };

  return (
    <section className={s.wrap}>
      <div className={s.controls}>
        <label className={s.field}>
          <span>{t("form.regime")}</span>
          <select
            value={policyId}
            onChange={(e) => setPolicyId(e.target.value)}
          >
            {BR_POLICIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className={s.field}>
          <span>{t("form.state")}</span>
          <select value={uf} onChange={(e) => setUf(e.target.value)}>
            {BR_STATES.map((st) => (
              <option key={st.uf} value={st.uf}>
                {st.name}
              </option>
            ))}
          </select>
        </label>

        <label className={s.field}>
          <span>{t("form.vacationDays")}</span>
          <input
            type="number"
            min={1}
            max={30}
            value={days}
            onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
          />
        </label>
      </div>

      <WorkingWeekPicker value={week} onChange={setWeek} />

      <div className={s.controls}>
        <label className={s.field}>
          <span>{t("form.from")}</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className={s.field}>
          <span>{t("form.to")}</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>
      <p className={s.hint}>{t("form.deadlineHint")}</p>

      <label className={s.checkbox}>
        <input
          type="checkbox"
          checked={includeOptional}
          onChange={(e) => setIncludeOptional(e.target.checked)}
        />
        <span>{t("form.includeOptional")}</span>
      </label>

      <p className={s.hint}>
        {policy.id === "br-clt" ? t("regime.hint.clt") : t("regime.hint.pj")}
      </p>

      <button className={s.primary} onClick={optimize}>
        {t("form.optimize")}
      </button>

      {error && <p className={s.error}>{error}</p>}

      {windows && !error && <WindowList windows={windows} />}

      <div className={s.split}>
        <h2 className={s.h2}>{t("split.heading")}</h2>
        <SplitEditor policy={policy} onCompute={computeSplit} />
        {plan && <PlanView plan={plan} />}
      </div>
    </section>
  );
}

function WindowList({ windows }: { windows: VacationWindow[] }) {
  if (windows.length === 0)
    return <p className={s.empty}>{t("result.empty")}</p>;
  return (
    <div>
      <h2 className={s.h2}>{t("result.heading")}</h2>
      <ul className={s.list}>
        {windows.map((w) => (
          <li key={w.startDate} className={s.card}>
            <div className={s.range}>
              {brDate(w.startDate)} → {brDate(w.endDate)}
            </div>
            <div className={s.stats}>
              <Stat value={w.totalRestDays} label={t("result.totalRest")} />
              <Stat value={w.workingDaysSpent} label={t("result.daysSpent")} />
              <Stat
                value={w.efficiency.toFixed(2)}
                label={t("result.efficiency")}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlanView({ plan }: { plan: SplitPlan }) {
  return (
    <ul className={s.list}>
      {plan.blocks.map((b, i) => (
        <li key={b.startDate} className={s.card}>
          <div className={s.range}>
            {t("result.block")} {i + 1} ({b.lengthDays}d): {brDate(b.startDate)}{" "}
            → {brDate(b.endDate)}
          </div>
          <div className={s.stats}>
            <Stat value={b.totalRestDays} label={t("result.totalRest")} />
            <Stat value={b.workingDaysSpent} label={t("result.daysSpent")} />
          </div>
        </li>
      ))}
      <li className={s.total}>
        {t("result.planTotal")}: {plan.totalRestDays} {t("result.totalRest")} ·{" "}
        {plan.totalWorkingDaysSpent} {t("result.daysSpent")}
      </li>
    </ul>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <span className={s.stat}>
      <strong>{value}</strong>
      <em>{label}</em>
    </span>
  );
}
