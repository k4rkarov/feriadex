"use client";

import s from "./Toggle.module.css";

/** Sliding on/off switch (same style family as the theme toggle). */
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={s.track}
      data-on={checked}
      onClick={() => onChange(!checked)}
    >
      <span className={s.knob} />
    </button>
  );
}
