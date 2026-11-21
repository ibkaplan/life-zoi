import { describe, expect, it } from "vitest";
import { containsProhibitedClaim } from "@/lib/claims";
import packageJson from "../../../package.json";
import {
  challengeProgress,
  challengeSteps,
  fatCopy,
  groceryNotes,
  grocerySamples,
  illustrativeBanner,
  labelById,
  lessSodium,
  parseAmount,
  plantCatalogIds,
  plantCheckId,
  plateExamples,
  plateFoods,
  plateIntro,
  platePlainText,
  plateSources,
  plateSummary,
  proteinCards,
  proteinCopy,
  rainbowCopy,
  saltCopy,
  sodiumAnswer,
  sodiumPairs,
  sodiumQuestion,
  uniquePlantsMarked,
  weekStart,
} from "@/lib/nutrition/plate";

const idPattern = /^[a-z0-9-]{1,80}$/;

describe("nutrition plate", () => {
  it("builds example plates with produce, protein, and grain", () => {
    expect(plateExamples.map((example) => example.id)).toEqual([
      "breakfast",
      "lunch",
      "dinner",
      "vegetarian",
      "quick",
    ]);
    const ids = new Set(plateFoods.map((food) => food.id));
    for (const example of plateExamples) {
      for (const foodId of example.foodIds) expect(ids.has(foodId)).toBe(true);
      const summary = plateSummary(example.foodIds);
      expect(summary.ready).toBe(true);
      expect(summary.message).toContain("Portions vary");
    }
    const vegetarian = plateSummary(plateExamples[3].foodIds);
    expect(vegetarian.protein.map((food) => food.id)).toEqual(["lentils", "tofu"]);
    expect(plateExamples[3].foodIds.join(" ")).not.toMatch(/chicken|salmon/);
    expect(plateIntro.lead).toMatch(/half vegetables and fruit/);
  });

  it("explains protein without a personal gram target", () => {
    expect(proteinCopy.lead).toContain("does not set a gram target");
    expect(proteinCopy.movement).toContain("Movement");
    expect(proteinCards.map((card) => card.name)).toEqual([
      "Eggs",
      "Fish, including salmon",
      "Chicken or turkey",
      "Greek yogurt",
      "Cottage cheese",
      "Beans",
      "Lentils",
      "Tofu",
      "Nuts and seeds",
    ]);
    expect(proteinCards.filter((card) => card.vegetarian).length).toBeGreaterThan(4);
    for (const card of proteinCards) {
      expect(card.image || card.draw).toBeTruthy();
      expect(card.meal.length).toBeGreaterThan(8);
    }
  });

  it("compares illustrative sodium labels", () => {
    expect(sodiumQuestion).toBe("Which product has less sodium?");
    expect(saltCopy.pressure).toContain("not a certainty for one person");
    for (const pair of sodiumPairs) {
      const left = labelById(pair.leftId);
      const right = labelById(pair.rightId);
      expect(left).toBeTruthy();
      expect(right).toBeTruthy();
      if (!left || !right) continue;
      expect(left.serving).toBe(right.serving);
      const answer = sodiumAnswer(left, right);
      expect(answer.winnerId).toBe(lessSodium(left, right));
      expect(answer.winnerId).toBe(left.sodiumMg < right.sodiumMg ? left.id : right.id);
      expect(answer.sentence).toContain("illustrative");
    }
    expect(lessSodium({ id: "a", sodiumMg: 10 }, { id: "b", sodiumMg: 10 })).toBe("tie");
  });

  it("keeps fats educational", () => {
    expect(fatCopy.lead).toContain("Replacing some saturated fat with unsaturated fat can support heart health");
    expect(fatCopy.lead).toContain("not a promise");
  });

  it("counts each plant once per week and can pass 30", () => {
    const catalog = plantCatalogIds();
    expect(new Set(catalog).size).toBe(catalog.length);
    expect(catalog.length).toBeGreaterThanOrEqual(30);
    expect(rainbowCopy.lead).toContain("not a requirement to hit 30");
    expect(weekStart("2026-11-06")).toBe("2026-11-02");
    expect(weekStart("2026-11-08")).toBe("2026-11-02");
    expect(weekStart("2026-11-09")).toBe("2026-11-09");
    expect(weekStart("2026-01-01")).toBe("2025-12-29");
    const week = weekStart("2026-11-06");
    expect(uniquePlantsMarked([catalog[0], catalog[0], catalog[1], "not-a-plant"], catalog)).toBe(2);
    for (const foodId of catalog) expect(plantCheckId(week, foodId)).toMatch(idPattern);
  });

  it("compares grocery labels without inventing a missing number", () => {
    const plain = grocerySamples.find((sample) => sample.id === "yogurt-plain");
    const vanilla = grocerySamples.find((sample) => sample.id === "yogurt-vanilla");
    expect(plain && vanilla).toBeTruthy();
    if (!plain || !vanilla) return;
    const notes = groceryNotes({ ...plain, illustrative: true }, { ...vanilla, illustrative: true });
    expect(notes.some((note) => note.includes("Sample plain yogurt lists less sodium"))).toBe(true);
    expect(notes.some((note) => note.includes("less added sugar"))).toBe(true);
    expect(notes.some((note) => note.includes("made-up teaching numbers"))).toBe(true);
    const missing = groceryNotes(
      { ...plain, illustrative: false, sodiumMg: null, product: "Package in my hand" },
      { ...vanilla, illustrative: true },
    );
    expect(missing.some((note) => note.includes("will not guess"))).toBe(true);
    expect(parseAmount("")).toBeNull();
    expect(parseAmount("-1")).toBeNull();
    expect(parseAmount("140")).toBe(140);
    expect(parseAmount("12.5")).toBe(12.5);
    for (const sample of grocerySamples) {
      expect(sample.product.startsWith("Sample ")).toBe(true);
    }
    expect(illustrativeBanner).toContain("Illustrative sample");
  });

  it("tracks seven challenge steps", () => {
    expect(challengeSteps).toHaveLength(7);
    expect(challengeProgress(["nstep-coffee"]).done).toBe(1);
    expect(challengeProgress(challengeSteps.map((step) => step.id)).complete).toBe(true);
    expect(challengeSteps[0]?.body).not.toMatch(/crash/i);
    for (const step of challengeSteps) expect(step.id).toMatch(idPattern);
  });

  it("links public sources and adds no paid package", () => {
    const urls = plateSources.map((source) => source.url);
    expect(urls).toEqual([
      "https://www.fda.gov/food/nutrition-facts-label",
      "https://www.myplate.gov/",
      "https://www.heart.org/en/healthy-living/healthy-eating",
      "https://www.nia.nih.gov/health/healthy-eating-nutrition-and-diet",
      "https://nutritionsource.hsph.harvard.edu/",
      "https://ods.od.nih.gov/",
    ]);
    expect(Object.keys(packageJson.dependencies).sort()).toEqual([
      "@supabase/ssr",
      "@supabase/supabase-js",
      "next",
      "react",
      "react-dom",
    ]);
  });

  it("stays free of prohibited claims", () => {
    const text = platePlainText();
    expect(containsProhibitedClaim(text)).toBe(false);
    expect(text).not.toMatch(/\bpercent\b|%|lifespan|years of life|miracle/i);
    expect(text).not.toMatch(/always causes a crash|sugar always causes/i);
    expect(text).toContain("BUILD YOUR HEALTHY PLATE");
    expect(text).toContain("Seven small steps. Better everyday choices.");
  });
});
