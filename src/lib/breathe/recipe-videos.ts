import { RECIPES, type Recipe } from "@/lib/breathe/content";

/**
 * Cooking videos for the written recipes on "Foods for the nitrate pathway".
 * Each one plays in YouTube's own embedded player (youtube-nocookie.com).
 * LifeZoi does not download or copy any video, and the player loads only
 * after the person presses play.
 *
 * Checked on RECIPE_VIDEOS_CHECKED_ON through YouTube's public oEmbed
 * endpoint: every video below answered 200, so it was public and its owner
 * allowed embedding that day. Titles and channels are copied from that answer.
 *
 * License: the owner asked for Creative Commons (CC BY) videos where
 * possible. YouTube's search and watch pages refuse automated reading, so the
 * license line could not be checked from here. Every video is therefore
 * marked "youtube-standard" (YouTube's standard license, shown through the
 * embedded player) until a person checks the license on YouTube and changes
 * it to "cc-by". Nobody has watched every video in full.
 */

export const RECIPE_VIDEOS_CHECKED_ON = "2026-11-12";

/** "cc-by" only after a person has seen the Creative Commons line on the YouTube page. */
export type RecipeVideoLicense = "youtube-standard" | "cc-by";

export type RecipeVideoSeed = {
  recipe: Recipe["id"];
  youtubeId: string;
  /** Copied exactly from YouTube. */
  title: string;
  /** Copied exactly from YouTube. */
  channel: string;
  channelUrl: string;
  license: RecipeVideoLicense;
  /** LifeZoi's own short description, in plain language. */
  note: string;
};

export const RECIPE_VIDEO_SEEDS: RecipeVideoSeed[] = [
  {
    recipe: "beet-arugula-salad",
    youtubeId: "x2Wd1c87l7Y",
    title: "Roasted Beet Salad Recipe - with Arugula and Feta. Great Salad Ideas",
    channel: "Cooking Secrets for Men",
    channelUrl: "https://www.youtube.com/@CookingSecretsForMen",
    license: "youtube-standard",
    note: "A roasted beetroot and arugula salad. This version adds feta.",
  },
  {
    recipe: "beet-smoothie",
    youtubeId: "oMwjwqlaN0s",
    title: "Berry & Beetroot Smoothie",
    channel: "everydaygourmettv",
    channelUrl: "https://www.youtube.com/@everydaygourmettv",
    license: "youtube-standard",
    note: "A berry and beetroot smoothie. The ingredients may differ a little from the recipe here.",
  },
  {
    recipe: "chard-eggs",
    youtubeId: "8L5RNipVJAs",
    title: "Easy and Simple Swiss Chard Recipe -  EatSimpleFood com",
    channel: "Eat Simple Food",
    channelUrl: "https://www.youtube.com/@EatSimpleFoods",
    license: "youtube-standard",
    note: "How to cook Swiss chard stems and leaves. Add the eggs or beans from the recipe here.",
  },
  {
    recipe: "beet-hummus",
    youtubeId: "GufQlxY3mbM",
    title: "Beetroot hummus Recipe",
    channel: "Chef Sanjyot Keer",
    channelUrl: "https://www.youtube.com/@YourFoodLab",
    license: "youtube-standard",
    note: "A chef shows how to blend beetroot hummus.",
  },
  {
    recipe: "borscht",
    youtubeId: "-eCy1bK9WAM",
    title: "Easy Vegetarian Borscht (Beet Soup) Recipe - EatSimpleFood.com",
    channel: "Eat Simple Food",
    channelUrl: "https://www.youtube.com/@EatSimpleFoods",
    license: "youtube-standard",
    note: "A vegetarian beetroot borscht, step by step.",
  },
  {
    recipe: "beet-vinegret",
    youtubeId: "qbxWIp9VhUU",
    title: "How to Make Russian Beet Salad Vinaigrette | Plant-based Recipe",
    channel: "Plant & Spoon",
    channelUrl: "https://www.youtube.com/@plantspoon3008",
    license: "youtube-standard",
    note: "A plant-based beetroot vinegret salad.",
  },
  {
    recipe: "arugula-pesto",
    youtubeId: "CgMSD82GZYo",
    title: "How to Make Arugula Pesto - Delicious and Healthy Pasta Recipe",
    channel: "Jack's Italian Kitchen",
    channelUrl: "https://www.youtube.com/@JacksItalianKitchen",
    license: "youtube-standard",
    note: "How to make arugula pesto and stir it into pasta.",
  },
  {
    recipe: "arugula-bean-salad",
    youtubeId: "bl17M-aMNuo",
    title: "Easy White Bean Salad by The Mediterranean Dish",
    channel: "The Mediterranean Dish",
    channelUrl: "https://www.youtube.com/@TheMediterraneanDish",
    license: "youtube-standard",
    note: "A white bean salad with herbs. Add the arugula and radishes from the recipe here.",
  },
  {
    recipe: "kale-salad",
    youtubeId: "TPBXcTLOSjc",
    title: "Massaged Kale Salad Recipe",
    channel: "Health Junkie",
    channelUrl: "https://www.youtube.com/@healthjunkies",
    license: "youtube-standard",
    note: "How to massage kale so it turns soft.",
  },
  {
    recipe: "spinach-chickpea-curry",
    youtubeId: "VgT6YwN6pjE",
    title: "My Easy Chana Saag (chickpea & spinach curry)",
    channel: "Nico's Recipes",
    channelUrl: "https://www.youtube.com/@nico.recipes",
    license: "youtube-standard",
    note: "A chickpea and spinach curry, also called chana saag.",
  },
  {
    recipe: "spinach-rice",
    youtubeId: "cO-9ovh7Pps",
    title: "Spanakorizo: Greek Spinach & Rice",
    channel: "Dimitra's Dishes",
    channelUrl: "https://www.youtube.com/@DimitrasDishes",
    license: "youtube-standard",
    note: "Greek spinach rice from a Greek home cook.",
  },
  {
    recipe: "green-shakshuka",
    youtubeId: "sQXqPsrRb64",
    title: "Green shakshuka",
    channel: "The University of Sydney",
    channelUrl: "https://www.youtube.com/@sydney_uni",
    license: "youtube-standard",
    note: "Eggs cooked in a pan of greens, from a university channel.",
  },
  {
    recipe: "bok-choy-stir-fry",
    youtubeId: "TjzcXqeFL9I",
    title: "STIR-FRY BOK CHOY With Garlic and Ginger In 4 Minutes | Simple, Fast, and Nutritious",
    channel: "Wok with Tak",
    channelUrl: "https://www.youtube.com/@wokwithtak",
    license: "youtube-standard",
    note: "A quick bok choy stir-fry with garlic and ginger.",
  },
  {
    recipe: "coleslaw",
    youtubeId: "HHSBalJiuc0",
    title: "Cabbage Coleslaw With Vinaigrette (Without Mayonnaise!)",
    channel: "Tastefully Grace",
    channelUrl: "https://www.youtube.com/@TastefullyGrace",
    license: "youtube-standard",
    note: "A cabbage slaw dressed with vinaigrette instead of mayonnaise.",
  },
  {
    recipe: "roasted-broccoli",
    youtubeId: "wOQPqEPVjL4",
    title: "How to Make Roasted Broccoli | Broccoli Recipes | Allrecipes.com",
    channel: "Allrecipes",
    channelUrl: "https://www.youtube.com/@allrecipes",
    license: "youtube-standard",
    note: "How to roast broccoli in the oven.",
  },
  {
    recipe: "lettuce-salad",
    youtubeId: "bv_RuWp6on8",
    title: "Maroulosalata (Greek Lettuce Salad)",
    channel: "Dimitra's Dishes",
    channelUrl: "https://www.youtube.com/@DimitrasDishes",
    license: "youtube-standard",
    note: "Greek lettuce salad with dill and spring onions.",
  },
  {
    recipe: "radish-cucumber-salad",
    youtubeId: "l5QNuNKriUI",
    title: "Cucumber and Radish Salad - Quick and Easy Recipe",
    channel: "What's On My Plate - Olga's Kitchen",
    channelUrl: "https://www.youtube.com/@whatsonmyplate-OlgasKitchen",
    license: "youtube-standard",
    note: "A quick radish and cucumber salad.",
  },
  {
    recipe: "tabbouleh",
    youtubeId: "7ImFOxHokzc",
    title: "Tabouli (Parsley Salad with Bulgur)",
    channel: "Nico's Recipes",
    channelUrl: "https://www.youtube.com/@nico.recipes",
    license: "youtube-standard",
    note: "A parsley and bulgur salad.",
  },
];

export type RecipeVideo = RecipeVideoSeed & {
  id: string;
  originalUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
};

export const recipeVideos: RecipeVideo[] = RECIPE_VIDEO_SEEDS.map((seed) => ({
  ...seed,
  id: `rv-${seed.youtubeId}`,
  originalUrl: `https://www.youtube.com/watch?v=${seed.youtubeId}`,
  embedUrl: `https://www.youtube-nocookie.com/embed/${seed.youtubeId}`,
  thumbnailUrl: `https://i.ytimg.com/vi/${seed.youtubeId}/hqdefault.jpg`,
}));

export function videoForRecipe(id: Recipe["id"], videos: RecipeVideo[] = recipeVideos): RecipeVideo | null {
  return videos.find((video) => video.recipe === id) ?? null;
}

/** Recipe ids that exist, so a typo in a seed is caught by the tests. */
export const RECIPE_IDS: ReadonlySet<string> = new Set(RECIPES.map((recipe) => recipe.id));

export const RECIPE_VIDEO_LICENSE_TEXT: Record<RecipeVideoLicense, string> = {
  "youtube-standard": "Standard YouTube license. The creator keeps all rights; it is shown only in YouTube's player.",
  "cc-by": "Creative Commons Attribution (CC BY), as marked on YouTube.",
};

export const RECIPE_VIDEO_TEXT = {
  heading: "Watch how to make it",
  none: "No checked video for this recipe yet.",
  note: "Cooking videos are the creators' own. Their ingredients and amounts can differ from the recipe here, so follow the written recipe if you have allergies or diet limits.",
  checked: "Checked on {date}: each video was public and its owner allowed it to be shown on other websites. Titles and channels come from YouTube. lifeZoi has not watched every video in full.",
} as const;
