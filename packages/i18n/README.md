# @feriadex/i18n

Localization: message catalogs, locale config, and per-country formatting
(date/number, week-start day).

- `messages/pt-BR/` — Portuguese (Brazil) catalog. **Primary/default locale.**
- `src/` — locale config, formatters, message loading.
- `src/index.ts` — public entry.

MVP is pt-BR only. English and other locales are future — add a `messages/<locale>/`
folder, no code change. User-facing strings **must** come from here, never
hardcoded in components.
