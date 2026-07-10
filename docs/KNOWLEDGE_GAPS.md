# KNOWLEDGE_GAPS

> Open questions and unknowns that need research or a decision before the
> related work is safe to build. Close a gap by resolving it and moving the
> outcome into the doc that owns it (ARCHITECTURE / BACKLOG / PROJECT_STATE).

## Holiday data
- **G-H1 — RESOLVED (2026-07-09).** MVP scope = **national + state** shipped as
  a build-time static dataset; **municipal via user-added custom holidays**. No
  runtime fetch (no CORS, offline-capable). ADR #8/#11.
- **G-H2 — RESOLVED (2026-07-09).** State (estadual) source = the open
  MIT dataset **joaopbini/feriados-brasil**, baked at build time via
  `scripts/import-estadual.ts` into `src/data/estadual.json` (no runtime
  dependency, no key, no cost). Municipal also available upstream (deferred —
  chunked/lazy in the app). Attribution in `packages/holidays/DATA_LICENSE.md`.
- **G-H5 — RESOLVED (2026-07-09).** State holidays are now **computed** from a
  curated rule table (`src/br/estadual.ts`, owner-provided official list; PE =
  first Sunday of March). Valid for any year → no dataset year cap. joaopbini
  dropped for estadual. (This fixed RJ/PE showing nothing in a future window.)
- **G-H6 — Municipal names/coverage.** Municipal still comes from joaopbini
  (owner's list had no municipal data). Some names are generic; coverage
  partial. Enrich capitals over time (BACKLOG D8).
- **G-H3 — Movable feasts.** Confirm which movable dates count as holidays vs
  optional points (Carnaval Mon/Tue, Ash Wednesday half-day, Corpus Christi).
  Regional variation exists. Computus handles the math; the *classification*
  is the gap.
- **G-H4 — Data freshness.** How often do holiday laws change mid-year? Sets
  cache TTL + revalidation policy.

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
- **G-A3 — Period overlap.** Each period's month options are chosen
  independently, so two periods can pick the same month and overlap. The
  `Máx. possível` badge sums each period's best window independently → an upper
  estimate, not guaranteed simultaneously achievable. Deferred (owner OK'd).
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
- **G-L1 — Branding distance from folgaextra.** Confirm Feriadex has fully
  independent visual identity/copy (logic reuse is fine; design/marks are not).
- **G-L2 — Ads/monetization** model (folgaextra used AdSense/FB pixel) — decide
  if/when Feriadex monetizes; affects privacy policy + consent (GDPR/LGPD).
