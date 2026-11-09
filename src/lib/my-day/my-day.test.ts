import { describe, expect, it } from "vitest";
import { containsProhibitedClaim } from "@/lib/claims";
import { emptyBrainProgress } from "@/lib/brain-quiz/progress";
import { emptyFoodPlan } from "@/lib/food-plan/types";
import { emptyFollowUp, emptyHabitJourney, type HabitJourney } from "@/lib/habit-transformation/model";
import { plansFor } from "@/lib/habit-transformation/engine";
import { lessonById } from "@/lib/wellness/movement-studio/catalog";
import { EMPTY_ASSESSMENT, type Assessment, type WeightEntry } from "@/lib/types";
import {
  HABIT_HREF,
  ITEM_IDS,
  PERFECT_DAY,
  SUGGESTED_TIMES,
  ayurvedaNote,
  calorieEstimate,
  dayProgress,
  encouragement,
  presentDay,
  proteinEstimate,
  weightChart,
  type DayRecord,
} from "@/lib/my-day/plan";
import {
  cycleItem,
  ensureToday,
  freshDay,
  loadMyDay,
  saveMyDay,
  setItemStatus,
  setItemTime,
  sanitizeMyDay,
} from "@/lib/my-day/storage";

function answers(patch: Partial<Assessment> = {}): Assessment {
  return { ...EMPTY_ASSESSMENT, ...patch, goals: patch.goals ? [...patch.goals] : [] };
}

function day(date: string, saved: Partial<Record<(typeof ITEM_IDS)[number], string>> = {}): DayRecord {
  return freshDay(date, saved);
}

function memory() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

describe("my day progress", () => {
  it("computes a percentage from marked items and ignores skipped ones", () => {
    const items = ITEM_IDS.map((id, index) => ({
      status: index < 2 ? ("done" as const) : index === 2 ? ("skipped" as const) : ("open" as const),
    }));
    const progress = dayProgress(items);
    expect(progress.completed).toBe(2);
    expect(progress.remaining).toBe(ITEM_IDS.length - 3);
    expect(progress.percent).toBe(Math.round((2 / (ITEM_IDS.length - 1)) * 100));
    expect(dayProgress(ITEM_IDS.map(() => ({ status: "open" }))).percent).toBe(0);
    expect(dayProgress(ITEM_IDS.map(() => ({ status: "done" }))).percent).toBe(100);
    expect(dayProgress(ITEM_IDS.map(() => ({ status: "skipped" }))).percent).toBe(0);
  });

  it("does not scold an open day", () => {
    expect(encouragement({ completed: 0, remaining: 4, percent: 0 })).toBe(PERFECT_DAY);
    expect(encouragement({ completed: 1, remaining: 2, percent: 33 })).toContain(PERFECT_DAY);
    expect(encouragement({ completed: 0, remaining: 4, percent: 0 }).toLowerCase()).not.toMatch(/fail|behind|guilt/);
  });
});

describe("my day storage", () => {
  it("keeps today's marks on refresh and starts a fresh plan on a new date", () => {
    const store = memory();
    const today = ensureToday(sanitizeMyDay(null), "2026-11-06");
    const marked = setItemStatus(setItemTime(today, "2026-11-06", "water", "06:40"), "2026-11-06", "water", "done");
    saveMyDay(store, marked);
    const loaded = loadMyDay(store);
    expect(loaded.days["2026-11-06"]?.items.water.status).toBe("done");
    expect(loaded.days["2026-11-06"]?.items.water.time).toBe("06:40");
    const next = ensureToday(loaded, "2026-11-07");
    expect(next.days["2026-11-06"]?.items.water.status).toBe("done");
    expect(next.days["2026-11-07"]?.items.water.status).toBe("open");
    expect(next.days["2026-11-07"]?.items.water.time).toBe("06:40");
    expect(next.savedTimes.water).toBe("06:40");
  });

  it("labels a saved clock time as yours and leaves the others suggested", () => {
    const file = ensureToday(sanitizeMyDay(null), "2026-11-06");
    const saved = setItemTime(file, "2026-11-06", "lunch", "13:15");
    const shown = presentDay(saved.days["2026-11-06"] as DayRecord, saved.savedTimes, null, emptyHabitJourney());
    const lunch = shown.find((item) => item.id === "lunch");
    const water = shown.find((item) => item.id === "water");
    expect(lunch?.timeLabel).toBe("Your time");
    expect(lunch?.time).toBe("13:15");
    expect(water?.timeLabel).toBe("Suggested time");
    expect(water?.time).toBe(SUGGESTED_TIMES.water);
  });
});

describe("my day personalization", () => {
  it("links the tiny habit to Habit Transformation and uses a saved action when one exists", () => {
    const blank = presentDay(day("2026-11-06"), {}, null, emptyHabitJourney());
    const habit = blank.find((item) => item.id === "habit");
    expect(habit?.href).toBe(HABIT_HREF);
    expect(habit?.detail).toBe("Choose one small action you can do now.");

    const journey: HabitJourney = {
      ...emptyHabitJourney(),
      picks: [{ habitId: "water", otherText: "", followUp: emptyFollowUp() }],
    };
    const saved = presentDay(day("2026-11-06"), {}, null, journey);
    const savedHabit = saved.find((item) => item.id === "habit");
    expect(savedHabit?.href).toBe(HABIT_HREF);
    expect(savedHabit?.detail).toBe(plansFor(journey)[0]?.smallAction);
    expect(savedHabit?.why).toContain("Habit Transformation");
  });

  it("uses a real film or written steps and does not invent a player", () => {
    const shown = presentDay(day("2026-11-06"), {}, null, emptyHabitJourney());
    const movement = shown.find((item) => item.id === "movement");
    expect(movement?.href).toContain("/academy/move/studio/lessons/");
    const id = movement?.href?.split("/").pop() ?? "";
    const lesson = lessonById(id);
    expect(lesson?.kind).toBe("video");
    expect(movement?.detail.toLowerCase()).toContain("does not add a play button");
    expect(movement?.steps).toEqual([]);

    const gentle = presentDay(
      day("2026-11-06"),
      {},
      answers({ conditionsNote: "knee pain" }),
      emptyHabitJourney(),
    ).find((item) => item.id === "movement");
    expect(gentle?.steps.length).toBeGreaterThan(0);
    expect(gentle?.detail.toLowerCase()).toContain("not a video");
    expect(gentle?.why.toLowerCase()).toContain("pain");
  });

  it("estimates calories with Mifflin-St Jeor only when the saved inputs exist", () => {
    const ready = answers({
      exactAge: "40",
      heightCm: "165",
      weightKg: "70",
      tableSex: "female",
      activityDays: "3",
      activityMinutes: "30",
    });
    const estimate = calorieEstimate(ready);
    const resting = Math.round(10 * 70 + 6.25 * 165 - 5 * 40 - 161);
    expect(estimate.kind).toBe("maintenance");
    if (estimate.kind === "maintenance") {
      expect(estimate.resting).toBe(resting);
      expect(estimate.kcal).toBe(Math.round(resting * 1.375));
      expect(estimate.kcal).toBeGreaterThanOrEqual(estimate.resting);
    }
    expect(calorieEstimate(answers({ ...ready, tableSex: "another" })).kind).toBe("none");
    expect(calorieEstimate(answers({ ...ready, tableSex: "prefer-not" })).kind).toBe("none");
    expect(calorieEstimate(answers({ ...ready, exactAge: "" })).kind).toBe("none");
    const male = calorieEstimate(answers({ ...ready, tableSex: "male", activityDays: "", activityMinutes: "" }));
    expect(male.kind).toBe("resting");
    if (male.kind === "resting") expect(male.kcal).toBe(Math.round(10 * 70 + 6.25 * 165 - 5 * 40 + 5));
  });

  it("does not raise protein when a saved note mentions kidney, liver, or pregnancy", () => {
    const weight = answers({ weightKg: "70" });
    const plain = proteinEstimate(weight);
    expect(plain.kind).toBe("estimate");
    if (plain.kind === "estimate") expect(plain.grams).toBe(56);
    for (const note of ["chronic kidney disease", "liver disease", "pregnancy"]) {
      const held = proteinEstimate(answers({ weightKg: "70", conditionsNote: note }));
      expect(held.kind).toBe("hold");
      expect(JSON.stringify(held)).not.toMatch(/\d/);
    }
    expect(proteinEstimate(answers()).kind).toBe("none");
  });

  it("charts only saved weight entries", () => {
    expect(weightChart([])).toEqual({ kind: "empty" });
    const one: WeightEntry = { id: "w1", date: "2026-11-01", value: 70, unit: "kg" };
    expect(weightChart([one])).toEqual({ kind: "single", entry: one });
    const bars = weightChart([
      one,
      { id: "w2", date: "2026-11-05", value: 71, unit: "kg" },
    ]);
    expect(bars.kind).toBe("bars");
    const mixed = weightChart([one, { id: "w3", date: "2026-11-02", value: 150, unit: "lb" }]);
    expect(mixed.kind).toBe("list");
  });

  it("keeps educational copy free of outcome claims", () => {
    const shown = presentDay(
      day("2026-11-06"),
      {},
      answers({
        hydration: "some",
        vegetables: "rarely",
        goals: ["sleep"],
        sleepHours: "6",
        sleepQuality: "fair",
        stress: "high",
      }),
      emptyHabitJourney(),
    );
    const text = [ayurvedaNote(), ...shown.flatMap((item) => [item.detail, item.why, item.hrefLabel])].join("\n");
    expect(containsProhibitedClaim(text)).toBe(false);
    expect(text.toLowerCase()).not.toMatch(/weight loss|detox/);
    expect(ayurvedaNote().toLowerCase()).toContain("not a diagnosis");
  });

  it("replaces an item without dropping the rest of the day", () => {
    const file = ensureToday(sanitizeMyDay(null), "2026-11-06");
    const next = cycleItem(file, "2026-11-06", "brain");
    expect(next.days["2026-11-06"]?.items.brain.variant).toBe(1);
    expect(next.days["2026-11-06"]?.items.water.status).toBe("open");
    const shown = presentDay(next.days["2026-11-06"] as DayRecord, {}, null, emptyHabitJourney());
    expect(shown.find((item) => item.id === "brain")?.href).toBe("/brain-quiz");
  });

  it("uses saved meals, quiz marks, and emotional notes without a new questionnaire", () => {
    const food = emptyFoodPlan();
    food.week = {
      id: "11111111-1111-4111-8111-111111111111",
      seed: 1,
      season: "",
      createdOn: "2026-11-02",
      note: "",
      days: [0, 1, 2, 3, 4, 5, 6].map((index) => ({
        index,
        seasonalFoodId: "",
        meals: [{ slot: "breakfast", mealId: "eggs-vegetables", portions: 1, variant: 0 }],
      })),
    };
    const brain = { ...emptyBrainProgress(), games: 1 };
    const shown = presentDay(day("2026-11-06"), {}, answers({ sleepHours: "7" }), emptyHabitJourney(), {
      date: "2026-11-06",
      foodPlan: food,
      brain,
      emotionalNotes: true,
    });
    const breakfast = shown.find((item) => item.id === "breakfast");
    const lunch = shown.find((item) => item.id === "lunch");
    expect(breakfast?.title).toBe("Eggs and vegetables");
    expect(breakfast?.why).toContain("already saved");
    expect(lunch?.title).toBe("Lunch");
    expect(shown.find((item) => item.id === "brain")?.why).toContain("not a health measure");
    const relax = shown.find((item) => item.id === "relax");
    expect(relax?.why).toContain("not been clinically reviewed");
    expect(relax?.why.toLowerCase()).not.toContain("validated");
    const text = shown.flatMap((item) => [item.title, item.detail, item.why]).join("\n");
    expect(containsProhibitedClaim(text)).toBe(false);
  });
});
