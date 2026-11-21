import type { Per100, PlateItem, Totals } from "@/lib/calories/types";

export const GRAM_LIMITS = { min: 1, max: 3000 } as const;

const round1 = (value: number) => Math.round(value * 10) / 10;

/** The published per-100 g values scaled to the grams entered. */
export function scale(per100g: Per100, grams: number): Totals {
  const factor = grams / 100;
  return {
    grams,
    kcal: Math.round(per100g.kcal * factor),
    protein: round1(per100g.protein * factor),
    fat: round1(per100g.fat * factor),
    carbs: round1(per100g.carbs * factor),
  };
}

export function totals(items: readonly PlateItem[]): Totals {
  const sum = { grams: 0, kcal: 0, protein: 0, fat: 0, carbs: 0 };
  for (const item of items) {
    const part = scale(item.per100g, item.grams);
    sum.grams += part.grams;
    sum.kcal += part.kcal;
    sum.protein += part.protein;
    sum.fat += part.fat;
    sum.carbs += part.carbs;
  }
  return { grams: sum.grams, kcal: sum.kcal, protein: round1(sum.protein), fat: round1(sum.fat), carbs: round1(sum.carbs) };
}

/** A whole number of grams within the limits, or null. Accepts a comma as the decimal mark. */
export function parseGrams(value: string | number): number | null {
  const text = typeof value === "number" ? String(value) : value.trim().replace(",", ".");
  if (!/^\d+(?:\.\d+)?$/.test(text)) return null;
  const grams = Math.round(Number(text));
  if (!Number.isFinite(grams) || grams < GRAM_LIMITS.min || grams > GRAM_LIMITS.max) return null;
  return grams;
}

/** Plausible per-100 g values: no negative numbers, no macronutrient above 100 g, no more than 900 kcal. */
export function validPer100(value: unknown): Per100 | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const read = (key: string, max: number) => {
    const n = typeof record[key] === "number" ? (record[key] as number) : Number.NaN;
    return Number.isFinite(n) && n >= 0 && n <= max ? round1(n) : null;
  };
  const kcal = read("kcal", 900);
  const protein = read("protein", 100);
  const fat = read("fat", 100);
  const carbs = read("carbs", 100);
  if (kcal === null || protein === null || fat === null || carbs === null) return null;
  if (protein + fat + carbs > 101) return null;
  return { kcal, protein, fat, carbs };
}
