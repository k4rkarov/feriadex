import type { Config } from "tailwindcss";

/**
 * Shared Tailwind preset — the single source of design tokens. Values map to
 * CSS variables defined in the app's globals.css so light/dark themes swap
 * without touching components. Extend here, not per-app.
 */
const preset: Omit<Config, "content"> = {
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        fg: "var(--fg)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        border: "var(--border)",
      },
      borderRadius: {
        card: "12px",
      },
    },
  },
  plugins: [],
};

export default preset;
