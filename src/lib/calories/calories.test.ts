import { beforeEach, describe, expect, it, vi } from "vitest";
import { bestLocalMatch, LOCAL_FOODS, searchLocal } from "@/lib/calories/local-foods";
import { parseGrams, scale, totals, validPer100 } from "@/lib/calories/math";
import { cleanQuery, parseFoodDataCentral, parseOpenFoodFacts, searchOnline } from "@/lib/calories/online";
import { parsePhotoBody, PHOTO_LIMITS, readGuesses, recognisePlate, resetPhotoLimitsForTests, takePhotoTurn } from "@/lib/calories/photo";
import { addItem, emptyCalorieLog, loadCalorieLog, removeItem, sanitizeCalorieLog, saveCalorieLog, updateItem } from "@/lib/calories/storage";
import type { PlateItem } from "@/lib/calories/types";

const broccoli: PlateItem = {
  id: "a",
  meal: "lunch",
  name: "Broccoli, boiled",
  source: "usda-local",
  sourceRef: "1",
  sourceUrl: null,
  grams: 150,
  per100g: { kcal: 35, protein: 2.4, fat: 0.4, carbs: 7.2 },
  fromPhoto: false,
};

function memory() {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
}

describe("calorie math", () => {
  it("scales per-100 g values to the grams entered", () => {
    expect(scale({ kcal: 160, protein: 2, fat: 14.66, carbs: 8.53 }, 50)).toEqual({ grams: 50, kcal: 80, protein: 1, fat: 7.3, carbs: 4.3 });
  });

  it("adds a plate of several foods", () => {
    const oats = { ...broccoli, id: "b", grams: 200, per100g: { kcal: 71, protein: 2.5, fat: 1.5, carbs: 12 } };
    expect(totals([broccoli, oats])).toEqual({ grams: 350, kcal: 195, protein: 8.6, fat: 3.6, carbs: 34.8 });
    expect(totals([])).toEqual({ grams: 0, kcal: 0, protein: 0, fat: 0, carbs: 0 });
  });

  it("accepts grams from 1 to 3000, with a comma or a dot", () => {
    expect(parseGrams("120")).toBe(120);
    expect(parseGrams("12,6")).toBe(13);
    expect(parseGrams("0")).toBeNull();
    expect(parseGrams("3001")).toBeNull();
    expect(parseGrams("-5")).toBeNull();
    expect(parseGrams("abc")).toBeNull();
  });

  it("refuses impossible nutrient values", () => {
    expect(validPer100({ kcal: 100, protein: 10, fat: 5, carbs: 5 })).not.toBeNull();
    expect(validPer100({ kcal: 1200, protein: 10, fat: 5, carbs: 5 })).toBeNull();
    expect(validPer100({ kcal: 100, protein: 60, fat: 30, carbs: 30 })).toBeNull();
    expect(validPer100({ kcal: 100, protein: -1, fat: 5, carbs: 5 })).toBeNull();
  });
});

describe("local USDA foods", () => {
  it("comes from the records already shipped with lifeZoi", () => {
    expect(LOCAL_FOODS.length).toBeGreaterThan(40);
    expect(LOCAL_FOODS.every((food) => food.source === "usda-local" && food.url?.startsWith("https://fdc.nal.usda.gov/"))).toBe(true);
  });

  it("finds foods by English or translated name", () => {
    expect(searchLocal("broccoli").map((food) => food.name)).toContain("Broccoli, boiled");
    const ru = (text: string) => (text === "Broccoli, boiled" ? "Брокколи, варёная" : text);
    expect(searchLocal("брокколи", ru).map((food) => food.name)).toEqual(["Broccoli, boiled"]);
    expect(searchLocal("x")).toEqual([]);
  });

  it("matches a photo name to the cooked food when it can", () => {
    expect(bestLocalMatch("grilled chicken breast")?.name).toBe("Chicken breast, roasted");
    expect(bestLocalMatch("broccoli, boiled")?.name).toBe("Broccoli, boiled");
    expect(bestLocalMatch("raw carrot sticks")?.name).toBe("Carrots, raw");
    expect(bestLocalMatch("chocolate cake")).toBeNull();
  });
});

describe("online food databases", () => {
  it("reads Open Food Facts products and skips ones without nutrients", () => {
    const payload = {
      products: [
        { code: "3017620422003", product_name: "Spread", product_name_ru: "Паста", brands: "Brand, Other", nutriments: { "energy-kcal_100g": 539, proteins_100g: 6.3, fat_100g: 30.9, carbohydrates_100g: 57.5 } },
        { code: "123", product_name: "Too short code", nutriments: { "energy-kcal_100g": 1 } },
        { code: "4000000000000", product_name: "No numbers", nutriments: {} },
      ],
    };
    expect(parseOpenFoodFacts(payload, "ru")).toEqual([
      {
        id: "3017620422003",
        source: "off",
        name: "Паста",
        brand: "Brand",
        per100g: { kcal: 539, protein: 6.3, fat: 30.9, carbs: 57.5 },
        url: "https://world.openfoodfacts.org/product/3017620422003",
      },
    ]);
    expect(parseOpenFoodFacts(null)).toEqual([]);
  });

  it("reads USDA FoodData Central search results, including Foundation energy", () => {
    const payload = {
      foods: [
        {
          fdcId: 171284,
          description: "Yogurt, plain, whole milk",
          foodNutrients: [
            { nutrientNumber: "203", value: 3.47 },
            { nutrientNumber: "204", value: 3.25 },
            { nutrientNumber: "205", value: 4.66 },
            { nutrientNumber: "208", value: 61, unitName: "KCAL" },
          ],
        },
        {
          fdcId: 2,
          description: "Foundation food",
          foodNutrients: [
            { nutrientNumber: "203", value: 1 },
            { nutrientNumber: "204", value: 1 },
            { nutrientNumber: "205", value: 1 },
            { nutrientNumber: "958", value: 30, unitName: "KCAL" },
          ],
        },
      ],
    };
    const parsed = parseFoodDataCentral(payload);
    expect(parsed[0]).toMatchObject({ id: "171284", source: "usda", per100g: { kcal: 61, protein: 3.5, fat: 3.3, carbs: 4.7 } });
    expect(parsed[1].per100g.kcal).toBe(30);
  });

  it("forwards only a short plain food name", () => {
    expect(cleanQuery("  гречка  ")).toBe("гречка");
    expect(cleanQuery("a")).toBeNull();
    expect(cleanQuery("<script>")).toBeNull();
    expect(cleanQuery("x".repeat(61))).toBeNull();
  });

  it("asks USDA only when its key is set, and survives a database that fails", async () => {
    const calls: string[] = [];
    const fetchImpl = vi.fn(async (url: string | URL | Request) => {
      calls.push(String(url));
      if (String(url).includes("openfoodfacts")) throw new Error("down");
      return Response.json({ foods: [] });
    }) as unknown as typeof fetch;
    const without = await searchOnline("avocado", "en", {}, fetchImpl);
    expect(without).toMatchObject({ answered: [], failed: ["off"], usdaConfigured: false });
    expect(calls.some((url) => url.includes("api.nal.usda.gov"))).toBe(false);
    const withKey = await searchOnline("avocado", "en", { USDA_FDC_API_KEY: "k" }, fetchImpl);
    expect(withKey).toMatchObject({ answered: ["usda"], failed: ["off"], usdaConfigured: true });
  });
});

describe("photo of a plate", () => {
  beforeEach(() => resetPhotoLimitsForTests());

  it("accepts only a small base64 JPEG, PNG, or WebP", () => {
    const data = "A".repeat(200);
    expect(parsePhotoBody({ data, mimeType: "image/jpeg", language: "ru" })).toMatchObject({ ok: true, input: { language: "ru" } });
    expect(parsePhotoBody({ data, mimeType: "image/gif" }).ok).toBe(false);
    expect(parsePhotoBody({ data: "not base64!", mimeType: "image/jpeg" }).ok).toBe(false);
    expect(parsePhotoBody({ data: "A".repeat(2_000_004), mimeType: "image/jpeg" }).ok).toBe(false);
  });

  it("turns the model's list into editable guesses matched to database foods", () => {
    const guesses = readGuesses(JSON.stringify({ foods: [{ name: "broccoli, boiled", label: "Брокколи", grams: 120 }, { name: "buckwheat porridge", label: "Гречка", grams: 0 }] }));
    expect(guesses[0]).toMatchObject({ label: "Брокколи", grams: 120, match: { name: "Broccoli, boiled" } });
    expect(guesses[1]).toMatchObject({ label: "Гречка", grams: 100, match: null });
    expect(readGuesses("not json")).toEqual([]);
  });

  it("does not call Google without a key and reports the free quota", async () => {
    const input = { data: "A".repeat(200), mimeType: "image/jpeg" as const, language: "en" as const };
    const fetchImpl = vi.fn(async () => new Response("", { status: 429 })) as unknown as typeof fetch;
    expect(await recognisePlate(input, "", fetchImpl)).toMatchObject({ ok: false, reason: "not-configured" });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(await recognisePlate(input, "key", fetchImpl)).toMatchObject({ ok: false, reason: "quota" });
  });

  it("sends the photo to the free model and never returns the key", async () => {
    let sent = "";
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      sent = String(init?.body);
      return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify({ foods: [{ name: "banana", label: "secret-key banana", grams: 118 }] }) }] } }] });
    }) as unknown as typeof fetch;
    const result = await recognisePlate({ data: "A".repeat(200), mimeType: "image/jpeg", language: "uk" }, "secret-key", fetchImpl);
    expect(String(vi.mocked(fetchImpl).mock.calls[0][0])).toContain("gemini-3.5-flash-lite");
    expect(sent).toContain("Ukrainian");
    expect(sent).not.toContain("secret-key");
    expect(result).toMatchObject({ ok: true, guesses: [{ name: "banana", grams: 118, match: { name: "Banana" } }] });
    expect(JSON.stringify(result)).not.toContain("secret-key");
  });

  it("limits each member per minute and per day", () => {
    const now = new Date("2026-11-13T10:00:00Z");
    for (let i = 0; i < PHOTO_LIMITS.perMinute; i++) expect(takePhotoTurn("m", now)).toBe(true);
    expect(takePhotoTurn("m", now)).toBe(false);
    expect(takePhotoTurn("other", now)).toBe(true);
  });
});

describe("food diary storage", () => {
  it("adds, edits, moves, and deletes items for a day", () => {
    let log = addItem(emptyCalorieLog(), "2026-11-13", broccoli);
    log = updateItem(log, "2026-11-13", "a", { grams: 90, meal: "dinner" });
    expect(log.days["2026-11-13"]).toEqual([{ ...broccoli, grams: 90, meal: "dinner" }]);
    log = removeItem(log, "2026-11-13", "a");
    expect(log.days).toEqual({});
  });

  it("drops invalid items, dates, and links when loading", () => {
    const log = sanitizeCalorieLog({
      days: {
        "2026-11-13": [broccoli, { ...broccoli, id: "b", grams: 0 }, { ...broccoli, id: "c", sourceUrl: "https://evil.example/x" }],
        "2026-02-31": [broccoli],
        nope: [broccoli],
      },
    });
    expect(Object.keys(log.days)).toEqual(["2026-11-13"]);
    expect(log.days["2026-11-13"].map((item) => item.id)).toEqual(["a", "c"]);
    expect(log.days["2026-11-13"][1].sourceUrl).toBeNull();
  });

  it("saves to and loads from the owned key, and removes an empty diary", () => {
    const storage = memory();
    saveCalorieLog(storage, addItem(emptyCalorieLog(), "2026-11-13", broccoli), "k");
    expect(loadCalorieLog(storage, "k").days["2026-11-13"]).toHaveLength(1);
    saveCalorieLog(storage, emptyCalorieLog(), "k");
    expect(storage.data.has("k")).toBe(false);
    storage.setItem("bad", "{not json");
    expect(loadCalorieLog(storage, "bad")).toEqual(emptyCalorieLog());
  });
});
