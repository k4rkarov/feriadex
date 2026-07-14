export interface HolidayRow {
  month: number;
  day: number;
  name: string;
}

export interface CityRecord {
  name: string;
  holidays: HolidayRow[];
}

export type UfData = Record<string, CityRecord>;

export const DEFAULT_BASE_URL = "/data/holidays";

/**
 * One municipal JSON per UF, fetched as a static asset (not bundled into a
 * JS chunk — see docs/ARCHITECTURE.md). A manifest maps UF -> content-hashed
 * filename so browsers can cache each file forever, same as a webpack chunk
 * would. Both the manifest and each UF's parsed data are cached in-memory so
 * brCities() and brMunicipalHolidays() never re-fetch/re-parse the same UF
 * twice within a session, regardless of call order.
 */
const manifestCache = new Map<string, Promise<Record<string, string>>>();
const ufCache = new Map<string, Promise<UfData>>();

async function getManifest(baseUrl: string): Promise<Record<string, string>> {
  let p = manifestCache.get(baseUrl);
  if (!p) {
    p = fetch(`${baseUrl}/manifest.json`)
      .then((r) => (r.ok ? (r.json() as Promise<Record<string, string>>) : {}))
      .catch(() => ({}));
    manifestCache.set(baseUrl, p);
  }
  return p;
}

export function loadUfData(uf: string, baseUrl: string = DEFAULT_BASE_URL): Promise<UfData> {
  const cacheKey = `${baseUrl}|${uf}`;
  let p = ufCache.get(cacheKey);
  if (!p) {
    p = getManifest(baseUrl)
      .then((manifest) => {
        const file = manifest[uf] ?? `${uf}.json`; // no manifest (e.g. tests) -> plain name
        return fetch(`${baseUrl}/${file}`).then((r) => (r.ok ? (r.json() as Promise<UfData>) : {}));
      })
      .catch(() => ({}));
    ufCache.set(cacheKey, p);
  }
  return p;
}
