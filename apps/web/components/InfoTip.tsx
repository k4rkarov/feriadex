"use client";

import { useState } from "react";
import s from "./InfoTip.module.css";

/** Click-to-open info popover with a close button (not hover). */
export function InfoTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className={s.wrap}>
      <button
        type="button"
        className={s.btn}
        onClick={() => setOpen((o) => !o)}
        aria-label="Informação"
        aria-expanded={open}
      >
        ⓘ
      </button>
      {open && (
        <span className={s.pop} role="tooltip">
          <span className={s.text}>{text}</span>
          <button
            type="button"
            className={s.close}
            onClick={() => setOpen(false)}
            aria-label="Fechar"
          >
            ×
          </button>
        </span>
      )}
    </span>
  );
}
