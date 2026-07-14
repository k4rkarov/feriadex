import { useEffect, useMemo, useState } from "react";
import { partitionsInto } from "@feriadex/core";
import type { LaborPolicy } from "@feriadex/policies";
import { t } from "@feriadex/i18n";
import { InfoTip } from "../../components/InfoTip";
import { SchemeTabs } from "./SchemeTabs";
import { type Scheme, type SplitConfig } from "./model";
import s from "./SplitEditor.module.css";

/** Even split of `total` into `n` blocks (bigger blocks first). */
function equalize(n: number, total: number): string[] {
  if (n < 1 || !Number.isFinite(total) || total < 1) return ["0"];
  const base = Math.floor(total / n);
  const rem = total % n;
  return Array.from({ length: n }, (_, i) => String(base + (i < rem ? 1 : 0)));
}

export interface SplitInitial {
  availableDays?: number;
  periods?: number;
  banco?: number;
  blocks?: number[];
}

export function SplitEditor({
  policy,
  onChange,
  schemes,
  selectedScheme,
  onSelectScheme,
  initial,
}: {
  policy: LaborPolicy;
  onChange: (config: SplitConfig | null) => void;
  schemes: Scheme[];
  selectedScheme: number;
  onSelectScheme: (i: number) => void;
  initial?: SplitInitial;
}) {
  // Defaults must match SSR; a shared study seeds these post-mount (below).
  const [availSelect, setAvailSelect] = useState("30");
  const [availText, setAvailText] = useState("30");
  const [bancoText, setBancoText] = useState("0");
  const [periods, setPeriods] = useState(3);
  const [blocks, setBlocks] = useState<string[]>(["10", "10", "10"]);

  // Seed from a shared link or a saved recent (arrives after mount → no
  // hydration mismatch). `initial` is a fresh object each time the parent
  // restores a study, so re-fires correctly on a second/third restore
  // without re-seeding on unrelated re-renders (stable reference otherwise).
  useEffect(() => {
    if (!initial) return;
    const d = initial.availableDays ?? 30;
    setAvailSelect(d === 20 ? "20" : d === 30 ? "30" : "other");
    setAvailText(String(d));
    setBancoText(String(initial.banco ?? 0));
    if (initial.periods) setPeriods(initial.periods);
    if (initial.blocks) setBlocks(initial.blocks.map(String));
  }, [initial]);

  const allowCustom = policy.minMainBlockDays <= 1; // free mode
  const otherMode = availSelect === "other";

  const availableDays =
    allowCustom || otherMode
      ? Math.trunc(Number(availText))
      : Number(availSelect);
  const availValid = Number.isFinite(availableDays) && availableDays >= 1;
  const banco =
    bancoText.trim() === "" ? 0 : Math.max(0, Math.trunc(Number(bancoText)));

  // CLT: only period counts that yield a valid partition. (Skip in free mode;
  // PJ.maxPeriods is huge, so never loop over it.)
  const periodOptions = useMemo(() => {
    if (allowCustom || !availValid) return [1];
    const max = Math.min(policy.maxPeriods, 6);
    const opts: number[] = [];
    for (let n = 1; n <= max; n++) {
      const ok = partitionsInto(availableDays, n, policy.minOtherBlockDays).some(
        (p) => Math.max(...p) >= policy.minMainBlockDays,
      );
      if (ok) opts.push(n);
    }
    return opts.length ? opts : [1];
  }, [allowCustom, availValid, availableDays, policy]);
  const activePeriods = periodOptions.includes(periods)
    ? periods
    : periodOptions[0]!;

  // Free mode: block values must be positive and sum to the available days.
  const blockNums = blocks.map((b) => Math.trunc(Number(b)));
  const blockSum = blockNums.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
  const blocksValid =
    availValid &&
    blockNums.every((b) => Number.isFinite(b) && b >= 1) &&
    blockSum === availableDays;

  useEffect(() => {
    if (!availValid) return onChange(null);
    if (allowCustom) {
      if (!blocksValid) return onChange(null);
      onChange({ availableDays, periods: blockNums.length, banco, customParts: blockNums });
    } else {
      onChange({ availableDays, periods: activePeriods, banco, customParts: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availText, availSelect, bancoText, blocks, activePeriods, allowCustom]);

  const setBlockCount = (n: number) => {
    if (n < 1) return;
    setBlocks(equalize(n, availValid ? availableDays : 1));
  };

  return (
    <div className={s.editor}>
      <div className={s.row}>
        <div className={`${s.field} ${s.num}`}>
          <span>
            {t("split.entitlement")}
            <InfoTip text={t("split.entitlement.info")} />
          </span>
          {allowCustom ? (
            <input
              type="number"
              min={1}
              value={availText}
              onChange={(e) => setAvailText(e.target.value)}
            />
          ) : (
            <select value={availSelect} onChange={(e) => setAvailSelect(e.target.value)}>
              <option value="30">{t("split.avail30")}</option>
              <option value="20">{t("split.avail20")}</option>
              <option value="other">{t("split.availOther")}</option>
            </select>
          )}
        </div>

        {otherMode && !allowCustom && (
          <label className={`${s.field} ${s.num}`}>
            <span>{t("split.availOther")}</span>
            <input
              type="number"
              min={1}
              value={availText}
              onChange={(e) => setAvailText(e.target.value)}
            />
          </label>
        )}

        <div className={`${s.field} ${s.num}`}>
          <span>
            {t("split.banco")}
            <InfoTip text={t("split.banco.info")} />
          </span>
          <input
            type="number"
            min={0}
            value={bancoText}
            onChange={(e) => setBancoText(e.target.value)}
          />
        </div>

        <div className={s.field}>
          <span>
            {t("split.periods")}
            <InfoTip text={t("split.periods.info")} />
          </span>
          {allowCustom ? (
            <div className={s.stepper}>
              <button
                type="button"
                className={s.stepBtn}
                onClick={() => setBlockCount(blocks.length - 1)}
                disabled={blocks.length <= 1}
              >
                −
              </button>
              <span className={s.stepVal}>{blocks.length}</span>
              <button
                type="button"
                className={s.stepBtn}
                onClick={() => setBlockCount(blocks.length + 1)}
              >
                +
              </button>
            </div>
          ) : (
            <div className={s.radios}>
              {periodOptions.map((n) => (
                <label key={n} className={s.radio}>
                  <input
                    type="radio"
                    name="periods"
                    checked={activePeriods === n}
                    onChange={() => setPeriods(n)}
                  />
                  {n}
                </label>
              ))}
            </div>
          )}
        </div>

        {!allowCustom && schemes.length > 1 && (
          <div className={s.schemesInline}>
            <SchemeTabs
              schemes={schemes}
              selected={selectedScheme}
              onSelect={onSelectScheme}
            />
          </div>
        )}
      </div>

      {allowCustom && (
        <div className={s.blocks}>
          {blocks.map((b, i) => (
            <label key={i} className={`${s.field} ${s.blockField}`}>
              <span>
                {t("split.block")} {i + 1}
              </span>
              <input
                type="number"
                min={1}
                value={b}
                onChange={(e) =>
                  setBlocks((prev) => {
                    const next = [...prev];
                    next[i] = e.target.value;
                    return next;
                  })
                }
              />
            </label>
          ))}
          <div className={s.totalWrap}>
            <span className={blocksValid ? s.totalOk : s.totalBad}>
              {t("split.freeTotal")} {blockSum}/{availValid ? availableDays : "—"}
            </span>
            <button
              type="button"
              className={s.equalize}
              onClick={() => setBlocks(equalize(blocks.length, availableDays))}
            >
              {t("split.equalize")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
