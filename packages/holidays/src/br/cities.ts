import { DEFAULT_BASE_URL, loadUfData } from "./data-loader";

export interface BrCity {
  ibge: number;
  name: string;
}

/**
 * City list for a state — every municipality, whether or not it has
 * municipal-holiday data. Sourced from the merged per-UF dataset (see
 * data-loader.ts); returns [] for an unknown UF.
 */
export async function brCities(uf: string, baseUrl: string = DEFAULT_BASE_URL): Promise<BrCity[]> {
  const data = await loadUfData(uf, baseUrl);
  return Object.entries(data)
    .map(([ibge, city]) => ({ ibge: Number(ibge), name: city.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}
