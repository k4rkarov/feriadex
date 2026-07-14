import type { Holiday } from "@feriadex/core";

const pad = (n: number): string => String(n).padStart(2, "0");

/**
 * State (estadual) holidays, computed from a curated rule table with each
 * date's establishing law/constitutional provision cited (researched
 * 2026-07-13 — see docs/KNOWLEDGE_GAPS.md G-H5 for sourcing notes and
 * confidence levels). All dates are fixed civil dates — rule-based →
 * valid for ANY year, no dataset year cap.
 *
 * States with no fixed civil state holiday (ES, MT, PR) are absent (adopt the
 * national calendar). Dates coinciding with a national holiday (e.g. DF/MG on
 * 21 Apr) are deduped at the counter by level precedence.
 *
 * Corrections made during the 2026-07-13 legal-basis research pass (these
 * were data bugs, not just missing citations):
 * - PE: was modeled as "first Sunday of March" (Lei nº 13.386/2007). That law
 *   was revoked by Lei nº 16.059, de 8 de junho de 2017, which fixes Data
 *   Magna de Pernambuco on a plain March 6 regardless of weekday. Changed to
 *   a fixed date; the movable-rule mechanism was removed since PE was its
 *   only user.
 * - PB: "Memória de João Pessoa" (Jul 26) was abolished by Lei nº 10.601, de
 *   16 de dezembro de 2015 (effective 2016), which replaced it with "Fundação
 *   do Estado e N. Sra. das Neves" (Aug 5). Removed the stale Jul 26 entry.
 * - PI: "Batalha do Jenipapo" (Mar 13) was never an actual state holiday —
 *   Lei federal nº 9.093/1995 caps each state at one civil holiday, and
 *   Piauí's slot is Oct 19; Mar 13 was only added to the state flag by Lei
 *   nº 5.507/2005. Removed.
 * - RO: "Dia do Evangélico" (Jun 18, Lei nº 1.026/2001) was declared
 *   unconstitutional by the STF (ADI 3940, decided 30/03/2020). Removed.
 */
interface Def {
  month: number;
  day: number;
  name: string;
  /** Extra legal/scope caveat shown alongside the holiday, when notable. */
  description?: string;
}

const TABLE: Record<string, Def[]> = {
  AC: [
    { month: 1, day: 23, name: "Dia do Evangélico", description: "Lei nº 1.538/2004 (revogada por Lei nº 2.013/2019, mas o feriado foi mantido)" },
    { month: 3, day: 8, name: "Dia da Mulher", description: "Lei nº 1.411/2001" },
    { month: 6, day: 15, name: "Aniversário do Estado", description: "Lei nº 14/1964" },
    { month: 9, day: 5, name: "Dia da Amazônia", description: "Lei nº 243/1968" },
    { month: 11, day: 17, name: "Tratado de Petrópolis", description: "Lei nº 57/1965" },
  ],
  AL: [
    {
      month: 6,
      day: 24,
      name: "São João",
      description: "Lei nº 5.508/1993. A Justiça do Trabalho já decidiu que este feriado obriga apenas o funcionalismo público, não o comércio/iniciativa privada",
    },
    {
      month: 6,
      day: 29,
      name: "São Pedro",
      description: "Lei nº 5.509/1993. A Justiça do Trabalho já decidiu que este feriado obriga apenas o funcionalismo público, não o comércio/iniciativa privada",
    },
    { month: 9, day: 16, name: "Emancipação Política", description: "Lei nº 9.358/2024" },
  ],
  AP: [
    { month: 3, day: 19, name: "São José", description: "Lei nº 667/2002" },
    { month: 9, day: 13, name: "Criação do Território Federal", description: "Constituição Estadual, art. 355" },
  ],
  AM: [{ month: 9, day: 5, name: "Elevação do Amazonas à Província", description:"Lei nº 25/1977 "}],
  BA: [{ month: 7, day: 2, name: "Independência da Bahia", description: "Constituição Estadual, art. 6º, §3º" }],
  CE: [{ month: 3, day: 25, name: "Data Magna do Ceará", description: "Constituição Estadual, art. 18)" }],
  DF: [
    { month: 4, day: 21, name: "Fundação de Brasília", description: "Lei Distrital nº 72/1989" },
    { month: 11, day: 30, name: "Dia do Evangélico", description: "Lei Distrital nº 963/1995" },
  ],
  ES: [],
  GO: [
    {
      month: 7,
      day: 26,
      name: "Fundação da Cidade de Goiás",
      description: "Lei nº 20.756/2020. Previsto no Estatuto dos Servidores Públicos Civis de GO (art. 269, §2º, II, \"a\"); originalmente Lei nº 10.460/1988 (revogada)",
    },
  ],
  MA: [{ month: 7, day: 28, name: "Adesão do Maranhão à Independência", description: "Lei nº 2.457/1964" }],
  MT: [],
  MS: [{ month: 10, day: 11, name: "Criação do Estado", description: "Lei nº 10/1979" }],
  MG: [{ month: 4, day: 21, name: "Data Magna de Minas Gerais", description: "Constituição Estadual, art. 256" }],
  PA: [{ month: 8, day: 15, name: "Adesão do Pará à Independência", description: "Lei nº 5.999/1996" }],
  PB: [
    { month: 8, day: 5, name: "Fundação do Estado e N. Sra. das Neves", description: "Lei nº 10.601/2015" },
  ],
  PR: [],
  PE: [{ month: 3, day: 6, name: "Data Magna de Pernambuco", description: "Lei nº 16.059/2017" }],
  PI: [
    { month: 10, day: 19, name: "Dia do Piauí", description: "Lei nº 176/1937" },
  ],
  RJ: [{ month: 4, day: 23, name: "Dia de São Jorge", description: "Lei nº 5.198/2008" }],
  RN: [{ month: 10, day: 3, name: "Mártires de Cunhaú e Uruaçu", description: "Lei nº 8.913/2006" }],
  RS: [{ month: 9, day: 20, name: "Dia do Gaúcho", description: "Lei nº 2.072/1953" }],
  RO: [
    { month: 1, day: 4, name: "Criação do Estado", description: "Lei nº 2.291/2010" },
  ],
  RR: [{ month: 10, day: 5, name: "Criação do Estado", description: "Constituição Estadual, art. 9º" }],
  SC: [{ month: 8, day: 11, name: "Dia de Santa Catarina", description: "Lei nº 12.906/2004" }],
  SP: [{ month: 7, day: 9, name: "Revolução Constitucionalista de 1932", description: "Lei nº 9.497/1997" }],
  SE: [{ month: 7, day: 8, name: "Emancipação Política de Sergipe", description: "Constituição Estadual, art. 269" }],
  TO: [
    { month: 9, day: 8, name: "N. Sra. da Natividade", description: "Lei nº 627/1993" },
    { month: 10, day: 5, name: "Criação do Estado", description: "Lei nº 98/1989" },
  ],
};

/** State holidays for a UF and year, computed from the rule table. Any year. */
export function brStateHolidays(uf: string, year: number): Holiday[] {
  const defs = TABLE[uf] ?? [];
  return defs.map((def) => ({
    date: `${year}-${pad(def.month)}-${pad(def.day)}`,
    name: def.name,
    level: "regional" as const,
    observance: "official" as const,
    ...(def.description ? { description: def.description } : {}),
  }));
}
