import type { MealSlot } from "@/lib/food-plan/types";
import { scaleFood, usdaById, type ScaledFood } from "@/lib/food-plan/usda";

export type MealPart = { foodId: string; servings: number };

export type SimpleMeal = {
  id: string;
  name: string;
  slot: MealSlot;
  minutes: number;
  budget: boolean;
  quick: boolean;
  minimalCooking: boolean;
  summary: string;
  steps: string[];
  parts: MealPart[];
  ayurveda: string;
};

export type MealTotals = {
  kcal: number;
  protein: number;
  fiber: number | null;
  fiberGap: string[];
  sat: number | null;
  sodium: number | null;
  lines: Array<{ foodId: string; name: string; fdcId: number; servings: number; scaled: ScaledFood }>;
};

export const SIMPLE_MEALS: SimpleMeal[] = [
  {
    id: "eggs-vegetables",
    name: "Eggs and vegetables",
    slot: "breakfast",
    minutes: 15,
    budget: true,
    quick: true,
    minimalCooking: false,
    summary: "Hard-boiled eggs with spinach, tomato, and a spoon of olive oil.",
    steps: [
      "Use two hard-boiled eggs.",
      "Warm the spinach and tomato in one tablespoon of olive oil until the spinach wilts.",
      "Serve the eggs with the vegetables.",
    ],
    parts: [
      { foodId: "egg", servings: 2 },
      { foodId: "spinach", servings: 2 },
      { foodId: "tomato", servings: 0.5 },
      { foodId: "olive-oil", servings: 1 },
    ],
    ayurveda: "Optional traditional note: add a pinch of cumin. Keep the same foods.",
  },
  {
    id: "greek-berries",
    name: "Greek yogurt and berries",
    slot: "breakfast",
    minutes: 5,
    budget: true,
    quick: true,
    minimalCooking: true,
    summary: "Plain nonfat Greek yogurt with half a cup of blueberries.",
    steps: ["Spoon the yogurt into a bowl.", "Add half a cup of blueberries."],
    parts: [
      { foodId: "greek-yogurt", servings: 1 },
      { foodId: "blueberries", servings: 0.5 },
    ],
    ayurveda: "Optional traditional note: stir in a pinch of cardamom. Keep the yogurt and berries.",
  },
  {
    id: "cottage-fruit",
    name: "Cottage cheese and fruit",
    slot: "breakfast",
    minutes: 5,
    budget: true,
    quick: true,
    minimalCooking: true,
    summary: "Low-fat cottage cheese with a cup of apple slices.",
    steps: ["Add the cottage cheese to a bowl.", "Serve it with a cup of apple slices."],
    parts: [
      { foodId: "cottage", servings: 1 },
      { foodId: "apple", servings: 1 },
    ],
    ayurveda: "Optional traditional note: add cinnamon. Keep the cheese and fruit.",
  },
  {
    id: "oats-seeds-berries",
    name: "Oats, seeds, and berries",
    slot: "breakfast",
    minutes: 5,
    budget: true,
    quick: true,
    minimalCooking: true,
    summary: "Cooked oats with pumpkin seeds and half a cup of blueberries.",
    steps: ["Start with a cup of cooked oats.", "Add an ounce of pumpkin seeds and half a cup of blueberries."],
    parts: [
      { foodId: "oats", servings: 1 },
      { foodId: "pumpkin-seeds", servings: 1 },
      { foodId: "blueberries", servings: 0.5 },
    ],
    ayurveda: "Optional traditional note: add cinnamon. The oats, seeds, and berries stay.",
  },
  {
    id: "bean-salad",
    name: "Black bean salad",
    slot: "lunch",
    minutes: 10,
    budget: true,
    quick: true,
    minimalCooking: true,
    summary: "Cooked black beans, romaine, tomato, and olive oil.",
    steps: ["Combine a cup of cooked black beans with romaine and half a tomato.", "Add one tablespoon of olive oil."],
    parts: [
      { foodId: "black-beans", servings: 1 },
      { foodId: "romaine", servings: 2 },
      { foodId: "tomato", servings: 0.5 },
      { foodId: "olive-oil", servings: 1 },
    ],
    ayurveda: "Optional traditional note: add cumin. Keep the beans and vegetables.",
  },
  {
    id: "chickpea-salad",
    name: "Chickpea salad",
    slot: "lunch",
    minutes: 10,
    budget: true,
    quick: true,
    minimalCooking: true,
    summary: "Cooked chickpeas, cucumber, romaine, and olive oil.",
    steps: ["Toss a cup of cooked chickpeas with cucumber and romaine.", "Add one tablespoon of olive oil."],
    parts: [
      { foodId: "chickpeas", servings: 1 },
      { foodId: "cucumber", servings: 2 },
      { foodId: "romaine", servings: 2 },
      { foodId: "olive-oil", servings: 1 },
    ],
    ayurveda: "Optional traditional note: add coriander. The chickpeas and vegetables stay.",
  },
  {
    id: "kidney-salad",
    name: "Kidney bean salad",
    slot: "lunch",
    minutes: 10,
    budget: true,
    quick: true,
    minimalCooking: true,
    summary: "Cooked kidney beans with spinach, carrot, and olive oil.",
    steps: ["Combine a cup of cooked kidney beans with spinach and a carrot.", "Add one tablespoon of olive oil."],
    parts: [
      { foodId: "kidney-beans", servings: 1 },
      { foodId: "spinach", servings: 2 },
      { foodId: "carrots", servings: 1 },
      { foodId: "olive-oil", servings: 1 },
    ],
    ayurveda: "Optional traditional note: add ginger. Keep the beans and vegetables.",
  },
  {
    id: "chicken-salad",
    name: "Chicken and vegetable salad",
    slot: "lunch",
    minutes: 10,
    budget: true,
    quick: true,
    minimalCooking: true,
    summary: "Cooked chicken breast with romaine, tomato, and olive oil.",
    steps: [
      "Slice the cooked chicken.",
      "Set it on romaine with half a tomato.",
      "Add one tablespoon of olive oil.",
    ],
    parts: [
      { foodId: "chicken", servings: 1 },
      { foodId: "romaine", servings: 2 },
      { foodId: "tomato", servings: 0.5 },
      { foodId: "olive-oil", servings: 1 },
    ],
    ayurveda: "Optional traditional note: add black pepper. The chicken and vegetables stay.",
  },
  {
    id: "tuna-greens",
    name: "Tuna and greens",
    slot: "lunch",
    minutes: 10,
    budget: true,
    quick: true,
    minimalCooking: true,
    summary: "Tuna canned in water with spinach and olive oil.",
    steps: ["Drain the tuna.", "Serve it on two cups of spinach with one tablespoon of olive oil."],
    parts: [
      { foodId: "tuna", servings: 1 },
      { foodId: "spinach", servings: 2 },
      { foodId: "olive-oil", servings: 1 },
    ],
    ayurveda: "Optional traditional note: add fennel seed. Keep the tuna and greens.",
  },
  {
    id: "cod-vegetables",
    name: "Fish and vegetables",
    slot: "dinner",
    minutes: 20,
    budget: true,
    quick: false,
    minimalCooking: false,
    summary: "Cooked Atlantic cod with broccoli, carrot, and olive oil.",
    steps: [
      "Warm the cod with the oil until it flakes. The cod figures are for dry-heat cooked cod; the oil is counted from its own record.",
      "Steam or warm the broccoli and carrot.",
    ],
    parts: [
      { foodId: "cod", servings: 1 },
      { foodId: "broccoli", servings: 1 },
      { foodId: "carrots", servings: 1 },
      { foodId: "olive-oil", servings: 1 },
    ],
    ayurveda: "Optional traditional note: finish with ginger. The fish and vegetables stay.",
  },
  {
    id: "chicken-plate",
    name: "Chicken with salad",
    slot: "dinner",
    minutes: 10,
    budget: true,
    quick: true,
    minimalCooking: true,
    summary: "Cooked chicken with romaine, cucumber, and olive oil.",
    steps: ["Slice the cooked chicken.", "Serve it with romaine, cucumber, and one tablespoon of olive oil."],
    parts: [
      { foodId: "chicken", servings: 1 },
      { foodId: "romaine", servings: 2 },
      { foodId: "cucumber", servings: 2 },
      { foodId: "olive-oil", servings: 1 },
    ],
    ayurveda: "Optional traditional note: add coriander. Keep the chicken and salad.",
  },
  {
    id: "lentils-vegetables",
    name: "Lentils and vegetables",
    slot: "dinner",
    minutes: 15,
    budget: true,
    quick: true,
    minimalCooking: false,
    summary: "Cooked lentils with carrot, spinach, and olive oil.",
    steps: ["Warm a cup of cooked lentils with carrot and spinach.", "Add one tablespoon of olive oil."],
    parts: [
      { foodId: "lentils", servings: 1 },
      { foodId: "carrots", servings: 1 },
      { foodId: "spinach", servings: 2 },
      { foodId: "olive-oil", servings: 1 },
    ],
    ayurveda: "Optional traditional note: add cumin and turmeric. The lentils and vegetables stay.",
  },
  {
    id: "tofu-vegetables",
    name: "Tofu with vegetables",
    slot: "dinner",
    minutes: 15,
    budget: true,
    quick: true,
    minimalCooking: false,
    summary: "Firm tofu with broccoli, carrot, and olive oil.",
    steps: ["Warm the tofu with the vegetables in one tablespoon of olive oil.", "The tofu record is firm tofu prepared with calcium sulfate."],
    parts: [
      { foodId: "tofu", servings: 1 },
      { foodId: "broccoli", servings: 1 },
      { foodId: "carrots", servings: 1 },
      { foodId: "olive-oil", servings: 1 },
    ],
    ayurveda: "Optional traditional note: add ginger. Keep the tofu and vegetables.",
  },
  {
    id: "tempeh-vegetables",
    name: "Tempeh with vegetables",
    slot: "dinner",
    minutes: 15,
    budget: true,
    quick: true,
    minimalCooking: false,
    summary: "Half a cup of tempeh with broccoli and olive oil.",
    steps: ["Warm the tempeh with broccoli in one tablespoon of olive oil."],
    parts: [
      { foodId: "tempeh", servings: 1 },
      { foodId: "broccoli", servings: 1 },
      { foodId: "olive-oil", servings: 1 },
    ],
    ayurveda: "Optional traditional note: add turmeric. The tempeh and vegetables stay.",
  },
  {
    id: "salmon-quinoa",
    name: "Salmon, quinoa, and greens",
    slot: "dinner",
    minutes: 15,
    budget: false,
    quick: true,
    minimalCooking: false,
    summary: "Cooked wild salmon with half a cup of quinoa and spinach.",
    steps: [
      "Warm the salmon. Its figures are for dry-heat cooked salmon.",
      "Serve it with half a cup of cooked quinoa and spinach, plus one tablespoon of olive oil.",
    ],
    parts: [
      { foodId: "salmon", servings: 1 },
      { foodId: "quinoa", servings: 0.5 },
      { foodId: "spinach", servings: 2 },
      { foodId: "olive-oil", servings: 1 },
    ],
    ayurveda: "Optional traditional note: add black pepper. The salmon, grain, and greens stay.",
  },
  {
    id: "turkey-rice",
    name: "Turkey, rice, and vegetables",
    slot: "dinner",
    minutes: 15,
    budget: true,
    quick: true,
    minimalCooking: false,
    summary: "Roasted turkey with half a cup of brown rice and broccoli.",
    steps: ["Use cooked turkey and cooked brown rice.", "Warm them with broccoli and one tablespoon of olive oil."],
    parts: [
      { foodId: "turkey", servings: 1 },
      { foodId: "brown-rice", servings: 0.5 },
      { foodId: "broccoli", servings: 1 },
      { foodId: "olive-oil", servings: 1 },
    ],
    ayurveda: "Optional traditional note: add rosemary in the kitchen sense, as a herb. The foods stay the same.",
  },
  {
    id: "beef-vegetables",
    name: "Lean beef and vegetables",
    slot: "dinner",
    minutes: 15,
    budget: false,
    quick: true,
    minimalCooking: false,
    summary: "Cooked lean tenderloin with broccoli, carrot, and olive oil.",
    steps: ["Slice the cooked lean beef.", "Serve it with broccoli, carrot, and one tablespoon of olive oil."],
    parts: [
      { foodId: "beef", servings: 1 },
      { foodId: "broccoli", servings: 1 },
      { foodId: "carrots", servings: 1 },
      { foodId: "olive-oil", servings: 1 },
    ],
    ayurveda: "Optional traditional note: add black pepper. The beef and vegetables stay.",
  },
  {
    id: "snack-yogurt",
    name: "Plain yogurt",
    slot: "snack",
    minutes: 2,
    budget: true,
    quick: true,
    minimalCooking: true,
    summary: "A 6 ounce container of low-fat plain yogurt.",
    steps: ["Eat it plain, or add fruit you already counted elsewhere."],
    parts: [{ foodId: "yogurt", servings: 1 }],
    ayurveda: "Optional traditional note: add a pinch of cardamom.",
  },
  {
    id: "snack-cottage",
    name: "Cottage cheese",
    slot: "snack",
    minutes: 2,
    budget: true,
    quick: true,
    minimalCooking: true,
    summary: "Four ounces of low-fat cottage cheese.",
    steps: ["Serve the cottage cheese as it is, or with vegetables."],
    parts: [{ foodId: "cottage", servings: 1 }],
    ayurveda: "Optional traditional note: add black pepper if you want it savory.",
  },
  {
    id: "snack-egg",
    name: "Boiled egg",
    slot: "snack",
    minutes: 2,
    budget: true,
    quick: true,
    minimalCooking: true,
    summary: "One hard-boiled egg.",
    steps: ["Use one hard-boiled egg."],
    parts: [{ foodId: "egg", servings: 1 }],
    ayurveda: "Optional traditional note: add black pepper.",
  },
  {
    id: "snack-almonds",
    name: "Small handful of almonds",
    slot: "snack",
    minutes: 1,
    budget: false,
    quick: true,
    minimalCooking: true,
    summary: "One ounce of almonds, about 23 kernels.",
    steps: ["Measure about one ounce. More is easy to pour, and this record is for one ounce."],
    parts: [{ foodId: "almonds", servings: 1 }],
    ayurveda: "Optional traditional note: none is needed. Nuts are the whole snack.",
  },
  {
    id: "snack-yogurt-fruit",
    name: "Fruit with yogurt",
    slot: "snack",
    minutes: 5,
    budget: true,
    quick: true,
    minimalCooking: true,
    summary: "Nonfat Greek yogurt with half a cup of sliced strawberries.",
    steps: ["Add the yogurt to a bowl.", "Top it with half a cup of sliced strawberries."],
    parts: [
      { foodId: "greek-yogurt", servings: 1 },
      { foodId: "strawberries", servings: 0.5 },
    ],
    ayurveda: "Optional traditional note: add cinnamon.",
  },
  {
    id: "snack-edamame",
    name: "Edamame",
    slot: "snack",
    minutes: 5,
    budget: true,
    quick: true,
    minimalCooking: true,
    summary: "One cup of prepared edamame.",
    steps: ["Use frozen edamame that has been prepared as the record describes."],
    parts: [{ foodId: "edamame", servings: 1 }],
    ayurveda: "Optional traditional note: add a pinch of salt you supply, or leave it plain. The record is prepared edamame.",
  },
];

const MEAL_BY_ID = new Map(SIMPLE_MEALS.map((meal) => [meal.id, meal]));

export function mealById(id: string): SimpleMeal | null {
  return MEAL_BY_ID.get(id) ?? null;
}

export function sumParts(parts: MealPart[], portion = 1): MealTotals {
  return mealTotals({ id: "sum", name: "", slot: "breakfast", minutes: 0, budget: true, quick: true, minimalCooking: true, summary: "", steps: [], parts, ayurveda: "" }, portion);
}

export function mealTotals(meal: SimpleMeal, portion = 1): MealTotals {
  let kcal = 0;
  let protein = 0;
  let fiber = 0;
  let fiberKnown = true;
  let sat = 0;
  let satKnown = true;
  let sodium = 0;
  let sodiumKnown = true;
  const fiberGap: string[] = [];
  const lines = meal.parts.map((part) => {
    const item = usdaById(part.foodId);
    if (!item) throw new Error(`Missing USDA food ${part.foodId}`);
    const scaled = scaleFood(item, part.servings * portion);
    kcal += scaled.kcal;
    protein += scaled.protein;
    if (scaled.fiber === null) {
      fiberKnown = false;
      fiberGap.push(item.name);
    } else fiber += scaled.fiber;
    if (scaled.sat === null) satKnown = false;
    else sat += scaled.sat;
    if (scaled.sodium === null) sodiumKnown = false;
    else sodium += scaled.sodium;
    return { foodId: item.id, name: item.name, fdcId: item.fdcId, servings: part.servings * portion, scaled };
  });
  return {
    kcal,
    protein,
    fiber: fiberKnown ? fiber : null,
    fiberGap,
    sat: satKnown ? sat : null,
    sodium: sodiumKnown ? sodium : null,
    lines,
  };
}

export function mealUsesCheese(meal: SimpleMeal): boolean {
  return meal.parts.some((part) => part.foodId === "cheddar");
}

export function mealUsesProcessedMeat(meal: SimpleMeal): boolean {
  return meal.parts.some((part) => /sausage|bacon|ham|salami|pepperoni/.test(part.foodId));
}
