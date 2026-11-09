import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { prepareAccountWrite, rowsToSession, shouldCopyLocalIntoAccount } from "@/lib/account-records";
import { buildTargets, mifflinStJeor } from "@/lib/food-plan/calc";
import { mealById, mealTotals, mealUsesCheese, SIMPLE_MEALS } from "@/lib/food-plan/meals";
import { ayurvedaLine, buildWeek, mealAllowed, planBlockReason, profileFilter, searchLibrary } from "@/lib/food-plan/plan";
import { guessSeason } from "@/lib/food-plan/seasonal";
import { emptyFoodPlan, emptyProfile, emptyProteinInputs, isEmptyFoodPlan, type ProteinInputs } from "@/lib/food-plan/types";
import { scaleFood, usdaById, USDA_FOODS } from "@/lib/food-plan/usda";
import { sanitizeSession } from "@/lib/session";
import { emptySession } from "@/lib/types";

const USER = "11111111-1111-4111-8111-111111111111";
const flags = { pregnancy: false, kidney: false, liver: false, eatingDisorder: false, complexMedical: false };

describe("food plan", () => {
  it("traces the hard-boiled egg to FoodData Central and scales the listed large egg", () => {
    const egg = usdaById("egg");
    expect(egg?.fdcId).toBe(173424);
    const scaled = scaleFood(egg!, 1);
    expect(scaled.grams).toBe(50);
    expect(scaled.kcal).toBeCloseTo(77.5, 5);
    expect(scaled.protein).toBeCloseTo(6.29, 5);
    const raw = JSON.parse(readFileSync("src/lib/wellness/foods.json", "utf8")) as {
      items: { fdcId: number; per100g: { proteinG: number } }[];
    };
    expect(raw.items.find((item) => item.fdcId === 173424)?.per100g.proteinG).toBe(12.58);
    expect(raw.items.find((item) => item.fdcId === 171481)?.per100g.proteinG).toBe(29.06);
  });

  it("uses a moderate cheese portion and does not invent a 200 g serving", () => {
    const cheese = usdaById("cheddar");
    expect(cheese?.fdcId).toBe(328637);
    expect(cheese?.grams).toBe(30);
    expect(cheese?.per100g.fiber).toBeNull();
    expect(cheese?.grams).not.toBe(200);
  });

  it("keeps every USDA id unique and every simple meal on traced foods", () => {
    expect(new Set(USDA_FOODS.map((food) => food.fdcId)).size).toBe(USDA_FOODS.length);
    for (const meal of SIMPLE_MEALS) {
      expect(mealUsesCheese(meal)).toBe(false);
      for (const part of meal.parts) expect(usdaById(part.foodId)).not.toBeNull();
      const totals = mealTotals(meal);
      expect(totals.protein).toBeGreaterThan(0);
    }
  });

  it("does not assume weight loss and uses Mifflin-St Jeor", () => {
    expect(mifflinStJeor("male", 80, 180, 40)).toBeCloseTo(1730, 5);
    expect(mifflinStJeor("female", 80, 180, 40)).toBeCloseTo(1564, 5);
    const result = buildTargets({ ...emptyProteinInputs(), age: "40", sex: "female", height: "165", weight: "60", activity: "moderate" }, flags);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.chosenPerKg).toBe(0.8);
    expect(result.calorieNote).toMatch(/not assumed/);
    expect(result.calorieTarget).toBe(Math.round(result.dayKcal));
  });

  it("will not offer a very-low-calorie target", () => {
    const result = buildTargets(
      { ...emptyProteinInputs(), age: "70", sex: "female", height: "150", weight: "45", activity: "sedentary", goal: "lose" },
      flags,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.calorieTarget === null || result.calorieTarget >= 1500).toBe(true);
  });

  it("does not raise protein for kidney disease, liver disease, or pregnancy", () => {
    const input: ProteinInputs = { ...emptyProteinInputs(), age: "40", sex: "male", height: "180", weight: "80", activity: "moderate", gramsPerKg: 1.6 };
    expect(buildTargets(input, { ...flags, kidney: true }).ok).toBe(false);
    expect(buildTargets(input, { ...flags, liver: true }).ok).toBe(false);
    expect(buildTargets(input, { ...flags, pregnancy: true }).ok).toBe(false);
  });

  it("blocks a personal plan for pregnancy or an eating disorder and respects allergies", () => {
    expect(planBlockReason({ ...emptyProfile(), pregnancy: true })).toMatch(/will not build/);
    expect(planBlockReason({ ...emptyProfile(), eatingDisorder: true })).toMatch(/will not build/);
    const filter = profileFilter({ ...emptyProfile(), allergens: ["egg"] });
    expect(mealAllowed(mealById("eggs-vegetables")!, filter, { time: false, budget: false, minimal: false })).toBe(false);
    const vegan = buildWeek({ ...emptyProfile(), pattern: "vegan", season: "summer" }, 4, "week-vegan1", "2026-11-06");
    expect(vegan.ok).toBe(true);
    if (!vegan.ok) return;
    const names = vegan.week.days.flatMap((day) => day.meals.map((meal) => meal.mealId));
    expect(names.some((id) => id.includes("chicken") || id.includes("beef") || id.includes("salmon"))).toBe(false);
    expect(vegan.week.days.every((day) => day.meals.every((meal) => meal.portions === 1))).toBe(true);
  });

  it("does not let a dosha change the foods", () => {
    const plain = buildWeek({ ...emptyProfile(), season: "autumn" }, 9, "week-plain01", "2026-11-06");
    const dosha = buildWeek({ ...emptyProfile(), season: "autumn", dosha: "vata" }, 9, "week-dosha01", "2026-11-06");
    expect(plain.ok && dosha.ok).toBe(true);
    if (!plain.ok || !dosha.ok) return;
    expect(plain.week.days.map((day) => day.meals.map((meal) => meal.mealId))).toEqual(
      dosha.week.days.map((day) => day.meals.map((meal) => meal.mealId)),
    );
    const line = ayurvedaLine(mealById("lentils-vegetables")!, { ...emptyProfile(), dosha: "pitta", avoid: "cumin" });
    expect(line).toMatch(/hidden/);
  });

  it("labels a season guess and searches the local library only", () => {
    const guess = guessSeason("America/New_York", 6);
    expect(guess?.season).toBe("summer");
    expect(guess?.label).toMatch(/Guessed/);
    expect(JSON.stringify(searchLibrary("asparagus"))).not.toMatch(/api\.openai|health record/i);
    expect(searchLibrary("asparagus")[0]?.href).toContain("/food-plan/seasonal/");
  });

  it("round-trips with the account session and leaves an empty plan blank", () => {
    expect(isEmptyFoodPlan(emptyFoodPlan())).toBe(true);
    const session = sanitizeSessionFood();
    expect(shouldCopyLocalIntoAccount(emptySession(), session)).toBe(true);
    const prepared = prepareAccountWrite(session, USER, "2026-11-06T12:00:00.000Z");
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    expect(prepared.rows.profile.session_state.foodPlan.favorites).toContain("bean-salad");
    const loaded = rowsToSession({
      profile: { display_name: null, session_state: prepared.rows.profile.session_state },
      assessments: [],
      scenarios: [],
      goals: [],
      checkIns: [],
    });
    expect(loaded.foodPlan.favorites).toContain("bean-salad");
  });
});

function sanitizeSessionFood() {
  return sanitizeSession({
    ...emptySession(),
    draft: { ...emptySession().draft, displayName: "Ada" },
    foodPlan: { ...emptyFoodPlan(), favorites: ["bean-salad", "not-a-meal"] },
  });
}
