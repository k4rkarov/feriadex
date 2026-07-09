import type { Config } from "tailwindcss";
import preset from "../../packages/config/tailwind/preset";

export default {
  presets: [preset],
  darkMode: "media",
  content: [
    "./app/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
} satisfies Config;
