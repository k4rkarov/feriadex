"use client";

import { useEffect, useRef, useState } from "react";
import s from "./SearchSelect.module.css";

export interface Option {
  value: string;
  label: string;
}

/** Lowercase + strip accents so "sao paulo" matches "São Paulo". */
const normalize = (s: string): string =>
  s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

/** Searchable single-select (combobox): click to open, type to filter. */
export function SearchSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selected = options.find((o) => o.value === value);
  const needle = normalize(q);
  const filtered = needle
    ? options.filter((o) => normalize(o.label).includes(needle))
    : options;

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    setQ("");
  };

  return (
    <div className={s.wrap} ref={ref}>
      <button
        type="button"
        className={s.control}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={selected ? s.val : s.placeholder}>
          {selected ? selected.label : "—"}
        </span>
        <span className={s.chev}>▾</span>
      </button>
      {open && (
        <div className={s.panel}>
          <input
            autoFocus
            className={s.search}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar…"
          />
          <ul className={s.list}>
            {filtered.slice(0, 300).map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  className={o.value === value ? s.optActive : s.opt}
                  onClick={() => pick(o.value)}
                >
                  {o.label}
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className={s.empty}>—</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
