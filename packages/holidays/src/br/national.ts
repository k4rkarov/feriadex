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
 * Note: Consciência Negra (Nov 20) became a national holiday in 2024
 * (Lei 14.759/2023); it is emitted for years >= 2024.
 */
export function brNationalHolidays(year: number): Holiday[] {
  const easter = easterSunday(year);

  const official: Holiday[] = [
    { date: fixed(year, 1, 1), name: "Confraternização Universal" },
    { date: addDays(easter, -2), name: "Sexta-feira Santa" },
    { date: fixed(year, 4, 21), name: "Tiradentes" },
    { date: fixed(year, 5, 1), name: "Dia do Trabalho" },
    { date: fixed(year, 9, 7), name: "Independência do Brasil" },
    { date: fixed(year, 10, 12), name: "Nossa Senhora Aparecida" },
    { date: fixed(year, 11, 2), name: "Finados" },
    { date: fixed(year, 11, 15), name: "Proclamação da República" },
    { date: fixed(year, 12, 25), name: "Natal" },
  ].map((h): Holiday => ({ ...h, level: "national", observance: "official" }));

  if (year >= 2024) {
    official.push({
      date: fixed(year, 11, 20),
      name: "Dia da Consciência Negra",
      level: "national",
      observance: "official",
    });
  }

  const optional: Holiday[] = [
    { date: addDays(easter, -48), name: "Carnaval (segunda)" },
    { date: addDays(easter, -47), name: "Carnaval (terça)" },
    { date: addDays(easter, -46), name: "Quarta-feira de Cinzas" },
    { date: addDays(easter, 60), name: "Corpus Christi" },
  ].map((h): Holiday => ({ ...h, level: "national", observance: "optional" }));

  return [...official, ...optional].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  );
}
