import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

// Golden rule enforced as lint: no inline CSS anywhere.
const noInlineCss = {
  "no-restricted-syntax": [
    "error",
    {
      selector: "JSXAttribute[name.name='style']",
      message: "No inline CSS. Use Tailwind utilities or a *.module.css file.",
    },
    {
      selector: "JSXOpeningElement[name.name='style']",
      message: "No <style> blocks. Use a *.module.css file or styles/globals.css.",
    },
  ],
};

export const ignores = {
  ignores: [
    "**/dist/**",
    "**/out/**",
    "**/.next/**",
    "**/node_modules/**",
    "**/coverage/**",
    "**/*.config.{js,cjs,mjs,ts}",
    "**/next-env.d.ts",
  ],
};

/**
 * Shared flat ESLint config for the monorepo. Pass `{ react: true }` to layer
 * React-hooks rules + the no-inline-CSS guard onto the app / UI packages.
 */
export function config({ react = false } = {}) {
  return [
    ignores,
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
      languageOptions: {
        globals: { ...globals.node },
      },
      rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
      },
    },
    ...(react
      ? [
          {
            files: [
              "apps/web/**/*.{ts,tsx}",
              "packages/ui/**/*.{ts,tsx}",
            ],
            languageOptions: {
              globals: { ...globals.browser },
            },
            plugins: { "react-hooks": reactHooks },
            rules: {
              "react-hooks/rules-of-hooks": "error",
              "react-hooks/exhaustive-deps": "warn",
              ...noInlineCss,
            },
          },
        ]
      : []),
  ];
}

export default config;
