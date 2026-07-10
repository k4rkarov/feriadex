import type { WorkingWeek } from "@feriadex/core";

/** A shareable study, encoded as readable query params. */
export interface Study {
  uf: string;
  city: number | null;
  clt: boolean;
  availableDays: number;
  div: number[]; // selected block sizes, e.g. [14, 11, 5]
  banco: number;
  from: string;
  to: string;
  week: WorkingWeek;
  excluded: string[]; // holiday dates the user unchecked
}

const weekToStr = (w: WorkingWeek): string =>
  w.map((on, i) => (on ? String(i) : "")).join("");

const strToWeek = (s: string): WorkingWeek => {
  const set = new Set(s.split("").map(Number));
  return [0, 1, 2, 3, 4, 5, 6].map((i) => set.has(i)) as unknown as WorkingWeek;
};

/** Build the query string (no leading "?") for a study. */
export function encodeStudy(s: Study): string {
  const p = new URLSearchParams();
  if (s.uf) p.set("uf", s.uf);
  if (s.city != null) p.set("city", String(s.city));
  p.set("clt", s.clt ? "1" : "0");
  p.set("dias", String(s.availableDays));
  if (s.div.length) p.set("div", s.div.join("-"));
  if (s.banco) p.set("banco", String(s.banco));
  p.set("de", s.from);
  p.set("ate", s.to);
  p.set("sem", weekToStr(s.week));
  if (s.excluded.length) p.set("exc", s.excluded.join(","));
  return p.toString();
}

/** Parse whatever params are present; everything is optional. */
export function parseStudy(qs: string): Partial<Study> {
  const p = new URLSearchParams(qs);
  const out: Partial<Study> = {};
  const num = (k: string) => {
    const v = Number(p.get(k));
    return Number.isFinite(v) ? v : undefined;
  };
  if (p.has("uf")) out.uf = p.get("uf") ?? "";
  if (p.has("city")) out.city = num("city") ?? null;
  if (p.has("clt")) out.clt = p.get("clt") === "1";
  if (p.has("dias")) out.availableDays = num("dias");
  if (p.has("div"))
    out.div = p.get("div")!.split("-").map(Number).filter((n) => n > 0);
  if (p.has("banco")) out.banco = num("banco");
  if (p.has("de")) out.from = p.get("de") ?? undefined;
  if (p.has("ate")) out.to = p.get("ate") ?? undefined;
  if (p.has("sem")) out.week = strToWeek(p.get("sem")!);
  if (p.has("exc")) out.excluded = p.get("exc")!.split(",").filter(Boolean);
  return out;
}
