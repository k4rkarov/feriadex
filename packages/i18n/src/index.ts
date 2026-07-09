// Public entry for @feriadex/i18n. MVP: pt-BR only. Adding a locale = add a
// catalog under src/messages and register it here — no component changes.

import { ptBR } from "./messages/pt-BR";

export const defaultLocale = "pt-BR" as const;
export type Locale = typeof defaultLocale;

export type MessageKey = keyof typeof ptBR;

const catalogs: Record<Locale, Record<MessageKey, string>> = {
  "pt-BR": ptBR,
};

/** Translate a message key for a locale (defaults to pt-BR). */
export function t(key: MessageKey, locale: Locale = defaultLocale): string {
  return catalogs[locale][key];
}
