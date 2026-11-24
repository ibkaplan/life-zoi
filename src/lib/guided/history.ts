import { isRealISODate } from "@/lib/dates";
import { GUIDED_KINDS, type GuidedKind } from "@/lib/guided/types";

/**
 * Finished voice-guided sessions, newest first. Saved with the rest of the
 * companion state (this browser, and the signed-in account when the
 * companion_state table exists). Only the session id, kind, date, and length
 * are kept: nothing the person said or felt.
 */
export type GuidedRecord = {
  id: string;
  session: string;
  kind: GuidedKind;
  /** Local date, YYYY-MM-DD. */
  date: string;
  /** Time actually spent playing, without pauses. */
  seconds: number;
};

export type GuidedState = { sessions: GuidedRecord[] };

export const GUIDED_HISTORY_LIMIT = 300;
/** Kinds whose minutes also count as exercise minutes in the day's log. */
export const EXERCISE_KINDS: readonly GuidedKind[] = ["pilates", "yoga", "stretching", "mobility"];

export function emptyGuided(): GuidedState {
  return { sessions: [] };
}

export function isEmptyGuided(state: GuidedState): boolean {
  return state.sessions.length === 0;
}

function cleanRecord(value: unknown): GuidedRecord | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const id = typeof row.id === "string" && /^[a-z0-9-]{1,40}$/.test(row.id) ? row.id : null;
  const session = typeof row.session === "string" && /^[a-z0-9-]{1,60}$/.test(row.session) ? row.session : null;
  const kind = (GUIDED_KINDS as readonly unknown[]).includes(row.kind) ? (row.kind as GuidedKind) : null;
  const date = typeof row.date === "string" && isRealISODate(row.date) ? row.date : null;
  const seconds = typeof row.seconds === "number" && Number.isFinite(row.seconds) ? Math.min(4 * 3600, Math.max(0, Math.round(row.seconds))) : null;
  if (!id || !session || !kind || !date || seconds === null) return null;
  return { id, session, kind, date, seconds };
}

export function sanitizeGuided(value: unknown): GuidedState {
  const row = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const list = Array.isArray(row.sessions) ? row.sessions : [];
  const seen = new Set<string>();
  const sessions: GuidedRecord[] = [];
  for (const item of list) {
    const record = cleanRecord(item);
    if (!record || seen.has(record.id)) continue;
    seen.add(record.id);
    sessions.push(record);
    if (sessions.length >= GUIDED_HISTORY_LIMIT) break;
  }
  return { sessions };
}

export function addGuidedRecord(state: GuidedState, record: GuidedRecord): GuidedState {
  const clean = cleanRecord(record);
  if (!clean) return state;
  return { sessions: [clean, ...state.sessions.filter((item) => item.id !== clean.id)].slice(0, GUIDED_HISTORY_LIMIT) };
}

export function guidedOn(state: GuidedState, date: string): { sessions: number; minutes: number } {
  const today = state.sessions.filter((item) => item.date === date);
  return { sessions: today.length, minutes: Math.round(today.reduce((sum, item) => sum + item.seconds, 0) / 60) };
}

/** Saved minutes for one session: at least 1, so a finished short session still counts. */
export function recordMinutes(seconds: number): number {
  return Math.max(1, Math.round(seconds / 60));
}
