import type { FoodMatch } from "@/lib/calories/types";
import { validPer100 } from "@/lib/calories/math";
import { fold } from "@/lib/calories/search-text";

/**
 * Free food databases the server may ask for a food name. Only the typed food
 * name and the interface language are sent: no account, no diary, no photo.
 *
 * - Open Food Facts: free and open, no key. It asks apps to send a User-Agent
 *   that names the app and to keep search to a few requests a minute, so the
 *   route caches answers.
 * - USDA FoodData Central: free, but needs a data.gov key in USDA_FDC_API_KEY.
 *   Without the key it is skipped.
 */
export const OFF_SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl";
export const FDC_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";
export const USER_AGENT = "lifeZoi/1.0 (https://www.lifezoi.com)";
const TIMEOUT_MS = 6_000;

type Env = Record<string, string | undefined>;

type OffProduct = {
  code?: unknown;
  product_name?: unknown;
  brands?: unknown;
  nutriments?: Record<string, unknown>;
  [key: string]: unknown;
};

const num = (value: unknown) => (typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN);
const text = (value: unknown, max = 120) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export function parseOpenFoodFacts(payload: unknown, language = "en"): FoodMatch[] {
  const products = (payload as { products?: unknown })?.products;
  if (!Array.isArray(products)) return [];
  const out: FoodMatch[] = [];
  for (const raw of products as OffProduct[]) {
    const code = text(raw.code, 32);
    const name = text(raw[`product_name_${language}`]) || text(raw.product_name);
    const n = raw.nutriments ?? {};
    let kcal = num(n["energy-kcal_100g"]);
    if (!Number.isFinite(kcal) && Number.isFinite(num(n["energy_100g"]))) kcal = num(n["energy_100g"]) / 4.184;
    const per100g = validPer100({
      kcal,
      protein: num(n["proteins_100g"]),
      fat: num(n["fat_100g"]),
      carbs: num(n["carbohydrates_100g"]),
    });
    if (!/^\d{4,32}$/.test(code) || !name || !per100g) continue;
    out.push({
      id: code,
      source: "off",
      name,
      brand: text(raw.brands, 80).split(",")[0]?.trim() || null,
      per100g: { ...per100g, kcal: Math.round(per100g.kcal) },
      url: `https://world.openfoodfacts.org/product/${code}`,
    });
  }
  return out;
}

type FdcNutrient = { nutrientNumber?: unknown; nutrientId?: unknown; value?: unknown; unitName?: unknown };
type FdcFood = { fdcId?: unknown; description?: unknown; brandOwner?: unknown; foodNutrients?: FdcNutrient[] };

/** USDA nutrient numbers: 208 energy (kcal), 958/957 Atwater energy in Foundation foods, 203 protein, 204 fat, 205 carbohydrate. */
export function parseFoodDataCentral(payload: unknown): FoodMatch[] {
  const list = (payload as { foods?: unknown })?.foods;
  if (!Array.isArray(list)) return [];
  const out: FoodMatch[] = [];
  for (const food of list as FdcFood[]) {
    const fdcId = num(food.fdcId);
    const name = text(food.description);
    const values = new Map<string, number>();
    for (const nutrient of food.foodNutrients ?? []) {
      const id = String(nutrient.nutrientNumber ?? "");
      const unit = String(nutrient.unitName ?? "").toUpperCase();
      if (id === "208" || id === "958" || id === "957") {
        if (unit && unit !== "KCAL") continue;
      }
      if (!values.has(id)) values.set(id, num(nutrient.value));
    }
    const kcal = values.get("208") ?? values.get("958") ?? values.get("957");
    const per100g = validPer100({ kcal, protein: values.get("203"), fat: values.get("204"), carbs: values.get("205") });
    if (!Number.isInteger(fdcId) || fdcId <= 0 || !name || !per100g) continue;
    out.push({
      id: String(fdcId),
      source: "usda",
      name,
      brand: text(food.brandOwner, 80) || null,
      per100g: { ...per100g, kcal: Math.round(per100g.kcal) },
      url: `https://fdc.nal.usda.gov/food-details/${fdcId}/nutrients`,
    });
  }
  return out;
}

/** A search term the server will forward: 2 to 60 characters of letters, digits, spaces, and simple punctuation. */
export function cleanQuery(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const query = value.replace(/\s+/g, " ").trim();
  if (query.length < 2 || query.length > 60) return null;
  if (!/^[\p{L}\p{N} ,.'%&()-]+$/u.test(query)) return null;
  return query;
}

async function getJson(url: string, fetchImpl: typeof fetch): Promise<unknown> {
  const response = await fetchImpl(url, {
    headers: { accept: "application/json", "user-agent": USER_AGENT },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`status ${response.status}`);
  return response.json();
}

export type OnlineResult = {
  results: FoodMatch[];
  /** Which databases answered, and which were tried but failed. */
  answered: Array<"off" | "usda">;
  failed: Array<"off" | "usda">;
  usdaConfigured: boolean;
};

export async function searchOnline(
  query: string,
  language: string,
  env: Env = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<OnlineResult> {
  const lang = /^[a-z]{2}$/.test(language) ? language : "en";
  const offUrl = new URL(OFF_SEARCH_URL);
  offUrl.search = new URLSearchParams({
    search_terms: query,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: "15",
    lc: lang,
    fields: `code,product_name,product_name_${lang},brands,nutriments`,
  }).toString();

  const key = env.USDA_FDC_API_KEY?.trim() ?? "";
  const tasks: Array<Promise<{ source: "off" | "usda"; items: FoodMatch[] }>> = [
    getJson(offUrl.toString(), fetchImpl).then((payload) => ({ source: "off" as const, items: parseOpenFoodFacts(payload, lang) })),
  ];
  if (key) {
    const fdcUrl = new URL(FDC_SEARCH_URL);
    fdcUrl.search = new URLSearchParams({ query, dataType: "Foundation,SR Legacy", pageSize: "10", api_key: key }).toString();
    tasks.push(getJson(fdcUrl.toString(), fetchImpl).then((payload) => ({ source: "usda" as const, items: parseFoodDataCentral(payload) })));
  }

  const settled = await Promise.allSettled(tasks);
  const answered: OnlineResult["answered"] = [];
  const failed: OnlineResult["failed"] = [];
  const usda: FoodMatch[] = [];
  const off: FoodMatch[] = [];
  settled.forEach((result, index) => {
    const source = index === 0 ? "off" : "usda";
    if (result.status === "fulfilled") {
      answered.push(source);
      (source === "usda" ? usda : off).push(...result.value.items);
    } else failed.push(source);
  });

  // Generic USDA foods first, then packaged products. Drop exact duplicate names.
  const seen = new Set<string>();
  const results = [...usda, ...off].filter((item) => {
    const keyName = `${fold(item.name)}|${fold(item.brand ?? "")}`;
    if (seen.has(keyName)) return false;
    seen.add(keyName);
    return true;
  });
  return { results: results.slice(0, 15), answered, failed, usdaConfigured: Boolean(key) };
}
