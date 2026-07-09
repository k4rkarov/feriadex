# Feriadex

Feriadex finds the **best days to take vacation** — bridging holidays and
weekends (*emendar*) to maximize consecutive rest. The name blends *feriado*
(holiday) and *index*.

Brazil-first (pt-BR UI), built to scale internationally. **Front-end only:**
a fully static site, no backend — holiday dates are computed/baked, and the
optimization runs in the browser.

> Status: early development. Engine, Brazilian holiday data, CLT/PJ rules, and
> a working web app are in place; UX polish is ongoing. See
> [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).

## What it does

- Given a state, working week, vacation entitlement, and a search period, it
  ranks vacation windows by **efficiency** = rest days ÷ working days spent.
- Handles **split vacations** with employer (RH) presets **and a custom editor
  that validates against the law in real time**.
- Two work regimes: **CLT** (bound by Art. 134) and **PJ** (free). CLT rules —
  ≤3 periods, one ≥14 days / others ≥5, no start in the 2 days before a
  holiday/rest (§3), abono pecuniário up to 1/3, deadline — are enforced and
  mapped in [`docs/COMPLIANCE.md`](docs/COMPLIANCE.md).

## Architecture

TypeScript monorepo (pnpm workspaces + Turborepo). Country logic is data, not
code — adding a country means adding packs, not editing the engine. Details in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

```
apps/web            Next.js static-export app (UI, no server)
packages/core       pure optimization engine (calendar, bridge, split)
packages/holidays   holiday providers (BR national computed + state baked)
packages/policies   labor-rule packs (CLT, PJ) + presets
packages/i18n       message catalogs (pt-BR)
packages/config     shared tsconfig + Tailwind preset
docs/               architecture, conventions, compliance, backlog, state, …
```

## Getting started

Requires Node ≥ 20 and pnpm (this environment uses `corepack pnpm`).

```bash
pnpm install          # install workspace deps
pnpm test             # run the test suite (vitest)
pnpm --filter web dev # run the app at http://localhost:3000
pnpm --filter web build   # static export → apps/web/out/
```

## Documentation

Start with [`docs/AI_CONTEXT.md`](docs/AI_CONTEXT.md) for a map. Key docs:
[architecture](docs/ARCHITECTURE.md) ·
[conventions](docs/CONVENTIONS.md) ·
[compliance](docs/COMPLIANCE.md) ·
[backlog](docs/BACKLOG.md) ·
[project state](docs/PROJECT_STATE.md).

## Data & licensing

National + movable holidays are computed (Gregorian Computus). State holidays
are baked from the open, MIT-licensed
[joaopbini/feriados-brasil](https://github.com/joaopbini/feriados-brasil);
attribution in [`packages/holidays/DATA_LICENSE.md`](packages/holidays/DATA_LICENSE.md).
