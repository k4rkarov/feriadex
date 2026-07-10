export interface BrCity {
  ibge: number;
  name: string;
}

/**
 * City list for a state, loaded lazily (one per-UF JSON chunk, code-split by
 * the bundler). Sourced from IBGE at build time. Returns [] for unknown UF.
 */
export async function brCities(uf: string): Promise<BrCity[]> {
  try {
    const mod = await import(`../data/cities/${uf}.json`);
    return ((mod as { default?: BrCity[] }).default ?? mod) as BrCity[];
  } catch {
    return [];
  }
}
