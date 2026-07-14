import { addDays, easterSunday, type Holiday } from "@feriadex/core";

const pad = (n: number): string => String(n).padStart(2, "0");
const fixed = (year: number, month: number, day: number): string =>
  `${year}-${pad(month)}-${pad(day)}`;

/**
 * Brazilian national holidays for a given year.
 *
 * Official federal holidays (fixed + Good Friday) are `observance: "official"`.
 * Carnaval and Corpus Christi are federally optional (ponto facultativo) but
 * widely taken off, so they are included as `observance: "optional"` — the app
 * can let the user decide whether optional points count.
 *
 * Legal basis (researched 2026-07-13; see docs/KNOWLEDGE_GAPS.md G-H3):
 * - Confraternização Universal, Dia do Trabalho, Independência do Brasil,
 *   Proclamação da República, Natal — Lei nº 662, de 6 de abril de 1949
 *   (art. 1º, original wording).
 * - Tiradentes, Finados — added to Lei 662/1949's art. 1º by Lei nº 10.607,
 *   de 19 de dezembro de 2002.
 * - Nossa Senhora Aparecida — standalone Lei nº 6.802, de 30 de junho de 1980
 *   (does not amend Lei 662/1949, stands alongside it).
 * - Dia da Consciência Negra (Nov 20) — standalone Lei nº 14.759, de 21 de
 *   dezembro de 2023; national only from 2024 onward (emitted for years >= 2024).
 * - Sexta-feira Santa is NOT declared a national holiday by any federal law.
 *   Lei nº 9.093, de 12 de setembro de 1995 (art. 2º) instead lets each
 *   município declare up to 4 "feriados religiosos" by local tradition,
 *   explicitly naming Sexta-feira da Paixão as one of them — it's observed
 *   virtually everywhere by municipal adoption, not by a national statute.
 *   Kept here as `observance: "official"` (matches near-universal practice
 *   and existing app behavior); the description below reflects the real
 *   mechanism rather than a fabricated national-law citation.
 * - Carnaval (seg/ter), Quarta-feira de Cinzas and Corpus Christi have no
 *   permanent law: for the federal civil service they're set by an annual
 *   Portaria (Ministério da Gestão e da Inovação em Serviços Públicos), so a
 *   specific Portaria number would go stale every year — not cited here.
 *   Corpus Christi is additionally a real municipal holiday in many cities
 *   under the same Lei 9.093/1995 art. 2º mechanism as Sexta-feira Santa.
 */
export function brNationalHolidays(year: number): Holiday[] {
  const easter = easterSunday(year);

  const official: Holiday[] = [
    { date: fixed(year, 1, 1), name: "Confraternização Universal (Lei nº 662/1949)" },
    {
      date: addDays(easter, -2),
      name: "Sexta-feira Santa",
      description:
        "Feriado religioso observado por adesão municipal (Lei nº 9.093/1995, art. 2º) — não há lei federal que o declare feriado nacional diretamente",
    },
    { date: fixed(year, 4, 21), name: "Tiradentes", description: "Lei nº 10.607/2002" },
    { date: fixed(year, 5, 1), name: "Dia do Trabalho", description: "Lei nº 662/1949" },
    { date: fixed(year, 9, 7), name: "Independência do Brasil", description: "Lei nº 662/1949" },
    { date: fixed(year, 10, 12), name: "Nossa Senhora Aparecida", description: "Lei nº 6.802/1980" },
    { date: fixed(year, 11, 2), name: "Finados", description: "Lei nº 10.607/2002" },
    { date: fixed(year, 11, 15), name: "Proclamação da República", description: "Lei nº 662/1949" },
    { date: fixed(year, 12, 25), name: "Natal", description: "Lei nº 662/1949" },
  ].map((h): Holiday => ({ ...h, level: "national", observance: "official" }));

  if (year >= 2024) {
    official.push({
      date: fixed(year, 11, 20),
      name: "Dia da Consciência Negra (Lei nº 14.759/2023)",
      level: "national",
      observance: "official",
    });
  }

  // Federal optional points (pontos facultativos): not national holidays, but
  // commonly days off — the user decides via the checkbox. No permanent law —
  // set annually by Portaria (MGI) for the federal civil service; see the
  // legal-basis note above.
  const optional: Holiday[] = [
    {
      date: addDays(easter, -48),
      name: "Véspera de Carnaval",
      description: "Definido anualmente por Portaria do Governo Federal, sem lei fixa",
    },
    {
      date: addDays(easter, -47),
      name: "Carnaval",
      description: "Definido anualmente por Portaria do Governo Federal, sem lei fixa",
    },
    {
      date: addDays(easter, -46),
      name: "Quarta-feira de Cinzas (até as 14h)",
      description: "Definido anualmente por Portaria do Governo Federal, sem lei fixa",
    },
    {
      date: addDays(easter, 60),
      name: "Corpus Christi",
      description:
        "Definido anualmente por Portaria do Governo Federal, sem lei fixa; feriado por lei em vários municípios (Lei nº 9.093/1995, art. 2º)",
    },
  ].map((h): Holiday => ({ ...h, level: "national", observance: "optional" }));

  return [...official, ...optional].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  );
}
