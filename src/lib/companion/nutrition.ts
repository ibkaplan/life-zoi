import { extraAllergens } from "@/lib/food-plan/plan";
import type { Allergen, MealSlot } from "@/lib/food-plan/types";
import type { HealthProfileFields, WellnessGoal } from "@/lib/health-profile";
import { allergenLabels, safetyFlags, safetyNotes } from "@/lib/health-profile";
import type { FoodPrefs } from "@/lib/companion/state";
import { splitFoods } from "@/lib/companion/state";
import { RECIPES, type Ingredient, type IngredientKind, type Recipe, type RecipeTag } from "@/lib/companion/recipes";

export const NUTRITION_GOALS = ["lose", "gain", "maintain", "general", "blood-sugar", "cholesterol"] as const;
export type NutritionGoal = (typeof NUTRITION_GOALS)[number];

export const nutritionGoalLabels: Record<NutritionGoal, string> = {
  lose: "Weight loss",
  gain: "Weight gain",
  maintain: "Weight maintenance",
  general: "General healthy eating",
  "blood-sugar": "Blood sugar management",
  cholesterol: "Cholesterol management",
};

export function nutritionGoalFor(primary: WellnessGoal | "", goals: WellnessGoal[]): NutritionGoal {
  const order: WellnessGoal[] = primary ? [primary, ...goals] : goals;
  for (const goal of order) {
    if (goal === "lose-weight") return "lose";
    if (goal === "gain-weight") return "gain";
    if (goal === "maintain-weight") return "maintain";
    if (goal === "blood-sugar") return "blood-sugar";
    if (goal === "cholesterol") return "cholesterol";
  }
  return "general";
}

/** Everything a recipe must avoid. Built from the assessment, the food questionnaire, and the existing food-plan profile. */
export type FoodRules = {
  /** Diagnosed allergies among the nine groups. Strict. */
  allergens: Allergen[];
  /** Allergy foods outside the nine groups, such as avocado. Strict: no swap. */
  allergyWords: string[];
  /** Exclusions, intolerances, sensitivities, dislikes, and requirement words. A swap may replace them. */
  excludedWords: string[];
  noKinds: IngredientKind[];
  glutenFree: boolean;
  notes: string[];
};

/** The subset of the existing food-plan profile that already holds food answers. */
export type ExistingFoodProfile = {
  allergens: Allergen[];
  allergyNote: string;
  avoid: string;
  dislikes: string;
  pattern: "" | "omnivore" | "pescatarian" | "vegetarian" | "vegan";
};

type FoodAnswers = Pick<
  HealthProfileFields,
  "foodAllergies" | "foodReactions" | "allergyNote" | "dietRequirements" | "dietPatterns" | "dietNote"
>;

const NUT_WORDS = ["nut", "nuts"];

function plural(word: string): string[] {
  const w = word.toLowerCase().trim();
  const forms = new Set([w]);
  if (w.endsWith("es")) forms.add(w.slice(0, -2));
  if (w.endsWith("s")) forms.add(w.slice(0, -1));
  else {
    forms.add(`${w}s`);
    forms.add(`${w}es`);
  }
  return [...forms].filter((form) => form.length >= 3);
}

const PORK = ["pork", "bacon", "ham", "sausage", "lard", "gelatin"];
const BEEF = ["beef", "veal", "steak", "mince"];
const ALCOHOL = ["wine", "beer", "rum", "brandy", "alcohol"];

export function foodRules(answers: FoodAnswers | null, prefs: FoodPrefs, existing: ExistingFoodProfile | null = null): FoodRules {
  const reactions = answers?.foodReactions ?? [];
  const allergyFoods = reactions.filter((item) => item.type === "allergy").map((item) => item.food);
  const allergyText = [answers?.allergyNote ?? "", existing?.allergyNote ?? "", ...allergyFoods].join(", ");
  const allergens = new Set<Allergen>([
    ...(answers?.foodAllergies ?? []),
    ...(existing?.allergens ?? []),
    ...extraAllergens(allergyText),
  ]);
  const allergyWords = splitFoods(allergyText).filter((word) => !NUT_WORDS.includes(word));
  const requirements = answers?.dietRequirements ?? [];
  const patterns = answers?.dietPatterns ?? [];
  const excluded = new Set<string>([
    ...prefs.exclusions,
    ...prefs.disliked,
    ...reactions.filter((item) => item.type !== "allergy").map((item) => item.food),
    ...splitFoods(existing?.avoid ?? ""),
    ...splitFoods(existing?.dislikes ?? ""),
  ]);
  const noKinds = new Set<IngredientKind>();
  const notes: string[] = [];
  const has = <T extends string>(list: T[], value: T) => list.includes(value);
  const vegan = has(requirements, "vegan") || has(patterns, "vegan") || existing?.pattern === "vegan";
  const vegetarian = vegan || has(requirements, "vegetarian") || has(patterns, "vegetarian") || existing?.pattern === "vegetarian";
  const pescatarian = has(patterns, "pescatarian") || existing?.pattern === "pescatarian";
  if (vegetarian || pescatarian || has(requirements, "no-meat") || prefs.eatsMeat === "no") noKinds.add("meat");
  if ((vegetarian && !pescatarian) || prefs.eatsFish === "no") noKinds.add("fish");
  if (vegan) {
    noKinds.add("dairy");
    noKinds.add("egg");
    noKinds.add("honey");
  }
  if (prefs.eatsDairy === "no" || has(patterns, "dairy-free")) noKinds.add("dairy");
  if (has(patterns, "low-lactose")) {
    noKinds.add("dairy");
    notes.push("Low-lactose: dairy is left out of suggestions. Lactose-free products may suit you; check the label.");
  }
  if (has(requirements, "no-pork") || has(requirements, "halal") || has(requirements, "kosher")) PORK.forEach((word) => excluded.add(word));
  if (has(requirements, "no-beef")) BEEF.forEach((word) => excluded.add(word));
  if (has(requirements, "halal")) ALCOHOL.forEach((word) => excluded.add(word));
  if (has(requirements, "kosher")) allergens.add("shellfish");
  if (has(requirements, "halal") || has(requirements, "kosher")) {
    notes.push(
      "Halal and kosher also depend on how food is sourced and prepared. LifeZoi leaves out pork and other excluded foods but cannot certify a meal. Choose certified products.",
    );
  }
  return {
    allergens: [...allergens],
    allergyWords,
    excludedWords: [...excluded],
    noKinds: [...noKinds],
    glutenFree: has(patterns, "gluten-free") || /\b(gluten|coeliac|celiac)\b/i.test(allergyText),
    notes,
  };
}

function ingredientWords(item: Pick<Ingredient, "name" | "aliases">): string[] {
  return [item.name.toLowerCase(), ...item.aliases.map((alias) => alias.toLowerCase())];
}

export function mentions(item: Pick<Ingredient, "name" | "aliases">, word: string): boolean {
  const forms = plural(word);
  return ingredientWords(item).some((text) => forms.some((form) => new RegExp(`\\b${form.replace(/[^a-z ]/g, "")}\\b`).test(text)));
}

type Check = { ok: true; swaps: string[]; warnings: string[] } | { ok: false; reason: string };

function blockedIngredient(item: { name: string; kind: IngredientKind; allergens: Allergen[]; aliases: string[] }, rules: FoodRules, allowSwap: boolean): string | null {
  const allergen = item.allergens.find((value) => rules.allergens.includes(value));
  if (allergen) return `contains ${allergenLabels[allergen].toLowerCase()} (allergy)`;
  const word = rules.allergyWords.find((value) => mentions(item, value));
  if (word) return `contains ${word} (allergy)`;
  if (rules.glutenFree && item.allergens.includes("wheat")) return "contains gluten";
  if (rules.noKinds.includes(item.kind)) return `contains ${item.kind}`;
  if (!allowSwap) {
    const excluded = rules.excludedWords.find((value) => mentions(item, value));
    if (excluded) return `contains ${excluded} (excluded)`;
  }
  return null;
}

/** Can a single food be named in a suggestion? Same allergy, diet, and exclusion checks as a recipe ingredient, with no swap. */
export function ingredientAllowed(item: { name: string; kind: IngredientKind; allergens: Allergen[]; aliases: string[] }, rules: FoodRules): boolean {
  return blockedIngredient(item, rules, false) === null;
}

const CROSS_CONTACT: Partial<Record<Allergen, string>> = {
  wheat: "Oats and grains can be processed with wheat. Choose products labeled gluten-free if needed.",
  peanut: "Seeds, granola, and dried fruit can carry a may-contain warning for peanuts. Read the label.",
  "tree-nut": "Seeds, granola, and dried fruit can carry a may-contain warning for tree nuts. Read the label.",
  sesame: "Breads and hummus often contain or may contain sesame. Read the label.",
  milk: "Breads, spreads, and plant drinks can contain milk. Read the label.",
  soy: "Sauces, breads, and stock can contain soy. Read the label.",
  egg: "Breads and pasta can contain egg. Read the label.",
  fish: "Some sauces and stocks contain fish. Read the label.",
  shellfish: "Some stocks and sauces contain shellfish. Read the label.",
};

/** Can this recipe be recommended? Allergies are never handled by a swap. */
export function checkRecipe(recipe: Recipe, rules: FoodRules): Check {
  const swaps: string[] = [];
  for (const item of recipe.ingredients) {
    const hard = blockedIngredient(item, rules, true);
    if (hard) return { ok: false, reason: `${item.name} ${hard}` };
    const excluded = rules.excludedWords.find((value) => mentions(item, value));
    if (!excluded) continue;
    if (!item.swap) return { ok: false, reason: `${item.name} contains ${excluded} (excluded)` };
    const swapBlocked = blockedIngredient({ ...item.swap, aliases: [item.swap.name.toLowerCase()] }, rules, false);
    if (swapBlocked) return { ok: false, reason: `${item.name} contains ${excluded} and the swap is not suitable` };
    swaps.push(`Made without ${item.name.toLowerCase()}: use ${item.swap.name.toLowerCase()} instead.`);
  }
  const warnings = rules.allergens
    .map((allergen) => CROSS_CONTACT[allergen])
    .filter((text): text is string => Boolean(text));
  if (rules.allergyWords.length > 0) warnings.push(`Check labels and shared kitchen tools for ${rules.allergyWords.join(", ")}.`);
  if (rules.allergens.length > 0 || rules.allergyWords.length > 0) {
    warnings.push("This idea leaves out the foods you listed, but LifeZoi cannot confirm any recipe is free of an allergen or cross-contact.");
  }
  return { ok: true, swaps, warnings: [...new Set(warnings)] };
}

const GOAL_TAGS: Record<NutritionGoal, RecipeTag[]> = {
  lose: ["vegetables", "fiber", "protein", "light"],
  gain: ["energy-dense", "protein", "whole-grain"],
  maintain: ["vegetables", "protein", "whole-grain"],
  general: ["vegetables", "fiber", "whole-grain"],
  "blood-sugar": ["fiber", "protein", "whole-grain", "low-added-sugar"],
  cholesterol: ["fiber", "unsaturated-fat", "vegetables"],
};

export const PORTION_GUIDANCE: Record<NutritionGoal, string[]> = {
  lose: [
    "Fill about half the plate with vegetables, a quarter with protein, and a quarter with starch.",
    "Keep regular meals so you are not very hungry later. No single food causes weight loss; the overall pattern over weeks matters.",
    "A slow, steady change is safer than strict dieting. LifeZoi does not set a calorie deficit.",
  ],
  gain: [
    "Add one or two snacks a day and an extra spoon of healthy fat, such as olive oil or nut butter, if those suit you.",
    "Include a protein food at each meal. No single food causes weight gain; regular extra portions over weeks help.",
    "If you are losing weight without trying, talk to a clinician.",
  ],
  maintain: [
    "Use a balanced plate: half vegetables, a quarter protein, a quarter starch.",
    "Keep meal times steady and adjust portions to your hunger.",
  ],
  general: [
    "Aim for a variety of vegetables, fruit, whole grains, and protein foods across the week.",
    "Choose water most of the time and keep sugary drinks occasional.",
  ],
  "blood-sugar": [
    "Pair starchy foods with protein, fiber, or vegetables, and keep portions of starch steady across meals.",
    "Keep to the meal timing and medicines your care team set. LifeZoi does not change either.",
  ],
  cholesterol: [
    "Choose unsaturated fats such as olive oil, nuts, seeds, and oily fish more often than butter or fatty meat.",
    "Fiber from oats, beans, and lentils fits well. Follow your clinician's advice on any medicine.",
  ],
};

function score(recipe: Recipe, goal: NutritionGoal, liked: string[], boost?: (recipe: Recipe) => number): number {
  let total = boost ? boost(recipe) : 0;
  for (const tag of GOAL_TAGS[goal]) if (recipe.tags.includes(tag)) total += 2;
  if (goal === "lose" && recipe.tags.includes("energy-dense")) total -= 1;
  if (liked.some((word) => recipe.ingredients.some((item) => mentions(item, word)))) total += 3;
  return total;
}

export type MealSuggestion = { recipe: Recipe; swaps: string[]; warnings: string[] };

export type DayMeals = {
  goal: NutritionGoal;
  slots: Record<MealSlot, MealSuggestion[]>;
  excluded: { recipe: Recipe; reason: string }[];
  guidance: string[];
  safety: string[];
};

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Suggestions for one day. The seed rotates choices so each day can differ. */
export function mealsForDay(
  answers: HealthProfileFields | null,
  prefs: FoodPrefs,
  goal: NutritionGoal,
  seed: string,
  existing: ExistingFoodProfile | null = null,
  recipes: Recipe[] = RECIPES,
  /** Optional extra ranking, such as Women's Care. It only reorders meals that already passed every check. */
  boost?: (recipe: Recipe) => number,
): DayMeals {
  const rules = foodRules(answers, prefs, existing);
  const liked = prefs.liked;
  const slots: Record<MealSlot, MealSuggestion[]> = { breakfast: [], lunch: [], dinner: [], snack: [] };
  const excluded: DayMeals["excluded"] = [];
  for (const recipe of recipes) {
    const check = checkRecipe(recipe, rules);
    if (!check.ok) {
      excluded.push({ recipe, reason: check.reason });
      continue;
    }
    slots[recipe.slot].push({ recipe, swaps: check.swaps, warnings: check.warnings });
  }
  const base = hash(seed);
  for (const slot of Object.keys(slots) as MealSlot[]) {
    slots[slot].sort((a, b) => {
      const diff = score(b.recipe, goal, liked, boost) - score(a.recipe, goal, liked, boost);
      if (diff !== 0) return diff;
      return ((hash(a.recipe.id) ^ base) >>> 0) - ((hash(b.recipe.id) ^ base) >>> 0);
    });
    // Rotate among the top choices so the same meal is not always first.
    const top = slots[slot].slice(0, 3);
    if (top.length > 1) {
      const shift = base % top.length;
      slots[slot] = [...top.slice(shift), ...top.slice(0, shift), ...slots[slot].slice(3)];
    }
  }
  const snackCount = goal === "gain" ? 2 : goal === "lose" ? 1 : 1;
  slots.snack = slots.snack.slice(0, Math.max(snackCount, 3));
  const flags = answers ? safetyFlags(answers) : null;
  return {
    goal,
    slots,
    excluded,
    guidance: PORTION_GUIDANCE[goal],
    safety: [
      ...rules.notes,
      ...(flags ? safetyNotes(flags).filter((note) => /blood sugar|allergen|diet/i.test(note)) : []),
      "These are general ideas, not a medical diet. A registered dietitian can tailor a plan to a health condition.",
    ],
  };
}

export type ShoppingLine = { name: string; recipes: string[] };

export function shoppingList(suggestions: MealSuggestion[]): ShoppingLine[] {
  const map = new Map<string, ShoppingLine>();
  for (const { recipe, swaps } of suggestions) {
    for (const item of recipe.ingredients) {
      const swapped = swaps.find((text) => text.startsWith(`Made without ${item.name.toLowerCase()}`));
      const name = swapped && item.swap ? item.swap.name : item.name;
      const key = name.toLowerCase();
      const line = map.get(key) ?? { name, recipes: [] };
      if (!line.recipes.includes(recipe.name)) line.recipes.push(recipe.name);
      map.set(key, line);
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}
