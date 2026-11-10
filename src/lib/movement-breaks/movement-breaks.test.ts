import { describe, expect, it } from "vitest";
import { emptyCompanion, sanitizeCompanion, MAX_MOVEMENT_BREAKS } from "@/lib/companion/state";
import { coerceHealthProfile } from "@/lib/health-profile";
import { MB, REFERENCES, ROUTINE, ROUTINE_SECONDS } from "@/lib/movement-breaks/content";
import { addMovementBreak, breakHistory, cleanReminder, isTracked, reminderDue, sittingProfile, sittingReasons } from "@/lib/movement-breaks/personal";

const base = { dailySetting: [], sedentaryHours: "", activityDays: "", walking: "", strength: "", hydration: "" } as const;

describe("sitting profile from existing answers", () => {
  it("is empty when there are no answers or blank answers", () => {
    expect(sittingProfile(null).highlight).toBe(false);
    expect(sittingReasons({ ...base, dailySetting: [] })).toEqual([]);
  });

  it("highlights office, computer, television, long sitting, and low activity", () => {
    const profile = sittingProfile({ ...base, dailySetting: ["office", "computer", "television"], sedentaryHours: "8", activityDays: "1", walking: "rarely", hydration: "most-days" });
    expect(profile.highlight).toBe(true);
    expect(profile.reasons).toEqual(["office", "computer", "television", "many-hours", "low-activity"]);
    expect(profile.current.map((line) => line.text).join(" ")).toMatch(/about 8 hours/);
    expect(profile.current.some((line) => line.id === "water-only")).toBe(true);
    expect(profile.next.every((line) => line.why)).toBe(true);
  });

  it("does not flag someone who sits a little and is active", () => {
    expect(sittingProfile({ ...base, dailySetting: ["on-my-feet"], sedentaryHours: "3", activityDays: "5" }).highlight).toBe(false);
  });
});

describe("the work and daily activity answer", () => {
  it("keeps only known values and lets prefer-not stand alone", () => {
    expect(coerceHealthProfile({ dailySetting: ["office", "made-up", "office"] }).dailySetting).toEqual(["office"]);
    expect(coerceHealthProfile({ dailySetting: ["prefer-not"] }).dailySetting).toEqual(["prefer-not"]);
    expect(coerceHealthProfile({ dailySetting: ["prefer-not", "computer"] }).dailySetting).toEqual(["computer"]);
    expect(coerceHealthProfile({}).dailySetting).toEqual([]);
  });
});

describe("movement break tracking", () => {
  it("counts breaks, ticks the tracker once, and adds exercise minutes", () => {
    let state = addMovementBreak(emptyCompanion(), "2026-11-10");
    state = addMovementBreak(state, "2026-11-10");
    const day = state.days["2026-11-10"];
    expect(day?.movementBreaks).toBe(2);
    expect(day?.exerciseMinutes).toBe(6);
    expect(isTracked(day, "mb-break")).toBe(true);
  });

  it("survives saving and loading, and caps nonsense counts", () => {
    const state = addMovementBreak(emptyCompanion(), "2026-11-10");
    expect(sanitizeCompanion(JSON.parse(JSON.stringify(state))).days["2026-11-10"]?.movementBreaks).toBe(1);
    const odd = sanitizeCompanion({ days: { "2026-11-10": { movementBreaks: 9999 } } });
    expect(odd.days["2026-11-10"]?.movementBreaks).toBe(MAX_MOVEMENT_BREAKS);
    const old = sanitizeCompanion({ days: { "2026-11-09": { walkingMinutes: 10 } } });
    expect(old.days["2026-11-09"]?.movementBreaks).toBe(0);
  });

  it("lists the last seven days, oldest first, across a month boundary", () => {
    const state = addMovementBreak(emptyCompanion(), "2026-11-01");
    const week = breakHistory(state, "2026-11-03");
    expect(week).toHaveLength(7);
    expect(week[0]?.date).toBe("2026-10-28");
    expect(week.find((item) => item.date === "2026-11-01")?.breaks).toBe(1);
  });
});

describe("the optional reminder", () => {
  it("is off by default and due only after the chosen time", () => {
    expect(cleanReminder(null).on).toBe(false);
    const settings = cleanReminder({ on: true, minutes: 30, since: 1_000 });
    expect(reminderDue(settings, 1_000 + 29 * 60_000)).toBe(false);
    expect(reminderDue(settings, 1_000 + 30 * 60_000)).toBe(true);
    expect(cleanReminder({ on: true, minutes: 7, since: -5 })).toEqual({ on: true, minutes: 30, since: 0 });
  });
});

describe("content safety", () => {
  const all = JSON.stringify(MB) + JSON.stringify(ROUTINE);

  it("keeps the routine to about 2 to 3 minutes with a seated choice for every step", () => {
    expect(ROUTINE_SECONDS).toBeGreaterThanOrEqual(120);
    expect(ROUTINE_SECONDS).toBeLessThanOrEqual(180);
    for (const step of ROUTINE) expect(step.seated.length).toBeGreaterThan(10);
  });

  it("never prescribes a water amount, detox, or a guaranteed effect", () => {
    expect(all).not.toMatch(/\b\d+(\.\d+)?\s*(litres?|liters?|glasses|cups|ml|oz)\b/i);
    expect(all).not.toMatch(/detoxif/i);
    expect(all).not.toMatch(/(?<!not )prevents? (blood )?clots/i);
    expect(all).toMatch(/do not prevent blood clots/);
    expect(all).toMatch(/heart failure, kidney disease/);
    expect(all).toMatch(/one leg needs prompt medical evaluation/);
    expect(all).toMatch(/Never hold your breath/);
    expect(all).toMatch(/not a medical deadline/);
  });

  it("marks each reference as read or still to be read", () => {
    expect(REFERENCES.length).toBe(7);
    expect(REFERENCES.filter((ref) => ref.readDuringBuild).map((ref) => ref.id)).toEqual(["sedentary-physiology", "ada-activity"]);
    for (const ref of REFERENCES) expect(ref.url).toMatch(/^https:\/\//);
  });
});
