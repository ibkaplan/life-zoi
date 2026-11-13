import { isRealISODate } from "@/lib/dates";
import { GRAM_LIMITS, validPer100 } from "@/lib/calories/math";
import { MEALS, type CalorieLog, type FoodSource, type Meal, type PlateItem } from "@/lib/calories/types";
import type { LocalBucket } from "@/lib/owned-local";

export const CALORIE_STORAGE_KEY = "lifezoi.calories.v1";
export const DAY_LIMIT = 90;
export const ITEM_LIMIT = 80;
const SOURCES: readonly FoodSource[] = ["usda-local", "usda", "off"];

export const emptyCalorieLog = (): CalorieLog => ({ version: 1, days: {} });

export function isEmptyCalorieLog(log: CalorieLog): boolean {
  return Object.values(log.days).every((items) => items.length === 0);
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export function sanitizeItem(value: unknown): PlateItem | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const id = text(record.id, 64);
  const name = text(record.name, 120);
  const meal = MEALS.find((item) => item === record.meal) as Meal | undefined;
  const source = SOURCES.find((item) => item === record.source);
  const grams = typeof record.grams === "number" ? Math.round(record.grams) : Number.NaN;
  const per100g = validPer100(record.per100g);
  const url = text(record.sourceUrl, 300);
  if (!id || !name || !meal || !source || !per100g) return null;
  if (!Number.isFinite(grams) || grams < GRAM_LIMITS.min || grams > GRAM_LIMITS.max) return null;
  return {
    id,
    meal,
    name,
    source,
    sourceRef: text(record.sourceRef, 40),
    sourceUrl: /^https:\/\/(?:world\.openfoodfacts\.org|fdc\.nal\.usda\.gov)\//.test(url) ? url : null,
    grams,
    per100g,
    fromPhoto: record.fromPhoto === true,
  };
}

/** Keep valid items on real dates, the newest days first, within the limits. */
export function sanitizeCalorieLog(value: unknown): CalorieLog {
  const days = (value as { days?: unknown })?.days;
  if (!days || typeof days !== "object") return emptyCalorieLog();
  const kept = Object.entries(days as Record<string, unknown>)
    .filter(([day, items]) => isRealISODate(day) && Array.isArray(items))
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, DAY_LIMIT)
    .map(([day, items]) => [day, (items as unknown[]).flatMap((item) => sanitizeItem(item) ?? []).slice(0, ITEM_LIMIT)] as const)
    .filter(([, items]) => items.length > 0);
  return { version: 1, days: Object.fromEntries(kept) };
}

export function loadCalorieLog(storage: LocalBucket | null, key: string): CalorieLog {
  if (!storage) return emptyCalorieLog();
  try {
    const raw = storage.getItem(key);
    return raw ? sanitizeCalorieLog(JSON.parse(raw)) : emptyCalorieLog();
  } catch {
    return emptyCalorieLog();
  }
}

export function saveCalorieLog(storage: LocalBucket | null, log: CalorieLog, key: string) {
  if (!storage) return;
  try {
    if (isEmptyCalorieLog(log)) storage.removeItem(key);
    else storage.setItem(key, JSON.stringify(sanitizeCalorieLog(log)));
  } catch {
    // Storage can be full or blocked. The page keeps working for this visit.
  }
}

export function itemsFor(log: CalorieLog, day: string): PlateItem[] {
  return log.days[day] ?? [];
}

export function addItem(log: CalorieLog, day: string, item: PlateItem): CalorieLog {
  const items = itemsFor(log, day);
  if (items.length >= ITEM_LIMIT) return log;
  return { ...log, days: { ...log.days, [day]: [...items, item] } };
}

export function updateItem(log: CalorieLog, day: string, id: string, change: Partial<Pick<PlateItem, "grams" | "meal">>): CalorieLog {
  const items = itemsFor(log, day).map((item) => (item.id === id ? { ...item, ...change } : item));
  return { ...log, days: { ...log.days, [day]: items } };
}

export function removeItem(log: CalorieLog, day: string, id: string): CalorieLog {
  const items = itemsFor(log, day).filter((item) => item.id !== id);
  const days = { ...log.days, [day]: items };
  if (items.length === 0) delete days[day];
  return { ...log, days };
}
