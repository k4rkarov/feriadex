# PROJECT_STATE

> Living snapshot of where Feriadex is. Update every working session.
> Last updated: 2026-07-09.

## Phase
**v1 UI complete (committed: "v1 done").** Engine + data + compliance + full
front-end. 60 tests green; `next build` static export clean (~103 KB first load).

Working app (`apps/web`):
- **Regime toggle** (CLT on/off = free), searchable accent-insensitive **state
  + city** dropdowns (`SearchSelect`), working-week picker, custom period.
- **Holiday counter**, 4 levels — national / regional / municipal /
  **facultativo** — clickable to list dates; per-day checkboxes (+ "Todos" per
  category) to exclude days you'll work; facultativos carry a short description.
- **Split**: CLT → all law-valid partitions ranked as tabs (`SchemeTabs`);
  free → block-stepper builder; **banco de horas** as an extra block.
- **Result**: period tabs → best-window-per-month sub-tabs (grouped by year) →
  colored month calendar (`CalendarView`), with `Dias extras` (red) and
  `Máx. possível` (green) badges. Two-color numbers (férias azul / extra
  vermelho).
- Theme toggle (system default, slider), header law link (Lei 13.467/2017),
  footer + privacy page.

Remaining: deploy (Epic I — GitHub Pages/CDN), share via URL (E4), shadcn
polish (E5), eslint/CI (A2/A3), monetization (Epic J, deferred), overlap
handling between periods (known gap). Monorepo tooling live. Three
packages built and **fully tested (31 tests green, typecheck clean)**:
- `@feriadex/core` — date utils, Computus (`easterSunday`), calendar, bridge
  optimizer (`evaluateWindow`/`optimizeSingleBlock`), split validation +
  greedy `solveSplit`.
- `@feriadex/holidays` — BR national + movable holidays computed at runtime
  (`brNationalHolidays`/`brProvider`), official vs optional tagged; **state
  (estadual) holidays baked** from an open MIT dataset (see DATA_LICENSE.md) (MIT) via
  `scripts/import-estadual.ts` → `brStateHolidays`/`brProviderFor` (coverage
  through 2026). Municipal deferred (chunked/lazy in app).
- `@feriadex/policies` — BR/CLT pack + RH presets, validated against the floor.

- `@feriadex/i18n` — minimal `t()` + pt-BR catalog (next-intl/locale routing later).

**App shell built** (`apps/web`): Next.js App Router, **static export**
(`output: 'export'`, builds to `out/`, ~107 KB first load, prerendered pt-BR
for SEO), Tailwind (shared preset) + CSS Modules + dark-mode tokens. Working
UI (`features/optimizer`): pick state + vacation days → ranked windows; CLT
preset dropdown → split plan. Wired to all four packages. No shadcn yet; no
custom period/working-week/URL-share yet.

Form now covers state, vacation days, working-week, custom period, include-
optional, and the **custom split editor with live CLT validation** (the
differentiator). **CLT Art. 134 §3** (no start within 2 days before a
holiday/weekly rest) enforced via `allowStart` gate; toggle in the UI.
Legal/RH rule → code mapping in `docs/COMPLIANCE.md`.

Verified: `next build` clean, typecheck clean (all packages + web), **42 tests
green**. Run tests: `corepack pnpm test`; run app: `corepack pnpm --filter web dev`
(pnpm not global — use corepack).

## Repository contents
- `README.md` — one-line product description.
- `CLAUDE.md` — repo working rules for contributors/AI.
  split gap §4).
- `docs/ARCHITECTURE.md`, `docs/api/openapi.yaml`, `docs/AI_CONTEXT.md`,
  `docs/BACKLOG.md`, `docs/KNOWLEDGE_GAPS.md`, `docs/SESSION_SUMMARY.md`,
  this file.

## Decisions made
1. Product = multi-country vacation optimizer; MVP = Brazil Brazilian vacation optimizer.
2. Stack: TS monorepo (pnpm+Turborepo), Next.js App Router, Tailwind+shadcn,
   date-fns (Temporal later), Zod, next-intl.
3. Architecture: pure `packages/core`; pluggable `holidays` adapters + `policies`
   packs + `i18n` — country logic is data, not code (ARCHITECTURE §4/§6).
4. Holiday data from government/public APIs (BrasilAPI for BR). No runtime
   dependency on any third-party API.
5. Persistence: MVP uses URL-encoded state + localStorage; Postgres later.
6. Own REST API `/api/v1` designed in openapi.yaml.
7. Differentiator: configurable split schemes with CLT + employer (RH) rules,
   user-editable (BACKLOG Epic C).
8. MVP is **Portuguese-first (pt-BR), Brazil only**. English/other countries
   deferred; architecture keeps expansion additive. Code in English, UI in
   pt-BR via i18n.
9. **Front-end only MVP** — no backend, no runtime API. Next.js **static
   export** (SSG) deployed to a CDN.
10. Styling = **Tailwind utilities + colocated CSS Modules**; no inline CSS.
11. Holidays = **build-time static dataset** (national + state); municipal via
    user-added custom holidays. No runtime fetch / no CORS.
12. Structure = **keep the monorepo** (`packages/*` + `apps/web`).

## Decisions pending
- Source for the build-time **state** holiday dataset (G-H2 — strategy set,
  source TBD).
- Preset ownership model → whether a DB/accounts are needed later (G-P1;
  not blocking front-end MVP).
- Deadline/concessive-period input contract (G-P2).
- Whether Region→City model generalizes internationally (G-I1; future).

## Next steps (in order)
1. **Polish** — shadcn components, empty/error states. (E5)
2. **Custom domain** — `CNAME` + DNS; drop `NEXT_PUBLIC_BASE_PATH` from the workflow. (I2)
3. **localStorage recents** — remember recent studies alongside the URL sharing. (E4 tail)
4. **Monetization** (deferred) — privacy policy, LGPD consent, AdSense. (Epic J)
5. **Data** — enrich municipal capital names (D8). Features: .ics export, compare
   scenarios, heatmap (Epic F). International: locale routing + 2nd country (Epic G).

**Recently done:** share-via-URL (readable params) + hydration-safe restore (E4);
period-overlap correctness — core `bestAssignment` + conflict-free UI selection,
honest `Máx. possível` (G-A3); ESLint flat config with no-inline-CSS guard (A2) +
CI workflow typecheck/lint/test (A3).

(Done: engine + data + compliance + full redesign UI + **deploy (GitHub Pages)**
+ **SEO/OG/sitemap/robots**. See SESSION_SUMMARY.)

## Known reference facts (from reverse-engineering, for reuse)
- the reference app API shape (studied, not consumed): `service.php?type=state|city`,
  `holidayservicev2.php?datestart=DD/MM/YYYY&dateend=..&uf=..&city=..` →
  `{date, description, origin: national|uf|city, days}`, `study.php` CRUD.
- Config model: working-week mask (Sun..Sat), vacationDays (default 10),
  compensationDays, vacationSplit, period (12-months-from-today | custom range).
