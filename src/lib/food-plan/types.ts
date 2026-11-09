export const SEASONS = ["spring", "summer", "autumn", "winter"] as const;
export type Season = (typeof SEASONS)[number];

export const GOALS = ["lose", "maintain", "gain", "balance", "variety", "seasonal", "ayurveda"] as const;
export type FoodGoal = (typeof GOALS)[number];

export const PATTERNS = ["omnivore", "pescatarian", "vegetarian", "vegan"] as const;
export type DietPattern = (typeof PATTERNS)[number];

export const DOSHAS = [
  "vata",
  "pitta",
  "kapha",
  "vata-pitta",
  "pitta-kapha",
  "vata-kapha",
  "tridosha",
  "not-sure",
  "skip",
] as const;
export type Dosha = (typeof DOSHAS)[number];

export const ALLERGENS = ["milk", "egg", "peanut", "tree-nut", "fish", "shellfish", "soy", "wheat", "sesame"] as const;
export type Allergen = (typeof ALLERGENS)[number];

export const MEAL_SLOTS = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

export const PROTEIN_GOALS = ["maintain", "lose", "gain", "muscle", "nutrition"] as const;
export type ProteinGoal = (typeof PROTEIN_GOALS)[number];

export const ACTIVITY_LEVELS = ["sedentary", "light", "moderate", "active", "very"] as const;
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];

export type HeightUnit = "cm" | "in";
export type WeightUnit = "kg" | "lb";
export type EquationSex = "female" | "male";

export type FoodProfile = {
  goal: FoodGoal | "";
  likes: string;
  dislikes: string;
  pattern: DietPattern | "";
  allergens: Allergen[];
  allergyNote: string;
  avoid: string;
  mealsPerDay: 0 | 2 | 3;
  snack: boolean;
  cookMinutes: 0 | 15 | 30 | 45 | 60;
  budget: "" | "modest" | "flexible";
  minimalCooking: boolean;
  season: Season | "";
  seasonSource: "" | "manual" | "guess";
  dosha: Dosha | "";
  pregnancy: boolean;
  eatingDisorder: boolean;
  complexMedical: boolean;
  kidney: boolean;
  liver: boolean;
};

export type PlannedMeal = {
  slot: MealSlot;
  mealId: string;
  portions: number;
  variant: number;
};

export type DayPlan = {
  index: number;
  meals: PlannedMeal[];
  seasonalFoodId: string;
};

export type WeekPlan = {
  id: string;
  seed: number;
  season: Season | "";
  createdOn: string;
  days: DayPlan[];
  note: string;
};

export type ShoppingItem = {
  id: string;
  name: string;
  group: string;
  detail: string;
  checked: boolean;
  custom: boolean;
};

export type ProgressNote = {
  id: string;
  date: string;
  cooked: number | null;
  triedFoodId: string;
  note: string;
};

export type ProteinInputs = {
  age: string;
  sex: EquationSex | "";
  height: string;
  heightUnit: HeightUnit;
  weight: string;
  weightUnit: WeightUnit;
  activity: ActivityLevel | "";
  goal: ProteinGoal | "";
  pattern: DietPattern | "";
  dairyFree: boolean;
  gramsPerKg: number | null;
};

export type LogLine = {
  id: string;
  foodId: string;
  servings: number;
};

export type PlateChoice = {
  proteinId: string;
  vegetableId: string;
  carbId: string;
  fatId: string;
  proteinServings: number;
  vegetableServings: number;
  carbServings: number;
  fatServings: number;
};

export type FoodPlanState = {
  profile: FoodProfile;
  week: WeekPlan | null;
  favorites: string[];
  shopping: ShoppingItem[];
  progress: ProgressNote[];
  protein: ProteinInputs;
  log: LogLine[];
  plate: PlateChoice;
};

export function emptyProfile(): FoodProfile {
  return {
    goal: "",
    likes: "",
    dislikes: "",
    pattern: "",
    allergens: [],
    allergyNote: "",
    avoid: "",
    mealsPerDay: 0,
    snack: false,
    cookMinutes: 0,
    budget: "",
    minimalCooking: false,
    season: "",
    seasonSource: "",
    dosha: "",
    pregnancy: false,
    eatingDisorder: false,
    complexMedical: false,
    kidney: false,
    liver: false,
  };
}

export function emptyProteinInputs(): ProteinInputs {
  return {
    age: "",
    sex: "",
    height: "",
    heightUnit: "cm",
    weight: "",
    weightUnit: "kg",
    activity: "",
    goal: "",
    pattern: "",
    dairyFree: false,
    gramsPerKg: null,
  };
}

export function emptyPlate(): PlateChoice {
  return {
    proteinId: "",
    vegetableId: "",
    carbId: "",
    fatId: "",
    proteinServings: 1,
    vegetableServings: 1,
    carbServings: 1,
    fatServings: 1,
  };
}

export function emptyFoodPlan(): FoodPlanState {
  return {
    profile: emptyProfile(),
    week: null,
    favorites: [],
    shopping: [],
    progress: [],
    protein: emptyProteinInputs(),
    log: [],
    plate: emptyPlate(),
  };
}

export function isEmptyFoodPlan(state: FoodPlanState): boolean {
  const profile = state.profile;
  const protein = state.protein;
  return (
    profile.goal === "" &&
    profile.likes === "" &&
    profile.dislikes === "" &&
    profile.pattern === "" &&
    profile.allergens.length === 0 &&
    profile.allergyNote === "" &&
    profile.avoid === "" &&
    profile.mealsPerDay === 0 &&
    !profile.snack &&
    profile.cookMinutes === 0 &&
    profile.budget === "" &&
    !profile.minimalCooking &&
    profile.season === "" &&
    profile.seasonSource === "" &&
    profile.dosha === "" &&
    !profile.pregnancy &&
    !profile.eatingDisorder &&
    !profile.complexMedical &&
    !profile.kidney &&
    !profile.liver &&
    state.week === null &&
    state.favorites.length === 0 &&
    state.shopping.length === 0 &&
    state.progress.length === 0 &&
    state.log.length === 0 &&
    protein.age === "" &&
    protein.sex === "" &&
    protein.height === "" &&
    protein.weight === "" &&
    protein.activity === "" &&
    protein.goal === "" &&
    protein.pattern === "" &&
    !protein.dairyFree &&
    protein.gramsPerKg === null &&
    state.plate.proteinId === "" &&
    state.plate.vegetableId === "" &&
    state.plate.carbId === "" &&
    state.plate.fatId === ""
  );
}
