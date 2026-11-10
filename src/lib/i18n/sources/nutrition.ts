import { RECIPES } from "@/lib/companion/recipes";
import { PORTION_GUIDANCE } from "@/lib/companion/nutrition";
import { CUISINES } from "@/lib/food-words";
import { SIMPLE_MEALS } from "@/lib/food-plan/meals";
import { KITCHEN_RECIPES, SEASONAL_FOODS } from "@/lib/food-plan/seasonal";
import { SPICES } from "@/lib/food-plan/spices";
import { USDA_FOODS } from "@/lib/food-plan/usda";
import * as education from "@/lib/nutrition/education";
import * as plate from "@/lib/nutrition/plate";

/**
 * Data from the "nutrition" area that pages show through `t(value)`, for example a list of lessons.
 * Every text string found in these values must have a translation in catalog/<locale>/nutrition.json.
 * Published source titles and publishers are shown as published, so they are left out.
 */
const sources: unknown[] = [
  SIMPLE_MEALS.map(({ name, summary, steps, ayurveda }) => ({ name, summary, steps, ayurveda })),
  SEASONAL_FOODS.map(({ name, summary, prepare, storage, shopping }) => ({ name, summary, prepare, storage, shopping })),
  KITCHEN_RECIPES.map(({ name, servingsNote, ingredients, steps, highlights, seasonalNote, ayurveda }) => ({
    name,
    servingsNote,
    ingredients: ingredients.map(({ item, amount, group }) => ({ item, amount, group })),
    steps,
    highlights,
    seasonalNote,
    ayurveda,
  })),
  SPICES.map(({ name, flavor, culinary, combinations, traditional, caution }) => ({ name, flavor, culinary, combinations, traditional, caution })),
  // The USDA record description is the record's published English name and is shown as published.
  USDA_FOODS.map(({ name, servingLabel, servingSource, ways }) => ({ name, servingLabel, servingSource, ways })),
  RECIPES.map(({ name, summary, steps, ingredients }) => ({
    name,
    summary,
    steps,
    ingredients: ingredients.map((item) => [item.name, item.swap?.name ?? ""]),
  })),
  PORTION_GUIDANCE,
  CUISINES,
  // Nutrition page (academy)
  education.disclaimer,
  education.kingArthur.note,
  education.labels,
  education.dailyChoices,
  education.comparison,
  education.teaspoons.map(({ spoons }) => spoons),
  education.teaspoonNote,
  education.hiding,
  education.sampleLabel,
  education.labelQuiz.map(({ prompt, choices, because }) => ({ prompt, choices: choices.map(({ label }) => label), because })),
  education.awareness,
  education.breadIntro,
  education.breadRecipes.map(({ name, description, prep, bake, difficulty, makes, imageAlt, ingredients, steps, serving, nutritionNote, starter }) => ({
    name,
    description,
    prep,
    bake,
    difficulty,
    makes,
    imageAlt,
    ingredients,
    steps,
    serving,
    nutritionNote,
    starter,
  })),
  education.gut,
  [education.probioticFoods, education.prebioticFoods, education.solubleFoods, education.insolubleFoods].map((list) =>
    list.map(({ name, alt, note }) => ({ name, alt, note })),
  ),
  education.gutDays.map(({ title, text }) => ({ title, text })),
  plate.illustrativeBanner,
  plate.relatedLinks.map(({ label }) => label),
  plate.plateFoods.map(({ name, note }) => ({ name, note })),
  plate.plateExamples.map(({ name, blurb }) => ({ name, blurb })),
  plate.plateIntro,
  plate.proteinCards.map(({ name, alt, caption, note, meal }) => ({ name, alt, caption, note, meal })),
  plate.proteinCopy,
  plate.saltPlaces.map(({ title, text }) => ({ title, text })),
  plate.saltCopy,
  plate.saltTips,
  plate.groceryCategories.map(({ label }) => label),
  plate.grocerySamples.map(({ product, serving, ingredients }) => ({ product, serving, ingredients })),
  plate.sodiumQuestion,
  plate.fatKinds.map(({ title, text }) => ({ title, text })),
  plate.fatCopy,
  plate.fatChoices.map(({ name, alt, caption, swap, meal }) => ({ name, alt, caption, swap, meal })),
  plate.plantGroups.map(({ title, foods }) => ({ title, foods: foods.map(({ name }) => name) })),
  plate.rainbowCopy,
  plate.groceryCopy,
  plate.groceryChecklist.map(({ label }) => label),
  plate.challengeCopy,
  plate.challengeSteps.map(({ title, body }) => ({ title, body })),
  plate.planFields.map(({ label }) => label),
];
export default sources;
