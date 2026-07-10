"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import s from "./InfoTip.module.css";

/** Click-to-open info popover with a close button (not hover). */
export function InfoTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const popRef = useRef<HTMLSpanElement>(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Nudge the popover horizontally so it stays inside the viewport.
  useLayoutEffect(() => {
    const el = popRef.current;
    if (!open || !el) return;
    el.style.left = "0px";
    const r = el.getBoundingClientRect();
    const m = 8;
    if (r.right > window.innerWidth - m) {
      el.style.left = `${window.innerWidth - m - r.right}px`;
    } else if (r.left < m) {
      el.style.left = `${m - r.left}px`;
    }
  }, [open]);

  return (
    <span className={s.wrap} ref={ref}>
      <button
        type="button"
        className={s.btn}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label="Informação"
        aria-expanded={open}
      >
        ⓘ
      </button>
      {open && (
        <span className={s.pop} role="tooltip" ref={popRef}>
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
