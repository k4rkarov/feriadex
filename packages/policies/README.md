# @feriadex/policies

Labor-policy packs per jurisdiction. Each pack encodes the rules that constrain
valid vacation split schemes: min block sizes, max periods, deadlines, sell-back
(abono), default working week, and employer (RH) presets.

- `src/policy.ts` — `LaborPolicy` interface + `SplitScheme` model.
- `src/packs/br/` — Brazil pack: CLT Art. 134 floor + common RH presets
  (30d/20d schemes; see `docs/REVERSE_ENGINEERING.md` §4).
- `src/index.ts` — public entry.

Adding a jurisdiction = new pack here, no engine change.
Depends on `@feriadex/core` for types only.
