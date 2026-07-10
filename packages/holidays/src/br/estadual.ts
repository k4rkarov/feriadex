import { dayOfWeek, type Holiday } from "@feriadex/core";

const pad = (n: number): string => String(n).padStart(2, "0");

/**
 * State (estadual) holidays, computed from a curated rule table (owner-provided
 * official list). Fixed dates + one movable rule (PE: first Sunday of March).
 * Rule-based → valid for ANY year, so there is no dataset year cap.
 *
 * States with no fixed civil state holiday (ES, MT, PR) are absent (adopt the
 * national calendar). Dates coinciding with a national holiday (e.g. DF/MG on
 * 21 Apr) are deduped at the counter by level precedence.
 */
type Def =
  | { month: number; day: number; name: string }
  | { rule: "firstSundayMarch"; name: string };

const TABLE: Record<string, Def[]> = {
  AC: [
    { month: 1, day: 23, name: "Dia do Evangélico" },
    { month: 3, day: 8, name: "Dia da Mulher" },
    { month: 6, day: 15, name: "Aniversário do Estado" },
    { month: 9, day: 5, name: "Dia da Amazônia" },
    { month: 11, day: 17, name: "Tratado de Petrópolis" },
  ],
  AL: [
    { month: 6, day: 24, name: "São João" },
    { month: 6, day: 29, name: "São Pedro" },
    { month: 9, day: 16, name: "Emancipação Política" },
  ],
  AP: [
    { month: 3, day: 19, name: "São José" },
    { month: 9, day: 13, name: "Criação do Território Federal" },
  ],
  AM: [{ month: 9, day: 5, name: "Elevação do Amazonas à Província" }],
  BA: [{ month: 7, day: 2, name: "Independência da Bahia" }],
  CE: [{ month: 3, day: 25, name: "Data Magna do Ceará" }],
  DF: [
    { month: 4, day: 21, name: "Fundação de Brasília" },
    { month: 11, day: 30, name: "Dia do Evangélico" },
  ],
  ES: [],
  GO: [{ month: 7, day: 26, name: "Fundação da Cidade de Goiás" }],
  MA: [{ month: 7, day: 28, name: "Adesão do Maranhão à Independência" }],
  MT: [],
  MS: [{ month: 10, day: 11, name: "Criação do Estado" }],
  MG: [{ month: 4, day: 21, name: "Data Magna de Minas Gerais" }],
  PA: [{ month: 8, day: 15, name: "Adesão do Pará à Independência" }],
  PB: [
    { month: 7, day: 26, name: "Memória de João Pessoa" },
    { month: 8, day: 5, name: "Fundação do Estado e N. Sra. das Neves" },
  ],
  PR: [],
  PE: [{ rule: "firstSundayMarch", name: "Data Magna de Pernambuco" }],
  PI: [
    { month: 3, day: 13, name: "Batalha do Jenipapo" },
    { month: 10, day: 19, name: "Dia do Piauí" },
  ],
  RJ: [{ month: 4, day: 23, name: "Dia de São Jorge" }],
  RN: [{ month: 10, day: 3, name: "Mártires de Cunhaú e Uruaçu" }],
  RS: [{ month: 9, day: 20, name: "Dia do Gaúcho" }],
  RO: [
    { month: 1, day: 4, name: "Criação do Estado" },
    { month: 6, day: 18, name: "Dia do Evangélico" },
  ],
  RR: [{ month: 10, day: 5, name: "Criação do Estado" }],
  SC: [{ month: 8, day: 11, name: "Dia de Santa Catarina" }],
  SP: [{ month: 7, day: 9, name: "Revolução Constitucionalista de 1932" }],
  SE: [{ month: 7, day: 8, name: "Emancipação Política de Sergipe" }],
  TO: [
    { month: 9, day: 8, name: "N. Sra. da Natividade" },
    { month: 10, day: 5, name: "Criação do Estado" },
  ],
};

function firstSundayOfMarch(year: number): string {
  for (let d = 1; d <= 7; d++) {
    const iso = `${year}-03-${pad(d)}`;
    if (dayOfWeek(iso) === 0) return iso;
  }
  return `${year}-03-01`;
}

/** State holidays for a UF and year, computed from the rule table. Any year. */
export function brStateHolidays(uf: string, year: number): Holiday[] {
  const defs = TABLE[uf] ?? [];
  return defs.map((def) => {
    const date =
      "rule" in def
        ? firstSundayOfMarch(year)
        : `${year}-${pad(def.month)}-${pad(def.day)}`;
    return {
      date,
      name: def.name,
      level: "regional" as const,
      observance: "official" as const,
    };
  });
}
