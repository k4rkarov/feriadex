"use client";

import { BR_STATES } from "@feriadex/holidays";
import { t } from "@feriadex/i18n";
import { brDate } from "./model";
import type { RecentStudy } from "../../lib/recents";
import s from "./RecentStudies.module.css";

const stateName = (uf: string): string =>
  BR_STATES.find((st) => st.uf === uf)?.name ?? t("recents.national");

function label(r: RecentStudy): string {
  const { study } = r;
  return `${stateName(study.uf)} · ${study.availableDays}d · ${brDate(study.from)}–${brDate(study.to)}`;
}

export function RecentStudies({
  recents,
  onApply,
  onRemove,
}: {
  recents: RecentStudy[];
  onApply: (study: RecentStudy["study"]) => void;
  onRemove: (savedAt: number) => void;
}) {
  if (!recents.length) return null;

  return (
    <div className={s.wrap}>
      <span className={s.heading}>{t("recents.heading")}</span>
      <div className={s.row}>
        {recents.map((r) => (
          <span key={r.savedAt} className={s.chip}>
            <button type="button" className={s.chipMain} onClick={() => onApply(r.study)}>
              {label(r)}
            </button>
            <button
              type="button"
              className={s.chipRemove}
              onClick={() => onRemove(r.savedAt)}
              aria-label={t("recents.remove")}
              title={t("recents.remove")}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
