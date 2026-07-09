# apps/web

Next.js (App Router) application — the thin presentation shell over the
`packages/*`. No business logic here; it orchestrates packages and renders UI.

- `app/[locale]/` — locale-routed pages (pt-BR default).
- `app/api/v1/` — thin route handlers (Zod-validated) per `docs/api/openapi.yaml`.
- `features/<name>/` — **feature modules** (grouped by feature, not file type).
  Each owns its components, hooks, and `*.module.css`. Examples to come:
  `optimizer` (input form), `result` (ranked windows), `calendar` (visual),
  `holidays` (custom holiday editor).
- `components/` — app-level shared components (not reusable enough for `ui`).
- `lib/` — app-only helpers (route/state serialization, etc.).
- `styles/globals.css` — global reset + design-token CSS variables. The only
  place for global styles.
- `public/` — static assets.

Styling: Tailwind utilities + colocated CSS Modules. **No inline styles.**
See `docs/CONVENTIONS.md`.
