# Legal & HR Compliance — Vacation Rules (Brazil)

Maps each rule from CLT Art. 134 (current text, Lei 13.467/2017; base
Decreto-Lei 1.535/77) and the employer (RH) requirements to where it is
enforced in code. Keep this in sync when the split logic changes.

> **Work regime.** These rules apply to **CLT** employees only. A **PJ**
> contractor is not bound by Art. 134 and organizes vacation freely. The app
> has a regime selector; each regime is a `LaborPolicy` (`CLT` / `PJ` in
> `@feriadex/policies`) that drives validation and the start-day gate. The
> table below is the **CLT** policy; under **PJ** the constraints are off
> (`maxPeriods=∞`, min blocks = 1, no §3), keeping only sum-to-total consistency.

| Rule | Source | Where enforced | Status |
|---|---|---|---|
| Up to **3 periods** | CLT Art. 134 §1 | `validateScheme` + `CLT.maxPeriods=3` | ✅ |
| One period **≥ 14** consecutive days | CLT Art. 134 §1 | `validateScheme` + `CLT.minMainBlockDays=14` | ✅ |
| Other periods **≥ 5** consecutive days | CLT Art. 134 §1 | `validateScheme` + `CLT.minOtherBlockDays=5` | ✅ |
| Blocks **sum to the entitlement** | RH | `validateScheme` (sum check) | ✅ |
| **Order irrelevant** (multiset) | RH | scheme is an unordered `parts[]`; validation sorts | ✅ |
| **No start** in the 2 days before a holiday / weekly rest | CLT Art. 134 §3 | `core isAllowedStart` + `policies cltStartAllowed` → `allowStart` gate in `optimizeSingleBlock`/`solveSplit` | ✅ |
| Vacation starts on a **working day** | CLT Art. 134 §3 (implied) | `isAllowedStart` (rejects rest-day starts) | ✅ |
| Must **finish before the deadline** (período concessivo) | CLT / RH | `to` field is the deadline (labeled + hinted); all blocks placed within `[from, to]`; a block that cannot fit surfaces a "não cabe no prazo" error | ✅ |
| **Whole period scheduled together** (not piecemeal) | RH | `solveSplit` resolves the entire scheme in one pass | ✅ |
| **Abono pecuniário** — sell up to 1/3 (e.g. 30→20) | CLT Art. 143 | Now **implicit**: the user enters "Dias disponíveis" (net of any abono). `maxSellBackDays` still exists in the policy for future explicit UI. | ✅ (implicit) |
| **Split into N periods** | CLT §1 / RH | "Dividir em" (max 3 for CLT); `bestSplit` enumerates valid partitions and picks the most rest. PJ also gets a free "monte o seu" custom input. | ✅ |
| **Half-day points not counted** | — | Quarta-feira de Cinzas (until 14h) is excluded — not a full day off. | ✅ |

All CLT Art. 134 + RH rules and the abono are now enforced. Remaining polish is
UX, not compliance.

## Notes
- The 30-day RH presets (`14+11+5`, `20+5+5`, `15+5+10`, `15+15`, `14+7+9`) and
  20-day presets (`14+6`, `15+5`, with 10-day abono) live in `CLT.presets`
  (`packages/policies/src/packs/br/clt.ts`) and are validated in tests.
- The §3 start rule is generic in core (`isAllowedStart(cal, date, blackoutDays)`);
  the Brazilian `blackoutDays = 2` binding is in the policy pack.
- **Deadline**: make the UI bind the search end date to the employee's
  return-limit so "finish before it expires" is guaranteed, and surface it
  explicitly (currently the period `to` field carries this implicitly).
