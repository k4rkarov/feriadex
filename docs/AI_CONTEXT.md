# AI_CONTEXT — Orientation for AI assistants

> Read this first when picking up work on Feriadex. It maps the repo, states
> the invariants, and points you at the right document. Keep it short and true.

## What Feriadex is
A vacation/holiday optimizer. Given holidays, weekends, a working-week, and a
vacation entitlement, it finds the **best days to take off** to maximize
consecutive rest by bridging (*emendar*) holidays and weekends. Starts as a
functional clone of folgaextra.com (Brazil) and scales to a multi-country,
multi-jurisdiction product.

**MVP scope: Portuguese-first (pt-BR), Brazilian users only.** English and other
countries are a future phase — the architecture keeps that additive, but only
BR/pt-BR packs are built now. Code/identifiers/docs are in English; user-facing
copy is pt-BR via the i18n layer.

## Document map
| Doc | Purpose | Update cadence |
|---|---|---|
| `docs/REVERSE_ENGINEERING.md` | Origin: analysis of folgaextra (algorithm, data shape, split gap §4) | rarely |
| `docs/CONVENTIONS.md` | **Rule #0** — file organization, modularity, no-inline-CSS, where-does-this-go map | rarely |
| `docs/ARCHITECTURE.md` | Target architecture, monorepo layout, module boundaries, ADRs | on design change |
| `docs/COMPLIANCE.md` | CLT Art. 134 + RH vacation rules → where enforced in code | on split-logic change |
| `docs/MONETIZATION.md` | Deferred ads plan (AdSense, LGPD consent, placements) | when monetizing |
| `docs/REDESIGN.md` | **Active UX overhaul spec + action plan** (city/municipal data, calendar result, theme toggle, layout) | until redesign done |
| `docs/api/openapi.yaml` | REST API design (draft) | on API change |
| `docs/BACKLOG.md` | Prioritized epics/stories | each planning pass |
| `docs/KNOWLEDGE_GAPS.md` | Open questions / unknowns / research needed | when a gap opens/closes |
| `docs/PROJECT_STATE.md` | Current snapshot: phase, done, next, decisions | every session |
| `docs/SESSION_SUMMARY.md` | Append-only session log | end of session |
| `CLAUDE.md` | Contributor + AI working rules for this repo | on convention change |

## Invariants (do not violate)
0. **File organization is fixed up front (rule #0).** Every file has one home
   before it's written (`docs/CONVENTIONS.md`). Modular. **No inline CSS** —
   Tailwind utilities or colocated `*.module.css` only. Don't "put it somewhere
   and move it later".
1. **`packages/core` is pure.** No I/O, no framework, no `Date.now()` leaking
   into logic — deterministic and unit-tested.
2. **No country logic hardcoded.** Holidays = `packages/holidays` adapters;
   labor rules = `packages/policies` packs; language = `packages/i18n`.
   Adding a country = adding data packs, not editing the engine or UI.
3. **Dependency direction is one-way** (see ARCHITECTURE §4). `core` depends on
   nothing internal.
4. **Do not depend on folgaextra's API at runtime.** Holiday data comes from
   government/public sources. folgaextra was studied only to understand logic.
5. **Dates are day-granular and TZ-safe**, isolated behind one date utility.
6. **The split solver is the product differentiator** — treat employer/legal
   split rules as hard constraints, configurable and user-editable (REVERSE_ENGINEERING §4).

## State of the code
No application code yet. Repo currently holds `README.md` and the docs above.
Next build step is `packages/core` (see BACKLOG / PROJECT_STATE).

## How to work here
- Before designing, read `PROJECT_STATE.md` (where we are) + relevant doc.
- After a working session, update `PROJECT_STATE.md` and append to
  `SESSION_SUMMARY.md`. Move resolved items out of `KNOWLEDGE_GAPS.md`.
- Prefer editing the doc that owns a fact over duplicating it elsewhere.
