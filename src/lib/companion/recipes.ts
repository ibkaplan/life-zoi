import { SIMPLE_MEALS, mealTotals } from "@/lib/food-plan/meals";
import type { Allergen, MealSlot } from "@/lib/food-plan/types";
import { usdaById, type UsdaFood } from "@/lib/food-plan/usda";

/**
 * One recipe view over the existing food-plan meals (with USDA nutrient
 * values) plus a few LifeZoi recipe ideas that have no nutrient numbers.
 * The food database itself is not duplicated: meal ingredients come from
 * src/lib/food-plan/usda.ts.
 */

export type IngredientKind = UsdaFood["kind"] | "honey";

export type Ingredient = {
  name: string;
  kind: IngredientKind;
  allergens: Allergen[];
  /** Words that also refer to this ingredient, for exclusion matching. */
  aliases: string[];
  /** A replacement used only for a non-allergy exclusion. */
  swap?: { name: string; kind: IngredientKind; allergens: Allergen[] };
};

export type RecipeTag = "fiber" | "protein" | "unsaturated-fat" | "energy-dense" | "light" | "vegetables" | "whole-grain" | "low-added-sugar" | "dessert";

export type Recipe = {
  id: string;
  name: string;
  slot: MealSlot;
  minutes: number;
  summary: string;
  steps: string[];
  ingredients: Ingredient[];
  tags: RecipeTag[];
  /** Nutrient totals exist only for meals built from USDA records. */
  kcal: number | null;
  source: "food-plan" | "lifezoi-idea";
};

function fromUsda(food: UsdaFood): Ingredient {
  const words = food.name.toLowerCase().split(/[^a-z]+/).filter((word) => word.length > 2);
  return { name: food.name, kind: food.kind, allergens: food.allergens, aliases: [food.id.replace(/-/g, " "), ...words] };
}

function tagsFor(ids: string[]): RecipeTag[] {
  const tags = new Set<RecipeTag>(["low-added-sugar"]);
  const has = (list: string[]) => ids.some((id) => list.includes(id));
  if (has(["lentils", "black-beans", "chickpeas", "kidney-beans", "oats", "chia", "brown-rice", "quinoa", "broccoli"])) tags.add("fiber");
  if (has(["egg", "chicken", "turkey", "salmon", "tuna", "cod", "beef", "greek-yogurt", "cottage", "tofu", "tempeh", "lentils", "edamame"])) tags.add("protein");
  if (has(["olive-oil", "almonds", "walnuts", "salmon", "chia", "pumpkin-seeds"])) tags.add("unsaturated-fat");
  if (has(["spinach", "romaine", "tomato", "cucumber", "broccoli", "carrots"])) tags.add("vegetables");
  if (has(["oats", "brown-rice", "quinoa"])) tags.add("whole-grain");
  if (has(["almonds", "walnuts", "olive-oil", "oats", "banana"])) tags.add("energy-dense");
  return [...tags];
}

const fromFoodPlan: Recipe[] = SIMPLE_MEALS.map((meal) => {
  const ids = meal.parts.map((part) => part.foodId);
  return {
    id: `fp-${meal.id}`,
    name: meal.name,
    slot: meal.slot,
    minutes: meal.minutes,
    summary: meal.summary,
    steps: meal.steps,
    ingredients: ids.map((id) => usdaById(id)).filter((food): food is UsdaFood => food !== null).map(fromUsda),
    tags: tagsFor(ids),
    kcal: Math.round(mealTotals(meal).kcal),
    source: "food-plan",
  };
});

function ing(name: string, kind: IngredientKind, allergens: Allergen[] = [], aliases: string[] = [], swap?: Ingredient["swap"]): Ingredient {
  return { name, kind, allergens, aliases: [name.toLowerCase(), ...aliases], swap };
}

const ideas: Recipe[] = [
  {
    id: "idea-avocado-toast",
    name: "Avocado and tomato toast",
    slot: "breakfast",
    minutes: 10,
    summary: "Whole-grain toast with mashed avocado, tomato, and black pepper.",
    steps: ["Toast one slice of whole-grain bread.", "Mash a quarter to half an avocado with a squeeze of lemon.", "Spread on the toast and top with sliced tomato and pepper."],
    ingredients: [
      ing("Whole-grain bread", "plant", ["wheat"], ["bread", "toast", "gluten"]),
      ing("Avocado", "plant", [], ["avocados", "guacamole"]),
      ing("Tomato", "plant", [], ["tomatoes"]),
      ing("Lemon", "plant", [], ["lemons"]),
    ],
    tags: ["fiber", "unsaturated-fat", "whole-grain", "low-added-sugar"],
    kcal: null,
    source: "lifezoi-idea",
  },
  {
    id: "idea-bean-avocado-bowl",
    name: "Bean, corn, and avocado bowl",
    slot: "lunch",
    minutes: 15,
    summary: "Black beans, corn, peppers, rice, and avocado with lime.",
    steps: ["Warm cooked rice and drained black beans.", "Add corn and chopped pepper.", "Top with diced avocado and a squeeze of lime."],
    ingredients: [
      ing("Black beans", "plant", [], ["beans"]),
      ing("Brown rice", "plant", [], ["rice"]),
      ing("Corn", "plant", [], ["sweetcorn"]),
      ing("Bell pepper", "plant", [], ["peppers", "pepper"]),
      ing("Avocado", "plant", [], ["avocados", "guacamole"], { name: "Plain yogurt or a spoon of olive oil", kind: "plant", allergens: [] }),
      ing("Lime", "plant", [], ["limes"]),
    ],
    tags: ["fiber", "protein", "unsaturated-fat", "vegetables", "whole-grain", "low-added-sugar"],
    kcal: null,
    source: "lifezoi-idea",
  },
  {
    id: "idea-guacamole-veg",
    name: "Guacamole with vegetable sticks",
    slot: "snack",
    minutes: 10,
    summary: "Mashed avocado with lime, served with carrot and cucumber sticks.",
    steps: ["Mash half an avocado with lime and a pinch of salt.", "Cut carrot and cucumber into sticks.", "Dip and enjoy."],
    ingredients: [
      ing("Avocado", "plant", [], ["avocados", "guacamole"]),
      ing("Lime", "plant", [], ["limes"]),
      ing("Carrot", "plant", [], ["carrots"]),
      ing("Cucumber", "plant", [], ["cucumbers"]),
    ],
    tags: ["unsaturated-fat", "vegetables", "low-added-sugar"],
    kcal: null,
    source: "lifezoi-idea",
  },
  {
    id: "idea-lentil-soup",
    name: "Simple lentil and vegetable soup",
    slot: "dinner",
    minutes: 35,
    summary: "Red lentils simmered with onion, carrot, and tomato.",
    steps: [
      "Soften a chopped onion and carrot in a spoon of olive oil.",
      "Add a cup of rinsed red lentils, a can of chopped tomatoes, and four cups of water or low-salt stock.",
      "Simmer 20 to 25 minutes until the lentils are soft. Season to taste.",
    ],
    ingredients: [
      ing("Red lentils", "plant", [], ["lentils"]),
      ing("Onion", "plant", [], ["onions"]),
      ing("Carrot", "plant", [], ["carrots"]),
      ing("Chopped tomatoes", "plant", [], ["tomato", "tomatoes"]),
      ing("Olive oil", "plant", [], ["oil"]),
    ],
    tags: ["fiber", "protein", "vegetables", "low-added-sugar"],
    kcal: null,
    source: "lifezoi-idea",
  },
  {
    id: "idea-salmon-tray",
    name: "Salmon and vegetable tray bake",
    slot: "dinner",
    minutes: 30,
    summary: "Salmon baked with potatoes, broccoli, and lemon.",
    steps: ["Heat the oven to 200 °C (400 °F).", "Roast chopped potatoes with a spoon of olive oil for 15 minutes.", "Add salmon and broccoli and bake 12 to 15 minutes until the fish flakes."],
    ingredients: [
      ing("Salmon", "fish", ["fish"], ["fish"]),
      ing("Potatoes", "plant", [], ["potato"]),
      ing("Broccoli", "plant", []),
      ing("Olive oil", "plant", [], ["oil"]),
      ing("Lemon", "plant", [], ["lemons"]),
    ],
    tags: ["protein", "unsaturated-fat", "vegetables", "low-added-sugar"],
    kcal: null,
    source: "lifezoi-idea",
  },
  {
    id: "idea-hummus-plate",
    name: "Hummus plate",
    slot: "lunch",
    minutes: 10,
    summary: "Hummus with whole-grain pita, cucumber, tomato, and olives.",
    steps: ["Spoon hummus onto a plate.", "Add sliced cucumber, tomato, and a few olives.", "Serve with warm whole-grain pita."],
    ingredients: [
      ing("Hummus", "plant", ["sesame"], ["chickpeas", "tahini"]),
      ing("Whole-grain pita", "plant", ["wheat"], ["bread", "pita", "gluten"]),
      ing("Cucumber", "plant", [], ["cucumbers"]),
      ing("Tomato", "plant", [], ["tomatoes"]),
      ing("Olives", "plant", [], ["olive"], { name: "Extra cucumber", kind: "plant", allergens: [] }),
    ],
    tags: ["fiber", "protein", "vegetables", "whole-grain", "low-added-sugar"],
    kcal: null,
    source: "lifezoi-idea",
  },
  {
    id: "idea-veg-omelette",
    name: "Vegetable omelette",
    slot: "breakfast",
    minutes: 12,
    summary: "Two-egg omelette with spinach, mushrooms, and tomato.",
    steps: ["Beat two eggs.", "Cook sliced mushrooms and spinach in a little oil.", "Pour in the eggs, cook gently, fold, and serve with tomato."],
    ingredients: [
      ing("Eggs", "egg", ["egg"], ["egg"]),
      ing("Spinach", "plant", []),
      ing("Mushrooms", "plant", [], ["mushroom"], { name: "Peppers", kind: "plant", allergens: [] }),
      ing("Tomato", "plant", [], ["tomatoes"]),
    ],
    tags: ["protein", "vegetables", "low-added-sugar"],
    kcal: null,
    source: "lifezoi-idea",
  },
  {
    id: "idea-peanut-oats",
    name: "Warm oats with banana and peanut butter",
    slot: "breakfast",
    minutes: 10,
    summary: "Oats cooked in milk or a plant drink, topped with banana and peanut butter.",
    steps: ["Cook half a cup of oats in milk or a fortified plant drink.", "Top with sliced banana.", "Stir in a spoon of peanut butter."],
    ingredients: [
      ing("Oats", "plant", [], ["oatmeal", "porridge"]),
      ing("Milk or fortified plant drink", "dairy", ["milk"], ["milk", "dairy"], { name: "Fortified oat drink", kind: "plant", allergens: [] }),
      ing("Banana", "plant", [], ["bananas"]),
      ing("Peanut butter", "plant", ["peanut"], ["peanuts", "peanut", "nuts"]),
    ],
    tags: ["fiber", "energy-dense", "whole-grain", "protein"],
    kcal: null,
    source: "lifezoi-idea",
  },
  {
    id: "idea-chicken-stirfry",
    name: "Chicken and vegetable stir-fry",
    slot: "dinner",
    minutes: 20,
    summary: "Chicken strips with mixed vegetables and brown rice.",
    steps: ["Cook brown rice.", "Stir-fry chicken strips in a little oil until cooked through.", "Add sliced vegetables for 3 to 4 minutes. Season with garlic and a splash of low-salt soy sauce."],
    ingredients: [
      ing("Chicken", "meat", [], ["chicken breast"]),
      ing("Mixed vegetables", "plant", [], ["vegetables", "peppers", "broccoli"]),
      ing("Brown rice", "plant", [], ["rice"]),
      ing("Low-salt soy sauce", "plant", ["soy", "wheat"], ["soy", "soy sauce"], { name: "Lemon juice and herbs", kind: "plant", allergens: [] }),
    ],
    tags: ["protein", "vegetables", "whole-grain", "low-added-sugar"],
    kcal: null,
    source: "lifezoi-idea",
  },
  {
    id: "idea-tofu-scramble",
    name: "Tofu scramble",
    slot: "breakfast",
    minutes: 12,
    summary: "Crumbled tofu with turmeric, spinach, and tomato.",
    steps: ["Crumble firm tofu into a pan with a little oil.", "Add a pinch of turmeric and pepper.", "Stir in spinach and tomato until warm."],
    ingredients: [
      ing("Tofu", "plant", ["soy"], ["soy"]),
      ing("Spinach", "plant", []),
      ing("Tomato", "plant", [], ["tomatoes"]),
    ],
    tags: ["protein", "vegetables", "low-added-sugar"],
    kcal: null,
    source: "lifezoi-idea",
  },
  {
    id: "idea-trail-mix",
    name: "Nut and dried fruit mix",
    slot: "snack",
    minutes: 2,
    summary: "A small handful of mixed nuts and raisins.",
    steps: ["Mix a small handful of nuts with a spoon of raisins."],
    ingredients: [
      ing("Mixed nuts", "plant", ["tree-nut", "peanut"], ["nuts", "almonds", "walnuts", "peanuts"]),
      ing("Raisins", "plant", [], ["dried fruit", "raisin"]),
    ],
    tags: ["energy-dense", "unsaturated-fat"],
    kcal: null,
    source: "lifezoi-idea",
  },
  {
    id: "idea-apple-cheese",
    name: "Apple and cheese",
    slot: "snack",
    minutes: 2,
    summary: "Apple slices with a small piece of cheese.",
    steps: ["Slice an apple.", "Serve with a small piece of cheese."],
    ingredients: [ing("Apple", "plant", [], ["apples"]), ing("Cheese", "dairy", ["milk"], ["cheddar", "dairy"])],
    tags: ["protein", "low-added-sugar"],
    kcal: null,
    source: "lifezoi-idea",
  },
];

export const RECIPES: Recipe[] = [...fromFoodPlan, ...ideas];

export function recipeById(id: string): Recipe | null {
  return RECIPES.find((recipe) => recipe.id === id) ?? null;
}
