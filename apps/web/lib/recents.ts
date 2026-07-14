import type { Study } from "./share";

const KEY = "feriadex:recents";
const MAX = 8;

export interface RecentStudy {
  study: Study;
  savedAt: number;
}

function read(): RecentStudy[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list: RecentStudy[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // storage unavailable/full — best-effort only, nothing to recover
  }
}

export function loadRecents(): RecentStudy[] {
  return read();
}

/** Save (bumping an identical existing entry to the front instead of duplicating it), capped at 8. */
export function saveRecent(study: Study): RecentStudy[] {
  const encoded = JSON.stringify(study);
  const list = read().filter((r) => JSON.stringify(r.study) !== encoded);
  list.unshift({ study, savedAt: Date.now() });
  const capped = list.slice(0, MAX);
  write(capped);
  return capped;
}

export function removeRecent(savedAt: number): RecentStudy[] {
  const list = read().filter((r) => r.savedAt !== savedAt);
  write(list);
  return list;
}
