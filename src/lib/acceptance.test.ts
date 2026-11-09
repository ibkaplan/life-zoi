import { describe, expect, it } from "vitest";
import { emptyFoodPrefs, emptyMovementPrefs, type FoodPrefs, type MovementPrefs } from "@/lib/companion/state";
import { mealsForDay, nutritionGoalFor, type DayMeals } from "@/lib/companion/nutrition";
import { coerceHealthProfile, emptyHealthProfile, type HealthProfileFields } from "@/lib/health-profile";
import { buildSession, INDOOR_CHOICES, DURATION_OPTIONS, moverProfile, recommend, stepsTotal } from "@/lib/wellness-library/discover";
import { MOVES } from "@/lib/wellness-library/moves";
import { findDuplicates, reviewQueue, visibleVideos, VIDEOS } from "@/lib/wellness-library/catalog";

/**
 * The twelve acceptance scenarios from the product brief, run against
 * synthetic profiles. No real person's data is used.
 */

function person(health: Partial<HealthProfileFields> & { exactAge?: string; ageRange?: string } = {}) {
  return { ...emptyHealthProfile(), ...coerceHealthProfile(health), exactAge: health.exactAge ?? "", ageRange: health.ageRange ?? "" };
}

function prefs(patch: Partial<MovementPrefs> = {}): MovementPrefs {
  return { ...emptyMovementPrefs(), ...patch };
}

const moveById = new Map(Object.values(MOVES).flat().map((move) => [move.id, move]));

function allMeals(day: DayMeals) {
  return [...day.slots.breakfast, ...day.slots.lunch, ...day.slots.dinner, ...day.slots.snack];
}

function food(patch: Partial<FoodPrefs> = {}): FoodPrefs {
  return { ...emptyFoodPrefs(), ...patch };
}

function containsAvocado(day: DayMeals): boolean {
  return allMeals(day).some(({ recipe, swaps }) =>
    recipe.ingredients.some((item) => /avocado/i.test(item.name) && !swaps.some((swap) => /avocado/i.test(swap))),
  );
}

describe("acceptance: movement", () => {
  it("1. a 25-year-old beginner gets a 20-minute aerobics session", () => {
    const profile = moverProfile(person({ exactAge: "25" }), prefs({ level: "beginner" }));
    const rec = recommend({ category: "aerobics", minutes: 20 }, profile);
    expect(rec.headline).toBe("Your 20-minute Aerobics session is ready!");
    expect(rec.main.kind).toBe("session");
    if (rec.main.kind !== "session") return;
    expect(rec.main.session.level).toBe("beginner");
    expect(stepsTotal(rec.main.session)).toBe(20 * 60);
    expect(rec.main.session.steps.every((step) => !moveById.get(step.moveId)?.highImpact)).toBe(true);
  });

  it("2. a 52-year-old beginner gets a 30-minute beginner Pilates session with the NHS video as an option", () => {
    const profile = moverProfile(person({ exactAge: "52" }), prefs({ level: "beginner", enjoyed: ["pilates"] }));
    const rec = recommend({ category: "pilates", minutes: 30 }, profile);
    expect(rec.headline).toBe("Your 30-minute Pilates session is ready!");
    expect(rec.main.kind === "session" && rec.main.session.level === "beginner" && stepsTotal(rec.main.session) === 1800).toBe(true);
    const nhs = rec.alternatives.find((alt) => alt.kind === "video" && alt.video.id === "nhs-pilates-beginner");
    expect(nhs).toBeTruthy();
    // Not called free until checked.
    expect(nhs && nhs.kind === "video" ? nhs.note : "").toMatch(/not yet checked/);
  });

  it("3. a 70-year-old asking for gentle chair exercise gets only seated, non-vigorous moves", () => {
    const profile = moverProfile(person({ exactAge: "70" }), prefs());
    const session = buildSession({ category: "chair", minutes: 15 }, profile);
    const main = session.steps.filter((step) => step.phase === "main");
    expect(main.length).toBeGreaterThan(0);
    for (const step of main) {
      const move = moveById.get(step.moveId);
      expect(move?.position).toBe("seated");
      expect(move?.intensity).not.toBe("vigorous");
    }
    expect(session.intensity).toBe("Low impact");
  });

  it("4. declining a walk because of rain offers indoor choices and every duration", () => {
    expect(INDOOR_CHOICES).toEqual(["pilates", "yoga", "aerobics", "dance", "chair", "strength", "stretching"]);
    expect([...DURATION_OPTIONS]).toEqual([10, 15, 20, 30, 45, 60]);
    const profile = moverProfile(person({ exactAge: "40" }), prefs());
    for (const category of INDOOR_CHOICES) {
      for (const minutes of DURATION_OPTIONS) {
        const session = buildSession({ category, minutes }, profile);
        expect(stepsTotal(session)).toBe(minutes * 60);
      }
    }
  });

  it("5. choosing yoga instead of Pilates returns yoga", () => {
    const profile = moverProfile(person({ exactAge: "52" }), prefs({ level: "beginner" }));
    const rec = recommend({ category: "yoga", minutes: 30 }, profile);
    expect(rec.headline).toContain("Yoga");
    expect(rec.main.kind === "session" && rec.main.session.category === "yoga").toBe(true);
    if (rec.main.kind === "session") {
      expect(rec.main.session.steps.filter((s) => s.phase === "main").every((s) => s.moveId.startsWith("yoga-"))).toBe(true);
    }
  });

  it("6. asking for a harder workout raises the level by one step, and age alone never does", () => {
    const young = moverProfile(person({ exactAge: "25" }), prefs({ level: "beginner" }));
    expect(buildSession({ category: "aerobics", minutes: 20 }, young).level).toBe("beginner");
    expect(buildSession({ category: "aerobics", minutes: 20, harder: true }, young).level).toBe("intermediate");
    const intermediate = moverProfile(person({ exactAge: "25" }), prefs({ level: "intermediate" }));
    const advanced = buildSession({ category: "aerobics", minutes: 20, harder: true }, intermediate);
    expect(advanced.level).toBe("advanced");
    expect(advanced.steps.some((step) => moveById.get(step.moveId)?.highImpact)).toBe(true);
    // An older person who asks for more gets more, too; age is not a cap.
    const older = moverProfile(person({ exactAge: "72" }), prefs({ level: "intermediate" }));
    expect(buildSession({ category: "strength", minutes: 20, harder: true }, older).level).toBe("advanced");
    // No stated level: an older age does not assign anything harder than beginner.
    const unstated = moverProfile(person({ exactAge: "70" }), prefs());
    expect(buildSession({ category: "aerobics", minutes: 20 }, unstated).level).toBe("beginner");
  });

  it("7. a knee limitation removes kneeling, deep knee bends, and jumping", () => {
    const profile = moverProfile(person({ exactAge: "45", exerciseRestrictions: "Left knee pain, no kneeling" }), prefs({ level: "advanced" }));
    expect(profile.kneeLimit).toBe(true);
    for (const category of ["pilates", "yoga", "aerobics", "strength", "home-cardio", "stretching"] as const) {
      const session = buildSession({ category, minutes: 30, harder: true }, profile);
      for (const step of session.steps) {
        const move = moveById.get(step.moveId);
        if (!move) continue;
        expect(move.kneeLoad || move.highImpact).toBe(false);
      }
    }
    const rec = recommend({ category: "pilates", minutes: 30 }, profile);
    // The NHS mat video involves kneeling, so it is not offered.
    expect(rec.alternatives.some((alt) => alt.kind === "video" && alt.video.kneeLoad)).toBe(false);
    expect(rec.notes.join(" ")).toMatch(/knee/);
  });
});

describe("acceptance: nutrition", () => {
  it("8. an avocado allergy removes every avocado recipe, with no swap", () => {
    const answers = person({ foodReactions: [{ food: "avocado", type: "allergy" }] });
    const day = mealsForDay(answers, food(), "general", "2026-11-09");
    expect(containsAvocado(day)).toBe(false);
    expect(allMeals(day).some(({ recipe }) => recipe.ingredients.some((item) => /avocado/i.test(item.name)))).toBe(false);
    expect(day.excluded.some(({ recipe }) => recipe.id === "idea-bean-avocado-bowl")).toBe(true);
    expect(allMeals(day)[0]?.warnings.join(" ")).toMatch(/cannot confirm/);
  });

  it("9. excluding avocado without an allergy never serves avocado, and may use a swap", () => {
    const day = mealsForDay(person(), food({ exclusions: ["avocado"] }), "general", "2026-11-09");
    expect(containsAvocado(day)).toBe(false);
    const bowl = allMeals(day).find(({ recipe }) => recipe.id === "idea-bean-avocado-bowl");
    expect(bowl?.swaps.join(" ")).toMatch(/without avocado/);
    expect(day.excluded.some(({ recipe }) => recipe.id === "idea-avocado-toast")).toBe(true);
  });

  it("the brief's example: avocado, mushrooms, and pork are never served", () => {
    const answers = person({ dietRequirements: ["no-pork"] });
    const day = mealsForDay(answers, food({ exclusions: ["avocado", "mushrooms"] }), "general", "seed");
    for (const { recipe, swaps } of allMeals(day)) {
      for (const item of recipe.ingredients) {
        const swapped = swaps.some((swap) => swap.toLowerCase().includes(item.name.toLowerCase()));
        if (swapped) continue;
        expect(item.name).not.toMatch(/avocado|mushroom|pork|bacon|ham/i);
      }
    }
  });

  it("10–12. weight goals change the guidance and the order of meals", () => {
    const lose = mealsForDay(person(), food(), nutritionGoalFor("lose-weight", ["lose-weight"]), "s");
    const gain = mealsForDay(person(), food(), nutritionGoalFor("gain-weight", ["gain-weight"]), "s");
    const keep = mealsForDay(person(), food(), nutritionGoalFor("maintain-weight", ["maintain-weight"]), "s");
    expect([lose.goal, gain.goal, keep.goal]).toEqual(["lose", "gain", "maintain"]);
    expect(lose.guidance.join(" ")).toMatch(/No single food causes weight loss/);
    expect(gain.guidance.join(" ")).toMatch(/No single food causes weight gain/);
    expect(keep.guidance.join(" ")).toMatch(/balanced plate/);
    expect(lose.guidance.join(" ")).not.toMatch(/\d{3,4} ?kcal/);
    const firstGainSnack = gain.slots.snack[0]?.recipe;
    expect(firstGainSnack?.tags).toContain("energy-dense");
    expect(gain.slots.snack.length).toBeGreaterThanOrEqual(2);
  });

  it("vegan and halal requirements are applied only when chosen", () => {
    const vegan = mealsForDay(person({ dietPatterns: ["vegan"] }), food(), "general", "s");
    expect(allMeals(vegan).every(({ recipe }) => recipe.ingredients.every((item) => item.kind === "plant"))).toBe(true);
    const none = mealsForDay(person(), food(), "general", "s");
    expect(allMeals(none).some(({ recipe }) => recipe.ingredients.some((item) => item.kind === "meat"))).toBe(true);
    const halal = mealsForDay(person({ dietRequirements: ["halal"] }), food(), "general", "s");
    expect(halal.safety.join(" ")).toMatch(/cannot certify/);
  });

  it("the existing food-plan profile is respected too", () => {
    const day = mealsForDay(person(), food(), "general", "s", { allergens: ["egg"], allergyNote: "", avoid: "", dislikes: "", pattern: "" });
    expect(allMeals(day).some(({ recipe }) => recipe.ingredients.some((item) => item.allergens.includes("egg")))).toBe(false);
  });
});

describe("library management", () => {
  it("shows only approved items from approved sources and flags unchecked ones", () => {
    expect(visibleVideos().every((video) => video.approval === "approved")).toBe(true);
    expect(findDuplicates()).toEqual([]);
    const queue = reviewQueue();
    expect(queue.some((issue) => issue.id === "nhs-pilates-beginner" && /not verified/.test(issue.problem))).toBe(true);
    expect(queue.some((issue) => issue.id === "jessica-smith")).toBe(true);
  });

  it("detects a duplicate video", () => {
    const first = VIDEOS[0];
    if (!first) throw new Error("catalog is empty");
    expect(findDuplicates([first, { ...first, id: "copy" }])).toEqual([{ id: "copy", problem: `Same video as ${first.id}.` }]);
  });
});
