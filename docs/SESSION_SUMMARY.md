# SESSION_SUMMARY

> Append-only log, newest first. One block per working session: what changed,
> what was decided, what's next.

---

## Session 19 — 2026-07-09 — UI iteration → v1 done (committed)
**Focus:** many rounds of UX feedback turning the shell into a finished v1.

**Highlights**
- **Regime:** replaced CLT/PJ dropdown with a **"Regime CLT" slider toggle**
  (on = law rules; off = free mode). PJ has no real vacation rules — free mode.
- **Free split builder:** stepper for block count + one field per block + live
  total + "Equilibrar" (replaced the raw comma text input).
- **CLT split:** rule-driven — all valid partitions (one ≥14, others ≥5) ranked
  by best rest, top-6 + "ver todas" (`SchemeTabs`), inline beside "Dividir em".
- **Result:** period tabs → best-window-per-month sub-tabs grouped by year
  (side by side) → colored calendar; `Dias extras` (red) + `Máx. possível`
  (green) badges; two-color numbers (férias azul / extra vermelho).
- **Holiday counter:** 4th category **Facultativos** (Carnaval seg/ter, Quarta
  de Cinzas, Corpus Christi) with descriptions; per-day checkboxes + "Todos".
- **Data fixes:** national count deduped to the real 12-month window (was 28 →
  13); estadual recomputed from a curated rule table (RJ/PE now show); curated
  municipal: Recife São João, Rio São Sebastião, SP Aniversário.
- **Fixes:** numeric inputs use text state (can be emptied); `periodOptions`
  loop bug (PJ maxPeriods huge → Firefox freeze) capped; hydration warning
  suppressed on `<html>`; searchable accent-insensitive `SearchSelect`; theme
  `color-scheme` for native controls; SVG icons (no emoji) for law/theme.

**State:** 60 tests green; `next build` clean. Committed as **"v1 done"**.

---

## Session 18 — 2026-07-09 — State holidays computed (drop the open dataset for estadual)
**Focus:** RJ/PE (and others) showed no state holiday because the the open dataset
estadual dataset stopped at 2026 and their dates fell outside the window.

**Done**
- Replaced the estadual dataset with a **computed rule table**
  (`src/br/estadual.ts`) from the owner-provided official state-holiday list:
  fixed dates + PE's "first Sunday of March" rule. Valid for **any year**.
- Deleted `src/data/estadual.json` + `scripts/import-estadual.ts`; the open dataset no
  longer used for estadual (still used for municipal — owner's list had none).
  Updated `DATA_LICENSE.md`. G-H5 resolved.
- Verified: RJ São Jorge 2027-04-23, PE Data Magna 2027-03-07 now appear in a
  12-month window; ES/MT/PR correctly empty. 60 tests green; web build clean.

---

## Session 17 — 2026-07-09 — Post-test fixes (counts, counter, split UX)
**Focus:** 5 fixes from the user's second test.

1. National count was 28 → fixed: removed Quarta-feira de Cinzas (half-day, not
   a full holiday), and `loadHolidays` now filters to the actual `[from,to]`
   window (no per-calendar-year double-count). A 12-month window = **13**
   (10 official + Carnaval seg/ter + Corpus). Verified.
2. Holiday counter is now **clickable** — each level (Nac/Est/Mun) expands its
   dated holiday list (`holidayLists` deduped by precedence).
3. Deleted the deadline hint sentence.
4. Brought the split control back as a **"Dividir em" dropdown** (was tabs).
5. Renamed to **"Dias disponíveis"** + **"Dividir em"** (max 3 for CLT); abono
   is now implicit; the **"monte o seu" custom input shows only for PJ**.

**New core:** `partitionsInto` + `bestSplit(cal, total, periods, …, constraints)`
— enumerate valid partitions into N periods, pick the most rest. Tested.

**Verified:** 59 tests green; web typecheck + `next build` clean.

---

## Session 16 — 2026-07-09 — Redesign R3/R4/R5: full UI overhaul
**Focus:** the redesign UI, in the agreed order.

**R3 (chrome):** theme toggle (system default, persisted, no-FOUC script);
wider layout + 17px base font; `Header` with title + info button ⚖️ (tooltip =
CLT summary, opens the law in a new tab); `Footer` (privacy link + copyright);
`/politica-privacidade` stub page.

**R4 (form):** city dropdown filtered by state (lazy `brCities`); live
`HolidayCounter` (Nac/Est/Mun via `countHolidays`, dedup); removed the
include-optional toggle (always on) and the "Dias de férias" field; entitlement
(default 30) is the only days field; `model.loadHolidays` merges the 3 levels
(municipal lazy).

**R5 (calendar):** `SplitEditor` reworked to preset **tabs** + custom inputs
with **auto re-calc** (no button); `CalendarView` month-grid colors each block
via `describeWindow` (azul = férias, roxo = extra, vermelho = extra-feriado)
with legend + Início/Retorno/Extras/Total; removed the top-5 list.

**Verified:** `next build` clean (First Load JS ~103 KB — per-UF data
code-split/lazy); web typecheck clean; 54 package tests green.

**Epic R complete.** Remaining is polish (R6: shadcn, share via URL) + deploy
(Epic I) + monetization (Epic J).

---

## Session 15 — 2026-07-09 — Redesign R1/R2: data layer + calendar helper
**Focus:** build the data + core pieces the redesign UI needs.

**Done**
- Core `describeWindow(cal, window)` → per-day `vacation|extra|extra-holiday`
  for the calendar coloring. Tested. (R2)
- Data source settled: **cities from IBGE**, **municipal from the open dataset**
  (both static/public, no rate limit; the reference app dropped — hit Cloudflare
  rate limit). `scripts/import-cities-municipal.ts` baked all 27 UFs:
  `src/data/cities/{UF}.json` (5571 cities) + `src/data/municipal/{UF}.json`
  (3846 cities with municipal, keyed by IBGE code, 2024–2026). ~1.6 MB total.
- Lazy per-UF loaders (dynamic import, code-split): `brCities(uf)`,
  `brMunicipalHolidays(uf, ibge, from, to)`, and `countHolidays(nat, reg, mun)`
  with level-precedence dedupe. (R1)
- Tests: 54 green (added describe + local-data). Typecheck clean.

**Next:** the redesign UI — R3 chrome (theme toggle, wider layout, header info
button, footer), R4 form (city dropdown + live counter, drop old fields),
R5 Calcular + calendar result view.

---

## Session 14 — 2026-07-09 — First user test → Redesign v1 spec
**Focus:** capture the UX overhaul from the first hands-on test (no code yet).

**Done**
- `docs/REDESIGN.md` — full spec + ordered action plan (Phases R1–R6) for the 8
  requested changes, calendar color semantics, and new data needs.
- Decisions locked: dark-mode toggle (system default); wider/bigger layout;
  optional points always on (drop toggle); header info button → law link (drop
  on-screen hint); footer privacy + copyright; **city dropdown + municipal
  holidays + live Nac/Est/Mun counter**; drop "Dias de férias" (entitlement is
  the only days field, default 30); "Otimizar" → "Calcular"; **calendar result
  view** (azul=férias, roxo=extra, vermelho=extra-feriado) with scheme **tabs
  (5 RH presets) + custom input box** that re-calcs live.
- BACKLOG Epic R added (+ D4/D6/D7 for municipal/cities/counts); PROJECT_STATE
  and AI_CONTEXT updated. Target screenshots committed at repo root
  (`the reference screenshots`, `the reference screenshots`).

**Next:** execute Epic R starting at the data layer (R1).

---

## Session 13 — 2026-07-09 — Abono (sell-back) + deadline; compliance closed
**Focus:** finish the last CLT/RH rules (C4, C8).

**Done**
- C4 — `maxSellBackDays(policy, entitlement)` in `@feriadex/policies` (CLT = ⌊1/3⌋,
  PJ = 0). `SplitEditor` now takes entitlement + sell-back inputs (capped),
  derives "a programar" (scheduled) days, validates the cap with a pt-BR reason.
  Presets map to entitlement 30 + inferred abono.
- C8 — `to` field relabeled as the return deadline (+ hint); blocks are bound
  within `[from, to]`; `Optimizer` catches an unfittable block / empty result
  and shows "não cabe no prazo" instead of crashing.
- `docs/COMPLIANCE.md`: C4/C8 now ✅ — all CLT Art. 134 + RH rules + abono enforced.
- Tests: 47 green (added sell-back tests). Typecheck + build clean; new fields
  prerendered.

**Remaining is UX, not compliance:** visual calendar (E3), URL-share (E4),
shadcn (E5), eslint/CI (A2/A3), municipal holidays (D4).

---

## Session 12 — 2026-07-09 — Work-regime selector (CLT vs PJ)
**Focus:** the split/start rules are CLT-only; PJ organizes freely.

**Done**
- `@feriadex/policies`: added `PJ` policy (free — `maxPeriods=∞`, min blocks 1,
  no §3 start rule) and `BR_POLICIES = [CLT, PJ]` registry.
- `SplitEditor` now takes a `policy` prop; validation, pt-BR reasons, and preset
  dropdown are policy-driven (rule messages parametrized with `{n}`).
- `Optimizer`: regime dropdown (default CLT) drives the policy + `allowStart`;
  removed the standalone §3 checkbox (regime governs it); added a regime hint.
- i18n: `form.regime`, `regime.hint.clt/pj`; made split heading/valid neutral.
- `docs/COMPLIANCE.md` notes the CLT-vs-PJ distinction.
- Tests: 45 green (added PJ policy tests). Typecheck + build clean; regime
  prerendered.

---

## Session 11 — 2026-07-09 — CLT Art. 134 §3 start rule + compliance doc
**Focus:** enforce the legal start-day restriction the optimizer was ignoring.

**Done**
- `core/calendar/start-rule.ts` — generic `isAllowedStart(cal, date, blackoutDays=2)`:
  false if the day is a rest day or any of the next `blackoutDays` days is a
  holiday/DSR. Exported from core.
- `policies/.../start-rule.ts` — `cltStartAllowed(date, cal) = isAllowedStart(cal, date, 2)`;
  bound onto `CLT.vacationStartAllowed`. Signature `(startDate, cal)` matches
  `OptimizeOptions.allowStart`.
- `allowStart` gate threaded through `optimizeSingleBlock` and `solveSplit`;
  UI toggle "Respeitar regra CLT de início" (default on) in `Optimizer.tsx`.
- `docs/COMPLIANCE.md` — maps every CLT Art. 134 + RH rule to where it is
  enforced (and flags open items: sell-back C4, explicit deadline C8).
- Tests: 42 green (added core + policies start-rule tests). Typecheck + build clean.

**Note:** this was done partly by a parallel background agent; edits converged
on one signature `(startDate, cal)`. Deadline + abono pecuniário still open.

---

## Session 10 — 2026-07-09 — Form expansion + custom split editor
**Focus:** flesh out inputs and ship the differentiator UI (custom, rule-aware
parceling).

**Done (modularized the feature, one responsibility per file)**
- `features/optimizer/model.ts` — date/week helpers, `buildCalendar`, `parseParts`.
- `WorkingWeekPicker.tsx` (+ .module.css) — 7-day toggle.
- `SplitEditor.tsx` (+ .module.css) — preset dropdown that prefills a free
  editor (totalDays + parts), **live CLT validation** (`validateScheme` gate +
  pt-BR reasons), compute button disabled while invalid. Fulfils C6.
- `Optimizer.tsx` — composes state, working week, custom period (from/to),
  include-optional toggle, single-block optimize, and the split editor.
- i18n: added working-week/period/split/weekday keys.

**Verified:** `next build` clean (108 KB first load, new labels prerendered);
web typecheck clean; package tests still 35 green.

**Deferred:** city/municipal input, sell-back, visual calendar, URL-share,
shadcn, eslint/CI.

---

## Session 9 — 2026-07-09 — App shell + first UI
**Focus:** stand up the front-end and prove the pipeline renders in a browser.

**Done**
- `@feriadex/i18n` — minimal `t()` + pt-BR catalog (defers next-intl/routing).
- `@feriadex/config` — Tailwind preset (design tokens via CSS vars) + package.json.
- `@feriadex/holidays` — `BR_STATES` (27 UFs) for the selector.
- `apps/web` — Next.js App Router, **static export** (`output: 'export'`),
  Tailwind + CSS Modules + dark-mode tokens. `features/optimizer/Optimizer.tsx`
  (client): state + vacation-days → ranked windows; CLT preset dropdown →
  `solveSplit` plan. Layout/page prerendered pt-BR.

**Verified:** `next build` → `out/` (107 KB first load, prerendered text present
for SEO); typecheck clean (web + all packages); 35 tests still green.

**Deferred:** shadcn/ui, working-week/custom-period/sell-back inputs, custom
split editor, visual calendar, URL-share, eslint/CI. Tracked in BACKLOG.

**Run app:** `corepack pnpm --filter web dev`.

---

## Session 8 — 2026-07-09 — State holidays baked from open data
**Focus:** cover estadual holidays (I provide the data, user adds nothing).

**Decided**
- Source = **an open MIT dataset (see DATA_LICENSE.md)** (open, MIT, maintained, no key/cost).
  Evaluated alternatives (feriados.dev, feriadosapi.com, invertexto = paid/keyed;
  BrasilAPI = national-only; dadosbr = archived/stale).
- Consumption = **build-time importer → baked static JSON**, not a runtime API.
  Same pattern the reference app uses (their own curated backend DB), but static in the
  bundle (no server).

**Done**
- `scripts/import-estadual.ts` — downloads + normalizes estadual JSON to
  `src/data/estadual.json` (9 KB, 140 rows, 2024–2026).
- `brStateHolidays(uf, year)`, `stateHolidayCoverage()`, `brProviderFor(uf)`
  (merges computed national + baked state).
- `DATA_LICENSE.md` — MIT attribution + regeneration instructions.
- Tests: 35 passing (added estadual + provider). PE 2026 Revolução Pernambucana
  06/03 verified against the reference app ground truth. Typecheck clean.

**Open:** upstream estadual data stops at 2026 (G-H5); municipal deferred to the
app (chunked/lazy, G-H → Epic D4).

**Next:** app shell (Next static export) + first UI wired to the packages.

---

## Session 7 — 2026-07-09 — Computus + BR holiday generators
**Focus:** movable feasts and the national holiday data, still no backend.

**Done**
- `core/calendar/easter.ts` — `easterSunday(year)` (Gregorian Computus); exported.
  Validated against known years + 2026 movable dates (ground truth: the reference app
  Carnaval 2026 = Feb 16/17 → Easter Apr 5).
- Extended `Holiday` with `observance` (`official` | `optional`).
- `@feriadex/holidays` — `brNationalHolidays(year)` (fixed official + Good Friday
  official; Carnaval/Ash Wed/Corpus Christi optional; Consciência Negra from
  2024) and `brProvider` over a year range. All **computed**, no network/CORS —
  supersedes the JSON build-dataset plan (ADR #11 refined).
- Tests: 31 passing total (added easter + br-national). Typecheck clean on all
  three packages.
- End-to-end smoke (throwaway): 2026 official holidays → best 15-day window
  (Apr 18→May 2, 8 working days for 16 rest) and CLT 14+11+5 split (32 rest days
  for 30 vacation, 3 non-overlapping blocks). Sensible.

**Next:** app shell (Next static export + Tailwind/eslint config) wired to the
packages, then the first input→optimize→result UI.

---

## Session 6 — 2026-07-09 — First code: tooling + core engine
**Focus:** stand up the monorepo and build the tested core engine.

**Done**
- Monorepo tooling: root `package.json` (pnpm workspaces), `pnpm-workspace.yaml`,
  `turbo.json`, shared `packages/config/tsconfig/base.json`.
- `@feriadex/core` (zero runtime deps, pure): `calendar/date.ts` (TZ-safe UTC
  date seam), `calendar/calendar.ts` (working-week + holiday classification),
  `bridge/evaluate.ts` + `bridge/optimize.ts` (window evaluation + ranking by
  efficiency), `split/scheme.ts` (`validateScheme`) + `split/solve.ts` (greedy
  `solveSplit`), public `index.ts`.
- `@feriadex/policies`: `LaborPolicy` type + BR/CLT pack with RH presets.
- Tests: 23 passing (date, calendar, evaluate, optimize, split, CLT presets).
  Typecheck clean on both packages.

**Env note:** pnpm is not global here — use `corepack pnpm <cmd>` (Node 24 has
corepack). `pnpm -r` recursion needs pnpm on PATH; typecheck run per-package
via `tsc` for now.

**Next:** movable feasts (B3), holiday build dataset (Epic D), then the app
shell (Next static export) + UI.

---

## Session 5 — 2026-07-09 — Front-end-only scope + stack decisions
**Focus:** confirm the app is front-end only and lock the remaining build choices.

**Decided (ADR #9–#12)**
- **Front-end only MVP** — no backend, no runtime API. Next.js **static export**
  (SSG) to a CDN.
- **Styling:** Tailwind utilities + colocated CSS Modules; no inline CSS.
- **Holidays:** build-time static dataset (national + state); municipal via
  user-added custom holidays. No runtime fetch / no CORS.
- **Structure:** keep the monorepo (`packages/*` + `apps/web`).

**Docs synced:** ARCHITECTURE (stack table, §7 API deferred, ADRs), PROJECT_STATE
(decisions + next steps), KNOWLEDGE_GAPS (G-H1 resolved, G-H2 narrowed), BACKLOG
(Epic D → static dataset, E6 → static export/no API), CLAUDE.md stack.

**Next:** tooling config (pnpm+Turbo, tsconfig/eslint/tailwind, Next static app)
→ then `packages/core` engine + tests.

---

## Session 4 — 2026-07-09 — Scaffold & organization rule
**Focus:** create the folder skeleton and lock file organization to avoid a
later refactor.

**Done**
- Scaffolded the monorepo directory tree (empty `apps/web` + `packages/*` with
  README stubs and `.gitkeep`).
- Authored `docs/CONVENTIONS.md` as **rule #0**: modularity, feature modules,
  **no inline CSS** (Tailwind utilities + colocated `*.module.css`), naming,
  barrels, and a "where-does-this-file-go" map.
- Elevated it to golden rule #0 in `CLAUDE.md`; added to AI_CONTEXT invariants +
  doc map; synced ARCHITECTURE folder tree.

**Next:** answer open questions (styling approach, monorepo tooling, holiday
data scope, MVP persistence) → then tooling config → `packages/core`.

---

## Session 3 — 2026-07-09 — Consolidation & scope lock
**Focus:** finalize docs, lock MVP scope, tidy repo.

**Done**
  (English); repointed all references; **deleted `PLANO.md`**.
- Added a standard `.gitignore`.
- Locked MVP scope: **Portuguese-first (pt-BR), Brazil only**; English and other
  countries deferred (architecture keeps expansion additive).

**Next:** scaffold monorepo → build `packages/core` engine + tests.

---

## Session 2 — 2026-07-09 — Architecture & docs
**Focus:** define an internationally scalable architecture and lay down the
project's documentation baseline.

**Done**
- Chose target architecture: TS monorepo (pnpm+Turborepo), pure `packages/core`,
  pluggable `holidays`/`policies`/`i18n` so country logic is data, not code.
- Confirmed holiday data source = government/public APIs (BrasilAPI for BR);
  no runtime dependency on the reference app.
- Authored: `docs/ARCHITECTURE.md`, `docs/api/openapi.yaml` (REST design),
  `docs/AI_CONTEXT.md`, `docs/BACKLOG.md`, `docs/KNOWLEDGE_GAPS.md`,
  `docs/PROJECT_STATE.md`, this log, and repo `CLAUDE.md`.
- Established folder structure (ARCHITECTURE §4) to avoid later refactors.

**Decided**
- Own `/api/v1`, country-centric and cache-friendly.
- MVP persistence = URL-encoded state + localStorage; Postgres later.

**Open / next**
- Resolve municipal-holiday scope and preset-ownership model (KNOWLEDGE_GAPS).
- Next build step: scaffold monorepo → `packages/core` engine + tests.

---

## Session 1 — 2026-07-09 — Reverse-engineering the reference app
**Focus:** understand the product to be cloned; produce a plan.

**Done**
- Crawled the reference app (React CRA SPA); pulled and analyzed JS bundles.
- Recovered the domain model, API surface, and bridge/split algorithm
- Identified the key gap: the reference app's vacation splitting is fixed/generic and
  does not honor company (RH) or nuanced CLT rules.

**Decided**
- Feriadex starts as a functional clone (Brazil), then diverges on UX/UI and a
  **configurable, rule-aware split engine** as the differentiator
 .
- Data source will be government APIs (same class the reference app relies on).

**Output:** reverse-engineering notes + roadmap + split gap (now consolidated in
