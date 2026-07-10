"use client";

import { useEffect, useState } from "react";
import { t } from "@feriadex/i18n";
import s from "./ThemeToggle.module.css";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      className={s.track}
      data-theme={theme}
      role="switch"
      aria-checked={theme === "dark"}
      aria-label={t("theme.toggle")}
      onClick={toggle}
    >
      <span className={s.icon}>☀️</span>
      <span className={s.icon}>🌙</span>
      <span className={s.knob} />
    </button>
  );
}
