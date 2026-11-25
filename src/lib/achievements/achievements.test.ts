import { describe, expect, it } from "vitest";
import { activityDays, AREA_IDS, currentRun, daysThisWeek, runHistory, weekGrid, type ActivityDays } from "@/lib/achievements/activity";
import { badgeStatuses, nextBadges, recentBadges } from "@/lib/achievements/badges";
import { emptyCalorieLog } from "@/lib/calories/storage";
import { emptyCompanion, emptyDay } from "@/lib/companion/state";
import { addIsoDays } from "@/lib/dates";
import { emptyAcademy } from "@/lib/growth-academy/progress";

const TODAY = "2026-11-25"; // a Wednesday

function none(): ActivityDays {
  return Object.fromEntries(AREA_IDS.map((id) => [id, []])) as unknown as ActivityDays;
}

const run = (start: string, length: number) => Array.from({ length }, (_, i) => addIsoDays(start, i));

describe("site-wide activity days", () => {
  it("is empty when nothing is saved", () => {
    const days = activityDays({ companion: emptyCompanion(), academy: emptyAcademy(), calories: emptyCalorieLog(), readings: [] }, TODAY);
    for (const id of AREA_IDS) expect(days[id]).toEqual([]);
    expect(badgeStatuses(days).every((badge) => !badge.earnedOn && badge.progress === 0)).toBe(true);
  });

  it("reads each area from the records that already exist", () => {
    const companion = emptyCompanion();
    companion.days["2026-11-20"] = { ...emptyDay("2026-11-20"), walkingMinutes: 15 };
    companion.days["2026-11-21"] = { ...emptyDay("2026-11-21"), entries: { "mb-water": { status: "done", minutes: 0, replacedWith: "" } } };
    companion.guided.sessions.push({ id: "g1", session: "s", kind: "meditation", date: "2026-11-22", seconds: 300 });
    companion.breathe.sessions.push({ id: "b1", date: "2026-11-23", seconds: 120, complete: true, feltAfter: null } as never);
    companion.focus.days.push({ date: "2026-11-24", sessions: 1, minutes: 25, breaks: 0 });
    companion.daily.feelings["2026-11-25"] = "okay";
    companion.courses.progress = { sleep: { startedOn: "2026-11-19", done: [{ day: 1, date: "2026-11-19" }] } } as never;
    const academy = { ...emptyAcademy(), days: ["2026-11-18"] };
    const calories = { ...emptyCalorieLog(), days: { "2026-11-17": [{ id: "x" } as never], "2026-11-16": [] } };
    const readings = [{ id: "r", kind: "blood_pressure", measuredAt: new Date(2026, 10, 15, 9).toISOString(), systolic: 120, diastolic: 80, pulse: null, note: "" } as const];

    const days = activityDays({ companion, academy, calories, readings }, TODAY);
    expect(days.movement).toEqual(["2026-11-20"]); // water alone is not movement
    expect(days.breathing).toEqual(["2026-11-22", "2026-11-23"]);
    expect(days.quiz).toEqual(["2026-11-24"]);
    expect(days.checkin).toEqual(["2026-11-25"]);
    expect(days.learning).toEqual(["2026-11-18", "2026-11-19"]);
    expect(days.meals).toEqual(["2026-11-17"]); // an empty day is not a meal
    expect(days.diary).toEqual(["2026-11-15"]);
  });

  it("leaves out a date after today", () => {
    const companion = emptyCompanion();
    companion.daily.feelings["2026-12-01"] = "great";
    const days = activityDays({ companion, academy: emptyAcademy(), calories: emptyCalorieLog(), readings: [] }, TODAY);
    expect(days.checkin).toEqual([]);
  });
});

describe("days in a row", () => {
  it("keeps yesterday's run while today is still open, and never goes below zero", () => {
    expect(currentRun(run("2026-11-21", 4), TODAY)).toBe(4); // 21–24, today not yet
    expect(currentRun(run("2026-11-21", 5), TODAY)).toBe(5); // includes today
    expect(currentRun(run("2026-11-10", 3), TODAY)).toBe(0);
    expect(currentRun([], TODAY)).toBe(0);
  });

  it("remembers the longest run and when each length was first reached", () => {
    const { longest, reachedOn } = runHistory([...run("2026-11-01", 3), ...run("2026-11-10", 5)]);
    expect(longest).toBe(5);
    expect(reachedOn.get(3)).toBe("2026-11-03");
    expect(reachedOn.get(5)).toBe("2026-11-14");
  });

  it("counts this week from Monday and builds a calendar that ends today", () => {
    expect(daysThisWeek(["2026-11-22", "2026-11-23", "2026-11-25"], TODAY)).toBe(2);
    const grid = weekGrid(["2026-11-25"], TODAY, 2);
    expect(grid).toHaveLength(2);
    expect(grid[1].monday).toBe("2026-11-23");
    expect(grid[1].days[2]).toEqual({ date: TODAY, active: true });
    expect(grid[1].days[3]).toBeNull();
  });
});

describe("badges", () => {
  it("are earned on the day the rule was first met, on any days", () => {
    const days = none();
    days.breathing = ["2026-10-01", "2026-10-05", "2026-10-09", "2026-10-12", "2026-10-20", "2026-11-02", "2026-11-03"];
    const byId = new Map(badgeStatuses(days).map((badge) => [badge.id, badge]));
    expect(byId.get("breathing-first")?.earnedOn).toBe("2026-10-01");
    expect(byId.get("breathing-seven")?.earnedOn).toBe("2026-11-03");
    expect(byId.get("breathing-thirty")).toMatchObject({ earnedOn: "", progress: 7, goal: 30 });
    expect(byId.get("run-3")).toMatchObject({ earnedOn: "", progress: 2 });
  });

  it("keeps a run badge after a pause", () => {
    const days = none();
    days.movement = [...run("2026-10-01", 7), "2026-11-20"];
    const byId = new Map(badgeStatuses(days).map((badge) => [badge.id, badge]));
    expect(byId.get("run-7")?.earnedOn).toBe("2026-10-07");
    expect(byId.get("run-3")?.earnedOn).toBe("2026-10-03");
  });

  it("counts different areas and a full week across areas", () => {
    const days = none();
    days.meals = ["2026-11-16"];
    days.quiz = ["2026-11-17"];
    days.diary = ["2026-11-18"];
    days.checkin = ["2026-11-20", "2026-11-22"];
    const byId = new Map(badgeStatuses(days).map((badge) => [badge.id, badge]));
    expect(byId.get("explorer")?.earnedOn).toBe("2026-11-20");
    expect(byId.get("full-week")?.earnedOn).toBe("2026-11-22");
    expect(byId.get("all-round")).toMatchObject({ earnedOn: "", progress: 4 });
  });

  it("lists recent badges newest first and next steps that are already under way", () => {
    const days = none();
    days.meals = run("2026-11-01", 3);
    const statuses = badgeStatuses(days);
    expect(recentBadges(statuses).map((badge) => badge.id)).toEqual(["run-3", "meals-first"]);
    const next = nextBadges(statuses);
    expect(next.length).toBeGreaterThan(0);
    expect(next.every((badge) => !badge.earnedOn && badge.progress > 0)).toBe(true);
  });

  it("uses gentle words and no loss language", () => {
    const words = badgeStatuses(none())
      .map((badge) => `${badge.title} ${badge.text}`)
      .join(" ")
      .toLowerCase();
    for (const word of ["lost", "missed", "broke", "fail", "don't break"]) expect(words).not.toContain(word);
  });
});
