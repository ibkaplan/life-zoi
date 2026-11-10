import { isRealISODate, localISODate } from "@/lib/dates";
import {
  DEFAULT_LONG_BREAK,
  DEFAULT_PRESET,
  isLongBreak,
  isPresetId,
  type LongBreakMinutes,
  type PresetId,
} from "@/lib/focus/timer";

/**
 * Focus & Brain Training: what the person finished, by day, and their settings.
 * It lives inside the companion state, so it follows the same save path as
 * Breathe for Life: this browser, then the companion_state table for a
 * signed-in account when that table exists. The task text is never saved here.
 */
export type FocusDay = {
  date: string;
  /** Focus sessions that ran to the end. */
  sessions: number;
  /** Minutes from those sessions. */
  minutes: number;
  /** Short and long breaks taken. */
  breaks: number;
};

export type FocusPrefs = {
  preset: PresetId;
  longMinutes: LongBreakMinutes;
  /** A soft chime when a session ends. */
  sound: boolean;
  /** The next session starts on its own when one ends. */
  autoNext: boolean;
  /** Background music plays during focus time and pauses for breaks. */
  musicInFocus: boolean;
  /** A short spoken note when a session changes. */
  voice: boolean;
};

export type FocusState = { days: FocusDay[]; prefs: FocusPrefs };

export const FOCUS_LIMITS = { days: 120, sessionsPerDay: 60, minutesPerDay: 24 * 60, breaksPerDay: 80 } as const;

export function defaultFocusPrefs(): FocusPrefs {
  return { preset: DEFAULT_PRESET, longMinutes: DEFAULT_LONG_BREAK, sound: true, autoNext: true, musicInFocus: false, voice: false };
}

export function emptyFocus(): FocusState {
  return { days: [], prefs: defaultFocusPrefs() };
}

export function isEmptyFocus(state: FocusState): boolean {
  return state.days.length === 0;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function count(value: unknown, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return 0;
  return Math.min(Math.round(value), max);
}

export function sanitizeFocus(input: unknown): FocusState {
  const record = asRecord(input);
  const prefs = asRecord(record.prefs);
  const defaults = defaultFocusPrefs();
  const seen = new Set<string>();
  const days = (Array.isArray(record.days) ? record.days : [])
    .map((item): FocusDay | null => {
      const row = asRecord(item);
      const date = typeof row.date === "string" && isRealISODate(row.date) ? row.date : "";
      if (!date || seen.has(date)) return null;
      seen.add(date);
      return {
        date,
        sessions: count(row.sessions, FOCUS_LIMITS.sessionsPerDay),
        minutes: count(row.minutes, FOCUS_LIMITS.minutesPerDay),
        breaks: count(row.breaks, FOCUS_LIMITS.breaksPerDay),
      };
    })
    .filter((day): day is FocusDay => day !== null && (day.sessions > 0 || day.minutes > 0 || day.breaks > 0))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, FOCUS_LIMITS.days);
  return {
    days,
    prefs: {
      preset: isPresetId(prefs.preset) ? prefs.preset : defaults.preset,
      longMinutes: isLongBreak(prefs.longMinutes) ? prefs.longMinutes : defaults.longMinutes,
      sound: typeof prefs.sound === "boolean" ? prefs.sound : defaults.sound,
      autoNext: typeof prefs.autoNext === "boolean" ? prefs.autoNext : defaults.autoNext,
      musicInFocus: typeof prefs.musicInFocus === "boolean" ? prefs.musicInFocus : defaults.musicInFocus,
      voice: typeof prefs.voice === "boolean" ? prefs.voice : defaults.voice,
    },
  };
}

export function emptyFocusDay(date: string): FocusDay {
  return { date, sessions: 0, minutes: 0, breaks: 0 };
}

export function focusDay(state: FocusState, date: string): FocusDay {
  return state.days.find((day) => day.date === date) ?? emptyFocusDay(date);
}

function withDay(state: FocusState, date: string, change: (day: FocusDay) => FocusDay): FocusState {
  const next = change(focusDay(state, date));
  return sanitizeFocus({ ...state, days: [next, ...state.days.filter((day) => day.date !== date)] });
}

/** A focus session that ran to the end. */
export function recordFocusSession(state: FocusState, date: string, minutes: number): FocusState {
  return withDay(state, date, (day) => ({ ...day, sessions: day.sessions + 1, minutes: day.minutes + Math.max(0, Math.round(minutes)) }));
}

/** A short or long break that was taken. */
export function recordBreak(state: FocusState, date: string): FocusState {
  return withDay(state, date, (day) => ({ ...day, breaks: day.breaks + 1 }));
}

export function withPrefs(state: FocusState, change: Partial<FocusPrefs>): FocusState {
  return sanitizeFocus({ ...state, prefs: { ...state.prefs, ...change } });
}

/** The seven days ending today, oldest first. Days with nothing are shown as zero. */
export function weekHistory(state: FocusState, today: string): FocusDay[] {
  const [year, month, day] = today.split("-").map(Number);
  const days: FocusDay[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = localISODate(new Date(year, month - 1, day - offset));
    days.push(focusDay(state, date));
  }
  return days;
}

export function weekTotals(days: readonly FocusDay[]): { sessions: number; minutes: number; breaks: number; activeDays: number } {
  return days.reduce(
    (sum, day) => ({
      sessions: sum.sessions + day.sessions,
      minutes: sum.minutes + day.minutes,
      breaks: sum.breaks + day.breaks,
      activeDays: sum.activeDays + (day.sessions > 0 ? 1 : 0),
    }),
    { sessions: 0, minutes: 0, breaks: 0, activeDays: 0 },
  );
}
