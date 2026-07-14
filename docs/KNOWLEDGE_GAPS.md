# KNOWLEDGE_GAPS

> Open questions and unknowns that need research or a decision before the
> related work is safe to build. Close a gap by resolving it and moving the
> outcome into the doc that owns it (ARCHITECTURE / BACKLOG / PROJECT_STATE).

## Holiday data
- **G-H1 — RESOLVED (2026-07-09).** MVP scope = **national + state** shipped as
  a build-time static dataset; **municipal via user-added custom holidays**. No
  runtime fetch (no CORS, offline-capable). ADR #8/#11.
- **G-H2 — RESOLVED (2026-07-09, delivery updated 2026-07-13).** State (estadual)
  source = the open MIT dataset (see DATA_LICENSE.md), baked at build time via
  `scripts/import-estadual.ts` into `src/data/estadual.json` (no runtime
  dependency, no key, no cost). Municipal: one JSON per UF
  (`src/br/data/{UF}.json`, all cities + name, holidays stored
  year-free as `{month, day, name}` and deduped), regenerated via
  `scripts/import-cities-municipal.ts`. Delivered to the browser as a
  content-hashed static asset (fetched per UF, cached forever via a manifest)
  rather than bundled into a JS chunk — decouples data size from the JS
  bundle as municipal coverage grows. Attribution in
  `packages/holidays/DATA_LICENSE.md`.
- **G-H5 — RESOLVED (2026-07-09; legal-basis audit 2026-07-13).** State
  holidays are **computed** from a curated rule table (`src/br/estadual.ts`),
  valid for any year → no dataset year cap. The open dataset is dropped for
  estadual. Every entry now cites its establishing law/constitutional
  provision (researched via each state's official gazette/legislative portal
  where reachable, else consistent secondary sources — confidence noted per
  entry in the research, not in code). The audit found the table had drifted
  from current law in 4 places, now fixed:
  - **PE** was modeled as "first Sunday of March" (Lei nº 13.386/2007,
    revoked). Current law (Lei nº 16.059/2017) fixes Data Magna de Pernambuco
    on a plain **March 6** — changed to a fixed date, movable-rule mechanism
    removed (PE was its only user).
  - **PB** listed "Memória de João Pessoa" (Jul 26), abolished in 2015/2016 by
    Lei nº 10.601/2015 and replaced by "Fundação do Estado e N. Sra. das
    Neves" (Aug 5) — removed the stale entry.
  - **PI** listed "Batalha do Jenipapo" (Mar 13) as a holiday — it never was
    one (Lei federal 9.093/1995 caps each state at one civil holiday; Piauí's
    is Oct 19; Mar 13 was only added to the state flag) — removed.
  - **RO** listed "Dia do Evangélico" (Jun 18) — declared unconstitutional by
    the STF (ADI 3940, 30/03/2020) — removed.
- **G-H6 — Municipal names/coverage.** Municipal still comes from the open dataset
  (owner's list had no municipal data). ~79% of entries are still the generic
  "Feriado Municipal"; coverage is partial (3,846/5,571 municipalities).
  Enrich over time by hand-editing `src/br/data/{UF}.json` directly —
  it's the single source now (2026-07-13: merged city name + holidays into
  one record per city, dropped the per-year date duplication, and dropped
  movable-feast entries — e.g. Sexta-feira Santa, Corpus Christi, Carnaval —
  that some cities listed as "municipal"; those recur on a different date
  every year, so storing them as a fixed `{month, day}` would be wrong for
  any year outside the fetched range, and they're already computed precisely
  at the national/facultative level via Easter algebra). Enrich capitals
  over time (BACKLOG D8).
- **G-H3 — Movable feasts — mostly resolved (2026-07-13).** Legal basis
  researched for all 9 fixed national holidays + Consciência Negra (each now
  cites its establishing law in `src/br/national.ts`, e.g. Lei nº 662/1949,
  Lei nº 10.607/2002, Lei nº 6.802/1980, Lei nº 14.759/2023). Sexta-feira
  Santa has **no federal law declaring it a national holiday** — it's a
  municipal "feriado religioso" under Lei nº 9.093/1995 art. 2º, adopted
  almost everywhere by local tradition; kept as `observance: "official"`
  (matches near-universal practice) with a description explaining the real
  mechanism instead of a fabricated law citation. Carnaval (seg/ter), Quarta
  de Cinzas, and Corpus Christi have **no permanent law at all** — for the
  federal civil service they're set by an annual Portaria (MGI) that changes
  number every year, so none is hardcoded (would go stale). Remaining
  classification question (this gap's original scope) unchanged: which of
  these should count as holidays vs. optional points is still a product call,
  not just a legal one.
- **G-H4 — Data freshness.** How often do holiday laws change mid-year? Sets
  cache TTL + revalidation policy. Note from the 2026-07-13 research pass:
  state holiday laws *do* change — found 4 outdated/invalid entries in the
  state table that had drifted from current law (see G-H5 below) — so this
  isn't purely theoretical; the state table needs a periodic re-check, not
  just an initial one.

## Labor policy
- **G-P1 — Preset ownership.** Are employer split presets (the RH schemes)
  curated by us, uploaded by companies, or user-defined only? Affects whether
  we need a DB + company accounts early (Epic H) or ship custom-only in MVP.
- **G-P2 — Deadline computation.** How is the "concessive period" (must finish
  before expiry) derived — from an acquisition date the user inputs, or from
  the search window? Needs a clear input contract in `OptimizeInput`.
- **G-P3 — Sell-back rules.** Confirm CLT abono pecuniário limit (≤1/3) and how
  it interacts with min-block sizes across schemes.

## Algorithm
- **G-A3 — Period overlap — RESOLVED (2026-07-10).** Overlap is defined on the
  full *rest span* `[start − leadingFree, end + trailingFree]` (not just booked
  days), so no calendar day is ever counted as rest twice. Core `bestAssignment`
  (`bridge/overlap.ts`) picks one conflict-free window per period maximizing
  summed rest; `CalendarView` seeds its selection from it, makes `Máx. possível`
  the honest achievable total, and disables month options that would collide
  with another period's current pick.
- **G-A4 — Facultativos as a level.** Carnaval (seg/ter), Quarta de Cinzas and
  Corpus Christi are modeled as a 4th "facultativo" bucket, counted as days off
  by default (owner decision), each user-uncheckable. Strict-legal mode (only
  where a municipal/estadual law makes them holidays) was declined.

- **G-A1 — Efficiency definition edge cases.** How to rank ties, and whether
  "extra days" counts only future free days or also the weekend before the
  start. Reverse-engineered logic gives a base; needs product decision.
- **G-A2 — Split search cost.** Combinatorial size of valid partitions ×
  placements for 30 days / 3 blocks — is brute force fine or do we need
  pruning / a Web Worker? Measure before optimizing.

## Internationalization
- **G-I1 — Country model generality.** Does the `Region → City` two-level model
  fit non-Brazil jurisdictions (e.g. countries with provinces/counties)? Verify
  with the second country before locking the schema.
- **G-I2 — Working-week + week-start defaults** per country — source from
  `Intl`/CLDR or a maintained table?

## Product / legal
- **G-L1 — Branding distance from the reference app.** Confirm Feriadex has fully
  independent visual identity/copy (logic reuse is fine; design/marks are not).
- **G-L2 — Ads/monetization** model (the reference app used AdSense/FB pixel) — decide
  if/when Feriadex monetizes; affects privacy policy + consent (GDPR/LGPD).
