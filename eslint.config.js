import { config } from "@feriadex/config/eslint";

export default [
  ...config({ react: true }),
  {
    // Background forwards per-instance animation tokens as CSS custom
    // properties into its module stylesheet — the sanctioned use of `style`
    // (dynamic values a static *.module.css cannot express). No declarations.
    files: ["apps/web/components/Background.tsx"],
    rules: { "no-restricted-syntax": "off" },
  },
];
