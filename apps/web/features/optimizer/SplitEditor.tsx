import { useMemo, useState } from "react";
import { validateScheme, type SplitScheme } from "@feriadex/core";
import { maxSellBackDays, type LaborPolicy } from "@feriadex/policies";
import { t } from "@feriadex/i18n";
import { parseParts } from "./model";
import s from "./SplitEditor.module.css";

/** pt-BR reasons a scheme is invalid, derived from the active policy. */
function reasons(
  scheme: SplitScheme,
  policy: LaborPolicy,
  sellBack: number,
  cap: number,
): string[] {
  const out: string[] = [];
  const { parts, totalDays } = scheme;
  const sum = parts.reduce((a, b) => a + b, 0);
  if (parts.some((p) => !Number.isInteger(p) || p <= 0))
    out.push(t("split.rule.positive"));
  if (sum !== totalDays)
    out.push(t("split.rule.sum").replace("{total}", String(totalDays)));
  if (parts.length > policy.maxPeriods)
    out.push(t("split.rule.periods").replace("{n}", String(policy.maxPeriods)));
  const sorted = [...parts].sort((a, b) => b - a);
  if ((sorted[0] ?? 0) < policy.minMainBlockDays)
    out.push(t("split.rule.main").replace("{n}", String(policy.minMainBlockDays)));
  if (sorted.slice(1).some((p) => p < policy.minOtherBlockDays))
    out.push(
      t("split.rule.other").replace("{n}", String(policy.minOtherBlockDays)),
    );
  if (sellBack > cap)
    out.push(t("split.rule.sellback").replace("{n}", String(cap)));
  return out;
}

export function SplitEditor({
  policy,
  onCompute,
}: {
  policy: LaborPolicy;
  onCompute: (scheme: SplitScheme) => void;
}) {
  const [entitlement, setEntitlement] = useState(30);
  const [sellBack, setSellBack] = useState(0);
  const [partsText, setPartsText] = useState("14, 11, 5");

  const cap = maxSellBackDays(policy, entitlement);
  const scheduled = entitlement - sellBack;
  const scheme = useMemo<SplitScheme>(
    () => ({ totalDays: scheduled, parts: parseParts(partsText) }),
    [scheduled, partsText],
  );
  const why = reasons(scheme, policy, sellBack, cap);
  const valid = validateScheme(scheme, policy).valid && sellBack <= cap && sellBack >= 0;

  const applyPreset = (value: string) => {
    const p = policy.presets[Number(value)];
    if (!p) return;
    // Presets encode scheduled days; assume a 30-day entitlement and infer the
    // abono as the remainder (e.g. totalDays 20 → 10 sold).
    setEntitlement(30);
    setSellBack(Math.max(0, 30 - p.totalDays));
    setPartsText(p.parts.join(", "));
  };

  return (
    <div className={s.editor}>
      <label className={s.field}>
        <span>{t("split.preset")}</span>
        <select defaultValue="" onChange={(e) => applyPreset(e.target.value)}>
          <option value="" disabled>
            —
          </option>
          {policy.presets.map((p, i) => (
            <option key={i} value={i}>
              {p.totalDays}d: {p.parts.join(" + ")}
            </option>
          ))}
        </select>
      </label>

      <div className={s.row}>
        <label className={s.field}>
          <span>{t("split.entitlement")}</span>
          <input
            type="number"
            min={1}
            max={30}
            value={entitlement}
            onChange={(e) => setEntitlement(Math.max(1, Number(e.target.value)))}
          />
        </label>
        <label className={s.field}>
          <span>{t("split.sellBack")}</span>
          <input
            type="number"
            min={0}
            max={cap}
            value={sellBack}
            disabled={cap === 0}
            onChange={(e) => setSellBack(Math.max(0, Number(e.target.value)))}
          />
        </label>
        <div className={s.field}>
          <span>{t("split.scheduled")}</span>
          <strong className={s.scheduled}>{scheduled}</strong>
        </div>
      </div>

      <label className={`${s.field} ${s.grow}`}>
        <span>{t("split.custom")}</span>
        <input
          type="text"
          value={partsText}
          onChange={(e) => setPartsText(e.target.value)}
          inputMode="numeric"
        />
      </label>

      <div className={valid ? s.ok : s.bad}>
        {valid ? `✓ ${t("split.valid")}` : `✕ ${t("split.invalid")}`}
      </div>
      {!valid && (
        <ul className={s.reasons}>
          {why.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}

      <button
        className={s.primary}
        disabled={!valid}
        onClick={() => onCompute(scheme)}
      >
        {t("split.compute")}
      </button>
    </div>
  );
}
