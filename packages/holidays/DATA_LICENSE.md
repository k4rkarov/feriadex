# Holiday data — sources & attribution

## National + movable holidays
Computed at runtime (no dataset). Movable feasts derive from Easter via the
Gregorian Computus in `@feriadex/core`. Always correct for any year.

## State (estadual) holidays
Baked from an open dataset:

- **Source:** [joaopbini/feriados-brasil](https://github.com/joaopbini/feriados-brasil)
- **License:** MIT
- **Baked file:** `src/data/estadual.json` (normalized subset: date, name, UF)
- **Regenerate:** `node --experimental-strip-types scripts/import-estadual.ts`

The dataset is downloaded once at build time and shipped with the app; there is
no runtime dependency on the source. Upstream currently publishes state
holidays through **2026** — re-run the importer when new years are added.

### MIT notice (joaopbini/feriados-brasil)
```
MIT License — Copyright (c) João Pedro Bini
Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction... The above copyright notice and this
permission notice shall be included in all copies or substantial portions of
the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

## Municipal holidays
Not yet baked. Upstream provides them (~1.7 MB/year, keyed by IBGE code); they
will be chunked per-UF and lazy-loaded as same-origin static assets when the
web app exists (avoids bundle bloat, still no runtime third-party call).
