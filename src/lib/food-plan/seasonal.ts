import { msg } from "@/lib/i18n/translate";
import type { Season } from "@/lib/food-plan/types";

export type SeasonalFood = {
  id: string;
  name: string;
  seasons: Season[];
  summary: string;
  prepare: string[];
  storage: string;
  shopping: string;
  recipeId: string;
};

export type KitchenRecipe = {
  id: string;
  foodId: string;
  name: string;
  minutes: number;
  servingsNote: string;
  ingredients: { item: string; amount: string; group: string }[];
  steps: string[];
  highlights: string[];
  seasonalNote: string;
  ayurveda: string;
};

const vary = "Availability varies by farm, weather, and week. These are New England examples, not a promise of what is in every market.";

export const SEASONAL_FOODS: SeasonalFood[] = [
  {
    id: "asparagus",
    name: "Asparagus",
    seasons: ["spring"],
    summary: "A spring stalk in New England markets, often from late April into June.",
    prepare: ["Snap off the woody end.", "Steam, roast, or sauté until just tender."],
    storage: "Refrigerate unwashed and use within a few days.",
    shopping: "Look for firm spears with closed tips.",
    recipeId: "asparagus-plate",
  },
  {
    id: "peas",
    name: "Green peas",
    seasons: ["spring", "summer"],
    summary: "Shelling peas and snap peas show up in late spring and early summer.",
    prepare: ["Shell fresh peas, or use snap peas whole.", "Boil or sauté briefly."],
    storage: "Refrigerate and use soon. Freeze extras if you will not cook them in a few days.",
    shopping: "Pods should feel full, not limp.",
    recipeId: "pea-skillet",
  },
  {
    id: "radishes",
    name: "Radishes",
    seasons: ["spring", "summer", "autumn"],
    summary: "Crisp spring roots that also appear through much of the market year.",
    prepare: ["Trim the tops.", "Slice raw or roast until sweet."],
    storage: "Refrigerate in a bag. Remove leafy tops if they are still attached.",
    shopping: "Choose firm roots. Soft spots mean they have sat too long.",
    recipeId: "radish-plate",
  },
  {
    id: "rhubarb",
    name: "Rhubarb",
    seasons: ["spring"],
    summary: "A tart spring stalk. The leaves are not eaten.",
    prepare: ["Discard the leaves.", "Chop the stalks and cook them with fruit until soft."],
    storage: "Refrigerate stalks and use within a few days.",
    shopping: "Stalks should be firm. Do not buy the leaves for eating.",
    recipeId: "rhubarb-oats",
  },
  {
    id: "strawberries-season",
    name: "Strawberries",
    seasons: ["spring", "summer"],
    summary: "Local berries often peak in June in New England. A traced USDA strawberry record is used when a meal counts them.",
    prepare: ["Rinse just before eating.", "Hull and slice."],
    storage: "Refrigerate dry and unwashed. Use within a couple of days.",
    shopping: "Look for bright berries with green caps. Avoid wet containers.",
    recipeId: "strawberry-bowl",
  },
  {
    id: "blueberries-season",
    name: "Blueberries",
    seasons: ["summer"],
    summary: "A summer New England berry. Nutrient figures, when shown, come from the traced USDA record.",
    prepare: ["Rinse gently.", "Eat fresh or fold into cooked oats."],
    storage: "Refrigerate and use within several days. Freeze in a single layer if needed.",
    shopping: "Berries should be dry and plump.",
    recipeId: "blueberry-bowl",
  },
  {
    id: "tomatoes-season",
    name: "Tomatoes",
    seasons: ["summer", "autumn"],
    summary: "Field tomatoes are a summer market food and often linger into early autumn.",
    prepare: ["Slice raw.", "Roast or simmer if you want them soft."],
    storage: "Keep ripe tomatoes on the counter if you will use them soon. Refrigerate only when they are very ripe.",
    shopping: "Choose fruit that smells fragrant and gives slightly.",
    recipeId: "tomato-beans",
  },
  {
    id: "sweet-corn",
    name: "Sweet corn",
    seasons: ["summer"],
    summary: "A mid-to-late summer market staple.",
    prepare: ["Husk, then boil, grill, or cut the kernels off the cob."],
    storage: "Refrigerate and cook soon. Sweetness drops after harvest.",
    shopping: "Husks should look fresh. Peel a small window if the seller allows it.",
    recipeId: "corn-skillet",
  },
  {
    id: "zucchini",
    name: "Zucchini",
    seasons: ["summer"],
    summary: "A summer squash that is mild and quick to cook.",
    prepare: ["Slice and sauté, roast, or grate into a pan with other vegetables."],
    storage: "Refrigerate and use within several days.",
    shopping: "Smaller squash are often more tender. Skin should be firm.",
    recipeId: "zucchini-skillet",
  },
  {
    id: "cucumbers-season",
    name: "Cucumbers",
    seasons: ["summer"],
    summary: "A cool summer vegetable for salads.",
    prepare: ["Slice. Peel only if the skin is tough or waxed."],
    storage: "Refrigerate.",
    shopping: "Choose firm cucumbers without soft ends.",
    recipeId: "cucumber-plate",
  },
  {
    id: "green-beans",
    name: "Green beans",
    seasons: ["summer", "autumn"],
    summary: "Snap beans from summer markets, sometimes into early autumn.",
    prepare: ["Trim the ends.", "Steam or sauté until tender-crisp."],
    storage: "Refrigerate unwashed.",
    shopping: "Pods should snap, not bend limply.",
    recipeId: "bean-skillet",
  },
  {
    id: "apples-season",
    name: "Apples",
    seasons: ["autumn", "winter"],
    summary: "Autumn harvest fruit that is also sold from storage in winter.",
    prepare: ["Eat raw with the skin, or cook slices until soft."],
    storage: "Refrigerate for a longer hold. Many varieties store well.",
    shopping: "Firm fruit without large bruises.",
    recipeId: "apple-oats",
  },
  {
    id: "kale",
    name: "Kale",
    seasons: ["autumn", "winter"],
    summary: "A hardy green through the cold months.",
    prepare: ["Strip the leaves from the stem.", "Massage for salads or sauté until wilted."],
    storage: "Refrigerate in a bag. It holds longer than tender lettuce.",
    shopping: "Leaves should look lively, not yellow or slimy.",
    recipeId: "kale-beans",
  },
  {
    id: "winter-squash",
    name: "Winter squash",
    seasons: ["autumn", "winter"],
    summary: "Butternut and related squash are harvested in autumn and stored into winter.",
    prepare: ["Peel if needed, cube, and roast or simmer until soft."],
    storage: "Keep whole squash in a cool room. Refrigerate after cutting.",
    shopping: "The squash should feel heavy and hard, without soft spots.",
    recipeId: "squash-plate",
  },
  {
    id: "cranberries",
    name: "Cranberries",
    seasons: ["autumn"],
    summary: "A New England autumn fruit, sharp on its own.",
    prepare: ["Simmer with apple and a little water until the berries pop."],
    storage: "Refrigerate and use within a few weeks, or freeze.",
    shopping: "Berries should be firm and bright.",
    recipeId: "cranberry-apple",
  },
  {
    id: "beets",
    name: "Beets",
    seasons: ["summer", "autumn", "winter"],
    summary: "Roots that are harvested in the warm months and stored later.",
    prepare: ["Scrub, then roast or boil until a knife slides in. Peel after cooking."],
    storage: "Refrigerate roots. Remove greens and use those sooner.",
    shopping: "Firm roots. Attached greens are a bonus if they still look fresh.",
    recipeId: "beet-plate",
  },
  {
    id: "potatoes",
    name: "Potatoes",
    seasons: ["autumn", "winter"],
    summary: "A storage crop through the colder months, also harvested earlier.",
    prepare: ["Scrub. Roast, boil, or pan-cook until tender."],
    storage: "Keep in a cool, dark, dry place. Do not refrigerate unless the kitchen is very warm.",
    shopping: "Avoid green skin and sprouts when you can.",
    recipeId: "potato-skillet",
  },
  {
    id: "cabbage",
    name: "Cabbage",
    seasons: ["autumn", "winter"],
    summary: "A storage green that carries many New England kitchens through winter.",
    prepare: ["Shred for a quick sauté or cut wedges and roast."],
    storage: "Refrigerate a whole head. It keeps longer than leaf lettuce.",
    shopping: "The head should feel dense.",
    recipeId: "cabbage-skillet",
  },
  {
    id: "carrots-season",
    name: "Carrots",
    seasons: ["summer", "autumn", "winter"],
    summary: "Market carrots in summer and stored roots later. Nutrient figures, when shown, use the traced USDA carrot record.",
    prepare: ["Scrub. Eat raw, roast, or simmer."],
    storage: "Refrigerate. Remove leafy tops.",
    shopping: "Firm roots. Limp carrots have dried out.",
    recipeId: "carrot-plate",
  },
  {
    id: "onions",
    name: "Storage onions",
    seasons: ["autumn", "winter"],
    summary: "Cured onions that keep through the cold months.",
    prepare: ["Peel and slice. Cook until soft, or use raw in small amounts."],
    storage: "Cool, dry, and dark. Do not store them in a sealed plastic bag.",
    shopping: "Dry papery skins and no soft spots.",
    recipeId: "onion-skillet",
  },
];

export const KITCHEN_RECIPES: KitchenRecipe[] = [
  {
    id: "asparagus-plate",
    foodId: "asparagus",
    name: "Asparagus with potatoes",
    minutes: 30,
    servingsNote: "About 1 plate",
    ingredients: [
      { item: "asparagus", amount: "1 small bunch", group: "Produce" },
      { item: "potato", amount: "1 medium", group: "Produce" },
      { item: "olive oil", amount: "1 teaspoon", group: "Pantry" },
      { item: "lemon", amount: "a wedge", group: "Produce" },
    ],
    steps: ["Heat the oven to 425°F (220°C).", "Cut the potato into wedges and the asparagus into short lengths.", "Toss with oil and roast about 20 minutes.", "Finish with lemon."],
    highlights: ["Vegetables and a storage potato on one plate", "A spring market idea"],
    seasonalNote: vary,
    ayurveda: "Optional: sprinkle cumin after roasting. Do not remove the potato or the asparagus.",
  },
  {
    id: "pea-skillet",
    foodId: "peas",
    name: "Peas with scallions",
    minutes: 15,
    servingsNote: "About 1 plate",
    ingredients: [
      { item: "green peas", amount: "1 cup", group: "Produce" },
      { item: "scallions", amount: "2", group: "Produce" },
      { item: "olive oil", amount: "1 teaspoon", group: "Pantry" },
      { item: "cooked brown rice", amount: "1 cup", group: "Grains" },
    ],
    steps: ["Warm the oil and scallions.", "Add the peas and cook until hot.", "Serve over the rice."],
    highlights: ["A whole grain with a spring vegetable"],
    seasonalNote: vary,
    ayurveda: "Optional: add ginger. Keep the rice.",
  },
  {
    id: "radish-plate",
    foodId: "radishes",
    name: "Radishes with beans",
    minutes: 10,
    servingsNote: "About 1 plate",
    ingredients: [
      { item: "radishes", amount: "4", group: "Produce" },
      { item: "cooked chickpeas", amount: "1 cup", group: "Protein" },
      { item: "olive oil", amount: "1 teaspoon", group: "Pantry" },
      { item: "lemon", amount: "a wedge", group: "Produce" },
    ],
    steps: ["Slice the radishes.", "Toss them with chickpeas, oil, and lemon."],
    highlights: ["A plant protein with a raw vegetable"],
    seasonalNote: vary,
    ayurveda: "Optional: add cumin. The chickpeas stay.",
  },
  {
    id: "rhubarb-oats",
    foodId: "rhubarb",
    name: "Rhubarb with oats",
    minutes: 20,
    servingsNote: "About 1 bowl",
    ingredients: [
      { item: "rhubarb stalks", amount: "1 cup chopped", group: "Produce" },
      { item: "apple", amount: "1 small", group: "Produce" },
      { item: "cooked oats", amount: "1 cup", group: "Grains" },
    ],
    steps: ["Simmer the rhubarb and apple with a splash of water until soft.", "Spoon the fruit over cooked oats.", "Leave out the rhubarb leaves."],
    highlights: ["Fruit and a whole grain", "No added sweetener is required"],
    seasonalNote: vary,
    ayurveda: "Optional: add cinnamon. This does not change the fruit or the oats.",
  },
  {
    id: "strawberry-bowl",
    foodId: "strawberries-season",
    name: "Strawberries with yogurt",
    minutes: 5,
    servingsNote: "About 1 bowl",
    ingredients: [
      { item: "strawberries", amount: "1 cup sliced", group: "Produce" },
      { item: "plain yogurt or cooked oats", amount: "1 container or 1 cup", group: "Protein" },
    ],
    steps: ["Slice the berries.", "Serve them on plain yogurt, or on cooked oats if you avoid dairy."],
    highlights: ["A short breakfast", "Use oats if you do not use dairy"],
    seasonalNote: vary,
    ayurveda: "Optional: add cardamom. Skip it if you prefer the berries plain.",
  },
  {
    id: "blueberry-bowl",
    foodId: "blueberries-season",
    name: "Blueberries with oats",
    minutes: 5,
    servingsNote: "About 1 bowl",
    ingredients: [
      { item: "blueberries", amount: "1/2 cup", group: "Produce" },
      { item: "cooked oats", amount: "1 cup", group: "Grains" },
      { item: "pumpkin seeds", amount: "1 tablespoon", group: "Pantry" },
    ],
    steps: ["Spoon berries and seeds over warm or cold cooked oats."],
    highlights: ["Whole grain, fruit, and seeds"],
    seasonalNote: vary,
    ayurveda: "Optional: add cinnamon.",
  },
  {
    id: "tomato-beans",
    foodId: "tomatoes-season",
    name: "Tomatoes with white beans",
    minutes: 15,
    servingsNote: "About 1 plate",
    ingredients: [
      { item: "tomatoes", amount: "2 medium", group: "Produce" },
      { item: "cooked white beans", amount: "1 cup", group: "Protein" },
      { item: "olive oil", amount: "1 teaspoon", group: "Pantry" },
      { item: "basil", amount: "a few leaves", group: "Produce" },
    ],
    steps: ["Chop the tomatoes.", "Warm the beans with oil.", "Stir in the tomatoes and basil."],
    highlights: ["Plant protein and a summer vegetable"],
    seasonalNote: vary,
    ayurveda: "Optional: add a pinch of fennel seed. Keep the beans.",
  },
  {
    id: "corn-skillet",
    foodId: "sweet-corn",
    name: "Corn and pepper skillet",
    minutes: 20,
    servingsNote: "About 1 plate",
    ingredients: [
      { item: "sweet corn", amount: "1 ear, kernels cut off", group: "Produce" },
      { item: "bell pepper", amount: "1", group: "Produce" },
      { item: "cooked beans", amount: "1 cup", group: "Protein" },
      { item: "olive oil", amount: "1 teaspoon", group: "Pantry" },
    ],
    steps: ["Warm the oil.", "Cook the pepper and corn until tender.", "Stir in the beans to heat through."],
    highlights: ["Vegetables plus beans"],
    seasonalNote: vary,
    ayurveda: "Optional: add cumin at the end.",
  },
  {
    id: "zucchini-skillet",
    foodId: "zucchini",
    name: "Zucchini with chickpeas",
    minutes: 20,
    servingsNote: "About 1 plate",
    ingredients: [
      { item: "zucchini", amount: "1 medium", group: "Produce" },
      { item: "cooked chickpeas", amount: "1 cup", group: "Protein" },
      { item: "olive oil", amount: "1 teaspoon", group: "Pantry" },
      { item: "lemon", amount: "a wedge", group: "Produce" },
    ],
    steps: ["Slice the zucchini.", "Sauté it in the oil until tender.", "Add chickpeas, then lemon."],
    highlights: ["A fast summer plate"],
    seasonalNote: vary,
    ayurveda: "Optional: add coriander.",
  },
  {
    id: "cucumber-plate",
    foodId: "cucumbers-season",
    name: "Cucumber and bean plate",
    minutes: 10,
    servingsNote: "About 1 plate",
    ingredients: [
      { item: "cucumber", amount: "1", group: "Produce" },
      { item: "cooked chickpeas", amount: "1 cup", group: "Protein" },
      { item: "olive oil", amount: "1 teaspoon", group: "Pantry" },
      { item: "lemon", amount: "a wedge", group: "Produce" },
    ],
    steps: ["Slice the cucumber.", "Toss with chickpeas, oil, and lemon."],
    highlights: ["No stove required if the chickpeas are already cooked"],
    seasonalNote: vary,
    ayurveda: "Optional: add mint. Skip mint if you dislike it.",
  },
  {
    id: "bean-skillet",
    foodId: "green-beans",
    name: "Green beans with potatoes",
    minutes: 25,
    servingsNote: "About 1 plate",
    ingredients: [
      { item: "green beans", amount: "2 handfuls", group: "Produce" },
      { item: "potato", amount: "1 medium", group: "Produce" },
      { item: "olive oil", amount: "1 teaspoon", group: "Pantry" },
    ],
    steps: ["Cut the potato into small pieces and start it in a pan with the oil.", "When it is almost tender, add the beans.", "Cook until both are tender."],
    highlights: ["Two vegetables, one pan"],
    seasonalNote: vary,
    ayurveda: "Optional: finish with black pepper.",
  },
  {
    id: "apple-oats",
    foodId: "apples-season",
    name: "Apple cinnamon oats",
    minutes: 10,
    servingsNote: "About 1 bowl",
    ingredients: [
      { item: "apple", amount: "1", group: "Produce" },
      { item: "cooked oats", amount: "1 cup", group: "Grains" },
      { item: "cinnamon", amount: "a pinch", group: "Spices" },
    ],
    steps: ["Chop the apple and warm it in a small pan with a splash of water.", "Stir it into the oats with cinnamon."],
    highlights: ["Whole grain and fruit"],
    seasonalNote: vary,
    ayurveda: "Cinnamon here is a flavor, not a supplement.",
  },
  {
    id: "kale-beans",
    foodId: "kale",
    name: "Kale and white beans",
    minutes: 20,
    servingsNote: "About 1 bowl",
    ingredients: [
      { item: "kale", amount: "2 handfuls of leaves", group: "Produce" },
      { item: "cooked white beans", amount: "1 cup", group: "Protein" },
      { item: "olive oil", amount: "1 teaspoon", group: "Pantry" },
      { item: "garlic", amount: "1 clove", group: "Produce" },
    ],
    steps: ["Warm the oil and garlic.", "Add the kale and a splash of water.", "Stir in the beans until hot."],
    highlights: ["A cold-weather bowl with plant protein"],
    seasonalNote: vary,
    ayurveda: "Optional: add a pinch of ginger. Keep the beans.",
  },
  {
    id: "squash-plate",
    foodId: "winter-squash",
    name: "Roasted squash and lentils",
    minutes: 35,
    servingsNote: "About 1 plate",
    ingredients: [
      { item: "winter squash", amount: "2 cups cubes", group: "Produce" },
      { item: "cooked lentils", amount: "1 cup", group: "Protein" },
      { item: "olive oil", amount: "1 teaspoon", group: "Pantry" },
    ],
    steps: ["Roast the squash at 425°F (220°C) until soft.", "Warm the lentils and spoon them beside the squash."],
    highlights: ["A vegetable and a plant protein"],
    seasonalNote: vary,
    ayurveda: "Optional: dust the squash with cumin after roasting.",
  },
  {
    id: "cranberry-apple",
    foodId: "cranberries",
    name: "Cranberry apple oats",
    minutes: 20,
    servingsNote: "About 1 bowl",
    ingredients: [
      { item: "cranberries", amount: "1/2 cup", group: "Produce" },
      { item: "apple", amount: "1", group: "Produce" },
      { item: "cooked oats", amount: "1 cup", group: "Grains" },
    ],
    steps: ["Simmer the cranberries and chopped apple with a little water until the berries pop.", "Spoon the fruit over oats."],
    highlights: ["Sharp fruit balanced with apple", "No claim that this treats anything"],
    seasonalNote: vary,
    ayurveda: "Optional: add cinnamon.",
  },
  {
    id: "beet-plate",
    foodId: "beets",
    name: "Beets with beans and greens",
    minutes: 40,
    servingsNote: "About 1 plate",
    ingredients: [
      { item: "beets", amount: "2 medium", group: "Produce" },
      { item: "cooked beans", amount: "1 cup", group: "Protein" },
      { item: "salad greens", amount: "2 handfuls", group: "Produce" },
      { item: "olive oil", amount: "1 teaspoon", group: "Pantry" },
    ],
    steps: ["Roast or boil the beets until tender, then slice them.", "Toss with beans, greens, and oil."],
    highlights: ["Roots, greens, and plant protein"],
    seasonalNote: vary,
    ayurveda: "Optional: add a pinch of coriander.",
  },
  {
    id: "potato-skillet",
    foodId: "potatoes",
    name: "Potato and cabbage skillet",
    minutes: 30,
    servingsNote: "About 1 plate",
    ingredients: [
      { item: "potato", amount: "1 large", group: "Produce" },
      { item: "cabbage", amount: "2 handfuls shredded", group: "Produce" },
      { item: "olive oil", amount: "1 teaspoon", group: "Pantry" },
      { item: "cooked beans", amount: "1 cup", group: "Protein" },
    ],
    steps: ["Pan-cook the potato in the oil until tender.", "Add the cabbage until it wilts.", "Stir in the beans to heat."],
    highlights: ["A winter storage plate with beans for protein"],
    seasonalNote: vary,
    ayurveda: "Optional: add caraway or cumin. Keep the beans.",
  },
  {
    id: "cabbage-skillet",
    foodId: "cabbage",
    name: "Cabbage and lentil skillet",
    minutes: 25,
    servingsNote: "About 1 bowl",
    ingredients: [
      { item: "cabbage", amount: "3 handfuls shredded", group: "Produce" },
      { item: "cooked lentils", amount: "1 cup", group: "Protein" },
      { item: "carrot", amount: "1", group: "Produce" },
      { item: "olive oil", amount: "1 teaspoon", group: "Pantry" },
    ],
    steps: ["Warm the oil.", "Cook the carrot and cabbage until tender.", "Stir in the lentils."],
    highlights: ["Fiber from vegetables and lentils"],
    seasonalNote: vary,
    ayurveda: "Optional: add ginger.",
  },
  {
    id: "carrot-plate",
    foodId: "carrots-season",
    name: "Carrots with lentils",
    minutes: 25,
    servingsNote: "About 1 bowl",
    ingredients: [
      { item: "carrots", amount: "2", group: "Produce" },
      { item: "cooked lentils", amount: "1 cup", group: "Protein" },
      { item: "olive oil", amount: "1 teaspoon", group: "Pantry" },
    ],
    steps: ["Slice the carrots and cook them in the oil with a splash of water until tender.", "Stir in the lentils."],
    highlights: ["A simple cold-weather bowl"],
    seasonalNote: vary,
    ayurveda: "Optional: add cumin.",
  },
  {
    id: "onion-skillet",
    foodId: "onions",
    name: "Onions with beans and greens",
    minutes: 20,
    servingsNote: "About 1 bowl",
    ingredients: [
      { item: "onion", amount: "1", group: "Produce" },
      { item: "cooked beans", amount: "1 cup", group: "Protein" },
      { item: "kale or cabbage", amount: "2 handfuls", group: "Produce" },
      { item: "olive oil", amount: "1 teaspoon", group: "Pantry" },
    ],
    steps: ["Cook the onion in the oil until soft.", "Add the greens and a splash of water.", "Stir in the beans."],
    highlights: ["Storage vegetables plus beans"],
    seasonalNote: vary,
    ayurveda: "Optional: add black pepper.",
  },
];

export const SEASON_LABEL: Record<Season, string> = {
  spring: msg("Spring"),
  summer: msg("Summer"),
  autumn: msg("Autumn"),
  winter: msg("Winter"),
};

export function seasonalById(id: string): SeasonalFood | null {
  return SEASONAL_FOODS.find((item) => item.id === id) ?? null;
}

export function recipeById(id: string): KitchenRecipe | null {
  return KITCHEN_RECIPES.find((item) => item.id === id) ?? null;
}

export function foodsForSeason(season: Season | ""): SeasonalFood[] {
  if (!season) return SEASONAL_FOODS;
  return SEASONAL_FOODS.filter((item) => item.seasons.includes(season));
}

const SOUTHERN =
  /^(Australia|Antarctica|Pacific\/(Auckland|Chatham|Fiji|Tongatapu)|America\/(Argentina|Sao_Paulo|Santiago|Buenos_Aires)|Africa\/(Johannesburg|Maputo)|Indian\/Mauritius)\b/;

const NORTH: Season[] = [
  "winter",
  "winter",
  "spring",
  "spring",
  "spring",
  "summer",
  "summer",
  "summer",
  "autumn",
  "autumn",
  "autumn",
  "winter",
];

export function guessSeason(timeZone: string, monthIndex: number): { season: Season; label: string } | null {
  if (!timeZone || monthIndex < 0 || monthIndex > 11) return null;
  const north = NORTH[monthIndex];
  const season = SOUTHERN.test(timeZone)
    ? north === "spring"
      ? "autumn"
      : north === "autumn"
        ? "spring"
        : north === "summer"
          ? "winter"
          : "summer"
    : north;
  return {
    season,
    label: msg("Guessed from this browser’s time zone. It can be wrong. Choose the season yourself."),
  };
}
