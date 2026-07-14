# Feriadex — Architecture

> Target architecture for a vacation/holiday optimizer that starts as a
> Brazil-only Brazilian vacation optimizer and scales to a **multi-country,
> multi-jurisdiction** product. Nothing here is built yet — this is the plan
> the code will grow into so we don't refactor later.

---

## 1. Goals & non-negotiables

- **Internationalizable from day one.** Country-specific logic (holidays,
  labor rules, week start, locale) is *data + plugins*, never hardcoded in the
  engine or UI. Adding a country = adding a data pack, not editing the core.
- **Pure, testable core.** The optimization engine is framework-free
  TypeScript with zero I/O — deterministic, unit-tested, reusable on server or
  client.
- **Thin edges.** UI and API are adapters around the core. Business rules never
  live in React components or route handlers.
- **Correctness of dates.** All date math is timezone-safe, day-granular, and
  isolated behind one date utility so we can swap the date lib (date-fns →
  Temporal) without touching business logic.

---

## 2. Key domain concepts (ubiquitous language)

| Term | Meaning |
|---|---|
| **Holiday** | A non-working calendar day from a jurisdiction (national / regional / municipal). |
| **Working-week mask** | 7-bit pattern of which weekdays are normally worked (varies by country/user). |
| **Bridge (emenda)** | Extending time off so vacation days glue onto weekends + holidays. |
| **Window** | A candidate vacation block: start date, days spent, extra free days gained, total consecutive rest. |
| **Efficiency** | `total rest days ÷ vacation days spent` — the core value metric. |
| **Split scheme** | A legal/company-approved partition of the entitlement into blocks (e.g. `14+11+5`). |
| **Labor policy** | The jurisdiction ruleset constraining split schemes, deadlines, and buy-back (CLT for BR). |
| **Study** | A saved, shareable optimization run (inputs + results). |

---

## 3. Stack (decided)

| Layer | Choice | Why |
|---|---|---|
| Language | **TypeScript** everywhere | one language, shared types core→UI |
| Monorepo | **pnpm workspaces + Turborepo** | share `packages/*`, cache builds |
| App/UI | **Next.js (App Router)** | SSR/SSG for SEO, route handlers as API |
| Styling | **Tailwind (utilities) + CSS Modules + shadcn/ui** | fast + own identity; custom CSS in colocated `*.module.css`; **no inline CSS** |
| Dates | **date-fns + date-fns-tz** (Temporal later) | tree-shakeable, TZ-safe; isolated |
| Validation | **Zod** | one schema → runtime validation + TS types + OpenAPI |
| i18n | **next-intl** | locale routing, ICU messages |
| Holiday data | National/state **computed** at runtime; municipal **pre-generated static JSON**, fetched per UF (content-hashed filename + manifest, cached forever) | no runtime network dependency, no CORS, offline-capable, data decoupled from the JS bundle |
| Persistence | **URL-encoded state + localStorage** (no backend) | fully front-end MVP; Postgres only if company accounts appear |
| Deploy | **Static export (SSG) to CDN** (Vercel / Cloudflare / GH Pages) | no server, near-zero cost, global edge |

---

## 4. Monorepo layout

```
feriadex/
├── apps/
│   └── web/                     # Next.js static-export app (no server)
│       ├── app/                 # layout, page, /politica-privacidade
│       ├── components/          # shared: Header, Footer, ThemeToggle, Toggle,
│       │                        #   InfoTip, SearchSelect (+ .module.css each)
│       ├── features/optimizer/  # Optimizer, SplitEditor, SchemeTabs,
│       │                        #   CalendarView, HolidayCounter,
│       │                        #   WorkingWeekPicker, model.ts (+ CSS modules)
│       └── styles/globals.css   # reset + design-token variables + color-scheme
├── packages/
│   ├── core/                    # PURE engine (no I/O, no deps)
│   │   ├── src/
│   │   │   ├── calendar/        # date utils, calendar, easter (Computus), start-rule
│   │   │   ├── bridge/          # evaluate, optimize (rank by efficiency), describe
│   │   │   ├── split/           # scheme + validate, partitions, solve/bestSplit
│   │   │   └── types.ts         # Holiday, VacationWindow
│   │   └── test/                # deterministic scenario tests
│   ├── holidays/                # providers + baked data
│   │   ├── src/br/              # national (computed), estadual (rule table),
│   │   │                        #   municipal (fetch-based loader), cities, counts, states
│   │   │   └── data/            # {UF}.json: {ibge: {name, holidays:[{month,day,name}]}}
│   │   │                        #   one file per UF, all cities + deduped recurring holidays
│   │   │                        #   (data lives under src/<cc>/ per country, not a shared src/data/)
│   │   └── scripts/             # import-cities-municipal.ts (regenerate from IBGE + open dataset)
│   │                            #   copy-public-data.mjs (hash + copy into apps/web/public, pre-dev/build)
│   ├── policies/                # labor-policy packs per jurisdiction
│   │   └── src/
│   │       ├── policy.ts        # LaborPolicy interface + SplitScheme model
│   │       └── packs/br/        # CLT Art.134 rules + common RH presets
│   ├── i18n/                    # locale config, message catalogs, formats
│   ├── ui/                      # shared shadcn-based components (design system)
│   └── config/                  # shared tsconfig / eslint / tailwind presets
├── docs/                        # ARCHITECTURE, BACKLOG, gaps, state, api/openapi
├── CLAUDE.md                    # AI + contributor guide for this repo
└── README.md
```

**Dependency rule (one direction only):**
`ui → core`, `web → {core, holidays, policies, i18n, ui}`,
`policies → core (types only)`, `holidays → core (types only)`.
`core` depends on **nothing** internal and has **no I/O**.

---

## 5. The core engine (`packages/core`)

Framework-free, pure functions. Two cooperating solvers:

### 5.1 Bridge optimizer (`bridge/`)
Ported logic from the reverse-engineered algorithm:
- `isWorkingDay(date, mask, holidays)` / `isHoliday(date, holidays)`
- `getExtraDays(from, dir)` → contiguous free days (weekend + holidays)
- `getStartDayOfVacation(from, dir)` → next/prev spendable working day
- `calculateBestDay(holiday, days, dir)` → best window around a holiday
- ranks windows by **efficiency** (`qtyExtraTotal`)

### 5.2 Split solver (`split/`) — our differentiator
Given an entitlement (e.g. 30 days) and a **LaborPolicy**, enumerate *valid*
partitions (multiset, order-independent), then for each partition place every
block in its best bridge window **within the deadline**, maximizing total rest
of the whole set. See BACKLOG epic "Configurable splitting".

Input contract:
```ts
interface OptimizeInput {
  countryCode: string;              // "BR"
  regionCode?: string;              // "PE"
  cityCode?: string;                // municipal holidays
  workingWeek: boolean[7];          // Sun..Sat mask
  entitlementDays: number;          // 30
  sellBackDays?: number;            // abono pecuniário (0..entitlement/3)
  period: { from: Date; to: Date }; // concessive window / deadline
  schemeId?: string;                // preset from policy pack, or ...
  customScheme?: SplitScheme;       // ...user-defined partition
}
```

---

## 6. Internationalization strategy (the scaling backbone)

Four axes of country variance, each isolated:

1. **Holidays** → `packages/holidays` `HolidayProvider` interface. One adapter
   per country/source. Core never knows *where* holidays came from.
2. **Labor rules** → `packages/policies` `LaborPolicy` interface. Each pack
   encodes split constraints, min block sizes, deadlines, buy-back rules,
   default working week. BR/CLT is the first pack; adding a country = new pack,
   no engine change.
3. **UI language** → `packages/i18n` message catalogs, locale-routed pages
   (`/[locale]/...`). ICU for plurals/gender.
4. **Locale formatting** → date/number formats, **week start day** (Sun vs Mon),
   from `Intl` + i18n config, fed into the working-week mask defaults.

`countryCode` is the top-level key that selects provider + policy + locale
defaults. Everything downstream is data lookup.

> **MVP scope:** the product ships **Portuguese-first (pt-BR), Brazil only**.
> English and other countries are deferred. The i18n/provider/policy structure
> exists so that expansion is additive, but only the BR/pt-BR packs are built
> now. Default locale = `pt-BR`; the i18n layer wraps strings from day one so we
> never retrofit it, but no second language is authored yet.

---

## 7. API layer — DEFERRED (not in MVP)

The MVP is **front-end only** (static export, no server). There is **no runtime
API**: optimization is client-side compute, holidays are a build-time dataset,
and studies are URL-encoded + localStorage. The `apps/web/app/api/v1` folder and
`docs/api/openapi.yaml` are a **forward design** for when a backend becomes
necessary (e.g. company accounts, shared/persistent studies, custom presets).

When that day comes: own REST API under `/api/v1`, thin handlers (Zod →
`core`/`holidays`/`policies` → serialize), country-centric and cache-friendly.
Never proxy or depend on any third-party API.

---

## 8. Data & persistence

- **MVP:** no database. Optimization is stateless compute; a "study" is the
  input serialized into the URL (shareable) + cached in localStorage.
- **Later:** Postgres for durable/shareable studies and user/company custom
  policy presets. Holiday responses cached (edge/CDN + in-memory) keyed by
  `country+region+city+range`.

---

## 9. Scaling & ops (forward-looking)

- Holiday reads: edge-cached, long TTL (holidays rarely change); revalidate
  yearly. Compute is CPU-only and horizontally trivial.
- Move `core` split solver to a Web Worker if large split spaces block the UI.
- Observability + rate limiting added at the API layer when a DB lands.
- Consider extracting the API into its own service only if a non-web client
  (mobile app) appears — the package boundaries already allow it.

---

## 10. Architecture decisions (ADR-lite)

| # | Decision | Status |
|---|---|---|
| 1 | TS monorepo (pnpm+Turbo), pure `core` package | Accepted |
| 2 | Next.js App Router, own `/api/v1` (no the reference app dependency) | Accepted |
| 3 | Holidays from government/public APIs via per-country adapters | Accepted |
| 4 | Labor rules as pluggable policy packs (CLT first) | Accepted |
| 5 | i18n via locale routing + per-country data selection | Accepted |
| 6 | date-fns now, isolate behind a date util for Temporal later | Accepted |
| 7 | No DB in MVP (URL/localStorage), Postgres later | Accepted |
| 8 | MVP holiday coverage: national + state (build dataset) + user-added municipal | Accepted |
| 9 | Front-end only MVP — Next.js **static export** (SSG), no server, no runtime API | Accepted |
| 10 | Styling: Tailwind utilities + colocated CSS Modules; no inline CSS | Accepted |
| 11 | Holidays **computed at runtime** (national + movable via Computus) — even simpler than a build dataset: no build step, no fetch, no CORS. State/municipal added later. | Accepted (refined) |
| 12 | Keep monorepo (`packages/*`) for modularity + i18n scaling | Accepted |
