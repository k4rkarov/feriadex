# @feriadex/core

Pure, framework-free vacation-optimization engine. **No I/O, no framework, no
network, deterministic.** Fully unit-tested. This is where the product's value
and all business logic live.

- `src/calendar/` — working-day / holiday predicates, working-week mask, date
  helpers (over the shared date utility).
- `src/bridge/` — bridge optimizer: `getExtraDays`, `getStartDayOfVacation`,
  `calculateBestDay`, ranking by efficiency.
- `src/split/` — split-scheme solver (valid partitions under a LaborPolicy).
- `src/index.ts` — public entry.
- `test/` — deterministic scenario tests. No network in tests.

Depends on nothing internal. See `docs/ARCHITECTURE.md` §5.
