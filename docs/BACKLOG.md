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
- [x] `done` D4. Municipal holidays baked from joaopbini per UF + lazy `brMunicipalHolidays(uf, ibge, from, to)` loader (dynamic import, code-split). (Redesign R1.2)
- [x] `done` D6. City list per UF from IBGE + lazy `brCities(uf)` loader. (Redesign R1.1)
- [x] `done` D7-lib. `countHolidays(national, regional, municipal)` with level precedence/dedupe. (Redesign R1.3)
- [ ] `todo` D8. Enrich capital municipal names from folgaextra (slow, paced), where joaopbini is generic.
- [ ] `todo` D7. Holiday-count helper (national/regional/municipal) for the live counter. (Redesign R1.3)
- [x] `done` D5. Movable feasts via Computus (see B3).

## Epic R — Redesign v1 (P0 now) — see docs/REDESIGN.md
- [ ] `todo` R2.1 `describeWindow` core helper (per-day vacation/extra/extra-holiday).
- [ ] `todo` R3.1 Theme toggle (system default, light/dark, persisted).
- [ ] `todo` R3.2 Wider layout + larger type; less side padding.
- [ ] `todo` R3.3 Header info button → CLT tooltip + link to the law (new tab); remove on-screen hint.
- [ ] `todo` R3.4 Footer: privacy-policy link + copyright (+ privacy page stub).
- [ ] `todo` R4.1 City dropdown filtered by state (data ready: `brCities`).
- [ ] `todo` R4.2 Live holiday counter Nac/Est/Mun (data ready: `countHolidays`).
- [ ] `todo` R4.3 Remove include-optional toggle (always on).
- [ ] `todo` R4.4 Remove "Dias de férias"; entitlement is the only days field (default 30).
- [x] `done` R5.1 Scheme tabs (RH presets) + custom inputs; **auto re-calc** on change; live CLT validation.
- [x] `done` R5.2 Action is "Calcular" (auto — no button); single-block path removed.
- [x] `done` R5.3 `CalendarView` month-grid (azul/roxo/vermelho legend, Início/Retorno/Extras/Total per block).
- [x] `done` R5.4 Removed the top-5 single-window list (`PlanView`).

## Epic E — Web app / MVP UI (P1) — v1 done (bar E4/E5)
- [x] `done` E1. Input form: regime toggle, searchable state + city, working-week, custom period, banco de horas, available-days.
- [x] `done` E2. Split picker: preset dropdown **+ custom editor with live CLT validation** (`SplitEditor`) → `solveSplit`. (fulfils C6)
- [x] `done` E3. Result view: **visual calendar** (`CalendarView`) per block with color legend + Início/Retorno/Extras/Total.
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

## Epic I — Deploy (P1)
- [ ] `todo` I1. GitHub Actions: build `apps/web` → publish `out/` to Pages (with `.nojekyll`).
- [ ] `todo` I2. Custom domain: `CNAME` + DNS (apex A/AAAA + `www` CNAME), HTTPS.
- [ ] `todo` I3. Consider `trailingSlash: true` + `basePath` only if served from a subpath.
- [ ] `todo` I4. Meta/OG tags, favicon, sitemap, robots — SEO/shareability.

## Epic J — Monetization (P3, deferred) — see docs/MONETIZATION.md
- [ ] `todo` J1. Privacy policy + terms pages (pt-BR); LGPD consent banner gating scripts.
- [ ] `todo` J2. GA4 analytics (consent-gated).
- [ ] `todo` J3. Modular `Ads` component + consent gate; AdSense integration (custom domain).
- [ ] `todo` J4. Non-intrusive placements; monitor RPM + Core Web Vitals.

## Epic H — Persistence & scale (P3)
- [ ] `todo` H1. Postgres for durable studies + custom/company policy presets.
- [ ] `todo` H2. Rate limiting + observability at API layer.
- [ ] `todo` H3. Move split solver to Web Worker if UI blocks on large spaces.
