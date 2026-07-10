
<h1 align=center><img src="apps/web/public/images/logo.png" width="50%"></h1>

Feriadex finds the **best days to take vacation** — bridging holidays and
weekends (*emendar*) to maximize consecutive rest while sacrificing the fewest
working days. The name blends *feriado* (holiday) and *index*.

Brazil-first (pt-BR), built to scale internationally. **Front-end only:** a
fully static site, no backend — holiday data is computed/baked, and all
optimization runs in the browser.

> Status: v1 working. Engine, Brazilian holiday data, CLT/free rules and a
> full UI are in place. See [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).

## What it does

- Pick a **work regime** (CLT toggle), **state** and **city** (searchable,
  accent-insensitive dropdowns), your **working week**, and a **search period**.
- See a live **holiday counter** — Nacionais · Estaduais · Municipais ·
  Facultativos — each clickable to list its dates; **uncheck any single day**
  you'll actually work so it stops counting as time off.
- Configure the **split**:
  - **CLT on:** available days (30 / 20 + abono / other) + "Dividir em" (1–3)
    → all law-valid partitions (one block ≥14, others ≥5) appear as tabs,
    ranked by best rest.
  - **CLT off (free):** a block builder — stepper for the number of blocks,
    one number field per block, live total, and "Equilibrar".
  - **Banco de horas:** extra days placed as an additional optimized block.
- Results as **period tabs**: each period offers the **best window per month**
  (grouped by year) as sub-tabs; picking one shows a **colored month calendar**
  (Férias / Fim de semana / extra) with Início · Retorno · Extras · Total, plus
  **Dias extras** and **Máx. possível** badges.
- Enforces **CLT Art. 134** (Lei 13.467/2017): ≤3 periods, one ≥14 / others ≥5,
  no start in the 2 days before a holiday/rest. Mapped in
  [`docs/COMPLIANCE.md`](docs/COMPLIANCE.md).

## Architecture

TypeScript monorepo (pnpm workspaces + Turborepo). Country logic is data, not
code — adding a country means adding packs, not editing the engine. Details in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

```
apps/web            Next.js static-export app (UI, no server)
packages/core       pure engine — calendar, Computus, bridge, split, describe
packages/holidays   holiday providers + baked data (national computed;
                    state/facultativo computed; cities/municipal baked)
packages/policies   labor-rule packs (CLT, PJ/free) + start rule + sell-back
packages/i18n       message catalog (pt-BR)
packages/config     shared tsconfig + Tailwind preset
docs/               architecture, conventions, compliance, backlog, state, …
```

## Getting started

Requires Node ≥ 20 and pnpm (this environment uses `corepack pnpm`).

```bash
pnpm install              # install workspace deps
pnpm test                 # run the test suite (vitest — 60 tests)
pnpm --filter web dev     # run the app at http://localhost:3000
pnpm --filter web build   # static export → apps/web/out/
```

Regenerate the baked city/municipal data (build-time, one-off):

```bash
node --experimental-strip-types packages/holidays/scripts/import-cities-municipal.ts
```

## Documentation

Start with [`docs/AI_CONTEXT.md`](docs/AI_CONTEXT.md). Key docs:
[architecture](docs/ARCHITECTURE.md) · [conventions](docs/CONVENTIONS.md) ·
[compliance](docs/COMPLIANCE.md) · [backlog](docs/BACKLOG.md) ·
[project state](docs/PROJECT_STATE.md) · [redesign spec](docs/REDESIGN.md).

## Data & licensing

- **National + facultativo** holidays: computed (fixed dates + Gregorian
  Computus for movable feasts). Any year.
- **State**: computed from a curated rule table (`packages/holidays/src/br/estadual.ts`).
- **Cities**: IBGE municipality list (baked). **Municipal holidays**: baked from
  an open MIT dataset + curated cities. Attribution in
  [`packages/holidays/DATA_LICENSE.md`](packages/holidays/DATA_LICENSE.md).
