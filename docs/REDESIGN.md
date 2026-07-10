# Redesign v1 — UX overhaul from first user test (2026-07-09)

> **STATUS: DONE (v1 committed).** All phases R1–R5 shipped, plus extra rounds
> of feedback (regime toggle, free block builder, facultativo category, ranked
> partitions, per-year month tabs, badges, numeric-input & freeze fixes). This
> doc is kept as the original spec/record; current state is in PROJECT_STATE.

> Spec + action plan for reworking the app after the first hands-on test.
> Target reference: the reference screenshots (now removed)
> (`the reference screenshots` = input form, `the reference screenshots` = calendar
> result). This captures **decided** requirements so work survives a context
> reset. Engine/data/compliance are done; this is the UI + missing data layer.

## Decisions (from user feedback)

1. **Dark mode = a manual toggle button.** On first visit **follow the system**
   preference; user can switch to light/dark; persist the choice (localStorage).
   (Today the app only follows `prefers-color-scheme` with no control.)
2. **Bigger font + less side margin.** Widen the container (currently
   `max-w-2xl` — too narrow/centered). More generous type scale.
3. **Optional points always ON.** Carnaval/Corpus Christi always count — it is
   the app's reason to exist. **Remove the include-optional toggle**; always
   include `observance: "optional"` holidays.
4. **Header info button instead of on-screen legal text.** Remove the
   `regime.hint.*` paragraph. Add a header button with a tooltip/alt text
   carrying the CLT rule summary; clicking it opens the law
   (`https://www.planalto.gov.br/ccivil_03/decreto-lei/del1535.htm`) in a new tab.
5. **Footer** with a **privacy-policy** link + copyright.
6. **City dropdown** in addition to state, **cities filtered by the selected
   state**. Default vacation days placeholder = **30**. A live **holiday
   counter** somewhere on screen: `N Nacionais · N Estaduais · N Municipais`,
   updating as state/city change. National always applies to every case.
7. **Remove the "Dias de férias" input.** "**Dias de direito**" (entitlement)
   is the single days field and drives everything.
8. **"Otimizar" → "Calcular".** After computing, show a **calendar** (month
   grid) visualizing the day-off options per the split, like tela2.

## New flow (consolidated)

`regime (CLT/PJ)` → `estado` + `cidade` → `dias de direito` (default 30) +
`abono` → `divisão` (scheme tabs + custom input) → working-week → period
(`to` = deadline) → **Calcular** → **calendar** of the placed plan.

- No more standalone "single-block optimize / top-5 list" — everything goes
  through a split scheme (a single un-split period is just `parts:[30]`).
- **Scheme tabs:** the standard 30-day RH presets as tabs
  (`14+11+5`, `20+5+5`, `15+5+10`, `15+15`, `14+7+9`) **plus** a free input box
  for a custom scheme; selecting/editing re-runs the calc and the calendar
  updates automatically.

## Calendar result (point 8) — color semantics

For each placed block, classify every day in the **continuous rest stretch**
`[start − leadingFree … end + trailingFree]`:

| Color | Meaning | Rule |
|---|---|---|
| Azul (Período Férias) | vacation days spent | day ∈ `[start, end]` (the block) |
| Roxo (Extra) | free weekend/DSR gained | flanking rest day, not a holiday |
| Vermelho (Extra Feriado) | free holiday gained | flanking rest day that is a holiday |

Header per plan: **Início** = `start`, **Retorno** = `end + 1`,
**Extras** = `leadingFree + trailingFree`, **Total** = `totalRestDays`.
The engine already exposes `startDate/endDate/leadingFree/trailingFree/
totalRestDays`; add a small pure helper in `@feriadex/core` to emit the
per-day `{date, kind}` classification for a window (feeds the calendar).

## New data needs

- **Cities + Municipal (D6/D4) — DONE (data baked, all 27 UFs).** No runtime
  consumption; both from static/public sources fetched once at build.
  - **Cities: IBGE** localidades API per UF → `src/data/cities/{UF}.json` =
    `[{ ibge, name }]`. Official, structured, and the IBGE id is the join key.
  - **Municipal: the open dataset** per-year JSON (static GitHub, no rate limit),
    grouped by UF, keyed by IBGE code → `src/data/municipal/{UF}.json` =
    `{ [ibge]: [{ date, name }] }`. Years 2024–2026. Capitals have real names
    (Rio: "São Sebastião/São Jorge"; Recife: "N. Sra. do Carmo").
  - Importer: `scripts/import-cities-municipal.ts`. Result: **5571 cities,
    3846 with municipal holidays** (RJ 91/92, SP 587/645, PE 140/185).
  - Data size ~1.6 MB total (cities 268 KB + municipal 1.3 MB across 27 files)
    → **lazy-load per UF** in the app (dynamic import / static asset), never
    bundle all at once.
  - **the reference app dropped as a source** (mass fetch hit Cloudflare rate limit
    "Error 1002"; and IBGE+the open dataset is cleaner and rate-limit-free). May still
    enrich a few capitals' names from the reference app later, slowly.
  - **Counter dedupe (R1.3):** municipal files include some dates that overlap
    national/estadual (e.g. Corpus Christi tagged municipal). The calendar's
    holiday Set already dedupes for computation; the "N municipais" **count**
    must exclude dates already national/estadual to avoid inflation.
- **City list per UF:** source municipality list (IBGE) → `uf → [{ibge, name}]`
  for the city dropdown, mapping city → IBGE code to look up municipal holidays.
- Municipal data is large (~1.7 MB/year) → **do not bundle**; chunk per-UF as
  same-origin static assets, lazy-loaded when a state is selected.

## Removals

- Include-optional toggle (#3), "Dias de férias" field (#7), on-screen CLT
  hint text (#4), the top-5 single-window list (#8/new flow).

---

# Action plan

Ordered; each step ends green (tests + typecheck + `next build`).

### Phase R1 — Data layer (unblocks #6)
- **R1.1** City list per UF: build-time importer (IBGE) → `packages/holidays`
  `brCities(uf)` + baked data. (BACKLOG D6)
- **R1.2** Municipal holidays: importer baking the open dataset municipal per-UF into
  same-origin static assets (`apps/web/public`), lazy loader
  `brMunicipalHolidays(ibge, year)`. (BACKLOG D4)
- **R1.3** Holiday-count helper: `counts = {national, regional, municipal}` for
  a given uf/city/period (national always included).

### Phase R2 — Core calendar helper (unblocks #8)
- **R2.1** `describeWindow(cal, window)` in `@feriadex/core` → `{date, kind:
  "vacation"|"extra"|"extra-holiday"}[]` over the extended rest stretch. Tested.

### Phase R3 — Layout & chrome
- **R3.1** Theme: default follow system + toggle (light/dark), persisted;
  `data-theme` on `<html>`, tokens already exist. (#1)
- **R3.2** Widen container + larger type scale; reduce side padding. (#2)
- **R3.3** Header: title + **info button** (tooltip = CLT summary, links to the
  law, new tab). Remove on-screen hint. (#4)
- **R3.4** Footer: privacy-policy link + copyright. (#5) (privacy page stub)

### Phase R4 — Form rework
- **R4.1** Add **city dropdown** filtered by state; wire to municipal data. (#6)
- **R4.2** Live **holiday counter** (Nac/Est/Mun), updates on state/city. (#6)
- **R4.3** Remove include-optional toggle; always include optional. (#3)
- **R4.4** Remove "Dias de férias"; entitlement ("Dias de direito", default 30)
  is the only days field. (#7)

### Phase R5 — Compute + calendar (the payoff)
- **R5.1** Scheme **tabs** (5 RH presets) + custom input box; selection/edit
  re-runs calc; live CLT validation stays. (#8, C-tabs)
- **R5.2** Rename action to **Calcular**; run `solveSplit` for the active scheme. (#8)
- **R5.3** **Calendar** month-grid component: render each block via
  `describeWindow`, 3-color legend, per-plan Início/Retorno/Extras/Total. (#8, E3)
- **R5.4** Remove the top-5 window list.

### Phase R6 — Polish
- **R6.1** shadcn/ui pass, mobile, empty/error states. (E5)
- **R6.2** Copy-link / URL-encoded study (share). (E4)

## Open / backlog spun off
- City list source + partial municipal coverage → enrich later (D6, D-enrich).
- G-H5 still applies (estadual only through 2026).
