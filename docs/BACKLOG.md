# BACKLOG

> Prioritized epics and stories. Priority tags: **P0** (blocks MVP), **P1**
> (MVP), **P2** (post-MVP differentiator), **P3** (later / international).
> Status: `todo` / `wip` / `done`.

## Epic A — Foundation (P0)
- [x] `done` A1. Scaffold pnpm+Turborepo monorepo; `apps/web` + `packages/*`.
- [ ] `wip`  A2. Shared config package: tsconfig + tailwind preset **done**; eslint, prettier **todo**.
- [ ] `todo` A3. CI: typecheck + lint + test on PR.
- [x] `done` A4. Date utility module (`core/calendar/date.ts`) — single TZ-safe, day-granular seam (native UTC; date-fns swap later).

## Epic B — Core engine (P0) — *the value*
- [x] `done` B1. `calendar/`: `isWorkingDay`, `isHoliday`, `isRestDay`, working-week mask.
- [x] `done` B2. `bridge/`: `evaluateWindow` + `optimizeSingleBlock` (ranking by efficiency).
- [x] `done` B3. Movable-feast computation (`core/calendar/easter.ts`; Carnaval/Corpus/Good Friday derive via offsets in `@feriadex/holidays`).
- [x] `done` B4. Scenario unit tests (weekend bridge, mid-week/holiday-in-block, year boundary, split). 23 tests green.
- [x] `done` B5. Efficiency metric defined & documented (`totalRestDays / workingDaysSpent`, in `types.ts`).

## Epic C — Configurable splitting (P2) — *the differentiator* (REVERSE_ENGINEERING §4)
- [x] `done` C1. `SplitScheme` model (multiset, order-independent).
- [x] `done` C2. `SplitConstraints` + `validateScheme` (main ≥14, others ≥5, ≤3 periods, sum check).
- [x] `done` C3. BR/CLT policy pack + common RH presets (30d and 20d schemes); presets validated in tests.
- [x] `done` C4. Sell-back (abono pecuniário): `maxSellBackDays` + entitlement/sell-back inputs (capped), scheduled days derived.
- [ ] `wip`  C5. Split solver: greedy `solveSplit` **done**; globally-optimal search + deadline handling **todo**.
- [x] `done` C6. Custom scheme editor with live CLT validation; user overrides preset (`apps/web/features/optimizer/SplitEditor.tsx`).
- [x] `done` C7. CLT Art. 134 §3 start rule — no start within 2 days before holiday/DSR (`isAllowedStart` + `cltStartAllowed`, wired as `allowStart`). See docs/COMPLIANCE.md.
- [x] `done` C8. Deadline (período concessivo): `to` labeled as the return-limit + hint; blocks bound within `[from, to]`; "não cabe no prazo" error when a block can't fit.
- [x] `done` C9. Work-regime selector — `CLT` (law-bound) vs `PJ` (free) policies; drives validation + §3 gate. UI dropdown + hint.

## Epic D — Holiday data (P1) — computed, no backend
- [x] `done` D1. `HolidayProvider` interface in `packages/holidays`.
- [x] `done` D2. BR national + movable holidays **computed at runtime** (`brNationalHolidays`/`brProvider`) — no build step, no network, no CORS. Supersedes the JSON-dataset idea.
- [x] `done` D3. State (regional) holidays for BR — baked from joaopbini/feriados-brasil (MIT) via `scripts/import-estadual.ts` → `brStateHolidays`/`brProviderFor`. Coverage through 2026 (G-H5).
- [ ] `todo` D4. Municipal holidays — chunk per-UF + lazy-load as same-origin static assets in the app (upstream has them; ~1.7 MB/year → not bundled).
- [x] `done` D5. Movable feasts via Computus (see B3).

## Epic E — Web app / MVP UI (P1)
- [ ] `wip`  E1. Input form: state, vacation days, **working-week picker, custom period, include-optional toggle** done; city, sell-back **todo**.
- [x] `done` E2. Split picker: preset dropdown **+ custom editor with live CLT validation** (`SplitEditor`) → `solveSplit`. (fulfils C6)
- [ ] `wip`  E3. Result view: ranked windows (days spent / rest / efficiency) + split plan **done**; visual calendar **todo**.
- [ ] `todo` E4. Shareable study via URL-encoded state; localStorage recents.
- [ ] `wip`  E5. Design system: Tailwind preset + CSS Modules + tokens/dark mode **done**; shadcn/ui components **todo**.
- [x] `done` E6. Static export (`output: 'export'`) building to `out/` (107 KB first load, prerendered). No `/api` (deferred). CDN deploy config **todo**.

## Epic F — Differentiator features (P2)
- [ ] `todo` F1. Interactive annual calendar with efficiency heatmap.
- [ ] `todo` F2. Export to Google Calendar / .ics / shareable image.
- [ ] `todo` F3. Compare scenarios side by side (10 vs 15 days, split vs not).
- [ ] `todo` F4. Profile presets (CLT, public servant, PJ).

## Epic G — Internationalization (P3)
- [ ] `wip`  G1. `packages/i18n`: minimal `t()` + pt-BR catalog **done**; next-intl locale routing (`/[locale]`), ICU, week-start per country **todo**.
- [ ] `todo` G2. Second country holiday adapter (e.g. Nager.Date) proving the abstraction.
- [ ] `todo` G3. Second labor-policy pack proving the policy abstraction.
- [ ] `todo` G4. Supported-countries registry wiring provider + policy + locale.

## Epic H — Persistence & scale (P3)
- [ ] `todo` H1. Postgres for durable studies + custom/company policy presets.
- [ ] `todo` H2. Rate limiting + observability at API layer.
- [ ] `todo` H3. Move split solver to Web Worker if UI blocks on large spaces.
