/**
 * Focus & Brain Training: the Pomodoro timer as plain data, so it can be tested
 * and saved without a browser.
 *
 * The standard method: choose one task, focus for 25 minutes, take a 5-minute
 * break, repeat four times, then take a longer break of 15 to 30 minutes.
 *
 * Time is kept as an end timestamp while running, so a tab in the background
 * or a phone with the screen off still shows the right time when it returns.
 */
export type Phase = "focus" | "short" | "long";

export const PRESET_IDS = ["15-5", "25-5", "45-10"] as const;
export type PresetId = (typeof PRESET_IDS)[number];

export type Preset = { id: PresetId; focus: number; short: number };

export const PRESETS: readonly Preset[] = [
  { id: "15-5", focus: 15, short: 5 },
  { id: "25-5", focus: 25, short: 5 },
  { id: "45-10", focus: 45, short: 10 },
];

/** The standard 25/5 method is the default. */
export const DEFAULT_PRESET: PresetId = "25-5";

export const LONG_BREAK_CHOICES = [15, 20, 30] as const;
export type LongBreakMinutes = (typeof LONG_BREAK_CHOICES)[number];
export const DEFAULT_LONG_BREAK: LongBreakMinutes = 20;

/** Focus sessions before the long break. */
export const CYCLE_LENGTH = 4;

export const TASK_LIMIT = 120;

export type TimerState = {
  preset: PresetId;
  longMinutes: LongBreakMinutes;
  phase: Phase;
  /** Which focus session of the cycle this is (1 to 4). During a break, the one just finished. */
  round: number;
  running: boolean;
  /** Epoch milliseconds when the current phase ends. Only set while running. */
  endsAt: number | null;
  /** Time left while paused or not started. */
  remainingMs: number;
  /** Has this phase been started at least once? Decides between Start and Resume. */
  started: boolean;
  /** The one task the person chose for this cycle. Stays in this tab only. */
  task: string;
};

export function presetById(id: PresetId): Preset {
  return PRESETS.find((preset) => preset.id === id) ?? PRESETS[1];
}

export function isPresetId(value: unknown): value is PresetId {
  return typeof value === "string" && (PRESET_IDS as readonly string[]).includes(value);
}

export function isLongBreak(value: unknown): value is LongBreakMinutes {
  return typeof value === "number" && (LONG_BREAK_CHOICES as readonly number[]).includes(value);
}

export function phaseMinutes(preset: PresetId, longMinutes: LongBreakMinutes, phase: Phase): number {
  if (phase === "long") return longMinutes;
  const chosen = presetById(preset);
  return phase === "focus" ? chosen.focus : chosen.short;
}

export function phaseMs(state: Pick<TimerState, "preset" | "longMinutes" | "phase">): number {
  return phaseMinutes(state.preset, state.longMinutes, state.phase) * 60_000;
}

export function initialTimer(preset: PresetId = DEFAULT_PRESET, longMinutes: LongBreakMinutes = DEFAULT_LONG_BREAK, task = ""): TimerState {
  const base = { preset, longMinutes, phase: "focus" as Phase };
  return { ...base, round: 1, running: false, endsAt: null, remainingMs: phaseMs(base), started: false, task };
}

/** Milliseconds left in the current phase, never below zero. */
export function remainingMs(state: TimerState, now: number): number {
  if (state.running && state.endsAt !== null) return Math.max(0, state.endsAt - now);
  return Math.max(0, state.remainingMs);
}

/** 0 at the start of a phase, 1 when it ends. */
export function phaseProgress(state: TimerState, now: number): number {
  const total = phaseMs(state);
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, 1 - remainingMs(state, now) / total));
}

export function startTimer(state: TimerState, now: number): TimerState {
  if (state.running) return state;
  const left = state.remainingMs > 0 ? state.remainingMs : phaseMs(state);
  return { ...state, running: true, started: true, endsAt: now + left, remainingMs: left };
}

export function pauseTimer(state: TimerState, now: number): TimerState {
  if (!state.running) return state;
  return { ...state, running: false, endsAt: null, remainingMs: remainingMs(state, now) };
}

/** Back to the start of the current phase, stopped. */
export function resetPhase(state: TimerState): TimerState {
  return { ...state, running: false, endsAt: null, remainingMs: phaseMs(state), started: false };
}

/** Back to the first focus session of a new cycle, stopped. The task and settings stay. */
export function resetCycle(state: TimerState): TimerState {
  return initialTimer(state.preset, state.longMinutes, state.task);
}

/** What follows the current phase: a short break, the long break after the fourth focus, or the next focus. */
export function nextPhase(state: Pick<TimerState, "phase" | "round">): { phase: Phase; round: number } {
  if (state.phase === "focus") return { phase: state.round >= CYCLE_LENGTH ? "long" : "short", round: state.round };
  if (state.phase === "short") return { phase: "focus", round: Math.min(CYCLE_LENGTH, state.round + 1) };
  return { phase: "focus", round: 1 };
}

/** Moves to the next phase. With `autoStart`, it starts counting at `now`. */
export function advance(state: TimerState, now: number, autoStart: boolean): TimerState {
  const next = nextPhase(state);
  const moved = { ...state, ...next };
  const total = phaseMs(moved);
  return autoStart
    ? { ...moved, running: true, started: true, endsAt: now + total, remainingMs: total }
    : { ...moved, running: false, started: false, endsAt: null, remainingMs: total };
}

/** True when the running phase has reached zero. */
export function isFinished(state: TimerState, now: number): boolean {
  return state.running && remainingMs(state, now) === 0;
}

/** Choosing new lengths restarts the cycle unless a phase is under way; then it waits. */
export function changeLengths(state: TimerState, preset: PresetId, longMinutes: LongBreakMinutes): TimerState {
  if (state.started) return { ...state, preset, longMinutes };
  const next = { ...state, preset, longMinutes };
  return { ...next, remainingMs: phaseMs(next) };
}

/** "25:00". Hours are shown as minutes, since no phase is longer than 45 minutes. */
export function formatClock(ms: number): string {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function cleanTask(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trimStart().slice(0, TASK_LIMIT);
}

export const TIMER_STORAGE_KEY = "lifezoi.focus.timer.v1";

export function serializeTimer(state: TimerState): string {
  return JSON.stringify(state);
}

/** Reads a saved timer defensively. Anything unexpected starts a fresh cycle. */
export function parseTimer(raw: string | null | undefined, now: number): TimerState | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const value = data as Record<string, unknown>;
  if (!isPresetId(value.preset) || !isLongBreak(value.longMinutes)) return null;
  const phase: Phase | null = value.phase === "focus" || value.phase === "short" || value.phase === "long" ? value.phase : null;
  if (!phase) return null;
  const round = typeof value.round === "number" && Number.isInteger(value.round) ? Math.min(CYCLE_LENGTH, Math.max(1, value.round)) : 1;
  const base = { preset: value.preset, longMinutes: value.longMinutes, phase };
  const total = phaseMs(base);
  const left = typeof value.remainingMs === "number" && Number.isFinite(value.remainingMs) ? Math.min(total, Math.max(0, value.remainingMs)) : total;
  const endsAt = typeof value.endsAt === "number" && Number.isFinite(value.endsAt) ? value.endsAt : null;
  // A running timer must end within one phase length from now, or it is stale.
  const running = value.running === true && endsAt !== null && endsAt - now <= total;
  return {
    ...base,
    round,
    running,
    endsAt: running ? endsAt : null,
    remainingMs: running && endsAt !== null ? Math.max(0, endsAt - now) : left,
    started: value.started === true,
    task: cleanTask(value.task),
  };
}
