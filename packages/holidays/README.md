# @feriadex/holidays

Holiday data access. Defines the `HolidayProvider` interface and one **adapter
per country/source**. The core never knows where holidays come from.

- `src/provider.ts` — `HolidayProvider` interface.
- `src/br/national.ts` — Brazil national + movable holidays, **computed** at
  runtime (Easter via `@feriadex/core`'s Computus). No network, no CORS.
- `src/br/estadual.ts` — state holidays from a curated rule table + one
  computed movable rule (PE).
- `src/br/cities.ts`, `src/br/municipal.ts` — city list + municipal holidays,
  one combined record per city (`{name, holidays: [{month, day, name}]}`) in
  `src/br/data/{UF}.json`. Holidays are stored year-free (they recur
  every year) and expanded to ISO dates on demand. Regenerate with
  `scripts/import-cities-municipal.ts` (fetches IBGE + an open MIT dataset,
  see `DATA_LICENSE.md`; drops movable feasts like Carnaval/Corpus Christi,
  already computed precisely at the national level).
- `src/br/data-loader.ts` — shared `fetch()`-based loader both use: fetches a
  static JSON asset per UF (not bundled into the JS build), with a
  content-hash manifest for long-term caching and an in-memory per-UF cache
  so a page never re-fetches the same UF twice.
- `src/index.ts` — public entry.

**Data delivery:** the package's `src/br/data/**` is the source of truth;
`scripts/copy-public-data.mjs` copies it into the consuming app's
`public/data/holidays/` (content-hashed filenames + manifest) as a
`predev`/`prebuild` step — see `apps/web/package.json`. A loader's `baseUrl`
param keeps this package framework-agnostic; the app passes its own
basePath-aware root.

Adding a country = new `src/<cc>/` generator, no engine/UI change.
Depends on `@feriadex/core`.
