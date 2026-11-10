import { isRealISODate } from "@/lib/dates";

/**
 * Breathe for Life: what the person recorded. It lives inside the companion state,
 * so it follows the same save path (this browser, then the companion_state table
 * for a signed-in account when that table exists).
 *
 * Everything here is self-reported. Nothing is a nitric oxide measurement.
 */

export const PRACTICE_FREQUENCY = ["rarely", "sometimes", "often"] as const;
export type PracticeFrequency = (typeof PRACTICE_FREQUENCY)[number];

export const MOUTH_BREATHING = ["often", "sometimes", "rarely", "not-sure"] as const;
export type MouthBreathing = (typeof MOUTH_BREATHING)[number];

export const HABIT_FREQUENCY = ["rarely", "some-days", "most-days"] as const;
export type HabitFrequency = (typeof HABIT_FREQUENCY)[number];

/** Answers to the short habit questions, at the start and at the end of a challenge. */
export type BreatheHabits = {
  practice: PracticeFrequency | "";
  mouthBreathing: MouthBreathing | "";
  greens: HabitFrequency | "";
  walking: HabitFrequency | "";
  /** 1 calm, 5 very stressed. */
  stress: number | null;
  /** 1 hard to relax, 5 relaxes easily. */
  relaxation: number | null;
};

export type BreatheSession = {
  id: string;
  date: string;
  seconds: number;
  /** The whole guided session was finished. Stopping early is always fine. */
  complete: boolean;
  /** How relaxed the person felt afterwards, 1 to 5, if they answered. */
  feltAfter: number | null;
};

export type ChallengeCheckIn = { date: string; stress: number | null; relaxation: number | null };

export type ChallengeExtras = { date: string; walked: boolean; greens: boolean };

export type BreatheChallenge = {
  startedOn: string;
  round: number;
  before: BreatheHabits;
  after: BreatheHabits | null;
  checkIns: ChallengeCheckIn[];
  extras: ChallengeExtras[];
  /** How the person feels at the end, in their own words. */
  feeling: string;
  finishedOn: string;
};

export type PastChallenge = { startedOn: string; finishedOn: string; round: number; sessions: number };

export type BreatheState = {
  /** Weekdays for the four recommended sessions. 0 is Monday, 6 is Sunday. */
  days: number[];
  sessions: BreatheSession[];
  challenge: BreatheChallenge | null;
  past: PastChallenge[];
  voice: boolean;
  pace: "gentle" | "standard";
  length: "quick" | "short" | "full";
};

export const BREATHE_LIMITS = { sessions: 365, checkIns: 40, extras: 40, past: 12, feeling: 280 } as const;
export const DEFAULT_DAYS = [0, 2, 4, 6] as const;

export function emptyHabits(): BreatheHabits {
  return { practice: "", mouthBreathing: "", greens: "", walking: "", stress: null, relaxation: null };
}

export function emptyBreathe(): BreatheState {
  return { days: [...DEFAULT_DAYS], sessions: [], challenge: null, past: [], voice: true, pace: "gentle", length: "full" };
}

export function isEmptyBreathe(state: BreatheState): boolean {
  return state.sessions.length === 0 && state.challenge === null && state.past.length === 0;
}

// ---------- sanitizing ----------

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | "" {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : "";
}

function scale(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5 ? value : null;
}

function date(value: unknown): string {
  return typeof value === "string" && isRealISODate(value) ? value : "";
}

function text(value: unknown, limit: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, limit);
}

const ID = /^[A-Za-z0-9:_-]{1,80}$/;

export function sanitizeHabits(input: unknown): BreatheHabits {
  const row = asRecord(input);
  return {
    practice: oneOf(row.practice, PRACTICE_FREQUENCY),
    mouthBreathing: oneOf(row.mouthBreathing, MOUTH_BREATHING),
    greens: oneOf(row.greens, HABIT_FREQUENCY),
    walking: oneOf(row.walking, HABIT_FREQUENCY),
    stress: scale(row.stress),
    relaxation: scale(row.relaxation),
  };
}

function sanitizeSession(input: unknown): BreatheSession | null {
  const row = asRecord(input);
  const id = typeof row.id === "string" && ID.test(row.id) ? row.id : "";
  const day = date(row.date);
  const seconds = typeof row.seconds === "number" && Number.isFinite(row.seconds) ? Math.round(row.seconds) : -1;
  if (!id || !day || seconds < 1 || seconds > 3600) return null;
  return { id, date: day, seconds, complete: row.complete === true, feltAfter: scale(row.feltAfter) };
}

function sanitizeChallenge(input: unknown): BreatheChallenge | null {
  const row = asRecord(input);
  const startedOn = date(row.startedOn);
  if (!startedOn) return null;
  const round = typeof row.round === "number" && Number.isInteger(row.round) && row.round >= 1 && row.round <= 99 ? row.round : 1;
  const checkIns = (Array.isArray(row.checkIns) ? row.checkIns : [])
    .map((item): ChallengeCheckIn | null => {
      const c = asRecord(item);
      const day = date(c.date);
      return day ? { date: day, stress: scale(c.stress), relaxation: scale(c.relaxation) } : null;
    })
    .filter((item): item is ChallengeCheckIn => item !== null)
    .filter((item, index, all) => all.findIndex((other) => other.date === item.date) === index)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-BREATHE_LIMITS.checkIns);
  const extras = (Array.isArray(row.extras) ? row.extras : [])
    .map((item): ChallengeExtras | null => {
      const e = asRecord(item);
      const day = date(e.date);
      return day ? { date: day, walked: e.walked === true, greens: e.greens === true } : null;
    })
    .filter((item): item is ChallengeExtras => item !== null)
    .filter((item, index, all) => all.findIndex((other) => other.date === item.date) === index)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-BREATHE_LIMITS.extras);
  return {
    startedOn,
    round,
    before: sanitizeHabits(row.before),
    after: row.after ? sanitizeHabits(row.after) : null,
    checkIns,
    extras,
    feeling: text(row.feeling, BREATHE_LIMITS.feeling),
    finishedOn: date(row.finishedOn),
  };
}

export function sanitizeBreathe(input: unknown): BreatheState {
  const row = asRecord(input);
  const days = Array.isArray(row.days)
    ? [...new Set(row.days.filter((d): d is number => Number.isInteger(d) && d >= 0 && d <= 6))].sort((a, b) => a - b)
    : [...DEFAULT_DAYS];
  const sessions = (Array.isArray(row.sessions) ? row.sessions : [])
    .map(sanitizeSession)
    .filter((item): item is BreatheSession => item !== null)
    .filter((item, index, all) => all.findIndex((other) => other.id === item.id) === index)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-BREATHE_LIMITS.sessions);
  const past = (Array.isArray(row.past) ? row.past : [])
    .map((item): PastChallenge | null => {
      const p = asRecord(item);
      const startedOn = date(p.startedOn);
      const finishedOn = date(p.finishedOn);
      if (!startedOn || !finishedOn) return null;
      const round = typeof p.round === "number" && Number.isInteger(p.round) && p.round >= 1 ? Math.min(p.round, 99) : 1;
      const count = typeof p.sessions === "number" && Number.isInteger(p.sessions) && p.sessions >= 0 ? Math.min(p.sessions, 400) : 0;
      return { startedOn, finishedOn, round, sessions: count };
    })
    .filter((item): item is PastChallenge => item !== null)
    .slice(0, BREATHE_LIMITS.past);
  return {
    days: days.length > 0 ? days : [...DEFAULT_DAYS],
    sessions,
    challenge: row.challenge ? sanitizeChallenge(row.challenge) : null,
    past,
    voice: row.voice !== false,
    pace: row.pace === "standard" ? "standard" : "gentle",
    length: row.length === "short" || row.length === "quick" ? row.length : "full",
  };
}

// ---------- updates (pure) ----------

export function addSession(state: BreatheState, session: BreatheSession): BreatheState {
  const clean = sanitizeSession(session);
  if (!clean) return state;
  const sessions = [...state.sessions.filter((item) => item.id !== clean.id), clean]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-BREATHE_LIMITS.sessions);
  return { ...state, sessions };
}

export function rateSession(state: BreatheState, id: string, feltAfter: number | null): BreatheState {
  return { ...state, sessions: state.sessions.map((item) => (item.id === id ? { ...item, feltAfter: scale(feltAfter) } : item)) };
}

export function toggleDay(state: BreatheState, weekday: number): BreatheState {
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return state;
  const has = state.days.includes(weekday);
  // At least one day stays chosen, so the calendar always has a suggestion.
  if (has && state.days.length === 1) return state;
  const days = has ? state.days.filter((d) => d !== weekday) : [...state.days, weekday].sort((a, b) => a - b);
  return { ...state, days };
}

export function startChallenge(state: BreatheState, startedOn: string, before: BreatheHabits): BreatheState {
  if (!isRealISODate(startedOn)) return state;
  const previous = state.challenge;
  const past = previous
    ? [
        {
          startedOn: previous.startedOn,
          finishedOn: previous.finishedOn || startedOn,
          round: previous.round,
          sessions: state.sessions.filter((item) => item.date >= previous.startedOn && item.date < startedOn).length,
        },
        ...state.past,
      ].slice(0, BREATHE_LIMITS.past)
    : state.past;
  return {
    ...state,
    past,
    challenge: {
      startedOn,
      round: previous ? previous.round + 1 : 1,
      before: sanitizeHabits(before),
      after: null,
      checkIns: [],
      extras: [],
      feeling: "",
      finishedOn: "",
    },
  };
}

export function saveCheckIn(state: BreatheState, checkIn: ChallengeCheckIn): BreatheState {
  if (!state.challenge || !isRealISODate(checkIn.date)) return state;
  const clean = { date: checkIn.date, stress: scale(checkIn.stress), relaxation: scale(checkIn.relaxation) };
  const checkIns = [...state.challenge.checkIns.filter((item) => item.date !== clean.date), clean]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-BREATHE_LIMITS.checkIns);
  return { ...state, challenge: { ...state.challenge, checkIns } };
}

export function saveExtras(state: BreatheState, extras: ChallengeExtras): BreatheState {
  if (!state.challenge || !isRealISODate(extras.date)) return state;
  const clean = { date: extras.date, walked: extras.walked === true, greens: extras.greens === true };
  const list = [...state.challenge.extras.filter((item) => item.date !== clean.date), clean]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-BREATHE_LIMITS.extras);
  return { ...state, challenge: { ...state.challenge, extras: list } };
}

export function finishChallenge(state: BreatheState, finishedOn: string, after: BreatheHabits, feeling: string): BreatheState {
  if (!state.challenge || !isRealISODate(finishedOn)) return state;
  return {
    ...state,
    challenge: { ...state.challenge, after: sanitizeHabits(after), feeling: text(feeling, BREATHE_LIMITS.feeling), finishedOn },
  };
}
