# @feriadex/config

Shared build/lint/style config consumed by every package and app, so settings
live in one place.

- `tsconfig/` — base TypeScript configs (extended by each package).
- `eslint/` — shared ESLint config.
- `tailwind/` — Tailwind preset: design tokens (colors, spacing, radii,
  breakpoints, fonts). Single source of truth for styling values.
