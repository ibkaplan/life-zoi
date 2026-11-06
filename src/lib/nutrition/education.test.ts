import { describe, expect, it } from "vitest";
import { containsProhibitedClaim } from "@/lib/claims";
import {
  breadRecipes,
  educationPlainText,
  gutDays,
  gutSources,
  labelQuiz,
  sugarSources,
} from "@/lib/nutrition/education";
import { mealModules } from "@/lib/wellness/academy";

const banned =
  /avoid fruit|stores every bite|one sweet causes|reverses heart|blocks arteries|automatically raises|all american bread|all packaged food|live longer|date of death|lifespan/i;

describe("nutrition education", () => {
  it("keeps the existing meal lessons", () => {
    const slugs = mealModules.map((module) => module.slug);
    for (const slug of ["planning", "portions", "protein", "fiber", "fats", "fish", "produce", "shopping"]) {
      expect(slugs).toContain(slug);
    }
  });

  it("uses three original breads with no added sugar", () => {
    expect(breadRecipes.map((recipe) => recipe.slug)).toEqual([
      "rustic-sourdough",
      "sunflower-walnut-bread",
      "oatmeal-seed-bread",
    ]);
    for (const recipe of breadRecipes) {
      expect(recipe.addedSugar).toBe("0 g");
      expect(recipe.ingredients.length).toBeGreaterThan(3);
      expect(recipe.steps.length).toBeGreaterThan(4);
      const ingredients = recipe.ingredients.map((item) => `${item.item} ${item.us} ${item.metric}`).join("\n");
      expect(ingredients).not.toMatch(/sugar|honey|molasses|syrup|dextrose|sucrose/i);
    }
    expect(breadRecipes[0]?.starter?.steps.length).toBeGreaterThan(3);
  });

  it("links the opened public sources and a seven-day gut practice", () => {
    const urls = [...sugarSources, ...gutSources].map((source) => source.url);
    expect(urls).toContain("https://www.fda.gov/food/nutrition-facts-label/added-sugars-nutrition-facts-label");
    expect(urls).toContain("https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sugar/added-sugars");
    expect(urls).toContain("https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sugar/sugar-101");
    expect(urls).toContain("https://nesr.usda.gov/what-relationship-between-added-sugars-and-risk-cardiovascular-disease");
    expect(urls).toContain(
      "https://professional.heart.org/en/science-news/2026-dietary-guidance-to-improve-cardiovascular-health/top-things-to-know",
    );
    expect(urls).toContain("https://www.cdc.gov/diabetes/healthy-eating/fiber-helps-diabetes.html");
    expect(gutDays).toHaveLength(7);
    for (const question of labelQuiz) {
      expect(question.choices.some((choice) => choice.id === question.answer)).toBe(true);
    }
  });

  it("stays educational and does not promise a longer life", () => {
    const text = educationPlainText();
    expect(text).toContain("may not remember every bite");
    expect(text).toContain("not automatically healthier");
    expect(text).toContain("22 to 34 grams");
    expect(text).toContain("FEED YOUR GUT");
    expect(text).toContain("simplified illustration");
    expect(containsProhibitedClaim(text)).toBe(false);
    expect(banned.test(text)).toBe(false);
    expect(text).not.toMatch(/\bpercent\b|%/);
  });
});
