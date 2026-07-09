# @feriadex/holidays

Holiday data access. Defines the `HolidayProvider` interface and one **adapter
per country/source**. The core never knows where holidays come from.

- `src/provider.ts` — `HolidayProvider` interface.
- `src/br/national.ts` — Brazil national + movable holidays, **computed** at
  runtime (Easter via `@feriadex/core`'s Computus). No network, no CORS.
- `src/br/provider.ts` — `brProvider` over a year range. Regional/municipal
  TBD (see `docs/KNOWLEDGE_GAPS.md` G-H2); municipal via user-added custom.
- `src/index.ts` — public entry.

Adding a country = new `src/<cc>/` generator, no engine/UI change.
Depends on `@feriadex/core`.
