const KEY = "lifezoi.wellness-assistant.recent.v1";
const MAX_RECENT = 6;

const listeners = new Set<() => void>();
let recentCache: string[] = [];
let ready = false;

function knownIds(ids: readonly string[]): Set<string> {
  return new Set(ids);
}

export function readRecentIds(
  storage: Pick<Storage, "getItem"> | null,
  allowed: readonly string[],
): string[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const allow = knownIds(allowed);
    const seen = new Set<string>();
    const ids: string[] = [];
    for (const item of parsed) {
      if (typeof item !== "string" || !allow.has(item) || seen.has(item)) continue;
      seen.add(item);
      ids.push(item);
      if (ids.length >= MAX_RECENT) break;
    }
    return ids;
  } catch {
    return [];
  }
}

export function writeRecentIds(storage: Pick<Storage, "setItem"> | null, ids: string[]) {
  storage?.setItem(KEY, JSON.stringify(ids.slice(0, MAX_RECENT)));
}

function publish(ids: string[]) {
  recentCache = ids;
  ready = true;
  listeners.forEach((listener) => listener());
}

export function subscribeRecent(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRecentIds(allowed: readonly string[]): string[] {
  if (typeof window === "undefined") return [];
  if (!ready) {
    recentCache = readRecentIds(window.sessionStorage, allowed);
    ready = true;
  }
  return recentCache;
}

export function getRecentServerIds(): string[] {
  return [];
}

export function rememberRecentId(id: string, allowed: readonly string[]) {
  if (typeof window === "undefined") return;
  if (!allowed.includes(id)) return;
  const next = [id, ...getRecentIds(allowed).filter((item) => item !== id)].slice(0, MAX_RECENT);
  writeRecentIds(window.sessionStorage, next);
  publish(next);
}

export function clearRecentQuestions(storage: Pick<Storage, "removeItem"> | null) {
  storage?.removeItem(KEY);
  if (storage && typeof window !== "undefined" && storage === window.sessionStorage) {
    publish([]);
  }
}

export function resetRecentForTests() {
  recentCache = [];
  ready = false;
  listeners.clear();
}
