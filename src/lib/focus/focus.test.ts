import { describe, expect, it } from "vitest";
import { BREAK_ACTIVITIES, LONG_BREAKS, SHORT_BREAKS, suggestBreak } from "@/lib/focus/activities";
import {
  emptyFocus,
  focusDay,
  recordBreak,
  recordFocusSession,
  sanitizeFocus,
  weekHistory,
  weekTotals,
  withPrefs,
} from "@/lib/focus/progress";
import {
  advance,
  changeLengths,
  formatClock,
  initialTimer,
  isFinished,
  nextPhase,
  parseTimer,
  pauseTimer,
  phaseProgress,
  remainingMs,
  resetCycle,
  resetPhase,
  serializeTimer,
  startTimer,
} from "@/lib/focus/timer";
import { emptyCompanion, sanitizeCompanion } from "@/lib/companion/state";

const MIN = 60_000;

describe("focus timer", () => {
  it("defaults to the standard 25 minute focus with a 5 minute break", () => {
    const timer = initialTimer();
    expect(timer.preset).toBe("25-5");
    expect(timer.phase).toBe("focus");
    expect(timer.round).toBe(1);
    expect(remainingMs(timer, 0)).toBe(25 * MIN);
    expect(formatClock(remainingMs(timer, 0))).toBe("25:00");
  });

  it("starts, pauses, and resumes from the time that was left", () => {
    let timer = startTimer(initialTimer(), 1000);
    expect(timer.running).toBe(true);
    expect(remainingMs(timer, 1000 + 10 * MIN)).toBe(15 * MIN);
    timer = pauseTimer(timer, 1000 + 10 * MIN);
    expect(timer.running).toBe(false);
    // Time passing while paused changes nothing.
    expect(remainingMs(timer, 1000 + 60 * MIN)).toBe(15 * MIN);
    timer = startTimer(timer, 5_000_000);
    expect(remainingMs(timer, 5_000_000 + 5 * MIN)).toBe(10 * MIN);
    expect(phaseProgress(timer, 5_000_000 + 5 * MIN)).toBeCloseTo(0.6);
  });

  it("resets the current phase", () => {
    const timer = resetPhase(pauseTimer(startTimer(initialTimer(), 0), 3 * MIN));
    expect(timer.started).toBe(false);
    expect(remainingMs(timer, 0)).toBe(25 * MIN);
  });

  it("follows four focus sessions with short breaks, then a long break", () => {
    let state = { phase: "focus" as const, round: 1 };
    const order: string[] = [];
    let current: { phase: "focus" | "short" | "long"; round: number } = state;
    for (let i = 0; i < 9; i += 1) {
      order.push(`${current.phase}${current.round}`);
      current = nextPhase(current);
    }
    expect(order).toEqual(["focus1", "short1", "focus2", "short2", "focus3", "short3", "focus4", "long4", "focus1"]);
    state = { phase: "focus", round: 1 };
    expect(nextPhase(state).phase).toBe("short");
  });

  it("moves to the next phase on its own when one ends", () => {
    const timer = startTimer(initialTimer("15-5"), 0);
    expect(isFinished(timer, 15 * MIN - 1)).toBe(false);
    expect(isFinished(timer, 15 * MIN)).toBe(true);
    const next = advance(timer, 15 * MIN, true);
    expect(next.phase).toBe("short");
    expect(next.running).toBe(true);
    expect(remainingMs(next, 15 * MIN)).toBe(5 * MIN);
    const waiting = advance(timer, 15 * MIN, false);
    expect(waiting.running).toBe(false);
    expect(waiting.started).toBe(false);
  });

  it("uses the chosen long break length", () => {
    const fourth = { ...initialTimer("45-10", 30), round: 4 };
    const long = advance(fourth, 0, false);
    expect(long.phase).toBe("long");
    expect(remainingMs(long, 0)).toBe(30 * MIN);
    expect(resetCycle(long).round).toBe(1);
  });

  it("applies new lengths at once only before a phase starts", () => {
    expect(remainingMs(changeLengths(initialTimer(), "45-10", 20), 0)).toBe(45 * MIN);
    const running = startTimer(initialTimer(), 0);
    expect(remainingMs(changeLengths(running, "15-5", 20), 0)).toBe(25 * MIN);
  });

  it("restores a saved timer and rejects damaged or stale ones", () => {
    const running = { ...startTimer(initialTimer(), 0), task: "Write a letter" };
    const restored = parseTimer(serializeTimer(running), 10 * MIN);
    expect(restored?.running).toBe(true);
    expect(restored && remainingMs(restored, 10 * MIN)).toBe(15 * MIN);
    expect(restored?.task).toBe("Write a letter");
    expect(parseTimer("not json", 0)).toBeNull();
    expect(parseTimer(JSON.stringify({ preset: "99-1" }), 0)).toBeNull();
    // An end time far in the future is not trusted.
    const stale = parseTimer(JSON.stringify({ ...running, endsAt: 10 ** 13 }), 0);
    expect(stale?.running).toBe(false);
  });
});

describe("focus progress", () => {
  it("counts finished sessions, minutes, and breaks by day", () => {
    let state = emptyFocus();
    state = recordFocusSession(state, "2026-11-10", 25);
    state = recordBreak(state, "2026-11-10");
    state = recordFocusSession(state, "2026-11-10", 25);
    state = recordFocusSession(state, "2026-11-08", 15);
    expect(focusDay(state, "2026-11-10")).toEqual({ date: "2026-11-10", sessions: 2, minutes: 50, breaks: 1 });
    const week = weekHistory(state, "2026-11-10");
    expect(week.map((day) => day.date)).toEqual([
      "2026-11-04",
      "2026-11-05",
      "2026-11-06",
      "2026-11-07",
      "2026-11-08",
      "2026-11-09",
      "2026-11-10",
    ]);
    expect(weekTotals(week)).toEqual({ sessions: 3, minutes: 65, breaks: 1, activeDays: 2 });
  });

  it("cleans saved data and keeps settings within the allowed choices", () => {
    const clean = sanitizeFocus({
      days: [{ date: "2026-02-30", sessions: 3 }, { date: "2026-11-01", sessions: -2, minutes: 1e9, breaks: "x" }, "junk"],
      prefs: { preset: "99-1", longMinutes: 17, sound: false, musicInFocus: true },
    });
    expect(clean.days).toEqual([{ date: "2026-11-01", sessions: 0, minutes: 1440, breaks: 0 }]);
    expect(clean.prefs).toEqual({ preset: "25-5", longMinutes: 20, sound: false, autoNext: true, musicInFocus: true, voice: false });
    expect(withPrefs(emptyFocus(), { preset: "45-10" }).prefs.preset).toBe("45-10");
  });

  it("is saved inside the companion state and survives a round trip", () => {
    const state = { ...emptyCompanion(), focus: recordFocusSession(emptyFocus(), "2026-11-10", 25) };
    const again = sanitizeCompanion(JSON.parse(JSON.stringify(state)));
    expect(again.focus.days[0]).toEqual({ date: "2026-11-10", sessions: 1, minutes: 25, breaks: 0 });
    expect(sanitizeCompanion({}).focus).toEqual(emptyFocus());
  });
});

describe("break activities", () => {
  it("offers every requested kind of break, each with steps", () => {
    const ids = SHORT_BREAKS.map((item) => item.id);
    for (const id of ["hands", "stretch", "chair", "breathing", "eyes", "walk", "water", "mindful"]) expect(ids).toContain(id);
    expect(LONG_BREAKS.length).toBeGreaterThan(0);
    for (const item of BREAK_ACTIVITIES) expect(item.steps.length).toBeGreaterThan(1);
    expect(new Set(BREAK_ACTIVITIES.map((item) => item.id)).size).toBe(BREAK_ACTIVITIES.length);
  });

  it("suggests a different short break each round and a long one after four", () => {
    const seen = new Set([1, 2, 3, 4].map((round) => suggestBreak("short", round, 0).id));
    expect(seen.size).toBe(4);
    expect(suggestBreak("long", 4, 0).kind).toBe("long");
    expect(suggestBreak("short", 1, 0, 1).id).not.toBe(suggestBreak("short", 1, 0).id);
  });
});
