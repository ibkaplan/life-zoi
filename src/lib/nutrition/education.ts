export type NutritionSource = {
  id: string;
  name: string;
  publisher: string;
  url: string;
  checked: string;
};

export type Ingredient = {
  item: string;
  us: string;
  metric: string;
};

export type StarterGuide = {
  title: string;
  intro: string;
  steps: string[];
};

export type BreadRecipe = {
  slug: string;
  name: string;
  description: string;
  prep: string;
  bake: string;
  difficulty: string;
  makes: string;
  image: string;
  imageAlt: string;
  width: number;
  height: number;
  addedSugar: "0 g";
  ingredients: Ingredient[];
  steps: string[];
  serving: string[];
  nutritionNote: string;
  starter: StarterGuide | null;
};

export type FoodCard = {
  id: string;
  name: string;
  image: string;
  alt: string;
  note: string;
};

export type QuizChoice = { id: string; label: string };

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: QuizChoice[];
  answer: string;
  because: string;
};

const CHECKED = "2026-11-06";

export const disclaimer =
  "lifeZoi is educational. It does not diagnose, treat, or plan medication, and it does not read a personal lab test. Associations from public pages are not guarantees for one person. A clinician or registered dietitian can help with personal food decisions.";

export const sugarSources: NutritionSource[] = [
  {
    id: "fda-added-sugars",
    name: "Added Sugars on the Nutrition Facts Label",
    publisher: "U.S. Food and Drug Administration",
    url: "https://www.fda.gov/food/nutrition-facts-label/added-sugars-nutrition-facts-label",
    checked: CHECKED,
  },
  {
    id: "aha-added-sugars",
    name: "Added Sugars",
    publisher: "American Heart Association",
    url: "https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sugar/added-sugars",
    checked: CHECKED,
  },
  {
    id: "aha-sugar-101",
    name: "Sugar 101",
    publisher: "American Heart Association",
    url: "https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sugar/sugar-101",
    checked: CHECKED,
  },
  {
    id: "usda-nesr-added-sugars",
    name: "What is the relationship between added sugars and risk of cardiovascular disease?",
    publisher: "USDA Nutrition Evidence Systematic Review",
    url: "https://nesr.usda.gov/what-relationship-between-added-sugars-and-risk-cardiovascular-disease",
    checked: CHECKED,
  },
  {
    id: "aha-2026-dietary",
    name: "Top Things to Know: 2026 Dietary Guidance to Improve Cardiovascular Health",
    publisher: "American Heart Association",
    url: "https://professional.heart.org/en/science-news/2026-dietary-guidance-to-improve-cardiovascular-health/top-things-to-know",
    checked: CHECKED,
  },
];

export const gutSources: NutritionSource[] = [
  {
    id: "cdc-fiber",
    name: "Fiber: The Carb That Helps You Manage Diabetes",
    publisher: "Centers for Disease Control and Prevention",
    url: "https://www.cdc.gov/diabetes/healthy-eating/fiber-helps-diabetes.html",
    checked: CHECKED,
  },
  {
    id: "medlineplus-fiber",
    name: "Fiber",
    publisher: "National Library of Medicine, MedlinePlus",
    url: "https://medlineplus.gov/ency/article/002470.htm",
    checked: CHECKED,
  },
  {
    id: "ods-probiotics",
    name: "Probiotics — Consumer fact sheet",
    publisher: "NIH Office of Dietary Supplements",
    url: "https://ods.od.nih.gov/factsheets/Probiotics-Consumer/",
    checked: CHECKED,
  },
  {
    id: "ods-probiotics-hp",
    name: "Probiotics — Health professional fact sheet",
    publisher: "NIH Office of Dietary Supplements",
    url: "https://ods.od.nih.gov/factsheets/Probiotics-HealthProfessional/",
    checked: CHECKED,
  },
  {
    id: "nccih-probiotics",
    name: "Probiotics: Usefulness and Safety",
    publisher: "National Center for Complementary and Integrative Health",
    url: "https://www.nccih.nih.gov/health/probiotics-what-you-need-to-know",
    checked: CHECKED,
  },
  {
    id: "pmc-fiber-microbiota",
    name: "Dietary fiber and prebiotics and the gastrointestinal microbiota",
    publisher: "Gut Microbes, via PubMed Central",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5390821/",
    checked: CHECKED,
  },
];

export const kingArthur = {
  name: "King Arthur Baking recipes",
  url: "https://www.kingarthurbaking.com/recipes/",
  note: "Technique ideas such as weighing flour, using a hot oven, and keeping a simple dough are widely taught. These three lifeZoi recipes were written for this page. They are not copied from King Arthur Baking. Their recipe library is a place to keep learning.",
};

export const labels = {
  viewRecipe: "View recipe",
  printRecipe: "Print this recipe",
  ingredients: "Ingredients",
  steps: "Steps",
  serving: "Serving ideas",
  backToMeals: "Back to Nutrition",
  allRecipes: "All bread recipes",
  starterLink: "Beginner starter guide",
  checkAnswers: "Check answers",
  tryAgain: "Try the quiz again",
  saveNote: "Save today’s note",
  markDay: "Mark this day",
  unmarkDay: "Marked in this tab",
  saveReflection: "Save the reflection",
  weightFirst: "Weight is the reliable measure. Cup amounts are approximate.",
  addedSugarLabel: "Added sugar",
};

export const dailyChoices = {
  title: "YOUR BODY REMEMBERS YOUR DAILY CHOICES",
  subtitle:
    "Everyday food choices add up. What you eat regularly can influence your metabolism, blood vessels, and long-term heart health.",
  message:
    "Your body may not remember every bite, but it responds to the patterns you repeat every day.",
  addedVersusNatural: [
    "Added sugar is sugar put in during manufacturing or cooking. Examples include table sugar, brown sugar, candy, cookies, sweetened cereal, sweetened yogurt, soda, high-fructose corn syrup, and syrups. The same sugars can show up in foods that do not taste sweet.",
    "Natural sugar in whole fruit comes with fiber, water, vitamins, minerals, and other plant compounds. Whole fruit is a food to enjoy. Fruit juice concentrate used as a sweetener is a different ingredient, and the FDA lists sugars from concentrated fruit juice with added sugars.",
  ],
  sections: [
    {
      id: "blood-sugar",
      title: "Blood sugar and insulin",
      body: "Carbohydrate in food, including sugars, is digested and glucose enters the blood. Insulin is a hormone that helps move glucose from the blood into cells. A sugary drink usually has little fiber, so there is less of the slowing effect fiber can have. CDC says the body does not absorb fiber the way it absorbs other carbohydrates, which is one reason fiber is described as helping with blood sugar. This page does not measure your glucose, diagnose diabetes, or set an insulin plan.",
    },
    {
      id: "triglycerides",
      title: "Triglycerides",
      body: "A USDA Nutrition Evidence Systematic Review found a consistent relationship between higher added-sugar intake and higher serum triglycerides. The same review said the cardiovascular findings were especially consistent for sugar-sweetened drinks. Triglycerides are a blood fat that clinicians use as one cardiovascular risk factor. That is an association in studies, not a result this page can assign to one drink or one person.",
    },
    {
      id: "pressure",
      title: "Blood pressure and vessels",
      body: "The same review graded the evidence as moderate that higher added-sugar intake, especially from sugary drinks, is associated with higher blood pressure and with hypertension, stroke, and coronary heart disease in adults. The authors also said other diet and lifestyle factors could not be fully ruled out. An association is not a certainty, and added sugar is not described here as sealing off a blood vessel.",
    },
    {
      id: "cholesterol",
      title: "Cholesterol",
      body: "Heart-health guidance contrasts patterns built around refined grains and added sugars with patterns that include whole grains, vegetables, and fruit. In the USDA review, evidence linking added sugars with LDL cholesterol was less consistent than the evidence for triglycerides and blood pressure, especially in short intervention studies. Added sugar does not automatically raise LDL.",
    },
    {
      id: "heart",
      title: "Heart health",
      body: "The American Heart Association’s 2026 dietary guidance asks people to look at the pattern of eating over time, not one food or one meal. Minimizing added sugars in drinks and foods is one feature of that pattern, alongside enough vegetables and fruit, whole grains, and energy intake that fits the body’s needs. Extra calories, body weight, triglycerides, blood pressure, and other risk factors sit beside added sugar in that picture. One sweet food does not decide heart health, and stopping sugar is not described here as reversing disease.",
    },
  ],
  diagram: {
    caption: "A simplified illustration, not a guaranteed sequence.",
    steps: ["Added sugar over time", "Metabolic changes", "Possible cardiovascular risk"],
    note: "This drawing is a teaching sketch. It is not a promise that a food leads to disease, and it is not a map of one meal.",
  },
  gradual:
    "A smaller step is enough: one fewer sugary drink, or one label read with curiosity. The FDA says a limited amount of added sugar can fit a pattern that still includes vegetables, fruit, grains, dairy, and protein foods. You do not have to quit every sweet food. Guilt is not the lesson.",
};

export const comparison = {
  title: "Two general reference points",
  intro: "These figures are public reference points, not a prescription and not a target lifeZoi calculated for you.",
  fdaTitle: "FDA Daily Value",
  fda: "50 grams of added sugar on a 2,000 calorie diet. The FDA uses that Daily Value on Nutrition Facts labels.",
  ahaTitle: "American Heart Association",
  aha: "No more than 100 calories a day for most women, about 6 teaspoons, and no more than 150 calories a day for most men, about 9 teaspoons. The association notes that one gram of sugar has 4 calories, so the women’s figure is about 25 grams. Nine teaspoons is about 36 grams for most men.",
};

export const teaspoons = [
  { grams: "4 g", spoons: "about 1 teaspoon" },
  { grams: "12 g", spoons: "about 3 teaspoons" },
  { grams: "24 g", spoons: "about 6 teaspoons" },
  { grams: "40 g", spoons: "about 10 teaspoons" },
];

export const teaspoonNote =
  "A kitchen estimate. About 4 grams of granulated sugar is 1 teaspoon. Use it to picture a label. It is not a diet.";

export const hiding = {
  title: "SUGAR HIDING IN YOUR EVERYDAY FOOD",
  intro:
    "Added sugar sometimes shows up in foods that are not desserts. Some packaged breads, buns, sauces, dressings, cereals, flavored yogurts, granola bars, peanut butters, and canned foods contain it. Some do not. This is not a claim about every American bread or every packaged food. The label is how you tell.",
  places: [
    "Packaged bread and buns",
    "Sauces and dressings",
    "Breakfast cereal",
    "Flavored yogurt",
    "Granola bars",
    "Peanut butter",
    "Canned foods",
  ],
  facts: [
    "Total Sugars includes sugars that are naturally in the food, such as those in milk and fruit, plus any added sugars.",
    "The line that says Includes Xg Added Sugars is the added part. The word Includes means those grams are already counted inside Total Sugars.",
    "There is a Daily Value for added sugars. The FDA does not print a Daily Value for total sugars.",
  ],
  namesIntro: "On the ingredient list, added sugars use many names. The American Heart Association includes these:",
  names: [
    "Cane sugar",
    "Brown sugar",
    "Corn syrup",
    "High-fructose corn syrup",
    "Dextrose",
    "Sucrose",
    "Maltose",
    "Honey",
    "Molasses",
    "Fruit juice concentrate",
  ],
  compare:
    "Compare two products by the Added Sugars line and the ingredient list. A word on the front of the package, including natural or healthy, does not replace that line. The American Heart Association also says “low sugar” is not a defined claim, while “no added sugars” has a specific meaning: no sugar ingredient was added during processing.",
};

export const sampleLabel = {
  title: "Sample label for practice",
  product: "Sample wheat sandwich bread",
  serving: "1 slice",
  disclaimer:
    "Invented numbers for practice. This is not a real brand, and it is not what every bread label looks like.",
  rows: [
    { label: "Serving size", value: "1 slice", highlight: false },
    { label: "Total Sugars", value: "4 g", highlight: false },
    { label: "Includes Added Sugars", value: "3 g", highlight: true },
  ],
  ingredients: "Whole wheat flour, water, yeast, cane sugar, salt, soybean oil.",
  read: "In this made-up example, 3 of the 4 grams are added. The Added Sugars line is the one to notice. A different loaf could list 0 grams.",
};

export const labelQuiz: QuizQuestion[] = [
  {
    id: "where",
    prompt: "Where does a Nutrition Facts label show added sugars?",
    choices: [
      { id: "front", label: "Only in a front-of-package word such as natural" },
      { id: "includes", label: "On the line under Total Sugars that says Includes Xg Added Sugars" },
      { id: "serving", label: "Added sugars replace the serving size" },
    ],
    answer: "includes",
    because: "The FDA uses Includes to show that added sugars are part of the Total Sugars number.",
  },
  {
    id: "savory",
    prompt: "Can a food that does not taste sweet still contain added sugar?",
    choices: [
      { id: "yes", label: "Yes. Some breads, sauces, and other savory foods do." },
      { id: "no", label: "No. Added sugar is only in foods that taste like dessert." },
      { id: "all", label: "Yes, and that means every packaged food has it." },
    ],
    answer: "yes",
    because: "Added sugar can be in foods that are not sweet. It is not in every packaged food. Read the label.",
  },
  {
    id: "natural",
    prompt: "A package says natural on the front. What tells you about added sugar?",
    choices: [
      { id: "word", label: "The word natural means there is no added sugar" },
      { id: "label", label: "The Includes Added Sugars line and the ingredient list" },
      { id: "color", label: "The color of the package" },
    ],
    answer: "label",
    because: "Compare the Added Sugars line and the ingredient names. A marketing word is not that measurement.",
  },
  {
    id: "fruit",
    prompt: "How is the sugar in a whole apple different from added sugar?",
    choices: [
      { id: "skip", label: "Whole fruit is something to skip because it contains sugar" },
      { id: "same", label: "Sugar in a whole apple is listed as added sugar" },
      { id: "whole", label: "Whole fruit brings natural sugars with fiber and the rest of the fruit. Added sugars are the ones put in during processing or cooking." },
    ],
    answer: "whole",
    because: "Whole fruit is encouraged here. Added sugars are a separate line on the label.",
  },
];

export const awareness = {
  title: "A note for today",
  prompt: "One packaged food whose Added Sugars line you looked at.",
  help: "This uses the same check-in list as other academy notes in this browser tab. It is not a new account and not a food diary.",
};

export const breadIntro = {
  title: "BAKE YOUR OWN BREAD. KNOW WHAT YOU EAT.",
  body: "Homemade means you choose the ingredients. It is not automatically healthier, and it is not automatically lower in calories. A homemade loaf can still be a large source of carbohydrate. The point is knowing what went in.",
};

export const breadRecipes: BreadRecipe[] = [
  {
    slug: "rustic-sourdough",
    name: "Rustic homemade sourdough",
    description:
      "A round country loaf made with flour, water, starter, and salt. The open crumb in the photo is the goal, and the clock matters more than extra ingredients.",
    prep: "About 30 minutes of hands-on time, then 4 to 6 hours of rising. An overnight rest in the refrigerator is optional.",
    bake: "About 45 minutes.",
    difficulty: "Practice",
    makes: "1 round loaf, about 12 slices.",
    image: "/nutrition/sourdough-loaf.jpg",
    imageAlt: "A round sourdough loaf, sliced open, with a floury brown crust and an open crumb.",
    width: 1152,
    height: 864,
    addedSugar: "0 g",
    ingredients: [
      { item: "Bread flour", us: "about 4 cups", metric: "500 g" },
      { item: "Water", us: "about 1 1/2 cups", metric: "350 g" },
      { item: "Bubbly sourdough starter", us: "about 1/2 cup", metric: "100 g" },
      { item: "Fine salt", us: "about 1 3/4 teaspoons", metric: "10 g" },
    ],
    steps: [
      "Stir the starter into the water until it loosens.",
      "Add the flour and mix until no dry flour remains. Cover and rest 30 minutes.",
      "Sprinkle on the salt. Pinch and fold until you cannot feel grains of salt.",
      "During the next 2 hours, fold the dough from the edges to the center three or four times. Then leave it covered until it looks puffier. A warm kitchen may need about 2 more hours. A cool kitchen may need about 4.",
      "Shape a round on a lightly floured counter. Set it seam-side up in a bowl lined with a floured cloth. Cover it.",
      "Rest 1 to 2 hours on the counter, or overnight in the refrigerator.",
      "Heat the oven to 450°F (230°C) with a covered Dutch oven inside for 30 minutes.",
      "Turn the dough onto a piece of parchment, score the top, and lower it into the hot pot. Cover the pot.",
      "Bake 25 minutes covered, then 18 to 22 minutes uncovered, until the crust is deep brown. If you use a thermometer, the center is usually done around 205 to 210°F (96 to 99°C).",
      "Cool on a rack for at least an hour before slicing.",
    ],
    serving: ["Toast it.", "Serve it with soup or beans.", "Offer olive oil at the table."],
    nutritionNote:
      "The dough is flour, water, starter, and salt. No sugar, honey, syrup, or juice is included, so added sugar is 0 g as written. Flour still contains carbohydrate. This is not a calorie target. Baking heats the loaf. The NIH Office of Dietary Supplements notes that sourdough is often processed after fermentation and then does not contain live cultures, so this baked loaf is not a probiotic food.",
    starter: {
      title: "Beginner starter guide",
      intro:
        "This guide is separate from the loaf. A starter is a jar of flour and water that you feed so wild yeast and bacteria can leaven bread. It does not need sugar.",
      steps: [
        "Day 1: stir 50 g whole-wheat or bread flour with 50 g water in a clean jar. Cover it loosely.",
        "Each day after that, remove about half of the mixture. Stir in 50 g flour and 50 g water.",
        "Keep the jar out of direct sun. A cool room moves more slowly than a warm one.",
        "It is ready to try when a feeding roughly doubles the jar within several hours and the smell is tangy rather than rotten. Many jars need about a week. Yours may differ.",
        "Fuzzy mold, or pink or orange streaks, means throw the jar away and start again.",
        "The loaf uses 100 g of active starter. Keep feeding the jar so the rest can live on.",
      ],
    },
  },
  {
    slug: "sunflower-walnut-bread",
    name: "Whole-wheat sunflower and walnut bread",
    description:
      "A pan loaf with whole-wheat flour, bread flour, yeast, sunflower seeds, walnuts, olive oil, and salt. Seeds and nuts are mixed through the crumb.",
    prep: "About 25 minutes of hands-on time, plus about 1 1/2 to 2 hours of rising.",
    bake: "35 to 40 minutes.",
    difficulty: "Beginner",
    makes: "1 loaf, about 12 slices.",
    image: "/nutrition/sunflower-walnut-loaf.jpg",
    imageAlt: "A sliced whole-wheat loaf topped with sunflower seeds and walnuts.",
    width: 1152,
    height: 864,
    addedSugar: "0 g",
    ingredients: [
      { item: "Whole-wheat flour", us: "about 2 cups plus 1 tablespoon", metric: "250 g" },
      { item: "Bread flour", us: "about 2 cups", metric: "250 g" },
      { item: "Warm water", us: "about 1 1/2 cups", metric: "360 g" },
      { item: "Instant yeast", us: "about 2 1/4 teaspoons", metric: "7 g" },
      { item: "Fine salt", us: "about 1 3/4 teaspoons", metric: "10 g" },
      { item: "Olive oil", us: "about 2 tablespoons", metric: "30 g" },
      { item: "Sunflower seeds", us: "about 1/3 cup", metric: "40 g" },
      { item: "Chopped walnuts", us: "about 1/3 cup", metric: "40 g" },
    ],
    steps: [
      "Stir the yeast into the warm water. The water should feel warm to a fingertip, not hot.",
      "Mix in both flours, the salt, and the olive oil until the dough comes together.",
      "Knead on the counter for 8 to 10 minutes, until the dough springs back slowly. Flour your hands if it sticks. Do not keep adding large amounts of flour.",
      "Flatten the dough, add the sunflower seeds and walnuts, and knead just until they are scattered.",
      "Put the dough in a lightly oiled bowl, cover it, and let it rise until puffy. That often takes 60 to 90 minutes.",
      "Shape a log and set it in a greased 8 1/2 by 4 1/2 inch loaf pan, about 21 by 11 cm. Cover it until the dough crests the pan, often 30 to 45 minutes.",
      "Heat the oven to 375°F (190°C). Bake 35 to 40 minutes, until the crust is deep brown. A thermometer in the center usually reads about 195 to 205°F (90 to 96°C).",
      "Cool in the pan for 10 minutes, then on a rack. Slice it after it cools.",
    ],
    serving: ["Use it for a sandwich.", "Toast a slice and add cheese or apple.", "Serve it with soup."],
    nutritionNote:
      "Nothing sweet is added, so added sugar is 0 g as written. Whole-wheat flour, seeds, and walnuts bring fiber and fat along with carbohydrate. The loaf is not automatically lower in calories than another bread. It is not a meal plan.",
    starter: null,
  },
  {
    slug: "oatmeal-seed-bread",
    name: "Oatmeal and seed bread",
    description:
      "A soft pan loaf with soaked rolled oats on the top and through the dough, plus pumpkin seeds and sunflower seeds. Whole-wheat flour and bread flour share the structure.",
    prep: "About 25 minutes of hands-on time, including a 15 minute oat soak, plus about 1 1/2 to 2 hours of rising.",
    bake: "40 to 45 minutes.",
    difficulty: "Beginner",
    makes: "1 loaf, about 12 slices.",
    image: "/nutrition/oatmeal-seed-loaf.jpg",
    imageAlt: "A golden loaf covered with rolled oats, with one slice showing pumpkin and sunflower seeds.",
    width: 1152,
    height: 864,
    addedSugar: "0 g",
    ingredients: [
      { item: "Rolled oats, plus a few for the top", us: "about 1 2/3 cups, plus 2 tablespoons", metric: "150 g, plus 2 tablespoons" },
      { item: "Whole-wheat flour", us: "about 1 2/3 cups", metric: "200 g" },
      { item: "Bread flour", us: "about 1 2/3 cups", metric: "200 g" },
      { item: "Water", us: "about 1 2/3 cups", metric: "380 g" },
      { item: "Instant yeast", us: "about 2 1/4 teaspoons", metric: "7 g" },
      { item: "Fine salt", us: "about 1 3/4 teaspoons", metric: "10 g" },
      { item: "Olive oil", us: "about 2 tablespoons", metric: "25 g" },
      { item: "Pumpkin seeds", us: "about 1/4 cup", metric: "30 g" },
      { item: "Sunflower seeds", us: "about 1/4 cup", metric: "30 g" },
    ],
    steps: [
      "Stir the 150 g of oats into 200 g of the water. Rest 15 minutes.",
      "Stir the yeast into the remaining 180 g of water.",
      "Mix the flours, salt, olive oil, soaked oats, and yeast water into a dough.",
      "Knead about 8 minutes. Add the pumpkin seeds and sunflower seeds near the end.",
      "Cover the dough and let it rise until puffy, often 60 to 90 minutes.",
      "Shape a log for a greased 8 1/2 by 4 1/2 inch loaf pan. Brush the top with water and press on the extra oats.",
      "Cover and rise until the dough mounds over the rim, often 30 to 45 minutes.",
      "Heat the oven to 375°F (190°C). Bake 40 to 45 minutes. The center is usually done around 195 to 205°F (90 to 96°C).",
      "Cool before slicing so the crumb can set.",
    ],
    serving: ["Toast it for breakfast.", "Pair a slice with soup.", "Eat it with fruit, not as a reason to skip fruit."],
    nutritionNote:
      "Oats, seeds, flour, oil, yeast, water, and salt are the ingredients. No sugar is added, so added sugar is 0 g as written. Oats and flour still contain carbohydrate. Homemade does not automatically mean lower in calories.",
    starter: null,
  },
];

export function breadRecipe(slug: string) {
  return breadRecipes.find((recipe) => recipe.slug === slug) ?? null;
}

export const gut = {
  title: "FEED YOUR GUT. NOURISH YOUR LIFE.",
  message:
    "Your gut does much more than digest food. It is home to a complex community of microorganisms that interacts with digestion, metabolism, and the immune system.",
  illustrationLabel: "Simplified drawing of the digestive tract for teaching. It is not a medical diagram or a diagnosis.",
  microbiome: [
    "NCCIH describes the microbiome as the community of microorganisms that lives on and in us. There is no single microbiome this page calls perfect. People differ, and a research review of fiber and prebiotics found that individuals can respond differently to the same carbohydrate.",
    "Human enzymes do not digest most plant fibers. Gut microbes can break many of them down. A review in Gut Microbes describes short-chain fatty acids, including acetate, propionate, and butyrate, as products of that fermentation. The review also links those acids, in study settings, with gut lining integrity, metabolism, and immune function. That is a research description, not a promise that a bowl of oats will change your immune system.",
  ],
  probioticIntro:
    "NIH defines probiotics as live microorganisms that provide a health benefit when taken in sufficient amounts. Effects depend on the strain, the dose, and the person. A fermented food is not automatically a studied probiotic.",
  probioticCaveat:
    "Not every fermented food still has live cultures when you eat it. The NIH says most commercial pickles are processed after fermentation and do not contain live cultures, and vinegar pickles are often in that group. Shelf-stable or pasteurized sauerkraut may have been heated. Olives vary with the cure and with pasteurization. A long boil can change what remains alive in miso or tempeh. Kombucha recipes differ, and many are sweetened, so the Added Sugars line still matters. Refrigerated and labeled “live cultures” is a clue. It is not proof of a health effect.",
  prebioticIntro:
    "NCCIH describes prebiotics as nondigestible food components that selectively feed desirable microorganisms. The NIH describes them as carbohydrates, such as inulin, that gut microbes use as fuel. The foods below are ordinary plants people use when they want those carbohydrates. A food is not a prebiotic supplement dose.",
  distinguish: [
    "Probiotics are the live microorganisms.",
    "Prebiotics are the food components those microbes can use.",
    "Synbiotics, in NCCIH’s wording, are products that combine probiotics and prebiotics. The NIH uses that name for products that contain both.",
  ],
  fiberIntro:
    "MedlinePlus says fiber adds bulk, helps prevent constipation, and can help you feel full. CDC says fiber can support blood sugar because the body does not absorb it the way it absorbs other carbohydrates, and that soluble fiber can help with cholesterol. A research review describes microbes fermenting fiber. These are general statements, not a personal result.",
  fiberReference:
    "CDC, citing the Dietary Guidelines for Americans, 2020–2025, says adults are advised to eat about 22 to 34 grams of fiber a day, depending on age and sex. That is a public reference range, not a number lifeZoi calculated for you. MedlinePlus also says to add fiber gradually and to drink fluids, because a sudden jump can cause gas, bloating, or cramps.",
  solubleTitle: "Soluble fiber examples",
  solubleNote:
    "MedlinePlus lists oat bran, barley, beans, lentils, nuts, seeds, and some fruits. CDC lists apples, oats, and beans. Many of these foods contain both soluble and insoluble fiber.",
  insolubleTitle: "Insoluble fiber examples",
  insolubleNote:
    "MedlinePlus points to wheat bran, vegetables, and whole grains. CDC lists whole wheat, bran, nuts, seeds, and the skins of many fruits and vegetables. Brown rice is one whole grain in that pattern.",
  habitsTitle: "Seven ordinary habits",
  habitsIntro:
    "Food comes before a product. None of these habits is a treatment, and none has to be perfect.",
  habits: [
    "Vegetables and fruit, including whole fruit.",
    "Beans, lentils, or chickpeas.",
    "Whole grains more often than only refined grains.",
    "A live-culture fermented food when it suits you. Skip it if it does not.",
    "Water or another drink you have been told is fine. MedlinePlus says fluids help fiber move.",
    "Moving in a way that is safe for you. This is not an exercise prescription.",
    "A varied plate rather than one supplement meant to do the whole job.",
  ],
  supplementsTitle: "If you look at a supplement",
  supplements: [
    "Start with food. NIH says there is no official probiotic recommendation that covers healthy people, and it suggests asking a clinician which product, dose, and duration to consider.",
    "Products come as capsules, powders, liquids, and refrigerated foods. Refrigeration does not make a product better. It means that product’s label says to keep it cold. Others are stored at room temperature.",
    "CFU means colony-forming units, a count of live microbes in a serving. Labels may also show genus, species, and strain, as in the NIH example Lacticaseibacillus rhamnosus GG.",
    "A higher CFU count is not always better. NIH says benefits, if any, depend on the specific microbes and the count, and that different strains have different evidence.",
    "Look for an expiration or use-by date and follow the storage line. The count can fall over time. A number from the day of manufacture may be higher than the number in the bottle you open.",
    "People who are seriously ill or immunocompromised, and preterm infants, are groups NIH and NCCIH flag for harm, including infection. lifeZoi does not recommend one product for everyone.",
  ],
  detoxTitle: "No detox",
  detox:
    "The gut does not need detox drinks, colon cleanses, or harsh cleanses. The public pages used here talk about fiber, fluids, everyday food, and ordinary movement. They do not ask you to buy a cleanse. Skip unnecessary laxatives and unproven cleanses unless a clinician has told you otherwise. A cleanse is not a shortcut on this page.",
  challengeTitle: "Seven-day curiosity challenge",
  challengeIntro:
    "Mark a day when you try the idea, or when you decide it does not fit. Seven marks are not a result. This challenge does not promise less bloating, more energy, or any other change in seven days.",
  reflectionLabel: "A short reflection",
  reflectionHelp:
    "Optional note on digestion, bloating, energy, and a food you liked. It stays with the other check-ins in this browser tab.",
};

export const probioticFoods: FoodCard[] = [
  {
    id: "yogurt",
    name: "Plain yogurt with live cultures",
    image: "/nutrition/yogurt.jpg",
    alt: "A bowl of plain white yogurt.",
    note: "Yogurt is made by adding live cultures to milk. Choose plain yogurt if you want less added sugar, and read the live-cultures line.",
  },
  {
    id: "kefir",
    name: "Kefir",
    image: "/nutrition/kefir.jpg",
    alt: "A glass and a bottle of plain kefir.",
    note: "Kefir is a fermented milk drink. Check the label for live cultures. Flavored kefir can contain added sugar.",
  },
  {
    id: "sauerkraut",
    name: "Refrigerated fermented sauerkraut",
    image: "/nutrition/sauerkraut.jpg",
    alt: "A bowl of pale fermented sauerkraut.",
    note: "Raw fermented cabbage kept cold may still contain live cultures. Pasteurized or shelf-stable kraut may not.",
  },
  {
    id: "kimchi",
    name: "Kimchi",
    image: "/nutrition/kimchi.jpg",
    alt: "A bowl of red kimchi.",
    note: "Kimchi is a fermented vegetable dish. NIH lists it among foods that can contain live cultures without being a proven probiotic product.",
  },
  {
    id: "pickles",
    name: "Refrigerated fermented pickles",
    image: "/nutrition/pickles.jpg",
    alt: "Fermented cucumber pickles in a glass jar of brine.",
    note: "Fermented pickles sit in a cloudy brine. Vinegar pickles and most shelf-stable pickles are not the same thing.",
  },
  {
    id: "olives",
    name: "Fermented olives",
    image: "/nutrition/olives.jpg",
    alt: "A dish of green and black olives.",
    note: "Some olives are fermented and some are cured and pasteurized. The jar and the storage tell you more than the word olive.",
  },
  {
    id: "miso",
    name: "Miso",
    image: "/nutrition/miso.jpg",
    alt: "A wooden bowl of dark miso paste.",
    note: "Miso is a fermented soybean paste. Stirring it into boiling soup for a long time can change the live cultures.",
  },
  {
    id: "tempeh",
    name: "Tempeh",
    image: "/nutrition/tempeh.jpg",
    alt: "Slices of tempeh showing a speckled soybean interior.",
    note: "Tempeh is a fermented soybean cake. Cooking it, which food safety often calls for, can change the live cultures. It is still a protein food.",
  },
  {
    id: "kombucha",
    name: "Kombucha",
    image: "/nutrition/kombucha.jpg",
    alt: "A glass of amber kombucha.",
    note: "Kombucha is fermented tea. Brands differ in alcohol, live cultures, and added sugar. Read the Added Sugars line.",
  },
];

export const prebioticFoods: FoodCard[] = [
  { id: "garlic", name: "Garlic", image: "/nutrition/garlic.jpg", alt: "A garlic bulb and loose cloves.", note: "A savory source of fermentable carbohydrate. Use it as food, not as a supplement dose." },
  { id: "onions", name: "Onions", image: "/nutrition/onions.jpg", alt: "Yellow onions, one of them cut open.", note: "Onions are a common plant food microbes can ferment. They are not a required daily quota." },
  { id: "leeks", name: "Leeks", image: "/nutrition/leeks.jpg", alt: "Three fresh leeks.", note: "Leeks are in the onion family. Cook them in a way you already like." },
  { id: "asparagus", name: "Asparagus", image: "/nutrition/asparagus.jpg", alt: "A bundle of green asparagus.", note: "Asparagus is one vegetable in a varied plate, not a special prescription." },
  { id: "bananas", name: "Bananas", image: "/nutrition/bananas.jpg", alt: "A small bunch of yellow bananas.", note: "Bananas are whole fruit. Their natural sugars are not the same topic as added sugar." },
  { id: "oats", name: "Oats", image: "/nutrition/oats.jpg", alt: "A bowl of dry rolled oats.", note: "Rolled oats bring soluble fiber. They are also the grain in the oatmeal bread recipe." },
  { id: "beans", name: "Beans", image: "/nutrition/beans.jpg", alt: "Bowls of dried beans.", note: "Beans feed a meal with fiber and plant protein. Rinse canned beans if you want less sodium." },
  { id: "lentils", name: "Lentils", image: "/nutrition/lentils.jpg", alt: "A bowl of dry brown lentils.", note: "Lentils cook without a long soak. Increase the portion gradually if you are not used to them." },
  { id: "chickpeas", name: "Chickpeas", image: "/nutrition/chickpeas.jpg", alt: "A bowl of dry chickpeas.", note: "Chickpeas are one legume in the bean family of habits. Canned or dried both count as food." },
  { id: "apples", name: "Apples", image: "/nutrition/apples.jpg", alt: "Red apples, one sliced with the skin on.", note: "A whole apple includes the skin and fiber. That is different from apple juice concentrate used as a sweetener." },
  { id: "barley", name: "Barley", image: "/nutrition/barley.jpg", alt: "A bowl of pearl barley.", note: "Barley is a whole-grain option when it fits the dish. Pearl barley is not the only form in stores." },
  { id: "chicory", name: "Chicory root", image: "/nutrition/chicory.jpg", alt: "A pale chicory root with its leaves.", note: "Chicory root is a familiar source of inulin, a carbohydrate NIH names when it explains prebiotics. The root is still just a food." },
];

export const solubleFoods: FoodCard[] = [
  { id: "sol-oats", name: "Oatmeal", image: "/nutrition/oats.jpg", alt: "Rolled oats in a bowl.", note: "Oats are a soluble-fiber example from MedlinePlus and CDC." },
  { id: "sol-barley", name: "Barley", image: "/nutrition/barley.jpg", alt: "Pearl barley in a bowl.", note: "Barley is listed with soluble fiber foods." },
  { id: "sol-beans", name: "Beans", image: "/nutrition/beans.jpg", alt: "Dried beans in bowls.", note: "Beans appear in both soluble-fiber lists and everyday meals." },
  { id: "sol-lentils", name: "Lentils", image: "/nutrition/lentils.jpg", alt: "Dry lentils in a bowl.", note: "Lentils are a soluble-fiber food and a prebiotic-style plant food." },
  { id: "sol-apples", name: "Apples", image: "/nutrition/apples.jpg", alt: "Apples with the skin on.", note: "CDC names apples among soluble fiber foods. Eat the whole fruit." },
  { id: "sol-pears", name: "Pears", image: "/nutrition/pears.jpg", alt: "Green pears, one cut in half.", note: "Pears are another whole fruit with fiber in the flesh and the skin." },
  { id: "sol-chia", name: "Chia", image: "/nutrition/chia.jpg", alt: "A bowl of chia seeds.", note: "Chia is a seed. Seeds show up in MedlinePlus soluble-fiber examples." },
  { id: "sol-psyllium", name: "Psyllium", image: "/nutrition/psyllium.jpg", alt: "A glass bowl of pale psyllium husk.", note: "Psyllium is a concentrated soluble fiber. It is optional. Food comes first, and a sudden large amount can cause gas." },
];

export const insolubleFoods: FoodCard[] = [
  { id: "ins-bran", name: "Wheat bran and whole wheat", image: "/nutrition/wheat-bran.jpg", alt: "A bowl of wheat bran flakes.", note: "Wheat bran is a classic insoluble example. Whole-wheat bread, including the sunflower loaf on this page, uses whole-wheat flour." },
  { id: "ins-rice", name: "Brown rice", image: "/nutrition/brown-rice.jpg", alt: "A bowl of cooked brown rice.", note: "Brown rice is a whole grain. It is one swap for a refined grain, not a rule for every meal." },
  { id: "ins-veg", name: "Vegetables", image: "/nutrition/vegetables.jpg", alt: "Broccoli, carrots, and leafy greens on a plate.", note: "Vegetables contribute insoluble fiber and a lot of variety." },
  { id: "ins-nuts", name: "Nuts and seeds", image: "/nutrition/nuts-seeds.jpg", alt: "A bowl of mixed nuts and sunflower seeds.", note: "Nuts and seeds appear in insoluble-fiber examples and add fats as well as fiber." },
  { id: "ins-skins", name: "Fruit skins", image: "/nutrition/fruit-skins.jpg", alt: "An apple and a pear with the skins left on.", note: "CDC points to the skins of many fruits and vegetables. Wash them. Leave the skin on when you like the texture." },
];

export const gutDays = [
  { id: "gut-day-1", title: "Day 1", text: "Include a vegetable you already know how to prepare." },
  { id: "gut-day-2", title: "Day 2", text: "Have oatmeal or another whole grain." },
  { id: "gut-day-3", title: "Day 3", text: "If it suits you, have plain yogurt or kefir. If it does not, repeat a whole grain or a fruit." },
  { id: "gut-day-4", title: "Day 4", text: "Add beans, lentils, or chickpeas to a meal you already make." },
  { id: "gut-day-5", title: "Day 5", text: "Try refrigerated fermented sauerkraut or another fermented vegetable, if that fits. If not, have a different vegetable." },
  { id: "gut-day-6", title: "Day 6", text: "Include fruit, nuts, or seeds." },
  { id: "gut-day-7", title: "Day 7", text: "Build one balanced meal from foods you liked this week. Nothing has to be new." },
];

function walk(value: unknown, out: string[]) {
  if (typeof value === "string") {
    out.push(value);
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

export function educationPlainText() {
  const chunks: string[] = [];
  walk(
    {
      disclaimer,
      sugarSources,
      gutSources,
      kingArthur,
      labels,
      dailyChoices,
      comparison,
      teaspoons,
      teaspoonNote,
      hiding,
      sampleLabel,
      labelQuiz,
      awareness,
      breadIntro,
      breadRecipes,
      gut,
      probioticFoods,
      prebioticFoods,
      solubleFoods,
      insolubleFoods,
      gutDays,
    },
    chunks,
  );
  return chunks.join("\n");
}
