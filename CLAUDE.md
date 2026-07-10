# CLAUDE.md — Feriadex

Working rules for contributors and AI assistants in this repo. This is a
**software project** (not a pentest engagement); the global pentest CLAUDE.md
does not apply here. Read `docs/AI_CONTEXT.md` before starting work.

## What this is
Feriadex is a vacation/holiday optimizer: it finds the best days to take time
off to maximize consecutive rest by bridging holidays and weekends. It begins
as a Brazil-focused Brazilian vacation optimizer and is built to scale to multiple
countries and labor jurisdictions.

## Golden rules (do not break)
0. **File organization is decided up front — never refactor-later.** Every file
   has one obvious home *before* it is written (see `docs/CONVENTIONS.md`). The
   codebase is **modular** (monorepo packages + feature modules in the app).
   **No inline CSS ever** — no `style={{}}`, no `<style>` blocks; styling is
   Tailwind utilities or a colocated `*.module.css`; globals/tokens live in one
   place. One responsibility per file. This rule is primordial.
1. **`packages/core` stays pure** — no I/O, no framework imports, deterministic,
   fully unit-tested. Business rules live here, never in React or route handlers.
2. **No hardcoded country logic** — holidays via `packages/holidays` adapters,
   labor rules via `packages/policies` packs, language via `packages/i18n`.
   Adding a country = new data packs, not engine/UI edits.
3. **One-way dependencies** (see ARCHITECTURE §4). `core` imports nothing internal.
4. **Never depend on any third-party API at runtime.** Holiday data = government/
   public sources. the reference app was studied only to learn the algorithm.
5. **Dates are day-granular and timezone-safe**, behind the single date utility.
   Don't scatter `new Date()`/`Date.now()` through logic.
6. **The split engine is the product.** Employer/legal split rules are hard
   constraints, configurable and user-editable.

## Stack
TypeScript · pnpm + Turborepo monorepo · **Next.js static export (SSG)** ·
Tailwind + **CSS Modules** + shadcn/ui · date-fns · Zod · next-intl.
**Front-end only MVP** — no backend, no runtime API; holidays are a build-time
static dataset; studies via URL + localStorage. See `docs/ARCHITECTURE.md` §3.

## Folder structure (scaffolded)
```
apps/web
  app/[locale]/         locale-routed pages (pt-BR default)
  app/api/v1/           thin route handlers (per openapi.yaml)
  features/<name>/      feature modules (own components/hooks/*.module.css)
  components/           app-level shared components
  lib/                  app-only helpers
  styles/globals.css    global reset + design-token CSS variables (only globals)
  public/               static assets
packages/core           pure engine — src/{calendar,bridge,split} + test/
packages/holidays       HolidayProvider + src/adapters/<country>
packages/policies        LaborPolicy packs — src/packs/<country> (BR/CLT first)
packages/i18n           locale config + messages/<locale> (pt-BR primary)
packages/ui             design system — src/components + src/styles
packages/config         shared tsconfig / eslint / tailwind (design tokens)
docs/                   conventions, architecture, api/openapi, backlog, gaps, state, sessions
```
Full rules + "where does this file go" map: `docs/CONVENTIONS.md`.

## Conventions
- **Language:** all code, comments, docs, and identifiers in **English**.
  User-facing copy is **pt-BR** (the MVP is Portuguese-first, Brazil only) and
  goes through the i18n layer from day one. English is a future locale, not yet
  authored. Never hardcode UI strings — always route through i18n.
- **Validation:** Zod schemas are the single source for API/runtime types.
- **Tests:** every `core` behavior gets a deterministic scenario test. No
  network in unit tests.
- **Commits:** Conventional Commits. Branch off `main`; don't commit/push unless
  asked. Co-author trailer required (see global rules).

## Docs to keep current
- After a working session: update `docs/PROJECT_STATE.md` and append to
  `docs/SESSION_SUMMARY.md`.
- New unknown → add to `docs/KNOWLEDGE_GAPS.md`; resolved → move the outcome to
  the owning doc and remove the gap.
- API change → update `docs/api/openapi.yaml`. Design change → `docs/ARCHITECTURE.md`.
- Prefer editing the doc that owns a fact over duplicating it.

## Pointers
- `docs/ARCHITECTURE.md` — the plan the code grows into.
- `docs/AI_CONTEXT.md` — start-here map for assistants.
