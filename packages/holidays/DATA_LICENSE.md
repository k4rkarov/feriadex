# Holiday data — sources & attribution

## National + movable holidays
Computed at runtime (no dataset). Movable feasts derive from Easter via the
Gregorian Computus in `@feriadex/core`. Always correct for any year.

## State (estadual) holidays
**Computed** from a curated rule table (`src/br/estadual.ts`), based on the
official state-holiday list provided by the project owner. Fixed dates plus one
movable rule (PE = first Sunday of March). Rule-based → valid for **any year**
(no dataset year cap). No third-party dataset; joaopbini is no longer used for
state holidays.

## Municipal holidays
Not yet baked. Upstream provides them (~1.7 MB/year, keyed by IBGE code); they
will be chunked per-UF and lazy-loaded as same-origin static assets when the
web app exists (avoids bundle bloat, still no runtime third-party call).
