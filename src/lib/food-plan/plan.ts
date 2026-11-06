import { isRealISODate } from "@/lib/dates";
import { mealById, SIMPLE_MEALS, type SimpleMeal } from "@/lib/food-plan/meals";
import { foodsForSeason, KITCHEN_RECIPES, SEASONAL_FOODS } from "@/lib/food-plan/seasonal";
import { SPICES } from "@/lib/food-plan/spices";
import {
  ACTIVITY_LEVELS,
  ALLERGENS,
  DOSHAS,
  GOALS,
  MEAL_SLOTS,
  PATTERNS,
  PROTEIN_GOALS,
  SEASONS,
  emptyFoodPlan,
  emptyPlate,
  emptyProfile,
  emptyProteinInputs,
  type Allergen,
  type DayPlan,
  type DietPattern,
  type FoodPlanState,
  type FoodProfile,
  type LogLine,
  type MealSlot,
  type PlannedMeal,
  type PlateChoice,
  type ProgressNote,
  type ProteinInputs,
  type ShoppingItem,
  type WeekPlan,
} from "@/lib/food-plan/types";
import {
  allowsPattern,
  blockedByAllergy,
  PLATE_CARB_IDS,
  PLATE_FAT_IDS,
  PLATE_PROTEIN_IDS,
  PLATE_VEGETABLE_IDS,
  usdaById,
  type UsdaFood,
} from "@/lib/food-plan/usda";

const PORTIONS = [0.5, 1, 1.5, 2];
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function dayName(index: number): string {
  return DAY_NAMES[index] ?? `Day ${index + 1}`;
}

export type MealFilter = {
  pattern: DietPattern | "";
  allergens: Allergen[];
  text: string;
  dairyFree: boolean;
  budgetOnly: boolean;
  quickOnly: boolean;
  minimalOnly: boolean;
  maxMinutes: number;
};

export function extraAllergens(text: string): Allergen[] {
  const t = text.toLowerCase();
  const found: Allergen[] = [];
  const add = (id: Allergen, pattern: RegExp) => {
    if (pattern.test(t) && !found.includes(id)) found.push(id);
  };
  add("milk", /\b(dairy|milk|cheese|yogurt|yoghurt|lactose)\b/);
  add("egg", /\beggs?\b/);
  add("peanut", /\b(peanuts?|nuts)\b/);
  add("tree-nut", /\b(tree nuts?|almonds?|walnuts?|nuts)\b/);
  add("fish", /\b(fish|salmon|tuna|cod)\b/);
  add("shellfish", /\b(shellfish|shrimp|crab)\b/);
  add("soy", /\b(soy|tofu|tempeh|edamame)\b/);
  add("wheat", /\b(wheat|gluten|bread)\b/);
  add("sesame", /\bsesame\b/);
  return found;
}

export function profileFilter(profile: FoodProfile): MealFilter {
  const text = `${profile.allergyNote} ${profile.avoid} ${profile.dislikes}`;
  return {
    pattern: profile.pattern,
    allergens: [...profile.allergens, ...extraAllergens(text)],
    text,
    dairyFree: profile.pattern === "vegan",
    budgetOnly: profile.budget === "modest",
    quickOnly: false,
    minimalOnly: profile.minimalCooking,
    maxMinutes: profile.cookMinutes,
  };
}

function textBlocksFood(food: UsdaFood, text: string): boolean {
  const hay = text.toLowerCase();
  if (!hay.trim()) return false;
  const names = [food.name.toLowerCase(), food.id.replace(/-/g, " ")];
  return names.some((name) => name.length >= 3 && hay.includes(name));
}

export function mealAllowed(meal: SimpleMeal, filter: MealFilter, relax: { time: boolean; budget: boolean; minimal: boolean }): boolean {
  if (!relax.time && filter.maxMinutes > 0 && meal.minutes > filter.maxMinutes) return false;
  if (!relax.budget && filter.budgetOnly && !meal.budget) return false;
  if (!relax.minimal && filter.minimalOnly && !meal.minimalCooking) return false;
  if (filter.quickOnly && !meal.quick) return false;
  const gluten = /\bgluten\b/.test(filter.text.toLowerCase());
  for (const part of meal.parts) {
    const food = usdaById(part.foodId);
    if (!food) return false;
    if (!allowsPattern(food, filter.pattern)) return false;
    if (blockedByAllergy(food, filter.allergens, filter.dairyFree)) return false;
    if (textBlocksFood(food, filter.text)) return false;
    if (gluten && food.id === "oats") return false;
  }
  return true;
}

function candidates(slot: MealSlot, filter: MealFilter): { meals: SimpleMeal[]; relaxed: boolean } {
  const inSlot = SIMPLE_MEALS.filter((meal) => meal.slot === slot);
  const strict = inSlot.filter((meal) => mealAllowed(meal, filter, { time: false, budget: false, minimal: false }));
  if (strict.length > 0) return { meals: strict, relaxed: false };
  const loose = inSlot.filter((meal) => mealAllowed(meal, filter, { time: true, budget: true, minimal: true }));
  return { meals: loose, relaxed: loose.length > 0 };
}

function randomIndex(seed: number, salt: number, length: number): number {
  let s = (seed + salt * 97) >>> 0 || 1;
  s = (Math.imul(1664525, s) + 1013904223) >>> 0;
  return length === 0 ? 0 : s % length;
}

export function planBlockReason(profile: FoodProfile): string {
  if (profile.pregnancy || profile.eatingDisorder || profile.complexMedical) {
    return "LifeZoi will not build a personal meal plan for pregnancy, an eating disorder, or a complex medical diet. A clinician or registered dietitian can help. The seasonal library, spice guide, and science pages stay open.";
  }
  return "";
}

export function slotsFor(profile: FoodProfile): MealSlot[] {
  const main: MealSlot[] = profile.mealsPerDay === 2 ? ["breakfast", "dinner"] : ["breakfast", "lunch", "dinner"];
  if (profile.snack) main.push("snack");
  return main;
}

export function buildWeek(profile: FoodProfile, seed: number, id: string, createdOn: string): { ok: true; week: WeekPlan } | { ok: false; reason: string } {
  const blocked = planBlockReason(profile);
  if (blocked) return { ok: false, reason: blocked };
  const filter = profileFilter(profile);
  const slots = slotsFor(profile);
  const seasonal = foodsForSeason(profile.season);
  let relaxed = false;
  const days: DayPlan[] = [];
  for (let index = 0; index < 7; index += 1) {
    const used = new Set<string>();
    const meals: PlannedMeal[] = [];
    for (const slot of slots) {
      const pool = candidates(slot, filter);
      if (pool.relaxed) relaxed = true;
      const fresh = pool.meals.filter((meal) => !used.has(meal.id));
      const list = fresh.length > 0 ? fresh : pool.meals;
      if (list.length === 0) {
        return { ok: false, reason: `No ${slot} fits the allergies and eating pattern. LifeZoi will not fill that slot with a food you asked to avoid.` };
      }
      const meal = list[randomIndex(seed, index * 10 + MEAL_SLOTS.indexOf(slot) + 1, list.length)];
      used.add(meal.id);
      meals.push({ slot, mealId: meal.id, portions: 1, variant: 0 });
    }
    days.push({
      index,
      meals,
      seasonalFoodId: seasonal.length > 0 ? seasonal[index % seasonal.length].id : "",
    });
  }
  const kidney = profile.kidney || profile.liver;
  return {
    ok: true,
    week: {
      id,
      seed,
      season: profile.season,
      createdOn,
      days,
      note: [
        relaxed ? "Some meals are longer or less thrifty than requested, because closer matches ran out. Allergies and the eating pattern were kept." : "",
        kidney ? "Protein portions are ordinary servings. They are not raised for kidney or liver disease." : "",
        "Meals do not have to contain the same amount of protein.",
      ]
        .filter(Boolean)
        .join(" "),
    },
  };
}

export function replacePlannedMeal(week: WeekPlan, profile: FoodProfile, dayIndex: number, slot: MealSlot): WeekPlan {
  const filter = profileFilter(profile);
  return {
    ...week,
    days: week.days.map((day) => {
      if (day.index !== dayIndex) return day;
      return {
        ...day,
        meals: day.meals.map((meal) => {
          if (meal.slot !== slot) return meal;
          const pool = candidates(slot, filter).meals.filter((item) => item.id !== meal.mealId);
          const list = pool.length > 0 ? pool : candidates(slot, filter).meals;
          if (list.length === 0) return meal;
          const next = list[randomIndex(week.seed, dayIndex * 20 + meal.variant + 3, list.length)];
          return { ...meal, mealId: next.id, variant: meal.variant + 1 };
        }),
      };
    }),
  };
}

export function regenerateDay(week: WeekPlan, profile: FoodProfile, dayIndex: number): WeekPlan {
  let next = week;
  const day = week.days.find((item) => item.index === dayIndex);
  if (!day) return week;
  for (const meal of day.meals) next = replacePlannedMeal(next, profile, dayIndex, meal.slot);
  return next;
}

export function ayurvedaLine(meal: SimpleMeal, profile: FoodProfile): string {
  if (!profile.dosha || profile.dosha === "skip" || profile.dosha === "not-sure") return "";
  const avoid = `${profile.avoid} ${profile.dislikes}`.toLowerCase();
  const spices = ["cumin", "cardamom", "cinnamon", "coriander", "fennel", "ginger", "turmeric", "pepper", "rosemary", "mint"];
  if (spices.some((spice) => meal.ayurveda.toLowerCase().includes(spice) && avoid.includes(spice))) {
    return "The traditional spice note is hidden because it overlaps a food you avoid. The meal stays the same.";
  }
  return meal.ayurveda;
}

function shopGroup(food: UsdaFood): string {
  if (food.kind === "dairy") return "Dairy";
  if (food.plate.includes("vegetable") || food.plate.includes("fruit")) return "Produce";
  if (food.plate.includes("carb")) return "Grains";
  if (food.id === "olive-oil") return "Pantry";
  if (food.allergens.includes("tree-nut") || food.id === "pumpkin-seeds" || food.id === "chia") return "Nuts and seeds";
  return "Protein";
}

export function shoppingFromWeek(week: WeekPlan, previous: ShoppingItem[] = []): ShoppingItem[] {
  const buckets = new Map<string, { name: string; group: string; servings: number; meals: string[] }>();
  for (const day of week.days) {
    for (const planned of day.meals) {
      const meal = mealById(planned.mealId);
      if (!meal) continue;
      for (const part of meal.parts) {
        const food = usdaById(part.foodId);
        if (!food) continue;
        const current = buckets.get(food.id) ?? { name: food.name, group: shopGroup(food), servings: 0, meals: [] };
        current.servings += part.servings * planned.portions;
        if (!current.meals.includes(meal.name)) current.meals.push(meal.name);
        buckets.set(food.id, current);
      }
    }
  }
  const generated: ShoppingItem[] = [...buckets.entries()].map(([id, row]) => {
    const prior = previous.find((item) => !item.custom && item.name === row.name);
    return {
      id: prior?.id ?? `shop-${id}`,
      name: row.name,
      group: row.group,
      detail: `About ${Math.round(row.servings * 10) / 10} listed servings (${row.meals.join(", ")})`,
      checked: prior?.checked ?? false,
      custom: false,
    };
  });
  const custom = previous.filter((item) => item.custom);
  return [...generated, ...custom].slice(0, 80);
}

export type LibraryHit = { id: string; title: string; href: string; kind: string };

export function searchLibrary(query: string): LibraryHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const hits: LibraryHit[] = [];
  for (const food of SEASONAL_FOODS) {
    if (`${food.name} ${food.summary}`.toLowerCase().includes(q)) {
      hits.push({ id: food.id, title: food.name, href: `/food-plan/seasonal/${food.id}`, kind: "Seasonal food" });
    }
  }
  for (const recipe of KITCHEN_RECIPES) {
    if (`${recipe.name} ${recipe.ingredients.map((item) => item.item).join(" ")}`.toLowerCase().includes(q)) {
      hits.push({ id: recipe.id, title: recipe.name, href: `/food-plan/seasonal/${recipe.foodId}`, kind: "Kitchen recipe" });
    }
  }
  for (const meal of SIMPLE_MEALS) {
    if (`${meal.name} ${meal.summary}`.toLowerCase().includes(q)) {
      hits.push({ id: meal.id, title: meal.name, href: "/food-plan/simple", kind: "Simple meal" });
    }
  }
  for (const spice of SPICES) {
    if (spice.name.toLowerCase().includes(q)) hits.push({ id: spice.id, title: spice.name, href: `/food-plan/spices/${spice.id}`, kind: "Spice" });
  }
  return hits.slice(0, 8);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function cleanText(value: unknown, max = 280): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max);
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | "" {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : "";
}

function flag(value: unknown): boolean {
  return value === true;
}

function portion(value: unknown): number {
  return typeof value === "number" && PORTIONS.includes(value) ? value : 1;
}

function servings(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 1;
  const stepped = Math.round(value * 4) / 4;
  if (stepped < 0.25 || stepped > 4) return 1;
  return stepped;
}

function cleanProfile(value: unknown): FoodProfile {
  const row = asRecord(value);
  if (!row) return emptyProfile();
  const allergens = Array.isArray(row.allergens)
    ? row.allergens.filter((item): item is Allergen => typeof item === "string" && ALLERGENS.includes(item as Allergen))
    : [];
  const meals = row.mealsPerDay === 2 || row.mealsPerDay === 3 ? row.mealsPerDay : 0;
  const cook = row.cookMinutes === 15 || row.cookMinutes === 30 || row.cookMinutes === 45 || row.cookMinutes === 60 ? row.cookMinutes : 0;
  return {
    goal: oneOf(row.goal, GOALS),
    likes: cleanText(row.likes),
    dislikes: cleanText(row.dislikes),
    pattern: oneOf(row.pattern, PATTERNS),
    allergens: [...new Set(allergens)],
    allergyNote: cleanText(row.allergyNote),
    avoid: cleanText(row.avoid),
    mealsPerDay: meals,
    snack: flag(row.snack),
    cookMinutes: cook,
    budget: row.budget === "modest" || row.budget === "flexible" ? row.budget : "",
    minimalCooking: flag(row.minimalCooking),
    season: oneOf(row.season, SEASONS),
    seasonSource: row.seasonSource === "manual" || row.seasonSource === "guess" ? row.seasonSource : "",
    dosha: oneOf(row.dosha, DOSHAS),
    pregnancy: flag(row.pregnancy),
    eatingDisorder: flag(row.eatingDisorder),
    complexMedical: flag(row.complexMedical),
    kidney: flag(row.kidney),
    liver: flag(row.liver),
  };
}

function cleanProtein(value: unknown): ProteinInputs {
  const row = asRecord(value);
  if (!row) return emptyProteinInputs();
  const grams = typeof row.gramsPerKg === "number" ? Math.round(row.gramsPerKg * 10) / 10 : null;
  return {
    age: typeof row.age === "string" && /^\d{1,3}$/.test(row.age.trim()) ? row.age.trim() : "",
    sex: row.sex === "female" || row.sex === "male" ? row.sex : "",
    height: typeof row.height === "string" && /^\d{1,3}(\.\d{1,2})?$/.test(row.height.trim()) ? row.height.trim() : "",
    heightUnit: row.heightUnit === "in" ? "in" : "cm",
    weight: typeof row.weight === "string" && /^\d{1,3}(\.\d{1,2})?$/.test(row.weight.trim()) ? row.weight.trim() : "",
    weightUnit: row.weightUnit === "lb" ? "lb" : "kg",
    activity: oneOf(row.activity, ACTIVITY_LEVELS),
    goal: oneOf(row.goal, PROTEIN_GOALS),
    pattern: oneOf(row.pattern, PATTERNS),
    dairyFree: flag(row.dairyFree),
    gramsPerKg: grams !== null && grams >= 0.8 && grams <= 1.6 ? grams : null,
  };
}

function cleanPlate(value: unknown): PlateChoice {
  const row = asRecord(value);
  const base = emptyPlate();
  if (!row) return base;
  const pick = (id: unknown, allowed: readonly string[]) => (typeof id === "string" && allowed.includes(id) ? id : "");
  return {
    proteinId: pick(row.proteinId, PLATE_PROTEIN_IDS),
    vegetableId: pick(row.vegetableId, PLATE_VEGETABLE_IDS),
    carbId: pick(row.carbId, PLATE_CARB_IDS),
    fatId: pick(row.fatId, PLATE_FAT_IDS),
    proteinServings: portion(row.proteinServings),
    vegetableServings: portion(row.vegetableServings),
    carbServings: portion(row.carbServings),
    fatServings: portion(row.fatServings),
  };
}

function cleanId(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return /^[A-Za-z0-9-]{8,80}$/.test(trimmed) ? trimmed : "";
}

export function sanitizeFoodPlan(input: unknown): FoodPlanState {
  const row = asRecord(input);
  if (!row) return emptyFoodPlan();
  const profile = cleanProfile(row.profile);
  const weekRow = asRecord(row.week);
  let week: WeekPlan | null = null;
  if (weekRow) {
    const id = cleanId(weekRow.id);
    const seed = typeof weekRow.seed === "number" && Number.isFinite(weekRow.seed) ? Math.abs(Math.trunc(weekRow.seed)) % 1000000000 : 0;
    const createdOn = typeof weekRow.createdOn === "string" && isRealISODate(weekRow.createdOn) ? weekRow.createdOn : "";
    const days = Array.isArray(weekRow.days)
      ? weekRow.days
          .map((item, index): DayPlan | null => {
            const day = asRecord(item);
            if (!day) return null;
            const meals = Array.isArray(day.meals)
              ? day.meals
                  .map((meal): PlannedMeal | null => {
                    const planned = asRecord(meal);
                    if (!planned || !MEAL_SLOTS.includes(planned.slot as MealSlot)) return null;
                    const mealId = typeof planned.mealId === "string" ? planned.mealId : "";
                    if (!mealById(mealId)) return null;
                    const variant = typeof planned.variant === "number" && planned.variant >= 0 && planned.variant < 50 ? Math.trunc(planned.variant) : 0;
                    return { slot: planned.slot as MealSlot, mealId, portions: portion(planned.portions), variant };
                  })
                  .filter((meal): meal is PlannedMeal => meal !== null)
                  .slice(0, 4)
              : [];
            const seasonalFoodId = typeof day.seasonalFoodId === "string" && SEASONAL_FOODS.some((food) => food.id === day.seasonalFoodId) ? day.seasonalFoodId : "";
            return { index: typeof day.index === "number" ? day.index : index, meals, seasonalFoodId };
          })
          .filter((day): day is DayPlan => day !== null)
          .slice(0, 7)
      : [];
    if (id && createdOn && days.length === 7) {
      week = {
        id,
        seed,
        season: oneOf(weekRow.season, SEASONS),
        createdOn,
        days,
        note: cleanText(weekRow.note, 400),
      };
    }
  }
  const favorites = Array.isArray(row.favorites)
    ? row.favorites.filter((item): item is string => typeof item === "string" && (mealById(item) !== null || KITCHEN_RECIPES.some((recipe) => recipe.id === item))).slice(0, 80)
    : [];
  const shopping = Array.isArray(row.shopping)
    ? row.shopping
        .map((item): ShoppingItem | null => {
          const entry = asRecord(item);
          if (!entry) return null;
          const id = cleanId(entry.id) || (typeof entry.id === "string" && /^shop-[a-z0-9-]{1,40}$/.test(entry.id) ? entry.id : "");
          const name = cleanText(entry.name, 80);
          if (!id || !name) return null;
          return {
            id,
            name,
            group: cleanText(entry.group, 40) || "Other",
            detail: cleanText(entry.detail, 180),
            checked: flag(entry.checked),
            custom: flag(entry.custom),
          };
        })
        .filter((item): item is ShoppingItem => item !== null)
        .slice(0, 80)
    : [];
  const progress = Array.isArray(row.progress)
    ? row.progress
        .map((item): ProgressNote | null => {
          const entry = asRecord(item);
          if (!entry) return null;
          const id = cleanId(entry.id);
          const date = typeof entry.date === "string" && isRealISODate(entry.date) ? entry.date : "";
          if (!id || !date) return null;
          const cooked = typeof entry.cooked === "number" && entry.cooked >= 0 && entry.cooked <= 21 ? Math.round(entry.cooked) : null;
          const tried = typeof entry.triedFoodId === "string" && SEASONAL_FOODS.some((food) => food.id === entry.triedFoodId) ? entry.triedFoodId : "";
          return { id, date, cooked, triedFoodId: tried, note: cleanText(entry.note) };
        })
        .filter((item): item is ProgressNote => item !== null)
        .slice(0, 60)
    : [];
  const log = Array.isArray(row.log)
    ? row.log
        .map((item): LogLine | null => {
          const entry = asRecord(item);
          if (!entry) return null;
          const id = cleanId(entry.id);
          const foodId = typeof entry.foodId === "string" ? entry.foodId : "";
          if (!id || !usdaById(foodId)) return null;
          return { id, foodId, servings: servings(entry.servings) };
        })
        .filter((item): item is LogLine => item !== null)
        .slice(0, 40)
    : [];
  return {
    profile,
    week,
    favorites,
    shopping,
    progress,
    protein: cleanProtein(row.protein),
    log,
    plate: cleanPlate(row.plate),
  };
}
