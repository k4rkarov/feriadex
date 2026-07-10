"use client";

import { useEffect, useRef, useState } from "react";
import type { Holiday } from "@feriadex/core";
import type { HolidayLists } from "@feriadex/holidays";
import { t } from "@feriadex/i18n";
import { brDate } from "./model";
import s from "./HolidayCounter.module.css";

type Level = "national" | "regional" | "municipal" | "facultative";

export function HolidayCounter({
  lists,
  excluded,
  onToggleDate,
  onToggleAll,
}: {
  lists: HolidayLists;
  excluded: ReadonlySet<string>;
  onToggleDate: (date: string) => void;
  onToggleAll: (dates: string[], include: boolean) => void;
}) {
  const [open, setOpen] = useState<Level | null>(null);

  const chip = (level: Level, label: string) => {
    const items = lists[level];
    const active = open === level;
    return (
      <button
        type="button"
        className={active ? s.chipActive : s.chip}
        onClick={() => setOpen(active ? null : level)}
        disabled={items.length === 0}
        aria-expanded={active}
      >
        <strong>{items.length}</strong> {label}
      </button>
    );
  };

  return (
    <div className={s.counter}>
      <div className={s.chips}>
        {chip("national", t("counter.national"))}
        {chip("regional", t("counter.regional"))}
        {chip("municipal", t("counter.municipal"))}
        {chip("facultative", t("counter.facultative"))}
      </div>

      {open && (
        <HolidayList
          items={lists[open]}
          excluded={excluded}
          onToggleDate={onToggleDate}
          onToggleAll={onToggleAll}
        />
      )}
    </div>
  );
}

function HolidayList({
  items,
  excluded,
  onToggleDate,
  onToggleAll,
}: {
  items: Holiday[];
  excluded: ReadonlySet<string>;
  onToggleDate: (date: string) => void;
  onToggleAll: (dates: string[], include: boolean) => void;
}) {
  const allRef = useRef<HTMLInputElement>(null);
  const dates = items.map((h) => h.date);
  const excludedCount = dates.filter((d) => excluded.has(d)).length;
  const allChecked = excludedCount === 0;

  useEffect(() => {
    if (allRef.current) {
      allRef.current.indeterminate =
        excludedCount > 0 && excludedCount < dates.length;
    }
  }, [excludedCount, dates.length]);

  return (
    <ul className={s.list}>
      <li>
        <label className={`${s.item} ${s.itemAll}`}>
          <input
            ref={allRef}
            type="checkbox"
            checked={allChecked}
            onChange={(e) => onToggleAll(dates, e.target.checked)}
          />
          <span>{t("counter.all")}</span>
        </label>
      </li>
      {items.map((h) => (
        <li key={h.date}>
          <label className={s.item}>
            <input
              type="checkbox"
              checked={!excluded.has(h.date)}
              onChange={() => onToggleDate(h.date)}
            />
            <span className={s.date}>{brDate(h.date)}</span>
            <span>
              {h.name}
              {h.description ? (
                <em className={s.desc}> — {h.description}</em>
              ) : null}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
