# @feriadex/ui

Shared design system: reusable, presentation-only components (shadcn/ui wrappers
+ Tailwind). No business logic, no data fetching. Consumed by `apps/web`.

- `src/components/` — one component per folder (`Component.tsx` +
  `Component.module.css` when custom CSS is needed).
- `src/styles/` — global design tokens / base styles for the system.
- `src/index.ts` — public entry.

Styling rules: Tailwind utilities + colocated CSS Modules only. **No inline
styles.** See `docs/CONVENTIONS.md` §2.
