import { isRealISODate } from "@/lib/dates";
import { disclaimer } from "@/lib/nutrition/education";

export const plateSafety = disclaimer;

export const illustrativeBanner =
  "Illustrative sample. Not a real package, and not a measured product.";

export const plateSources = [
  {
    id: "fda-label",
    name: "The Nutrition Facts Label",
    publisher: "U.S. Food and Drug Administration",
    url: "https://www.fda.gov/food/nutrition-facts-label",
    checked: "2026-11-06",
  },
  {
    id: "myplate",
    name: "MyPlate",
    publisher: "U.S. Department of Agriculture",
    url: "https://www.myplate.gov/",
    checked: "2026-11-06",
  },
  {
    id: "aha-eating",
    name: "Healthy eating",
    publisher: "American Heart Association",
    url: "https://www.heart.org/en/healthy-living/healthy-eating",
    checked: "2026-11-06",
  },
  {
    id: "nia-eating",
    name: "Healthy eating, nutrition, and diet",
    publisher: "National Institute on Aging",
    url: "https://www.nia.nih.gov/health/healthy-eating-nutrition-and-diet",
    checked: "2026-11-06",
  },
  {
    id: "harvard-source",
    name: "The Nutrition Source",
    publisher: "Harvard T.H. Chan School of Public Health",
    url: "https://nutritionsource.hsph.harvard.edu/",
    checked: "2026-11-06",
  },
  {
    id: "ods-home",
    name: "Office of Dietary Supplements",
    publisher: "National Institutes of Health",
    url: "https://ods.od.nih.gov/",
    checked: "2026-11-06",
  },
] as const;

export const relatedLinks = [
  { href: "/outlook", label: "Life Outlook" },
  { href: "/what-if", label: "WHAT IF" },
  { href: "/academy/move", label: "Movement" },
  { href: "/academy/move/chair-stand", label: "Strength practice: stand from a chair" },
  { href: "/academy/move/heel-to-toe", label: "Balance practice: heel-to-toe steps" },
  { href: "/progress", label: "Progress" },
  { href: "/plan", label: "Improvement plan" },
] as const;

export type PlateSlot = "produce" | "protein" | "grain" | "fat";

export type PlateFood = {
  id: string;
  name: string;
  slot: PlateSlot;
  note: string;
};

export const plateFoods: readonly PlateFood[] = [
  { id: "berries", name: "Berries", slot: "produce", note: "Fresh or unsweetened frozen." },
  { id: "spinach", name: "Spinach", slot: "produce", note: "Raw or cooked." },
  { id: "broccoli", name: "Broccoli", slot: "produce", note: "A familiar green vegetable." },
  { id: "carrots", name: "Carrots", slot: "produce", note: "Raw or cooked." },
  { id: "tomato", name: "Tomato", slot: "produce", note: "Fresh, or canned if you read the label." },
  { id: "banana", name: "Banana", slot: "produce", note: "Whole fruit." },
  { id: "apple", name: "Apple", slot: "produce", note: "Leave the skin on when you like it." },
  { id: "salad-greens", name: "Salad greens", slot: "produce", note: "Any mix you already eat." },
  { id: "eggs", name: "Eggs", slot: "protein", note: "A simple protein food." },
  { id: "salmon", name: "Salmon", slot: "protein", note: "An oily fish." },
  { id: "chicken", name: "Chicken or turkey", slot: "protein", note: "Cooked with herbs instead of a salty sauce." },
  { id: "greek-yogurt", name: "Greek yogurt", slot: "protein", note: "Plain, if you want less added sugar." },
  { id: "cottage-cheese", name: "Cottage cheese", slot: "protein", note: "Compare sodium if you use the tub." },
  { id: "beans", name: "Beans", slot: "protein", note: "A vegetarian protein food." },
  { id: "lentils", name: "Lentils", slot: "protein", note: "A vegetarian protein food." },
  { id: "tofu", name: "Tofu", slot: "protein", note: "A vegetarian protein food." },
  { id: "oats", name: "Oats", slot: "grain", note: "A whole grain." },
  { id: "brown-rice", name: "Brown rice", slot: "grain", note: "A whole grain." },
  { id: "whole-wheat-bread", name: "Whole-wheat bread", slot: "grain", note: "Check the sodium line." },
  { id: "quinoa", name: "Quinoa", slot: "grain", note: "Used here as a grain food." },
  { id: "crackers", name: "Whole-grain crackers", slot: "grain", note: "A quick carbohydrate food." },
  { id: "olive-oil", name: "Olive oil", slot: "fat", note: "A modest pour." },
  { id: "avocado", name: "Avocado", slot: "fat", note: "Unsaturated fat in a whole food." },
  { id: "walnuts", name: "Walnuts", slot: "fat", note: "A small handful." },
  { id: "almonds", name: "Almonds", slot: "fat", note: "A small handful." },
  { id: "chia", name: "Chia seeds", slot: "fat", note: "A spoon, not a bowl." },
  { id: "peanut-butter", name: "Peanut butter", slot: "fat", note: "A thin spread. Compare added sugar and sodium." },
];

export const plateExamples = [
  {
    id: "breakfast",
    name: "Breakfast",
    blurb: "Berries, eggs, oats, and a few walnuts.",
    foodIds: ["berries", "eggs", "oats", "walnuts"],
  },
  {
    id: "lunch",
    name: "Lunch",
    blurb: "Greens, tomato, chicken, brown rice, and olive oil.",
    foodIds: ["salad-greens", "tomato", "chicken", "brown-rice", "olive-oil"],
  },
  {
    id: "dinner",
    name: "Dinner",
    blurb: "Broccoli, carrots, salmon, quinoa, and avocado.",
    foodIds: ["broccoli", "carrots", "salmon", "quinoa", "avocado"],
  },
  {
    id: "vegetarian",
    name: "Vegetarian",
    blurb: "Spinach, lentils, tofu, brown rice, and olive oil.",
    foodIds: ["spinach", "lentils", "tofu", "brown-rice", "olive-oil"],
  },
  {
    id: "quick",
    name: "Quick busy-day meal",
    blurb: "A banana, carrots, cottage cheese, crackers, and peanut butter.",
    foodIds: ["banana", "carrots", "cottage-cheese", "crackers", "peanut-butter"],
  },
] as const;

export const plateIntro = {
  title: "BUILD YOUR HEALTHY PLATE",
  lead: "A useful picture is half vegetables and fruit, a quarter protein, and a quarter whole grains or other carbohydrate foods. Healthy fats sit in a modest amount, beside that picture rather than as a fourth quarter.",
  vary: "Portions vary from person to person and from meal to meal. This is a pattern for building a plate, not a measured diet and not a personal target.",
  empty: "Pick a vegetable or fruit, a protein food, and a grain or other carbohydrate food. Fats stay in a modest amount. Portions vary.",
  partial: "Add whatever part is still empty: vegetables or fruit, protein, and grains or other carbohydrate foods. A fat can sit beside the plate in a small amount. Portions vary.",
  ready: "This selection follows the plate pattern: about half vegetables and fruit, a quarter protein, a quarter grains or other carbohydrate foods, and fats in a modest amount. Portions vary from person to person and from meal to meal.",
  crowded: "The pattern is here. You also picked several foods in one part. The half and the quarters are shares of the plate, not a pile. Portions vary.",
};

export type DrawKind = "egg" | "fish" | "chicken" | "cheese" | "tofu" | "oil" | "avocado" | "nuts" | "seed";

export type FoodVisual = {
  id: string;
  name: string;
  image: string | null;
  draw: DrawKind | null;
  alt: string;
  caption: string;
};

export const proteinCards: readonly (FoodVisual & {
  vegetarian: boolean;
  note: string;
  meal: string;
})[] = [
  {
    id: "eggs",
    name: "Eggs",
    image: null,
    draw: "egg",
    alt: "Original drawing of an egg.",
    caption: "Original drawing",
    vegetarian: true,
    note: "Eggs are a compact protein food. They fit a vegetarian plate that includes eggs.",
    meal: "Scramble eggs with spinach and eat them with toast.",
  },
  {
    id: "salmon",
    name: "Fish, including salmon",
    image: null,
    draw: "fish",
    alt: "Original drawing of a fish.",
    caption: "Original drawing",
    vegetarian: false,
    note: "Salmon is an oily fish. Other fish can play the same role on the plate.",
    meal: "Bake salmon with broccoli and brown rice.",
  },
  {
    id: "chicken",
    name: "Chicken or turkey",
    image: null,
    draw: "chicken",
    alt: "Original drawing of a chicken drumstick.",
    caption: "Original drawing",
    vegetarian: false,
    note: "Plain roasted or stewed poultry is a protein food. A salty coating is a separate choice.",
    meal: "Slice leftover chicken over a large salad and a whole grain.",
  },
  {
    id: "greek-yogurt",
    name: "Greek yogurt",
    image: "/nutrition/yogurt.jpg",
    draw: null,
    alt: "A bowl of plain white yogurt.",
    caption: "Kitchen photo already used on this Nutrition page.",
    vegetarian: true,
    note: "Plain Greek yogurt is a protein food. Sweetened cups can carry added sugar, so the label still matters.",
    meal: "Top plain yogurt with berries and a spoon of chia.",
  },
  {
    id: "cottage-cheese",
    name: "Cottage cheese",
    image: null,
    draw: "cheese",
    alt: "Original drawing of a soft cheese bowl.",
    caption: "Original drawing",
    vegetarian: true,
    note: "Cottage cheese is a dairy protein food. Brands differ in sodium, so compare the line if you have two tubs.",
    meal: "Eat it with tomato and whole-grain crackers.",
  },
  {
    id: "beans",
    name: "Beans",
    image: "/nutrition/beans.jpg",
    draw: null,
    alt: "Bowls of dried beans.",
    caption: "Kitchen photo already used on this Nutrition page.",
    vegetarian: true,
    note: "Beans bring protein and fiber. A low-sodium can is one option. Rinsing regular canned beans can wash away some salty liquid. It does not remove all of the sodium.",
    meal: "Warm beans with garlic and spoon them beside rice and greens.",
  },
  {
    id: "lentils",
    name: "Lentils",
    image: "/nutrition/lentils.jpg",
    draw: null,
    alt: "A bowl of dry brown lentils.",
    caption: "Kitchen photo already used on this Nutrition page.",
    vegetarian: true,
    note: "Lentils are a vegetarian protein food that cooks without a long soak.",
    meal: "Make a lentil soup and add carrots and lemon.",
  },
  {
    id: "tofu",
    name: "Tofu",
    image: null,
    draw: "tofu",
    alt: "Original drawing of tofu cubes.",
    caption: "Original drawing",
    vegetarian: true,
    note: "Tofu is a soybean protein food. It takes on the herbs you cook it with.",
    meal: "Pan-cook tofu with vegetables and serve it over brown rice.",
  },
  {
    id: "nuts-seeds",
    name: "Nuts and seeds",
    image: "/nutrition/nuts-seeds.jpg",
    draw: null,
    alt: "A bowl of mixed nuts and sunflower seeds.",
    caption: "Kitchen photo already used on this Nutrition page.",
    vegetarian: true,
    note: "Nuts and seeds contribute protein and fat. A small handful is the usual idea. This is not a gram target.",
    meal: "Add walnuts or pumpkin seeds to oatmeal.",
  },
];

export const proteinCopy = {
  title: "PROTEIN & STRONG MUSCLES",
  lead: "Protein foods help build and repair muscle. They also help a meal feel satisfying. Needs vary. This page does not set a gram target and it does not measure your muscle.",
  aging: "Muscle size and strength tend to decline as people get older. Protein foods are one part of looking after muscle. They are not a special cure, and they do not replace movement.",
  recovery: "After you use your muscles, a meal or snack with protein and a carbohydrate food is a common pattern. When you eat, and how much, is individual.",
  movement: "Pair protein foods with strength and balance movement. The Movement library has a chair stand and supported heel-to-toe steps. Stop any move that hurts.",
};

export const saltPlaces = [
  { id: "bread", title: "Bread", text: "Bread is a common place sodium shows up, including some homemade loaves that use salt. Amounts differ by recipe and brand. Read the line or taste the dough you make." },
  { id: "soup", title: "Canned soup", text: "A can of soup can carry a large sodium number in one bowl. Compare two cans. A lower number is lower for that labeled serving, not a verdict on the whole brand." },
  { id: "sauce", title: "Sauces", text: "Pasta sauce, soy sauce, salad dressing, and gravy often hold more sodium than the food you pour them on. A smaller pour changes the plate." },
  { id: "meats", title: "Processed meats", text: "Ham, bacon, sausage, and deli slices often list more sodium than fresh meat. That is a pattern to look for, not a rule for every package." },
  { id: "cheese", title: "Cheese", text: "Cheese is salty by nature of how it is made. The amount still differs. Look at the serving, which is often smaller than the pile on a plate." },
  { id: "snacks", title: "Snacks", text: "Crackers, chips, and seasoned nuts can add sodium between meals. Unsalted nuts are a different package from a salted snack." },
  { id: "restaurant", title: "Restaurant meals", text: "A menu may not show sodium. Sauce on the side, or a plate with vegetables and a simply cooked protein, is a practical step. This page does not know the number for your order." },
];

export const saltCopy = {
  title: "HIDDEN SALT — PROTECT YOUR HEART",
  titleNote: "The heading is a reminder to notice sodium. It is not a promise that a meal protects your heart.",
  saltVersusSodium: "Salt is a crystal that contains sodium. The Nutrition Facts label lists sodium in milligrams. That number is sodium, not the weight of the salt you might picture in a spoon. You do not need a conversion chart for this lesson. Read the sodium line and the serving size.",
  pressure: "Public heart-health pages describe an association between higher sodium intake and higher blood pressure. An association in groups of people is not a certainty for one person. This page does not measure your blood pressure and it does not diagnose hypertension.",
  label: "On a label, find the serving size first, then sodium. Two products can only be compared fairly when you notice whether the servings match.",
};

export const saltTips = [
  "When you buy canned beans, look for a can that says low sodium.",
  "If you use regular canned beans, draining and rinsing can wash away some of the salty liquid. It does not remove all of the sodium, and the amount varies.",
  "Lemon, garlic, herbs, and other spices add flavor without putting a sodium number on the plate.",
  "Compare two labels in the store before you decide. The sample labels on this page are for practice.",
];

export type TeachingLabel = {
  id: string;
  category: "yogurt" | "bread" | "cereal" | "sauce" | "soup" | "snack";
  product: string;
  serving: string;
  calories: number;
  addedSugarsG: number;
  sodiumMg: number;
  fiberG: number;
  proteinG: number;
  ingredients: string;
};

export const groceryCategories = [
  { id: "yogurt", label: "Yogurts" },
  { id: "bread", label: "Breads" },
  { id: "cereal", label: "Cereals" },
  { id: "sauce", label: "Sauces" },
  { id: "soup", label: "Soups" },
  { id: "snack", label: "Snacks" },
] as const;

export const grocerySamples: readonly TeachingLabel[] = [
  { id: "yogurt-plain", category: "yogurt", product: "Sample plain yogurt", serving: "3/4 cup (170 g)", calories: 100, addedSugarsG: 0, sodiumMg: 65, fiberG: 0, proteinG: 17, ingredients: "Cultured milk." },
  { id: "yogurt-vanilla", category: "yogurt", product: "Sample vanilla yogurt", serving: "3/4 cup (170 g)", calories: 150, addedSugarsG: 14, sodiumMg: 85, fiberG: 0, proteinG: 6, ingredients: "Cultured milk, cane sugar, natural flavor." },
  { id: "bread-oat", category: "bread", product: "Sample oat bread", serving: "1 slice (28 g)", calories: 80, addedSugarsG: 1, sodiumMg: 120, fiberG: 2, proteinG: 3, ingredients: "Whole wheat flour, water, oats, yeast, salt." },
  { id: "bread-white", category: "bread", product: "Sample white bread", serving: "1 slice (28 g)", calories: 70, addedSugarsG: 2, sodiumMg: 230, fiberG: 0, proteinG: 2, ingredients: "Enriched flour, water, sugar, yeast, salt." },
  { id: "cereal-bran", category: "cereal", product: "Sample bran flakes", serving: "1 cup (40 g)", calories: 120, addedSugarsG: 4, sodiumMg: 140, fiberG: 5, proteinG: 3, ingredients: "Whole wheat, wheat bran, sugar, salt." },
  { id: "cereal-frosted", category: "cereal", product: "Sample frosted flakes", serving: "1 cup (40 g)", calories: 150, addedSugarsG: 12, sodiumMg: 210, fiberG: 1, proteinG: 2, ingredients: "Milled corn, sugar, salt, malt flavor." },
  { id: "sauce-herb", category: "sauce", product: "Sample herb tomato sauce", serving: "1/4 cup (60 g)", calories: 40, addedSugarsG: 2, sodiumMg: 180, fiberG: 1, proteinG: 1, ingredients: "Tomatoes, onion, garlic, basil, salt." },
  { id: "sauce-salty", category: "sauce", product: "Sample salty tomato sauce", serving: "1/4 cup (60 g)", calories: 45, addedSugarsG: 4, sodiumMg: 520, fiberG: 1, proteinG: 1, ingredients: "Tomatoes, sugar, salt, onion powder." },
  { id: "soup-garden", category: "soup", product: "Sample garden soup", serving: "1 cup (245 g)", calories: 90, addedSugarsG: 2, sodiumMg: 140, fiberG: 3, proteinG: 4, ingredients: "Tomatoes, carrots, beans, garlic, salt." },
  { id: "soup-noodle", category: "soup", product: "Sample noodle soup", serving: "1 cup (245 g)", calories: 120, addedSugarsG: 1, sodiumMg: 480, fiberG: 1, proteinG: 5, ingredients: "Broth, noodles, carrots, salt, yeast extract." },
  { id: "snack-nuts", category: "snack", product: "Sample unsalted nuts", serving: "1 ounce (28 g)", calories: 170, addedSugarsG: 0, sodiumMg: 5, fiberG: 2, proteinG: 6, ingredients: "Almonds and walnuts." },
  { id: "snack-crackers", category: "snack", product: "Sample cheese crackers", serving: "1 ounce (28 g)", calories: 140, addedSugarsG: 2, sodiumMg: 250, fiberG: 1, proteinG: 3, ingredients: "Enriched flour, cheese, oil, salt." },
];

export const sodiumPairs = [
  { id: "soups", leftId: "soup-garden", rightId: "soup-noodle" },
  { id: "breads", leftId: "bread-oat", rightId: "bread-white" },
] as const;

export const sodiumQuestion = "Which product has less sodium?";

export const fatKinds = [
  { id: "unsaturated", title: "Unsaturated fat", text: "Olive oil, avocado, walnuts, almonds, chia, flax, and oily fish such as salmon are rich in unsaturated fat. These are everyday foods, not a treatment." },
  { id: "saturated", title: "Saturated fat", text: "Butter, fatty cuts of meat, coconut oil, and many cheeses are richer in saturated fat. This page does not ban them. The idea is to replace some of them, not to fear a single meal." },
  { id: "trans", title: "Trans fat", text: "Artificial trans fat has left many packaged foods. A label can still list partially hydrogenated oil. If you see that ingredient, choose a different product. This is label reading, not a disease claim." },
];

export const fatCopy = {
  title: "HEALTHY FATS",
  lead: "Replacing some saturated fat with unsaturated fat can support heart health. That is a general pattern from public guidance. It is not a promise that a food prevents disease.",
  modest: "Fat is part of cooking and of feeling satisfied. Modest means a spoon, a slice, or a small handful, not a measured prescription.",
};

export const fatChoices: readonly (FoodVisual & { swap: string; meal: string })[] = [
  { id: "olive-oil", name: "Olive oil", image: null, draw: "oil", alt: "Original drawing of an oil bottle.", caption: "Original drawing", swap: "For sautéing vegetables, use olive oil where you might have used a large knob of butter.", meal: "Toss cooked greens with a small spoon of olive oil and lemon." },
  { id: "avocado", name: "Avocado", image: null, draw: "avocado", alt: "Original drawing of an avocado.", caption: "Original drawing", swap: "Spread avocado on toast where you might have used butter.", meal: "Add slices to a bean salad." },
  { id: "walnuts", name: "Walnuts", image: "/nutrition/nuts-seeds.jpg", draw: null, alt: "A bowl of mixed nuts and sunflower seeds. Walnuts are one nut in this family.", caption: "Kitchen photo of mixed nuts and seeds.", swap: "A small handful of walnuts can replace a salty crunchy snack.", meal: "Stir chopped walnuts into oatmeal." },
  { id: "almonds", name: "Almonds", image: null, draw: "nuts", alt: "Original drawing of nuts.", caption: "Original drawing", swap: "A small handful of almonds can replace chips.", meal: "Pair almonds with fruit." },
  { id: "chia", name: "Chia", image: "/nutrition/chia.jpg", draw: null, alt: "A bowl of chia seeds.", caption: "Kitchen photo already used on this Nutrition page.", swap: "Stir chia into yogurt instead of a sweet crunchy topping.", meal: "Mix a spoon of chia into plain yogurt and fruit." },
  { id: "flax", name: "Flax", image: null, draw: "seed", alt: "Original drawing of seeds.", caption: "Original drawing", swap: "Ground flax can sit in oatmeal where you might have added only butter.", meal: "Stir ground flax into warm oats." },
  { id: "salmon-fat", name: "Salmon and other oily fish", image: null, draw: "fish", alt: "Original drawing of a fish.", caption: "Original drawing", swap: "Serve salmon where you might have served a fattier processed meat.", meal: "Bake salmon with vegetables and a whole grain." },
];

export const plantGroups = [
  { id: "green", title: "Green", foods: [
    { id: "spinach", name: "Spinach" },
    { id: "kale", name: "Kale" },
    { id: "broccoli", name: "Broccoli" },
    { id: "green-beans", name: "Green beans" },
    { id: "cucumber", name: "Cucumber" },
    { id: "peas", name: "Peas" },
  ] },
  { id: "red", title: "Red", foods: [
    { id: "tomato", name: "Tomato" },
    { id: "strawberries", name: "Strawberries" },
    { id: "red-pepper", name: "Red pepper" },
    { id: "apple", name: "Apple" },
    { id: "watermelon", name: "Watermelon" },
  ] },
  { id: "orange", title: "Orange and yellow", foods: [
    { id: "carrot", name: "Carrot" },
    { id: "sweet-potato", name: "Sweet potato" },
    { id: "orange", name: "Orange" },
    { id: "banana", name: "Banana" },
    { id: "yellow-pepper", name: "Yellow pepper" },
  ] },
  { id: "blue", title: "Blue and purple", foods: [
    { id: "blueberries", name: "Blueberries" },
    { id: "eggplant", name: "Eggplant" },
    { id: "purple-cabbage", name: "Purple cabbage" },
    { id: "plum", name: "Plum" },
  ] },
  { id: "beans", title: "Beans and lentils", foods: [
    { id: "black-beans", name: "Black beans" },
    { id: "lentils", name: "Lentils" },
    { id: "chickpeas", name: "Chickpeas" },
  ] },
  { id: "nuts", title: "Nuts and seeds", foods: [
    { id: "walnuts", name: "Walnuts" },
    { id: "almonds", name: "Almonds" },
    { id: "chia", name: "Chia" },
    { id: "flaxseed", name: "Flaxseed" },
  ] },
  { id: "grains", title: "Whole grains", foods: [
    { id: "oats", name: "Oats" },
    { id: "brown-rice", name: "Brown rice" },
    { id: "quinoa", name: "Quinoa" },
    { id: "barley", name: "Barley" },
  ] },
  { id: "herbs", title: "Herbs", foods: [
    { id: "parsley", name: "Parsley" },
    { id: "basil", name: "Basil" },
    { id: "cilantro", name: "Cilantro" },
    { id: "garlic", name: "Garlic" },
    { id: "ginger", name: "Ginger" },
  ] },
] as const;

export const rainbowCopy = {
  title: "EAT THE RAINBOW — 30 PLANTS CHALLENGE",
  lead: "Color is a simple way to remember variety: green, red, orange or yellow, blue or purple, plus beans, nuts and seeds, whole grains, and herbs. Thirty is a nickname for many plants, not a requirement to hit 30.",
  count: "Each plant counts once this week, even if you eat it again. A new calendar week starts a fresh list. You can also reset this week.",
};

export const groceryCopy = {
  title: "SMART GROCERY SHOPPING",
  lead: "Compare two yogurts, breads, cereals, sauces, soups, or snacks. Start with an illustrative sample, or type the numbers you see on a package in your hand. lifeZoi does not look up products and it does not invent a missing number.",
  checklistTitle: "Grocery checklist",
  checklistNote: "A reminder you can mark and print. It is not a required shopping list.",
};

export const groceryChecklist = [
  { id: "groc-produce", label: "Vegetables and fruit in more than one color" },
  { id: "groc-protein", label: "A protein food you already know how to cook" },
  { id: "groc-grain", label: "A whole grain or other carbohydrate food" },
  { id: "groc-beans", label: "Low-sodium canned beans, if you buy beans in a can" },
  { id: "groc-flavor", label: "Herbs, lemon, garlic, or other spices" },
  { id: "groc-fat", label: "A food with unsaturated fat, such as olive oil, nuts, or avocado" },
  { id: "groc-breakfast", label: "Foods for a breakfast you can repeat" },
  { id: "groc-drink", label: "Water, milk, or unsweetened tea" },
] as const;

export const challengeCopy = {
  title: "MY NUTRITION CHALLENGE",
  motto: "Seven small steps. Better everyday choices.",
  lead: "Mark a step when you try it. The marks stay in this browser tab with your other check-ins. There is no account and no score that follows you.",
  done: "You marked all seven small steps. They stay in this browser tab until you restart. Nothing here is a grade or a medical result.",
  restart: "Restart clears these seven steps and the meal sketch in this tab.",
};

export const challengeSteps = [
  {
    id: "nstep-coffee",
    title: "Sweet coffee",
    body: "If your coffee or tea is sweet, notice it today. You might use a little less of the sweetener you already add, or leave it as it is and pay attention to the taste. A sweet drink can still be part of the day. This step is not a warning about an energy slump.",
  },
  {
    id: "nstep-color",
    title: "Add color",
    body: "Add one fruit or vegetable color to a meal you already eat. A tomato, a handful of greens, or a piece of fruit is enough.",
  },
  {
    id: "nstep-protein",
    title: "Protein at breakfast",
    body: "Include a protein food at breakfast if that meal fits your morning. Eggs, yogurt, beans, or nuts are examples. If one food does not suit you, pick another you tolerate.",
  },
  {
    id: "nstep-sodium",
    title: "Compare sodium",
    body: "Compare the sodium line on two packages, or use the sample labels in Hidden salt. Look at the serving size before you decide.",
  },
  {
    id: "nstep-plant",
    title: "A new plant",
    body: "Eat one plant you do not have every week, or mark a familiar plant in the rainbow tracker. One plant counts once.",
  },
  {
    id: "nstep-fat",
    title: "Unsaturated fat",
    body: "Use an unsaturated fat in place of some saturated fat. Olive oil, avocado, nuts, seeds, or oily fish are examples. This is a swap, not a promise.",
  },
  {
    id: "nstep-plan",
    title: "Plan the day",
    body: "Plan one breakfast, one lunch, one dinner, and two snacks. Write foods you can actually get. This is a sketch, not a prescription.",
  },
] as const;

export const planFields = [
  { id: "nstep-breakfast", label: "Breakfast" },
  { id: "nstep-lunch", label: "Lunch" },
  { id: "nstep-dinner", label: "Dinner" },
  { id: "nstep-snack-a", label: "Snack" },
  { id: "nstep-snack-b", label: "Second snack" },
] as const;

const foodById = new Map(plateFoods.map((food) => [food.id, food]));

export function plateGroups(ids: readonly string[]) {
  const selected = ids.map((id) => foodById.get(id)).filter((food): food is PlateFood => Boolean(food));
  return {
    produce: selected.filter((food) => food.slot === "produce"),
    protein: selected.filter((food) => food.slot === "protein"),
    grain: selected.filter((food) => food.slot === "grain"),
    fat: selected.filter((food) => food.slot === "fat"),
  };
}

export function plateSummary(ids: readonly string[]) {
  const groups = plateGroups(ids);
  const ready = groups.produce.length > 0 && groups.protein.length > 0 && groups.grain.length > 0;
  const crowded = groups.protein.length > 2 || groups.grain.length > 2 || groups.fat.length > 2 || groups.produce.length > 4;
  let message = plateIntro.empty;
  if (ready && crowded) message = plateIntro.crowded;
  else if (ready) message = plateIntro.ready;
  else if (ids.length > 0) message = plateIntro.partial;
  return { ready, crowded, message, ...groups };
}

export function labelById(id: string) {
  return grocerySamples.find((sample) => sample.id === id) ?? null;
}

export function lessSodium(left: { id: string; sodiumMg: number }, right: { id: string; sodiumMg: number }) {
  if (left.sodiumMg < right.sodiumMg) return left.id;
  if (right.sodiumMg < left.sodiumMg) return right.id;
  return "tie";
}

export function sodiumAnswer(left: TeachingLabel, right: TeachingLabel) {
  const winnerId = lessSodium(left, right);
  if (winnerId === "tie") {
    return {
      winnerId,
      sentence: "These illustrative labels list the same sodium per labeled serving.",
    };
  }
  const winner = winnerId === left.id ? left : right;
  const other = winnerId === left.id ? right : left;
  return {
    winnerId,
    sentence: `${winner.product} lists ${winner.sodiumMg} mg sodium per labeled serving. ${other.product} lists ${other.sodiumMg} mg. These illustrative samples use the same serving size, so the lower line is the smaller amount of sodium on that serving.`,
  };
}

export function weekStart(isoDate: string) {
  if (!isRealISODate(isoDate)) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - (weekday - 1));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function plantCheckId(week: string, foodId: string) {
  return `pw-${week}-${foodId}`;
}

export function plantCatalogIds() {
  return plantGroups.flatMap((group) => group.foods.map((food) => food.id));
}

export function uniquePlantsMarked(ids: readonly string[], catalog: readonly string[]) {
  const allowed = new Set(catalog);
  const seen = new Set<string>();
  for (const id of ids) {
    if (allowed.has(id)) seen.add(id);
  }
  return seen.size;
}

export function challengeProgress(doneIds: readonly string[]) {
  const doneSet = new Set(doneIds);
  const done = challengeSteps.filter((step) => doneSet.has(step.id)).length;
  return { done, total: challengeSteps.length, complete: done === challengeSteps.length };
}

export type GrocerySide = {
  product: string;
  serving: string;
  calories: number | null;
  addedSugarsG: number | null;
  sodiumMg: number | null;
  fiberG: number | null;
  proteinG: number | null;
  ingredients: string;
  illustrative: boolean;
};

export function parseAmount(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!/^\d{1,5}(\.\d{1,2})?$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

function sideName(side: GrocerySide, fallback: string) {
  return side.product.trim() || fallback;
}

export function groceryNotes(left: GrocerySide, right: GrocerySide) {
  const notes: string[] = [];
  const leftName = sideName(left, "The first label");
  const rightName = sideName(right, "The second label");
  if (left.illustrative || right.illustrative) {
    notes.push("Illustrative samples use made-up teaching numbers. They are not store products.");
  }
  if (!left.illustrative || !right.illustrative) {
    notes.push("A label you typed is shown as you entered it. lifeZoi did not look it up.");
  }
  if (left.serving.trim() && right.serving.trim() && left.serving.trim() !== right.serving.trim()) {
    notes.push("The serving sizes are not the same, so the lines are not the same amount of food.");
  }
  if (left.sodiumMg !== null && right.sodiumMg !== null) {
    if (left.sodiumMg < right.sodiumMg) notes.push(`${leftName} lists less sodium per labeled serving.`);
    else if (right.sodiumMg < left.sodiumMg) notes.push(`${rightName} lists less sodium per labeled serving.`);
    else notes.push("These labels list the same sodium per labeled serving.");
  } else {
    notes.push("Sodium is missing on a label, so this page will not guess it.");
  }
  if (left.addedSugarsG !== null && right.addedSugarsG !== null) {
    if (left.addedSugarsG < right.addedSugarsG) notes.push(`${leftName} lists less added sugar per labeled serving.`);
    else if (right.addedSugarsG < left.addedSugarsG) notes.push(`${rightName} lists less added sugar per labeled serving.`);
    else notes.push("These labels list the same added sugar per labeled serving.");
  }
  if (left.fiberG !== null && right.fiberG !== null && left.fiberG !== right.fiberG) {
    const higher = left.fiberG > right.fiberG ? leftName : rightName;
    notes.push(`${higher} lists more fiber per labeled serving.`);
  }
  if (left.proteinG !== null && right.proteinG !== null && left.proteinG !== right.proteinG) {
    const higher = left.proteinG > right.proteinG ? leftName : rightName;
    notes.push(`${higher} lists more protein per labeled serving.`);
  }
  notes.push("Calories are shown so you can read them. This page does not set a calorie target.");
  return notes;
}

export function amountText(value: number | null, unit: string) {
  if (value === null) return "Not entered";
  return `${value} ${unit}`;
}

function walk(value: unknown, out: string[]) {
  if (typeof value === "string" || typeof value === "number") {
    out.push(String(value));
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) walk(item, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) walk(item, out);
  }
}

export function platePlainText() {
  const chunks: string[] = [];
  walk(
    {
      plateSafety,
      illustrativeBanner,
      plateSources,
      relatedLinks,
      plateFoods,
      plateExamples,
      plateIntro,
      proteinCards,
      proteinCopy,
      saltPlaces,
      saltCopy,
      saltTips,
      grocerySamples,
      sodiumQuestion,
      fatKinds,
      fatCopy,
      fatChoices,
      plantGroups,
      rainbowCopy,
      groceryCopy,
      groceryChecklist,
      challengeCopy,
      challengeSteps,
      planFields,
    },
    chunks,
  );
  return chunks.join("\n");
}
