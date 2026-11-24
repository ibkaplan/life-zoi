import { describe, expect, it } from "vitest";
import { emptyCalorieLog } from "@/lib/calories/storage";
import type { PlateItem } from "@/lib/calories/types";
import { DAILY_FEELINGS, emptyCompanion, emptyDay } from "@/lib/companion/state";
import { factOfTheDay } from "@/lib/encyclopedia/facts";
import { gentleReminder, healthDaySummary, matchFeeling, partOfDay, type PartOfDay } from "@/lib/health-day/health-day";
import { activityBySlug } from "@/lib/wellness/academy";
import { LIBRARY_CATEGORIES } from "@/lib/music-library/catalog";
import { TRACK_ITEMS } from "@/lib/movement-breaks/personal";

const TODAY = "2026-11-24";

function item(meal: PlateItem["meal"], grams: number, kcal: number): PlateItem {
  return { id: `${meal}-${grams}`, meal, name: "Food", source: "usda-local", sourceRef: "1", sourceUrl: null, grams, per100g: { kcal, protein: 0, fat: 0, carbs: 0 }, fromPhoto: false };
}

describe("My Health Day summary", () => {
  it("stays empty when nothing was recorded, and still shows the Fact of the Day", () => {
    const summary = healthDaySummary(emptyCompanion(), emptyCalorieLog(), TODAY);
    expect(summary.habits).toEqual({ done: 0, total: TRACK_ITEMS.length });
    expect(summary.movement).toEqual({ minutes: 0, breaks: 0 });
    expect(summary.breathing).toEqual({ sessions: 0, minutes: 0 });
    expect(summary.food).toBeNull();
    expect(summary.fact.id).toBe(factOfTheDay(TODAY).id);
  });

  it("counts only today's own records", () => {
    const companion = emptyCompanion();
    companion.days[TODAY] = {
      ...emptyDay(TODAY),
      walkingMinutes: 10,
      exerciseMinutes: 6,
      movementBreaks: 2,
      entries: { "mb-water": { status: "done", minutes: 0, replacedWith: "" }, "mb-walk": { status: "partial", minutes: 0, replacedWith: "" }, "mb-calves": { status: "skipped", minutes: 0, replacedWith: "" } },
    };
    companion.days["2026-11-23"] = { ...emptyDay("2026-11-23"), walkingMinutes: 40 };
    companion.breathe.sessions = [
      { id: "a", date: TODAY, seconds: 300, complete: true, feltAfter: null },
      { id: "b", date: TODAY, seconds: 180, complete: false, feltAfter: null },
      { id: "c", date: "2026-11-23", seconds: 600, complete: true, feltAfter: null },
    ];
    const log = { ...emptyCalorieLog(), days: { [TODAY]: [item("breakfast", 200, 50), item("breakfast", 100, 100), item("lunch", 100, 250)], "2026-11-23": [item("dinner", 100, 900)] } };
    const summary = healthDaySummary(companion, log, TODAY);
    expect(summary.habits.done).toBe(2);
    expect(summary.movement).toEqual({ minutes: 16, breaks: 2 });
    expect(summary.breathing).toEqual({ sessions: 2, minutes: 8 });
    expect(summary.food).toEqual({ items: 3, meals: 2, kcal: 450 });
  });
});

describe("gentle reminders", () => {
  it("offers at most one soft nudge and none once the day's things are done", () => {
    const empty = healthDaySummary(emptyCompanion(), emptyCalorieLog(), TODAY);
    for (const part of ["morning", "afternoon", "evening"] as PartOfDay[]) {
      const text = gentleReminder(empty, part);
      expect(text).toBeTruthy();
      expect(text).not.toMatch(/must|should|need to|warning/i);
    }
    const busy = { ...empty, habits: { done: 3, total: 6 }, movement: { minutes: 20, breaks: 1 }, breathing: { sessions: 1, minutes: 5 } };
    expect(gentleReminder(busy, "morning")).toBeNull();
    expect(gentleReminder(busy, "afternoon")).toBeNull();
    expect(gentleReminder(busy, "evening")).toBeNull();
  });

  it("splits the day at noon and 6 pm", () => {
    expect(partOfDay(7)).toBe("morning");
    expect(partOfDay(12)).toBe("afternoon");
    expect(partOfDay(18)).toBe("evening");
  });
});

describe("matching to how the person feels", () => {
  it("always points to things that exist in the libraries", () => {
    for (const feeling of DAILY_FEELINGS)
      for (const part of ["morning", "afternoon", "evening"] as PartOfDay[]) {
        const match = matchFeeling(feeling, part);
        expect(LIBRARY_CATEGORIES).toContain(match.music.category);
        expect(match.breathing.href).toBe("/breathe/practice");
        const slug = match.movement.href.replace("/academy/move/", "");
        if (slug !== "breaks") expect(activityBySlug(slug)?.title).toBe(match.movement.title);
      }
  });

  it("keeps low energy gentle and seated", () => {
    for (const part of ["morning", "afternoon", "evening"] as PartOfDay[]) {
      const match = matchFeeling("low", part);
      expect(["/academy/move/easy-reach", "/academy/move/ankle-circles"]).toContain(match.movement.href);
      expect(["nature", "sleep"]).toContain(match.music.category);
    }
  });

  it("suggests calmer music in the evening", () => {
    expect(matchFeeling("okay", "evening").music.category).toBe("sleep");
    expect(matchFeeling("low", "evening").music.category).toBe("sleep");
  });
});
