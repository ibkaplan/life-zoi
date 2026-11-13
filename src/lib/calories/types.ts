/** Calories, protein, fat, and carbohydrate for 100 grams of a food, as the source publishes them. */
export type Per100 = { kcal: number; protein: number; fat: number; carbs: number };

/** Where the numbers for a food came from. */
export type FoodSource = "usda-local" | "usda" | "off";

export type FoodMatch = {
  /** Stable id within its source, such as a USDA fdcId or an Open Food Facts barcode. */
  id: string;
  source: FoodSource;
  name: string;
  brand: string | null;
  per100g: Per100;
  url: string | null;
};

export const MEALS = ["breakfast", "lunch", "dinner", "snack"] as const;
export type Meal = (typeof MEALS)[number];

export type PlateItem = {
  id: string;
  meal: Meal;
  name: string;
  source: FoodSource;
  sourceRef: string;
  sourceUrl: string | null;
  grams: number;
  per100g: Per100;
  /** True when the food and grams were first suggested from a photo. */
  fromPhoto: boolean;
};

export type CalorieLog = {
  version: 1;
  /** Local calendar day (YYYY-MM-DD) to the items eaten that day. */
  days: Record<string, PlateItem[]>;
};

export type Totals = { grams: number; kcal: number; protein: number; fat: number; carbs: number };

/** One food the photo model named, with the grams it estimated and the closest database food, if any. */
export type PhotoGuess = {
  name: string;
  label: string;
  grams: number;
  match: FoodMatch | null;
};
