const THREAD_KEY = "lifezoi.wellness-assistant.live.v1";
const METER_KEY = "lifezoi.wellness-assistant.meter.v1";
const METER = /^[a-zA-Z0-9-]{16,80}$/;

export type LiveTurn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: string;
};

const listeners = new Set<() => void>();
let turns: LiveTurn[] = [];
let ready = false;
const serverTurns: LiveTurn[] = [];

function publish(next: LiveTurn[]) {
  turns = next.slice(-8);
  ready = true;
  listeners.forEach((listener) => listener());
}

export function readLiveTurns(storage: Pick<Storage, "getItem"> | null): LiveTurn[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(THREAD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { turns?: unknown };
    if (!Array.isArray(parsed.turns)) return [];
    const next: LiveTurn[] = [];
    for (const item of parsed.turns) {
      if (!item || typeof item !== "object") continue;
      const turn = item as Record<string, unknown>;
      const role = turn.role === "assistant" || turn.role === "user" ? turn.role : null;
      const content = typeof turn.content === "string" ? turn.content.trim() : "";
      const id = typeof turn.id === "string" ? turn.id : "";
      if (!role || !content || !id) continue;
      const source = typeof turn.source === "string" ? turn.source : undefined;
      next.push({ id, role, content: content.slice(0, 800), source });
      if (next.length >= 8) break;
    }
    return next;
  } catch {
    return [];
  }
}

export function writeLiveTurns(storage: Pick<Storage, "setItem"> | null, next: LiveTurn[]) {
  storage?.setItem(THREAD_KEY, JSON.stringify({ version: 1, turns: next.slice(-8) }));
}

export function subscribeLive(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLiveTurns(): LiveTurn[] {
  if (typeof window === "undefined") return serverTurns;
  if (!ready) {
    turns = readLiveTurns(window.sessionStorage);
    ready = true;
  }
  return turns;
}

export function getLiveServerTurns(): LiveTurn[] {
  return serverTurns;
}

export function setLiveTurns(next: LiveTurn[]) {
  const sliced = next.slice(-8);
  if (typeof window !== "undefined") writeLiveTurns(window.sessionStorage, sliced);
  publish(sliced);
}

export function loadWellnessMeter(
  storage: Pick<Storage, "getItem" | "setItem"> | null,
  createId: () => string = () => crypto.randomUUID(),
): string {
  if (!storage) return "";
  const existing = storage.getItem(METER_KEY) ?? "";
  if (METER.test(existing)) return existing;
  const created = createId();
  if (!METER.test(created)) return "";
  storage.setItem(METER_KEY, created);
  return created;
}

export function clearLiveSession(storage: Pick<Storage, "removeItem"> | null) {
  storage?.removeItem(THREAD_KEY);
  storage?.removeItem(METER_KEY);
  if (storage && typeof window !== "undefined" && storage === window.sessionStorage) publish([]);
}

export function resetLiveForTests() {
  turns = [];
  ready = false;
  listeners.clear();
}
