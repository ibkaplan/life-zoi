import { describe, expect, it } from "vitest";
import { FOODS, RECIPES } from "@/lib/breathe/content";
import { RECIPE_IDS, RECIPE_VIDEO_LICENSE_TEXT, RECIPE_VIDEO_TEXT, recipeVideos, videoForRecipe } from "@/lib/breathe/recipe-videos";
import { containsProhibitedClaim } from "@/lib/claims";

describe("nitrate recipes", () => {
  it("has unique ids and only names vegetables from the food list", () => {
    expect(RECIPES.length).toBeGreaterThanOrEqual(20);
    expect(new Set(RECIPES.map((recipe) => recipe.id)).size).toBe(RECIPES.length);
    const foods = new Set(FOODS.map((food) => food.id));
    for (const recipe of RECIPES) {
      for (const food of recipe.foods) expect(foods.has(food), `${recipe.id}: ${food}`).toBe(true);
      expect(recipe.ingredients.length).toBeGreaterThan(0);
      expect(recipe.steps.length).toBeGreaterThan(0);
      expect(recipe.minutes).toBeGreaterThan(0);
    }
  });

  it("keeps the recipe wording free of health claims", () => {
    const text = RECIPES.flatMap((recipe) => [recipe.title, ...recipe.ingredients, ...recipe.steps]).join("\n");
    expect(containsProhibitedClaim(text)).toBe(false);
    expect(text).not.toMatch(/cure|prevent|detox|boost|weight loss|supplement/i);
  });
});

describe("recipe videos", () => {
  it("uses only official YouTube embeds, one per recipe, for recipes that exist", () => {
    const ids = new Set<string>();
    const recipes = new Set<string>();
    for (const video of recipeVideos) {
      expect(RECIPE_IDS.has(video.recipe)).toBe(true);
      expect(video.youtubeId).toMatch(/^[A-Za-z0-9_-]{11}$/);
      expect(video.embedUrl).toBe(`https://www.youtube-nocookie.com/embed/${video.youtubeId}`);
      expect(video.originalUrl).toBe(`https://www.youtube.com/watch?v=${video.youtubeId}`);
      expect(video.thumbnailUrl).toBe(`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`);
      expect(video.channelUrl).toMatch(/^https:\/\/www\.youtube\.com\/@/);
      expect(video.title.trim()).not.toBe("");
      expect(video.channel.trim()).not.toBe("");
      expect(ids.has(video.youtubeId)).toBe(false);
      expect(recipes.has(video.recipe)).toBe(false);
      ids.add(video.youtubeId);
      recipes.add(video.recipe);
    }
    expect(videoForRecipe("no-such-recipe")).toBeNull();
  });

  it("shows a license line for every video and does not claim Creative Commons unchecked", () => {
    for (const video of recipeVideos) expect(RECIPE_VIDEO_LICENSE_TEXT[video.license]).toBeTruthy();
    // No video has been confirmed as CC BY yet; change this when a person checks one on YouTube.
    expect(recipeVideos.filter((video) => video.license === "cc-by")).toEqual([]);
  });

  it("does not make health claims in lifeZoi's own words", () => {
    const own = [...Object.values(RECIPE_VIDEO_TEXT), ...Object.values(RECIPE_VIDEO_LICENSE_TEXT), ...recipeVideos.map((video) => video.note)].join(" ");
    expect(own).not.toMatch(/blood flow|in your blood|cure|prevent|detox|boost|weight loss/i);
    expect(containsProhibitedClaim(own)).toBe(false);
  });
});
