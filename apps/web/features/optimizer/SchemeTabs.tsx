"use client";

import { useState } from "react";
import { t } from "@feriadex/i18n";
import { InfoTip } from "../../components/InfoTip";
import type { Scheme } from "./model";
import s from "./SchemeTabs.module.css";

const CAP = 6;

export function SchemeTabs({
  schemes,
  selected,
  onSelect,
}: {
  schemes: Scheme[];
  selected: number;
  onSelect: (i: number) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? schemes : schemes.slice(0, CAP);

  return (
    <div className={s.wrap}>
      <div className={s.tabs}>
        {visible.map((sc, i) => (
          <button
            key={sc.parts.join("+") + i}
            type="button"
            className={i === selected ? s.tabActive : s.tab}
            onClick={() => onSelect(i)}
          >
            {sc.parts.join("+")}
          </button>
        ))}
        {schemes.length > CAP && (
          <button
            type="button"
            className={s.more}
            onClick={() => setShowAll((a) => !a)}
          >
            {showAll
              ? t("split.showLess")
              : `${t("split.showAll")} (+${schemes.length - CAP})`}
          </button>
        )}
        <InfoTip text={t("split.schemesInfo")} />
      </div>
    </div>
  );
}
