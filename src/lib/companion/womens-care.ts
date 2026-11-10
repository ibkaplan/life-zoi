import type { Allergen, MealSlot } from "@/lib/food-plan/types";
import type { HealthProfileFields } from "@/lib/health-profile";
import {
  foodRules,
  ingredientAllowed,
  mealsForDay,
  mentions,
  type DayMeals,
  type ExistingFoodProfile,
  type FoodRules,
  type MealSuggestion,
  type NutritionGoal,
} from "@/lib/companion/nutrition";
import { RECIPES, type Ingredient, type IngredientKind, type Recipe } from "@/lib/companion/recipes";
import type { CareSymptom, CyclePhase, FoodPrefs, LifeStage, WomensCarePrefs } from "@/lib/companion/state";

/**
 * Women's Care: a layer on the existing daily meal plan, not a separate plan.
 *
 * It is used only when the person has said both that she identifies as a
 * woman and that cycle or menopause nutrition is relevant to her. It adds a
 * few recipe ideas to the same pool, runs them through the same allergy,
 * diet, religious, and exclusion checks, and reorders meals that already
 * passed those checks. It never adds a meal that the checks refused.
 *
 * Everything stays on the device or in the person's own account row.
 * Nothing here is sent to an AI or other outside service.
 *
 * The wording is qualitative. It makes no medical claim, gives no amounts,
 * and does not diagnose. Text lives in this file so it can be moved to
 * translation keys later.
 */

export const WOMENS_CARE_TITLE = "WOMEN'S CARE – Nutrition That Understands Your Body";
export const WOMENS_CARE_MESSAGE = "We care about women at every stage of life. Your body changes, and your nutrition can change with it.";
export const WOMENS_CARE_TAKE_CARE = "Take care of yourself, gently and without rules about good or bad food.";
export const WOMENS_CARE_SHARE_CARE = "If a sister, mother, daughter, or friend might like this too, you can invite her.";
export const WOMENS_CARE_PRIVACY =
  "Your answers here are saved with your other food choices: in this browser, or in your own account when you are signed in. They are never sent to an AI or any outside service, and LifeZoi never guesses them.";
export const WOMENS_CARE_NOT_MEDICAL =
  "These are general food ideas, not medical advice or a diagnosis. Your body and your cycle are your own; use what feels right and leave the rest.";

export const lifeStageLabels: Record<LifeStage, string> = {
  cycle: "I have a menstrual cycle",
  perimenopause: "Perimenopause (my cycle is changing)",
  menopause: "Menopause or after",
};

export const cyclePhaseLabels: Record<CyclePhase, string> = {
  period: "During my period",
  follicular: "The days after my period",
  ovulation: "Around the middle of my cycle",
  luteal: "The week or so before my period",
  unsure: "Not sure, or my cycle is irregular",
};

export const careSymptomLabels: Record<CareSymptom, string> = {
  tired: "Tired or low energy",
  cramps: "Cramps",
  bloating: "Bloating",
  "sweet-cravings": "Craving something sweet",
  "salty-cravings": "Craving something salty or savory",
  "big-appetite": "Hungrier than usual",
  "low-mood": "Low or changeable mood",
  headache: "Headaches",
  "hot-flushes": "Hot flushes",
  "poor-sleep": "Trouble sleeping",
  "heavy-bleeding": "Heavy bleeding",
  severe: "Symptoms are severe or stop me doing daily things",
};

export function womensCareActive(care: WomensCarePrefs | null | undefined): care is WomensCarePrefs {
  return Boolean(care && care.identifiesAsWoman && care.relevant);
}

// ---------- focus areas ----------

export const FOCUS_IDS = ["iron", "vitamin-c", "protein", "fiber", "calcium", "omega-3", "magnesium", "warm"] as const;
export type FocusId = (typeof FOCUS_IDS)[number];

type FoodExample = Pick<Ingredient, "name" | "kind" | "allergens" | "aliases">;

function food(name: string, kind: IngredientKind, allergens: Allergen[] = [], aliases: string[] = []): FoodExample {
  return { name, kind, allergens, aliases: [name.toLowerCase(), ...aliases] };
}

type Focus = {
  label: string;
  why: string;
  /** Example foods. Each is checked against the person's rules before it is shown. */
  examples: FoodExample[];
  /** Words that mark a recipe ingredient as fitting this focus. */
  words: string[];
  tags?: Recipe["tags"];
};

const FOCUS: Record<FocusId, Focus> = {
  iron: {
    label: "Iron-rich foods",
    why: "Some iron is lost with menstrual blood. Iron-rich foods help you get enough from what you eat.",
    examples: [
      food("Red meat such as beef or lamb", "meat", [], ["beef", "lamb", "steak"]),
      food("Chicken or turkey", "meat", [], ["chicken", "turkey"]),
      food("Sardines or salmon", "fish", ["fish"], ["fish", "sardines", "salmon"]),
      food("Eggs", "egg", ["egg"], ["egg"]),
      food("Lentils, beans, and chickpeas", "plant", [], ["lentils", "beans", "chickpeas"]),
      food("Tofu or tempeh", "plant", ["soy"], ["soy", "tofu", "tempeh"]),
      food("Spinach and other dark leafy greens", "plant", [], ["spinach", "greens", "kale"]),
      food("Pumpkin seeds", "plant", [], ["seeds"]),
      food("Iron-fortified breakfast cereal", "plant", ["wheat"], ["cereal"]),
    ],
    words: ["beef", "lamb", "steak", "mince", "turkey", "sardine", "salmon", "tuna", "egg", "lentil", "bean", "chickpea", "hummus", "spinach", "kale", "tofu", "tempeh", "edamame", "pumpkin", "quinoa"],
  },
  "vitamin-c": {
    label: "Vitamin C with iron",
    why: "Eating vitamin C foods in the same meal helps your body take up iron from plant foods.",
    examples: [
      food("Peppers", "plant", [], ["pepper"]),
      food("Tomatoes", "plant", [], ["tomato"]),
      food("Broccoli", "plant"),
      food("Citrus fruit", "plant", [], ["orange", "lemon", "lime"]),
      food("Berries and kiwi", "plant", [], ["berries", "strawberries", "kiwi"]),
    ],
    words: ["pepper", "tomato", "broccoli", "lemon", "lime", "orange", "berry", "berries", "strawberry", "strawberries", "raspberry", "raspberries", "kiwi"],
  },
  protein: {
    label: "Protein at each meal",
    why: "Protein with a meal helps it keep you full and gives steady energy.",
    examples: [
      food("Fish", "fish", ["fish"], ["fish"]),
      food("Chicken, turkey, or lean meat", "meat", [], ["chicken", "turkey", "beef"]),
      food("Eggs", "egg", ["egg"], ["egg"]),
      food("Greek yogurt or cottage cheese", "dairy", ["milk"], ["yogurt", "cheese", "dairy"]),
      food("Beans, lentils, tofu, or tempeh", "plant", ["soy"], ["beans", "lentils", "tofu", "soy"]),
    ],
    words: [],
    tags: ["protein"],
  },
  fiber: {
    label: "Fiber and whole grains",
    why: "Fiber-rich foods and whole grains give slower, steadier energy and support regular digestion.",
    examples: [
      food("Oats", "plant", [], ["oats"]),
      food("Brown rice or quinoa", "plant", [], ["rice", "quinoa"]),
      food("Beans and lentils", "plant", [], ["beans", "lentils"]),
      food("Vegetables and fruit", "plant", [], ["vegetables", "fruit"]),
    ],
    words: [],
    tags: ["fiber", "whole-grain"],
  },
  calcium: {
    label: "Calcium and vitamin D",
    why: "Bones change around and after menopause. Calcium foods, and vitamin D from sunlight or food, support bone health.",
    examples: [
      food("Milk, yogurt, or cheese", "dairy", ["milk"], ["milk", "yogurt", "cheese", "dairy"]),
      food("Calcium-fortified plant drink", "plant", [], ["plant drink", "oat drink"]),
      food("Tofu made with calcium", "plant", ["soy"], ["tofu", "soy"]),
      food("Sardines or canned salmon with soft bones", "fish", ["fish"], ["fish", "sardines", "salmon"]),
      food("Broccoli and kale", "plant", [], ["broccoli", "kale"]),
      food("Almonds", "plant", ["tree-nut"], ["nuts", "almond"]),
    ],
    words: ["milk", "yogurt", "yoghurt", "cheese", "cottage", "tofu", "sardine", "broccoli", "kale", "almond", "fortified"],
  },
  "omega-3": {
    label: "Omega-3 fats",
    why: "Oily fish, walnuts, and chia or flax seeds are sources of omega-3 fats that fit a heart-healthy pattern.",
    examples: [
      food("Salmon, sardines, or mackerel", "fish", ["fish"], ["fish", "salmon", "sardines", "mackerel"]),
      food("Walnuts", "plant", ["tree-nut"], ["nuts", "walnut"]),
      food("Chia or ground flax seeds", "plant", [], ["chia", "flax", "seeds"]),
    ],
    words: ["salmon", "sardine", "mackerel", "tuna", "walnut", "chia", "flax"],
  },
  magnesium: {
    label: "Magnesium foods",
    why: "Seeds, nuts, beans, leafy greens, whole grains, and dark chocolate all provide magnesium.",
    examples: [
      food("Pumpkin seeds", "plant", [], ["seeds"]),
      food("Almonds", "plant", ["tree-nut"], ["nuts", "almond"]),
      food("Beans and lentils", "plant", [], ["beans", "lentils"]),
      food("Spinach", "plant"),
      food("Whole grains", "plant", [], ["oats", "rice", "quinoa"]),
      food("Dark chocolate", "plant", ["milk"], ["chocolate", "cocoa"]),
    ],
    words: ["pumpkin", "almond", "bean", "lentil", "spinach", "oat", "quinoa", "chocolate", "cocoa", "chia"],
  },
  warm: {
    label: "Warm, comforting meals",
    why: "Many people find warm meals and drinks comforting on days with cramps or low energy.",
    examples: [
      food("Soups and stews", "plant", [], ["soup", "stew"]),
      food("Warm porridge", "plant", [], ["oats", "porridge"]),
      food("Herbal tea", "plant", [], ["tea"]),
    ],
    words: ["soup", "chili", "stew", "curry", "porridge", "oats", "baked", "dal"],
  },
};

function stageFocus(stage: LifeStage | "", phase: CyclePhase | ""): FocusId[] {
  if (stage === "perimenopause") return ["calcium", "protein", "fiber", "omega-3", "iron"];
  if (stage === "menopause") return ["calcium", "protein", "fiber", "omega-3"];
  switch (phase) {
    case "period":
      return ["iron", "vitamin-c", "protein", "warm"];
    case "follicular":
      return ["protein", "fiber", "iron", "vitamin-c"];
    case "ovulation":
      return ["fiber", "protein", "vitamin-c"];
    case "luteal":
      return ["fiber", "protein", "magnesium"];
    default:
      return ["iron", "vitamin-c", "fiber", "protein"];
  }
}

const SYMPTOM_FOCUS: Partial<Record<CareSymptom, FocusId[]>> = {
  tired: ["iron", "vitamin-c", "protein"],
  "heavy-bleeding": ["iron", "vitamin-c"],
  cramps: ["warm", "omega-3", "magnesium"],
  "big-appetite": ["protein", "fiber"],
  "sweet-cravings": ["fiber", "protein"],
  "low-mood": ["omega-3", "fiber"],
  "poor-sleep": ["magnesium"],
};

export function focusFor(care: WomensCarePrefs): FocusId[] {
  const ids = new Set<FocusId>(stageFocus(care.stage, care.phase));
  for (const symptom of care.symptoms) for (const id of SYMPTOM_FOCUS[symptom] ?? []) ids.add(id);
  if (care.ironConcern) ids.add("iron");
  return [...ids];
}

/** Which focus areas a recipe meets, by its ingredients and tags. */
export function recipeFocus(recipe: Recipe, focus: FocusId[]): FocusId[] {
  return focus.filter((id) => {
    const area = FOCUS[id];
    if (area.tags?.some((tag) => recipe.tags.includes(tag))) return true;
    return area.words.some((word) => recipe.ingredients.some((item) => mentions(item, word)) || new RegExp(`\\b${word}`, "i").test(recipe.name));
  });
}

// ---------- extra recipe ideas, checked like every other recipe ----------

function ing(name: string, kind: IngredientKind, allergens: Allergen[] = [], aliases: string[] = [], swap?: Ingredient["swap"]): Ingredient {
  return { name, kind, allergens, aliases: [name.toLowerCase(), ...aliases], swap };
}

export const WOMENS_CARE_RECIPES: Recipe[] = [
  {
    id: "wc-beef-bean-chili",
    name: "Beef and bean chili",
    slot: "dinner",
    minutes: 35,
    summary: "A hearty, warming chili with lean beef, kidney beans, peppers, and tomato.",
    steps: [
      "Brown lean beef mince with a chopped onion in a spoon of olive oil.",
      "Add chopped pepper, a can of chopped tomatoes, drained kidney beans, and a little chili or paprika.",
      "Simmer 20 minutes, stirring now and then. Serve with rice or a baked potato.",
    ],
    ingredients: [
      ing("Lean beef mince", "meat", [], ["beef", "mince"], { name: "Extra beans or lentils", kind: "plant", allergens: [] }),
      ing("Kidney beans", "plant", [], ["beans"]),
      ing("Bell pepper", "plant", [], ["peppers", "pepper"]),
      ing("Chopped tomatoes", "plant", [], ["tomato", "tomatoes"]),
      ing("Onion", "plant", [], ["onions"]),
      ing("Olive oil", "plant", [], ["oil"]),
    ],
    tags: ["protein", "fiber", "vegetables", "low-added-sugar"],
    kcal: null,
    source: "lifezoi-idea",
  },
  {
    id: "wc-chicken-chickpea-spinach",
    name: "Chicken, chickpea, and spinach curry",
    slot: "dinner",
    minutes: 30,
    summary: "A gentle curry with chicken, chickpeas, spinach, and tomato.",
    steps: [
      "Cook chicken pieces in a little oil with onion, garlic, and a spoon of mild curry spice.",
      "Add chopped tomatoes and drained chickpeas and simmer 15 minutes until the chicken is cooked through.",
      "Stir in spinach until it wilts. Serve with brown rice.",
    ],
    ingredients: [
      ing("Chicken", "meat", [], ["chicken breast"]),
      ing("Chickpeas", "plant", [], ["chickpea"]),
      ing("Spinach", "plant"),
      ing("Chopped tomatoes", "plant", [], ["tomato", "tomatoes"]),
      ing("Onion", "plant", [], ["onions"]),
      ing("Brown rice", "plant", [], ["rice"]),
    ],
    tags: ["protein", "fiber", "vegetables", "whole-grain", "low-added-sugar"],
    kcal: null,
    source: "lifezoi-idea",
  },
  {
    id: "wc-sardine-toast",
    name: "Sardines on whole-grain toast",
    slot: "lunch",
    minutes: 10,
    summary: "Sardines on toast with tomato and lemon: a quick, satisfying lunch.",
    steps: ["Toast a slice of whole-grain bread.", "Top with sardines from a can, mashed lightly.", "Add sliced tomato, a squeeze of lemon, and black pepper."],
    ingredients: [
      ing("Sardines", "fish", ["fish"], ["fish", "sardine"]),
      ing("Whole-grain bread", "plant", ["wheat"], ["bread", "toast", "gluten"]),
      ing("Tomato", "plant", [], ["tomatoes"]),
      ing("Lemon", "plant", [], ["lemons"]),
    ],
    tags: ["protein", "unsaturated-fat", "whole-grain", "low-added-sugar"],
    kcal: null,
    source: "lifezoi-idea",
  },
  {
    id: "wc-lentil-spinach-dal",
    name: "Red lentil and spinach dal",
    slot: "lunch",
    minutes: 30,
    summary: "Soft, warm red lentils with spinach, tomato, and mild spices.",
    steps: [
      "Simmer rinsed red lentils in water with turmeric for 15 to 20 minutes until soft.",
      "Soften onion in a little oil with cumin, then stir it into the lentils with chopped tomato.",
      "Add spinach until it wilts. Finish with a squeeze of lemon.",
    ],
    ingredients: [
      ing("Red lentils", "plant", [], ["lentils"]),
      ing("Spinach", "plant"),
      ing("Tomato", "plant", [], ["tomatoes"]),
      ing("Onion", "plant", [], ["onions"]),
      ing("Lemon", "plant", [], ["lemons"]),
    ],
    tags: ["protein", "fiber", "vegetables", "low-added-sugar"],
    kcal: null,
    source: "lifezoi-idea",
  },
  {
    id: "wc-choc-berry-yogurt",
    name: "Dark chocolate and berry yogurt pot",
    slot: "snack",
    minutes: 5,
    summary: "Creamy yogurt with berries and a little grated dark chocolate. A real dessert.",
    steps: ["Spoon yogurt into a bowl or glass.", "Add a handful of berries.", "Grate or chop a square of dark chocolate over the top."],
    ingredients: [
      ing("Greek yogurt", "dairy", ["milk"], ["yogurt", "dairy"]),
      ing("Berries", "plant", [], ["berry", "strawberries", "raspberries"]),
      ing("Dark chocolate", "plant", ["milk"], ["chocolate", "cocoa"]),
    ],
    tags: ["protein", "dessert"],
    kcal: null,
    source: "lifezoi-idea",
  },
  {
    id: "wc-baked-apple-oats",
    name: "Warm baked apple with oats and cinnamon",
    slot: "snack",
    minutes: 25,
    summary: "A soft baked apple with an oat and pumpkin seed topping. Warm and sweet.",
    steps: [
      "Heat the oven to 180 °C (350 °F). Core an apple and place it in a small dish.",
      "Mix a spoon of oats, a spoon of pumpkin seeds, and cinnamon, and press it into and over the apple.",
      "Bake 20 minutes until soft.",
    ],
    ingredients: [
      ing("Apple", "plant", [], ["apples"]),
      ing("Oats", "plant", [], ["oatmeal", "porridge"]),
      ing("Pumpkin seeds", "plant", [], ["seeds", "pumpkin"]),
      ing("Cinnamon", "plant"),
    ],
    tags: ["fiber", "dessert", "low-added-sugar"],
    kcal: null,
    source: "lifezoi-idea",
  },
  {
    id: "wc-choc-chia-pudding",
    name: "Chocolate chia pudding",
    slot: "breakfast",
    minutes: 5,
    summary: "Chia seeds set overnight in a cocoa plant drink, topped with raspberries. Made the night before.",
    steps: [
      "Stir three spoons of chia seeds and a spoon of cocoa powder into a cup of calcium-fortified oat drink.",
      "Leave in the fridge overnight.",
      "Top with raspberries in the morning.",
    ],
    ingredients: [
      ing("Chia seeds", "plant", [], ["chia", "seeds"]),
      ing("Cocoa powder", "plant", [], ["cocoa", "chocolate"]),
      ing("Calcium-fortified oat drink", "plant", [], ["oat drink", "plant drink", "fortified"]),
      ing("Raspberries", "plant", [], ["raspberry", "berries"]),
    ],
    tags: ["fiber", "unsaturated-fat", "dessert", "low-added-sugar"],
    kcal: null,
    source: "lifezoi-idea",
  },
];

// ---------- adapting the day ----------

export type CareHighlight = { slot: MealSlot; recipe: Recipe; focus: FocusId[] };

export type CareFocus = { id: FocusId; label: string; why: string; examples: string[] };

export type WomensCareAdaptation = {
  focus: CareFocus[];
  highlights: CareHighlight[];
  /** Satisfying options from today's checked meals. */
  hearty: MealSuggestion[];
  desserts: MealSuggestion[];
  /** True when meat and fish are both left out by the person's own rules. */
  plantOnly: boolean;
  tips: string[];
  clinician: string[];
  /** The person flagged something that is worth raising with a clinician. */
  urgent: boolean;
};

const BOOST_PER_FOCUS = 2;
const BOOST_CAP = 6;

/** The extra ranking for one recipe. Only used to reorder recipes that already passed every check. */
export function careBoost(recipe: Recipe, focus: FocusId[], care: WomensCarePrefs): number {
  let total = Math.min(recipeFocus(recipe, focus).length * BOOST_PER_FOCUS, BOOST_CAP);
  if (care.symptoms.includes("sweet-cravings") && recipe.tags.includes("dessert")) total += 3;
  if ((care.symptoms.includes("salty-cravings") || care.symptoms.includes("big-appetite")) && recipe.ingredients.some((item) => item.kind === "meat" || item.kind === "fish")) total += 2;
  return total;
}

const SYMPTOM_TIPS: Partial<Record<CareSymptom, string>> = {
  tired: "On tired days, a regular meal with protein and an iron-rich food can help more than skipping and catching up later.",
  cramps: "Warm meals and drinks, and a heat pad, are comforting for many people with cramps.",
  bloating: "Smaller meals, enough water, and eating slowly can feel easier when you are bloated. Very salty foods can make some people feel more puffy.",
  "sweet-cravings": "Craving something sweet is normal. Enjoy a dessert you like; pairing it with protein or fiber, such as yogurt, fruit, or oats, can make it more satisfying.",
  "salty-cravings": "If you want something savory, a hearty meal or a handful of roasted chickpeas or seeds can hit the spot.",
  "big-appetite": "Feeling hungrier is common at some points in the cycle. It is fine to eat a bit more; a filling meal with protein and fiber helps.",
  "low-mood": "Regular meals and time outside or with people you like can help on low days. If low mood lasts or worries you, please talk to someone you trust or a clinician.",
  headache: "Drinking enough water and not going too long without food can help some people with headaches.",
  "hot-flushes": "Some people notice hot drinks, spicy food, or alcohol bring on hot flushes. Noticing your own pattern is more useful than a rule.",
  "poor-sleep": "A lighter evening meal and less caffeine after midday help some people sleep.",
};

const CLINICIAN_BASE =
  "Please see a doctor, nurse, or other clinician if your periods are very heavy, your symptoms are severe or change suddenly, or you are worried about low iron. LifeZoi cannot test for or diagnose iron deficiency, and does not suggest supplements.";

export function careTips(care: WomensCarePrefs): string[] {
  const tips = care.symptoms.map((symptom) => SYMPTOM_TIPS[symptom]).filter((tip): tip is string => Boolean(tip));
  if (care.stage === "perimenopause" || care.stage === "menopause") {
    tips.push("Strength exercise and walking, along with calcium and protein foods, support bones and muscles as you get older.");
  }
  tips.push("There are no good or bad foods here. Every meal counts, and so does enjoying it.");
  return [...new Set(tips)];
}

export function careClinician(care: WomensCarePrefs): { lines: string[]; urgent: boolean } {
  const lines = [CLINICIAN_BASE];
  const urgent = care.symptoms.includes("heavy-bleeding") || care.symptoms.includes("severe") || care.ironConcern;
  if (care.symptoms.includes("heavy-bleeding")) lines.unshift("You said your bleeding is heavy. That is worth talking about with a clinician, who can check your iron and other causes.");
  if (care.ironConcern) lines.unshift("You said you are worried about low iron. A clinician can check this with a simple blood test. Food ideas here do not replace that.");
  if (care.symptoms.includes("severe")) lines.unshift("You said your symptoms are severe. You do not have to just put up with it; a clinician can help.");
  return { lines, urgent };
}

/** Example foods for a focus, without any food the person's rules leave out. */
export function allowedExamples(id: FocusId, rules: FoodRules): string[] {
  return FOCUS[id].examples.filter((item) => ingredientAllowed(item, rules)).map((item) => item.name);
}

const animal = (recipe: Recipe) => recipe.ingredients.some((item) => item.kind === "meat" || item.kind === "fish");

/** Filling lunches and dinners from today's checked ideas: meat and fish first where the person eats them, then beans, lentils, and tofu. */
function heartyOptions(all: MealSuggestion[]): MealSuggestion[] {
  return all
    .filter(({ recipe }) => (recipe.slot === "lunch" || recipe.slot === "dinner") && recipe.tags.includes("protein"))
    .filter(({ recipe }) => animal(recipe) || recipe.ingredients.some((item) => /bean|lentil|chickpea|tofu|tempeh/i.test(item.name)))
    .sort((a, b) => Number(animal(b.recipe)) - Number(animal(a.recipe)))
    .slice(0, 4);
}

export type PlannedDay = { day: DayMeals; care: WomensCareAdaptation | null };

/**
 * The daily meal plan, adapted for Women's Care when the person opted in.
 * Without the opt-in this is exactly mealsForDay with the usual recipes.
 */
export function plannedMeals(
  answers: HealthProfileFields | null,
  prefs: FoodPrefs,
  goal: NutritionGoal,
  seed: string,
  existing: ExistingFoodProfile | null,
  care: WomensCarePrefs | null | undefined,
): PlannedDay {
  if (!womensCareActive(care)) return { day: mealsForDay(answers, prefs, goal, seed, existing, RECIPES), care: null };
  const focus = focusFor(care);
  const day = mealsForDay(answers, prefs, goal, seed, existing, [...RECIPES, ...WOMENS_CARE_RECIPES], (recipe) => careBoost(recipe, focus, care));
  const rules = foodRules(answers, prefs, existing);
  const all = (Object.keys(day.slots) as MealSlot[]).flatMap((slot) => day.slots[slot]);
  const highlights: CareHighlight[] = [];
  for (const slot of Object.keys(day.slots) as MealSlot[]) {
    const first = day.slots[slot][0];
    if (!first) continue;
    const matched = recipeFocus(first.recipe, focus);
    if (matched.length > 0) highlights.push({ slot, recipe: first.recipe, focus: matched });
  }
  const { lines, urgent } = careClinician(care);
  return {
    day,
    care: {
      focus: focus.map((id) => ({ id, label: FOCUS[id].label, why: FOCUS[id].why, examples: allowedExamples(id, rules) })).filter((item) => item.examples.length > 0),
      highlights,
      hearty: heartyOptions(all),
      desserts: all.filter(({ recipe }) => recipe.tags.includes("dessert")).slice(0, 3),
      plantOnly: rules.noKinds.includes("meat") && rules.noKinds.includes("fish"),
      tips: careTips(care),
      clinician: lines,
      urgent,
    },
  };
}

export const focusLabels: Record<FocusId, string> = Object.fromEntries(FOCUS_IDS.map((id) => [id, FOCUS[id].label])) as Record<FocusId, string>;
