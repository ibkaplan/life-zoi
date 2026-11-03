import raw from "@/lib/wellness/foods.json";
import type { FoodPreparation, FoodRecord } from "@/lib/wellness/types";

const NAMES: Record<string, string> = {
  "beef-tenderloin-raw": "Beef tenderloin, raw",
  "beef-tenderloin-cooked": "Beef tenderloin, broiled",
  "veal-loin-raw": "Veal loin, raw",
  "veal-loin-cooked": "Veal loin, braised",
  "pork-loin-raw": "Pork center loin, raw",
  "pork-loin-cooked": "Pork center loin, broiled",
  "lamb-leg-raw": "Lamb leg, raw",
  "lamb-leg-cooked": "Lamb leg, roasted",
  "chicken-breast-raw": "Chicken breast, raw",
  "chicken-breast-cooked": "Chicken breast, roasted",
  "turkey-raw": "Turkey, meat only, raw",
  "turkey-cooked": "Turkey, meat only, roasted",
  "salmon-raw": "Wild Atlantic salmon, raw",
  "salmon-cooked": "Wild Atlantic salmon, cooked",
  "sardines-canned": "Atlantic sardines, canned",
  "trout-raw": "Wild rainbow trout, raw",
  "trout-cooked": "Wild rainbow trout, cooked",
  "cod-raw": "Atlantic cod, raw",
  "cod-cooked": "Atlantic cod, cooked",
  "tuna-raw": "Skipjack tuna, raw",
  "tuna-canned": "Light tuna, canned in water",
  "mackerel-raw": "Atlantic mackerel, raw",
  "mackerel-cooked": "Atlantic mackerel, cooked",
  "pollock-raw": "Alaska pollock, raw",
  "tilapia-raw": "Tilapia, raw",
  "tilapia-cooked": "Tilapia, cooked",
  "shrimp-raw": "Shrimp, raw",
  "shrimp-cooked": "Shrimp, cooked",
  "egg-raw": "Egg, raw",
  "egg-cooked": "Egg, hard-boiled",
  "black-beans-raw": "Black beans, raw",
  "black-beans-cooked": "Black beans, boiled",
  "lentils-raw": "Lentils, raw",
  "lentils-cooked": "Lentils, boiled",
  "chickpeas-raw": "Chickpeas, raw",
  "chickpeas-cooked": "Chickpeas, boiled",
  "tofu-firm": "Firm tofu",
  almonds: "Almonds",
  walnuts: "English walnuts",
  chia: "Chia seeds, dried",
  "sunflower-kernels": "Sunflower kernels, dried",
  apple: "Apple, with skin",
  banana: "Banana",
  orange: "Orange",
  "broccoli-raw": "Broccoli, raw",
  "broccoli-cooked": "Broccoli, boiled",
  "spinach-raw": "Spinach, raw",
  "spinach-cooked": "Spinach, boiled",
  "carrots-raw": "Carrots, raw",
  "oats-dry": "Oats, dry",
  "oats-cooked": "Oats, cooked",
  "brown-rice-raw": "Brown rice, raw",
  "brown-rice-cooked": "Brown rice, cooked",
  "quinoa-raw": "Quinoa, uncooked",
  "quinoa-cooked": "Quinoa, cooked",
};

const GROUPS: Record<string, string> = {
  beef: "Beef",
  veal: "Veal",
  pork: "Pork",
  lamb: "Lamb",
  chicken: "Chicken",
  turkey: "Turkey",
  salmon: "Salmon",
  sardines: "Sardines",
  trout: "Trout",
  cod: "Cod",
  tuna: "Tuna",
  mackerel: "Mackerel",
  "other-seafood": "Other fish and seafood",
  eggs: "Eggs",
  beans: "Beans",
  lentils: "Lentils",
  chickpeas: "Chickpeas",
  tofu: "Tofu",
  "nuts-seeds": "Nuts and seeds",
  fruits: "Fruits",
  vegetables: "Vegetables",
  "whole-grains": "Whole grains",
};

type RawFood = Omit<FoodRecord, "plainName" | "groupLabel">;

export const FOOD_BASIS = raw.basis;

export const foods: FoodRecord[] = (raw.items as RawFood[]).map((item) => ({
  ...item,
  preparation: item.preparation as FoodPreparation,
  plainName: NAMES[item.id] ?? item.description,
  groupLabel: GROUPS[item.group] ?? item.group,
}));

export const FOOD_GROUPS = Object.entries(GROUPS).map(([id, label]) => ({ id, label }));

export function foodById(id: string) {
  return foods.find((item) => item.id === id) ?? null;
}
