# CONVENTIONS — File Organization (Primordial Rule)

> **This is rule #0 of the project.** Organization is decided *up front* so we
> never pay a refactor tax later. Every new file has one obvious home before it
> is written. If you are unsure where something goes, stop and decide here
> first — do not "put it somewhere and move it later".

## 1. Modularity (mandatory)
- The codebase is a **monorepo of independent packages** with a strict one-way
  dependency graph (see `ARCHITECTURE.md` §4). Nothing imports "upward".
- Business logic lives in `packages/*`, never in `apps/web`. The app is a thin
  presentation shell over the packages.
- Inside `apps/web`, code is grouped by **feature module** (`features/<name>/`),
  not by file type. A feature owns its components, hooks, styles, and local
  logic. Shared-across-features UI goes to `packages/ui`; shared logic to the
  relevant package.
- One responsibility per file. A file that does two things gets split.

## 2. Styling (mandatory — no inline CSS, ever)
- **Never** use inline styles (`style={{...}}`) or `<style>` blocks in
  components. Styling is always declared in a stylesheet or via the utility
  layer — never embedded in JSX/TS.
- Default styling = **Tailwind utility classes** (utility classes are *not*
  inline CSS — they carry no `style` attribute). Layout, spacing, color come
  from the design tokens in `packages/config/tailwind`.
- When a component needs custom CSS beyond utilities, use a **colocated CSS
  Module**: `ComponentName.module.css` next to `ComponentName.tsx`. Import it;
  reference classes by name. One module per component that needs one.
- **Global** styles (reset, CSS variables/design tokens, font faces) live only
  in `apps/web/styles/globals.css` and `packages/ui/src/styles/`. No component
  defines globals.
- No magic values: colors, spacing, radii, breakpoints come from tokens, not
  hardcoded hex/px scattered in modules.

## 3. Naming
- Directories: `kebab-case`. React components: `PascalCase.tsx`. Hooks:
  `useThing.ts`. Non-component TS: `kebab-case.ts`. Tests: `*.test.ts` colocated
  or under a package's `test/`.
- Everything in **English** (identifiers, files, comments). User-facing copy is
  **pt-BR** and lives in i18n catalogs — never hardcoded in components.

## 4. Barrels & imports
- Each package exposes a single public entry (`src/index.ts`). Consumers import
  from the package root, not deep internal paths.
- Within a package, deep relative imports are fine; across packages, only the
  public entry.

## 5. Where things go (quick map)
| Kind of file | Home |
|---|---|
| Pure vacation/calendar logic | `packages/core/src/{calendar,bridge,split}` |
| Holiday fetching / adapters | `packages/holidays/src/adapters/<country>` |
| Labor-law rules & presets | `packages/policies/src/packs/<country>` |
| Reusable design-system component | `packages/ui/src/components` |
| Translations | `packages/i18n/messages/<locale>` |
| Shared tsconfig/eslint/tailwind | `packages/config/*` |
| A page / route | `apps/web/app/[locale]/...` |
| An API route handler | `apps/web/app/api/v1/...` |
| Feature UI (form, result, calendar) | `apps/web/features/<feature>` |
| App-only helper | `apps/web/lib` |
| Global CSS / tokens | `apps/web/styles/globals.css`, `packages/ui/src/styles` |
| Custom component CSS | `<Component>.module.css` colocated |

## 6. Definition of done for a new file
1. It lives in the correct home per §5.
2. No inline styles; CSS is in a module or the utility layer.
3. It has one responsibility.
4. It imports across packages only via public entries.
5. User-facing strings go through i18n.
