# Reverse-Engineering — folgaextra.com

> Analysis of the product Feriadex clones first (Brazil). Captured to learn the
> **algorithm and data shape**, not to copy design or consume its API at
> runtime. Last analyzed: 2026-07-09. (Supersedes the original pt-BR `PLANO.md`.)

## 1. What folgaextra does
A Brazilian vacation optimizer. Finds the **best days to start vacation** so
that vacation days bridge (*emendar*) holidays + weekends and maximize
consecutive rest — no manual calendar scanning. Pitch: "spend 10 days, rest 17".

User flow:
1. Pick **state (UF)** and optionally **city** → defines which holidays count
   (national + state + municipal).
2. Set **working week** (7-day mask, default Mon–Fri).
3. Enter **vacation days** (default 10), **compensation/day-bank**, and whether
   to **split** vacation.
4. Choose **search period**: `1` = next 12 months from today, `2` = custom range.
5. (Optional) add/edit **holidays not listed** (manual customization).
6. App computes a **ranking of vacation windows**: start day, days spent, extra
   free days gained, total consecutive rest.
7. Result is **saveable and shareable** by URL (`/resultado/:id`).

## 2. Core algorithm (recovered)
For **each holiday** in the period, compute the best window bridging forward
(`+1`) and backward (`-1`):
- `getStartDayOfVacation(from, dir)` — walk to the next/previous working day
  that is not a holiday (where spending a vacation day makes sense).
- `getExtraDays(from, dir)` — count contiguous non-working days (weekends) and
  holidays → `extraDayOff` + `extraHoliday` = "free" rest.
- `calculateBestDay(holiday, days, dir)` — place vacation days so the block
  glues to weekend + holiday; compute `qtyExtraTotal` = rest gained beyond
  vacation days spent (the bridge **efficiency**).
- Ranking: keep windows with highest `qtyExtraTotal`; ties keep all.
- **Split** (`vacationSplit > 1`): `_doCalculateCombination` enumerates
  partitions of the vacation days; `getCalculateSmart` picks the N-block
  combination maximizing total rest; `_filterClosestHolidays` prunes nearby
  holidays to avoid duplicate windows.
- Validation: `vacationDays / vacationSplit >= min` (no blocks too small).

Key metric = **bridge efficiency**: `rest days ÷ vacation days spent`. This is
what sells the product.

## 3. Target's stack (for reference only)
Frontend: React (Create React App + webpack), react-snap (prerender/SEO),
MobX-State-Tree (`Configuration`, `Study` models), Ant Design, Tailwind,
moment.js. Monetization: Google AdSense, Facebook Pixel, Google Analytics.

Backend: PHP + nginx, base path `/webservice`, SQL DB (Sequelize-style
timestamps). Studied, **not** to be consumed by Feriadex:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/webservice/service.php?type=state` | 27 UFs |
| GET | `/webservice/service.php?type=city&state=UF` | cities of the UF |
| GET | `/webservice/holidayservicev2.php?datestart=DD/MM/YYYY&dateend=DD/MM/YYYY&uf=UF&city=CITY` | holidays in range |
| POST | `/webservice/study.php` | save study → id |
| GET/PUT/DELETE | `/webservice/study.php?id=` | load / update / delete |

Holiday shape: `{ "date":"2026-03-06", "description":"Revolução Pernambucana",
"origin":"national|uf|city", "days":"125" }` (`days` = days until the holiday).

SPA routes: `/`, `/resultado`, `/resultado/:studyId`, `/estudo/:studyId`,
`/politica-privacidade`.

## 4. Known gap → Feriadex's differentiator
folgaextra **pre-defines** how vacation is split (fixed/generic). It does not
honor each employer's HR (RH) parceling rules or nuanced CLT constraints.
Feriadex solves this with **configurable split schemes**: presets + free user
editing (see ARCHITECTURE §5.2 and BACKLOG Epic C).

### Rules to model
1. **Employer/profile presets** — allowed scheme sets. The optimizer only
   proposes windows matching a valid scheme.
2. **Order-independent** — `14+9+7 == 7+9+14`. Treat a scheme as a *multiset*.
3. **Deadline (concessive period)** — the full entitlement must end **before it
   expires** (return-from-vacation limit). Hard date constraint.
4. **Single submission block** — the whole entitlement (e.g. 30 days) is
   scheduled at once; you cannot book one piece and the rest later. The solver
   resolves the whole set together, not incrementally.
5. **CLT Art. 134 §1º (legal floor)** — up to **3 periods**; one **≥ 14
   consecutive days**, the others **≥ 5 consecutive days**. Employer presets sit
   on top and may be stricter.
6. **Sell-back (abono pecuniário)** — the worker may sell up to 1/3 (e.g. 10 of
   30 days), reducing days to schedule (30→20). Modeled as a parameter.

### Concrete HR (RH) schemes to ship as presets
30 days:
```
30 = 14 + 11 + 5
30 = 20 + 5 + 5
30 = 15 + 5 + 10
30 = 15 + 15
30 = 14 + 7 + 9
```
20 days (with 10-day sell-back / abono):
```
20 = 14 + 6
20 = 15 + 5
```

### Implementation shape
Declarative constraint:
`SplitScheme = { totalDays, parts: number[] (multiset), maxReturnDate,
minMainBlock: 14, minOtherBlock: 5 }`. The solver enumerates *valid*
partitions (preset or CLT floor), places each block in its best bridge window
within the deadline, and maximizes total rest of the set. UI: preset dropdown +
free "build your own scheme" editor with live CLT validation; the user can
override any preset. Presets stored in localStorage (MVP), per-company later.

## 5. Data source note
folgaextra maintains its own holiday DB. Feriadex sources holidays from
government/public APIs (BrasilAPI for national; regional/municipal source TBD —
see KNOWLEDGE_GAPS G-H1/G-H2). No runtime dependency on folgaextra.
