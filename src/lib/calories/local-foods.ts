import { foods, FOOD_BASIS } from "@/lib/wellness/foods";
import type { FoodMatch } from "@/lib/calories/types";
import { matchScore } from "@/lib/calories/search-text";

export { FOOD_BASIS };

/**
 * The USDA FoodData Central SR Legacy records that already ship with lifeZoi
 * (src/lib/wellness/foods.json). They work without a network and are the
 * fallback when the online databases cannot answer.
 */
export const LOCAL_FOODS: FoodMatch[] = foods.flatMap((food) => {
  const n = food.per100g;
  if (n.caloriesKcal === null || n.proteinG === null || n.totalFatG === null || n.carbohydrateG === null) return [];
  return [
    {
      id: String(food.fdcId),
      source: "usda-local" as const,
      name: food.plainName,
      brand: null,
      per100g: { kcal: n.caloriesKcal, protein: n.proteinG, fat: n.totalFatG, carbs: n.carbohydrateG },
      url: food.url,
    },
  ];
});

const GROUP_OF = new Map(foods.map((food) => [String(food.fdcId), food.groupLabel]));

/**
 * Local foods whose English name, group, or translated name contains every word of the query.
 * `translate` is the page's `t`, so "гречка" or "броколі" finds the translated name.
 */
export function searchLocal(query: string, translate: (text: string) => string = (text) => text, limit = 8): FoodMatch[] {
  return LOCAL_FOODS.map((food) => {
    const group = GROUP_OF.get(food.id) ?? "";
    const score = matchScore(query, food.name, group, translate(food.name), translate(group));
    return { food, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.food.name.localeCompare(b.food.name))
    .slice(0, limit)
    .map((item) => item.food);
}

const COOKING = /^(?:cooked|boiled|roasted|broiled|braised|grilled|fried|baked|steamed|raw|fresh|sliced|chopped|plain|whole|hard|soft)$/i;

/**
 * The closest local food for an English name the photo model gave.
 * Tries the whole name, then each main word from the end ("grilled chicken breast" → "breast", "chicken").
 */
export function bestLocalMatch(name: string): FoodMatch | null {
  const parts = name.split(/[\s,]+/).filter((word) => word.length > 2 && !COOKING.test(word));
  const queries = [name, parts.join(" "), ...parts.slice().reverse()].filter(Boolean);
  const raw = /\braw\b/i.test(name);
  for (const query of queries) {
    const found = searchLocal(query, (text) => text, 20);
    if (found.length === 0) continue;
    const prepared = raw
      ? found.find((food) => /\braw\b|dry|uncooked/i.test(food.name))
      : found.find((food) => /cooked|boiled|roasted|broiled|braised|hard-boiled|canned/i.test(food.name));
    return prepared ?? found[0];
  }
  return null;
}
