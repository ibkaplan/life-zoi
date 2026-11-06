import type { PdfSection } from "@/lib/library/pdf";

export type GuideSection = PdfSection & { id?: string };

export type ShortRecipe = {
  id: string;
  title: string;
  addedSugar: "0 g";
  ingredients: string[];
  steps: string[];
  note: string;
};

export type LibraryGuide = {
  slug: string;
  title: string;
  summary: string;
  minutes: string;
  topic: string;
  pdfFile: string;
  related: { href: string; label: string }[];
  sections: GuideSection[];
  recipes?: ShortRecipe[];
};

const safety =
  "Stop if something hurts, makes you dizzy, or does not fit a limit from your clinician. This is education, not a personal exercise plan.";

function recipeSections(recipes: ShortRecipe[]): GuideSection[] {
  return recipes.map((recipe) => ({
    id: recipe.id,
    heading: recipe.title,
    paragraphs: [`Added sugar in this recipe: ${recipe.addedSugar}. ${recipe.note}`],
    bullets: [
      ...recipe.ingredients.map((item) => `Ingredient: ${item}`),
      ...recipe.steps.map((step, index) => `Step ${index + 1}. ${step}`),
    ],
  }));
}

const breadRecipes: ShortRecipe[] = [
  {
    id: "skillet-flatbread",
    title: "Skillet flatbread",
    addedSugar: "0 g",
    ingredients: [
      "240 g all-purpose flour, about 2 cups",
      "150 g water, about 2/3 cup",
      "4 g fine salt, about 3/4 teaspoon",
      "10 g olive oil, about 2 teaspoons, plus a little for the pan",
    ],
    steps: [
      "Stir the flour, water, salt, and oil into a soft dough. Cover and rest 15 minutes.",
      "Divide into 4 pieces and press each into a thin round.",
      "Warm a skillet over medium heat with a little oil. Cook until both sides have brown spots, about 2 minutes a side. The pan is hot.",
      "Cool for a minute. Flour still contains carbohydrate. This is not a calorie target.",
    ],
    note: "The ingredients are flour, water, salt, and olive oil. No sugar, honey, syrup, juice, or sweetened mix is included.",
  },
  {
    id: "chickpea-skillet",
    title: "Chickpea skillet bread",
    addedSugar: "0 g",
    ingredients: [
      "120 g chickpea flour, about 1 cup",
      "240 g water, about 1 cup",
      "3 g fine salt, about 1/2 teaspoon",
      "15 g olive oil, about 1 tablespoon",
      "1 g ground cumin, about 1/4 teaspoon, optional",
    ],
    steps: [
      "Whisk the flour, water, salt, oil, and cumin. Rest 10 minutes. Add a splash of water if the batter is stiff.",
      "Heat an ovenproof skillet with a little oil in a 425 F (220 C) oven for 5 minutes. The handle gets hot.",
      "Pour in the batter. Bake about 18 to 25 minutes, until the top is set and the edges are brown.",
      "Cool on a rack before slicing. This is a bread, not a treatment.",
    ],
    note: "The ingredients are chickpea flour, water, salt, olive oil, and optional cumin. No sweetener is included.",
  },
  {
    id: "herb-rolls",
    title: "Same-day herb rolls",
    addedSugar: "0 g",
    ingredients: [
      "300 g all-purpose or bread flour, about 2 1/2 cups",
      "190 g lukewarm water, about 3/4 cup plus 1 tablespoon",
      "5 g instant yeast, about 1 1/2 teaspoons",
      "5 g fine salt, about 1 teaspoon",
      "15 g olive oil, about 1 tablespoon",
      "2 g dried rosemary or another dried herb you already cook with, about 1 teaspoon",
    ],
    steps: [
      "Stir the yeast into the water. Mix in the flour, salt, oil, and herb.",
      "Knead about 6 minutes. Cover until puffy. A warm kitchen may take about 45 minutes. A cool one may take longer.",
      "Divide into 8 balls. Set them on a lightly oiled tray and cover until puffy, often 20 to 30 minutes.",
      "Bake at 375 F (190 C) for about 16 to 20 minutes, until browned. Cool before you pack them.",
    ],
    note: "Yeast is not sugar. No honey or sugar is added. The ingredients are flour, water, yeast, salt, olive oil, and dried herb.",
  },
];

export const libraryGuides: LibraryGuide[] = [
  {
    slug: "hidden-sugar",
    title: "Hidden Sugar Guide",
    summary: "A calm way to find added sugar on a package without turning one label into a rule.",
    minutes: "About 4 minutes",
    topic: "sugar",
    pdfFile: "/library/pdfs/hidden-sugar.pdf",
    related: [
      { href: "/academy/meals#sugar-hiding", label: "Nutrition: labels and added sugar" },
      { href: "/food-labels", label: "Food Intelligence" },
      { href: "/sugar-detective", label: "Sugar Detective" },
      { href: "/choices/sugar", label: "Daily choice: sugar" },
    ],
    sections: [
      {
        heading: "Start with the Added Sugars line",
        paragraphs: [
          "Added sugar is sugar put in while a food is made. The Added Sugars line on a Nutrition Facts label is the clearest place to look. Sugars that are already in fruit or plain milk are a different line.",
          "lifeZoi does not set a personal gram limit. The longer label lesson, including everyday patterns, is in Nutrition. This guide is the short reading practice.",
        ],
      },
      {
        heading: "Names that often mean sugar was added",
        paragraphs: [
          "The ingredient list can use more than one word for sugar. This is a reading list, not a complete chemistry table. If you are unsure, use the Added Sugars line.",
        ],
        bullets: [
          "Sugar, cane sugar, and brown sugar",
          "Honey, maple syrup, agave, and molasses",
          "Corn syrup and other syrups",
          "Fruit juice concentrate used as a sweetener",
          "Dextrose and maltose",
        ],
      },
      {
        heading: "Compare two foods you already buy",
        paragraphs: [
          "Pick two drinks, yogurts, or sauces from your own kitchen. Read the serving size first, then Added Sugars. A larger serving can make a number look bigger even when the recipes are similar.",
          "You do not have to throw food away. The point is to see the line once, then decide what you want next time.",
        ],
      },
      {
        heading: "What this guide does not do",
        paragraphs: [
          "It does not diagnose a condition. It does not forbid a food. It does not promise a change in weight, energy, or heart health.",
        ],
      },
    ],
  },
  {
    slug: "fiber-foods",
    title: "Fiber Guide",
    summary: "Twenty ordinary foods people use when they want more fiber, plus a reminder to go slowly.",
    minutes: "About 5 minutes",
    topic: "gut",
    pdfFile: "/library/pdfs/fiber-foods.pdf",
    related: [
      { href: "/academy/meals/fiber", label: "Meal lesson: fiber" },
      { href: "/academy/meals#feed-your-gut", label: "Nutrition: gut health" },
      { href: "/academy/compare", label: "Food comparison" },
      { href: "/choices/fiber", label: "Daily choice: fiber" },
    ],
    sections: [
      {
        heading: "Twenty foods, not a gram target",
        paragraphs: [
          "Fiber amounts change with the brand, the form, and the way you cook. Read the dietary fiber line on the package, or the USDA record in Food comparison. This list names foods. It does not assign you a number.",
          "MedlinePlus describes fiber as adding bulk and says that raising fiber too quickly can cause gas, bloating, and cramps. Fluids help fiber move. If a clinician limited your fluids or your fiber, that instruction comes first.",
        ],
        bullets: [
          "Rolled oats, for a breakfast you can repeat",
          "Lentils, from dry or from a rinsed can",
          "Black beans",
          "Chickpeas",
          "Split peas",
          "Barley",
          "Quinoa",
          "Broccoli",
          "Carrots",
          "Sweet potato, with the skin if you like it",
          "Apple with the skin",
          "Pear",
          "Raspberries",
          "Brussels sprouts",
          "Avocado",
          "Almonds",
          "Chia seeds, stirred into a food you already eat",
          "Edamame",
          "Plain popcorn",
          "Bread whose first ingredient is a whole grain, after you read the label",
        ],
      },
      {
        heading: "A small start",
        paragraphs: [
          "Add one of these foods to a meal you already make. Keep the portion modest for a few days. Drink the fluids you are allowed. The Nutrition gut page has the longer food notes and photos.",
        ],
      },
    ],
  },
  {
    slug: "gut-basics",
    title: "Gut Health Basics",
    summary: "A short orientation to everyday eating. The longer gut lesson stays in Nutrition.",
    minutes: "About 4 minutes",
    topic: "gut",
    pdfFile: "/library/pdfs/gut-basics.pdf",
    related: [
      { href: "/academy/meals#feed-your-gut", label: "Nutrition: gut health" },
      { href: "/library/guides/fiber-foods", label: "Fiber guide" },
      { href: "/choices/fiber", label: "Daily choice: fiber" },
    ],
    sections: [
      {
        heading: "Food first, not a product",
        paragraphs: [
          "Digestion depends on many things, including what you eat, how fast you change it, stress, illness, and medicines. There is no perfect gut pattern on this page. People differ.",
          "The Nutrition section is the place for the longer explanation, food photos, and the optional seven-day notes. This guide is the short version.",
        ],
      },
      {
        heading: "Three everyday foods",
        paragraphs: [
          "Oats, beans, and plain yogurt with live cultures are ordinary foods. Oats and beans bring fiber. Plain yogurt is a fermented milk food. Read the Added Sugars line if the yogurt is flavored. None of these is a treatment, and none guarantees comfort.",
        ],
        bullets: [
          "Oats: cook them as you already do, and add fruit if you want",
          "Beans: rinse canned beans if you want less sodium, and increase the portion slowly",
          "Plain yogurt: look for live cultures, and skip it if dairy does not suit you",
        ],
      },
      {
        heading: "When to talk with a clinician",
        paragraphs: [
          "Bleeding, trouble swallowing, ongoing pain, or a change that worries you belongs with a qualified clinician. This page cannot tell you the cause, and it does not diagnose any condition.",
        ],
      },
    ],
  },
  {
    slug: "healthy-breakfast",
    title: "Healthy Breakfast Guide",
    summary: "Breakfast ideas from foods you may already have. Morning eating is optional.",
    minutes: "About 3 minutes",
    topic: "nutrition",
    pdfFile: "/library/pdfs/healthy-breakfast.pdf",
    related: [
      { href: "/academy/meals", label: "Nutrition" },
      { href: "/academy/meals/planning", label: "Planning meals" },
      { href: "/library/guides/fiber-foods", label: "Fiber guide" },
    ],
    sections: [
      {
        heading: "There is no required breakfast",
        paragraphs: [
          "Some people feel better with a morning meal. Some do not. This guide does not assign a calorie target or a clock time. If a clinician gave you a meal schedule, use that.",
        ],
      },
      {
        heading: "Ideas you can repeat",
        paragraphs: ["Pick one you can make on a tired morning. Repeating a meal is allowed."],
        bullets: [
          "Oats cooked with water or milk you tolerate, plus fruit",
          "Eggs with toast you already buy",
          "Plain yogurt and fruit",
          "Leftover beans with rice or a tortilla",
          "Last night's dinner, reheated until it is hot",
        ],
      },
      {
        heading: "A note on sugar",
        paragraphs: [
          "Flavored yogurts, cereals, and breakfast drinks can carry added sugar. The Hidden Sugar Guide and the Nutrition label section show where to read that line.",
        ],
      },
    ],
  },
  {
    slug: "homemade-bread",
    title: "Homemade Bread Collection",
    summary: "Three short original breads with no added sugar, plus links to the longer Nutrition loaves.",
    minutes: "About 6 minutes",
    topic: "bread",
    pdfFile: "/library/pdfs/homemade-bread.pdf",
    related: [
      { href: "/academy/meals#bake-bread", label: "Nutrition: homemade bread" },
      { href: "/academy/meals/rustic-sourdough", label: "Rustic sourdough" },
      { href: "/academy/meals/sunflower-walnut-bread", label: "Sunflower and walnut bread" },
      { href: "/academy/meals/oatmeal-seed-bread", label: "Oatmeal and seed bread" },
    ],
    sections: [
      {
        heading: "Longer loaves live in Nutrition",
        paragraphs: [
          "Nutrition already has three lifeZoi breads: rustic sourdough, whole-wheat sunflower and walnut bread, and oatmeal and seed bread. Those pages are the full recipes. This collection does not replace them.",
          "Homemade bread is not automatically healthier, and it is not automatically lower in carbohydrate. You do get to see what went in. Wash your hands. Keep raw dough away from anyone who should not taste raw flour. Ovens and pans stay hot after you turn them off.",
        ],
      },
      {
        heading: "Three shorter breads",
        paragraphs: [
          "The three recipes below were written for this guide. Each one lists no sugar, honey, syrup, juice, or sweetened mix, so added sugar is 0 g as written. Cup amounts are approximate. Weight is the steadier measure.",
        ],
      },
      ...recipeSections(breadRecipes),
    ],
    recipes: breadRecipes,
  },
  {
    slug: "food-labels",
    title: "Understanding Food Labels",
    summary: "How to read a serving, added sugars, fiber, sodium, and the ingredient list.",
    minutes: "About 4 minutes",
    topic: "sugar",
    pdfFile: "/library/pdfs/food-labels.pdf",
    related: [
      { href: "/food-labels", label: "Food Intelligence" },
      { href: "/academy/meals#sugar-hiding", label: "Nutrition: added sugar" },
      { href: "/library/guides/hidden-sugar", label: "Hidden Sugar Guide" },
    ],
    sections: [
      {
        heading: "Read the serving before the number",
        paragraphs: [
          "The Nutrition Facts label is written for one serving. If you eat more than that serving, you get more of what is listed. lifeZoi does not turn the label into a personal score.",
        ],
      },
      {
        heading: "Four lines worth a look",
        paragraphs: ["You do not have to study every line. These four answer common questions."],
        bullets: [
          "Added Sugars: sugar put in during making",
          "Dietary fiber: use it when you are comparing plant foods, and remember brands differ",
          "Sodium: useful if you are choosing between two packaged foods",
          "Ingredient list: items are listed by weight, so the first item is the largest",
        ],
      },
      {
        heading: "The Daily Value column",
        paragraphs: [
          "The right-hand column compares one serving with a reference diet. It is not a grade for you. Another package can use a different serving and look different for that reason alone.",
          "Food Intelligence and the Nutrition sugar section go further. This page is the pocket version.",
        ],
      },
    ],
  },
  {
    slug: "ten-minute-stretch",
    title: "10-Minute Daily Stretching",
    summary: "A ten-minute stretch you can do in a chair. Standing is optional.",
    minutes: "About 10 minutes",
    topic: "movement",
    pdfFile: "/library/pdfs/ten-minute-stretch.pdf",
    related: [
      { href: "/library/move", label: "Movement library" },
      { href: "/academy/move/easy-reach", label: "Easy seated reach" },
    ],
    sections: [
      {
        heading: "How to use the ten minutes",
        paragraphs: [
          "Move only in a range that feels easy. A longer stretch is not better. Every part has a seated option. Skip any part.",
          safety,
        ],
        bullets: [
          "Minute 1. Sit or stand tall and take a few ordinary breaths.",
          "Minute 2. Circle the shoulders slowly. Stay seated if you like.",
          "Minute 3. Turn the head a little to each side. Do not force the neck.",
          "Minutes 4 and 5. Reach one arm up, or reach forward to a table. Switch sides.",
          "Minutes 6 and 7. Circle the ankles while seated. If you stand, hold a counter and ease one heel down only if it does not hurt.",
          "Minute 8. Sit and turn the chest gently, hands on the chair.",
          "Minute 9. Open and close the hands slowly.",
          "Minute 10. Sit and breathe in an ordinary way.",
        ],
      },
      {
        heading: "Safety",
        paragraphs: [
          "This is not a treatment for a joint, back, or nerve condition. Chest pain, dizziness, or trouble breathing means stop and get urgent help, not another stretch.",
        ],
      },
    ],
  },
  {
    slug: "chair-exercises",
    title: "Chair Exercises",
    summary: "Five seated movements with a way to make each one smaller.",
    minutes: "About 8 minutes",
    topic: "chair",
    pdfFile: "/library/pdfs/chair-exercises.pdf",
    related: [
      { href: "/library/move/chair-yoga", label: "Chair yoga" },
      { href: "/academy/move/chair-stand", label: "Stand from a chair" },
      { href: "/library/programs/chair-yoga-10", label: "10-minute chair yoga" },
    ],
    sections: [
      {
        heading: "Use a sturdy chair",
        paragraphs: [
          "Choose a chair that does not roll. Put both feet on the floor if you can. Hold the chair if you need to. A few repetitions are enough, and one is enough.",
          safety,
        ],
        bullets: [
          "Seated march: lift one foot, then the other, only as high as is comfortable.",
          "Sit to stand: lean forward a little and stand slowly, using your hands. If standing is not for today, press your palms together and relax.",
          "Seated reach: reach one arm forward or up, then the other.",
          "Heel lifts: keep the toes down and lift the heels, or skip this and point and flex the feet.",
          "Towel pull: hold a towel in both hands and pull gently apart. Skip it if a clinician limited arm movement.",
        ],
      },
      {
        heading: "Safety",
        paragraphs: [
          "Stop for pain or if you feel unsteady. These ideas are not a fall-prevention prescription and not a strength score.",
        ],
      },
    ],
  },
  {
    slug: "beginner-balance",
    title: "Beginner Balance",
    summary: "Balance practice you do while holding on, plus a fully seated option.",
    minutes: "About 6 minutes",
    topic: "balance",
    pdfFile: "/library/pdfs/beginner-balance.pdf",
    related: [
      { href: "/balance-challenge", label: "Balance and Brain Challenge" },
      { href: "/academy/move/heel-to-toe", label: "Supported heel-to-toe steps" },
      { href: "/library/move/supported-balance", label: "Supported balance practice" },
    ],
    sections: [
      {
        heading: "Hold on the whole time",
        paragraphs: [
          "Stand beside a counter or a heavy chair. Clear the floor of loose rugs and cords. A second chair behind you can be a place to sit. You do not earn anything by letting go.",
          "Seated alternative: sit tall and march slowly, or turn your head a little while your back is supported. That still counts as practice.",
          safety,
        ],
        bullets: [
          "Shift your weight from one foot to the other while both hands can reach the counter.",
          "Lift one heel while holding on. Skip it if the ankle hurts.",
          "Place one foot ahead of the other and take a few small steps, still holding on. Stop if you feel unsteady.",
          "Sit and rest whenever you want. Rest is part of the practice.",
        ],
      },
      {
        heading: "Safety",
        paragraphs: [
          "CDC describes balance examples for older adults and says activity should match your abilities. This page is not a test of fall risk. Pain, dizziness, chest pain, or trouble breathing needs a clinician or emergency services, not another step.",
        ],
      },
    ],
  },
  {
    slug: "gentle-morning",
    title: "Gentle Morning Movement",
    summary: "A short morning sequence you can start before you stand up.",
    minutes: "About 8 minutes",
    topic: "movement",
    pdfFile: "/library/pdfs/gentle-morning.pdf",
    related: [
      { href: "/library/move/morning-movement", label: "Morning movement" },
      { href: "/library/programs/chair-yoga-5", label: "5-minute chair yoga" },
    ],
    sections: [
      {
        heading: "Start seated",
        paragraphs: [
          "Sit on the edge of the bed or on a chair before you stand. If mornings make you dizzy, stay seated and mention that to a clinician. This sequence is not a treatment for blood pressure or for sleep.",
          safety,
        ],
        bullets: [
          "Ankle circles, one foot at a time.",
          "Shoulder rolls, small and slow.",
          "An easy reach with one arm, then the other.",
          "Stand only if you feel steady, and hold the bed or the chair.",
          "Walk to a window, or march while seated.",
          "Finish with one minute of ordinary breathing.",
        ],
      },
    ],
  },
  {
    slug: "brain-aging",
    title: "Brain Health and Healthy Aging",
    summary: "Everyday ideas about attention, movement, people, and sleep. Not a memory test.",
    minutes: "About 4 minutes",
    topic: "brain",
    pdfFile: "/library/pdfs/brain-aging.pdf",
    related: [
      { href: "/library/lessons/brain-health", label: "Brain health lesson" },
      { href: "/balance-challenge", label: "Balance and Brain Challenge" },
      { href: "/library/guides/better-sleep", label: "Better Sleep" },
    ],
    sections: [
      {
        heading: "No score and no promise",
        paragraphs: [
          "This guide does not test memory. It does not diagnose dementia or any other condition. It does not promise a longer life. A quiet day is not a decline.",
          "Public pages discuss sleep, movement, learning, and time with other people as parts of everyday life. lifeZoi keeps those as ideas you can try, not as a program with a result.",
        ],
      },
      {
        heading: "Four small ideas",
        paragraphs: ["Choose one. Leave the others."],
        bullets: [
          "A walk, or a chair movement if walking is not available",
          "A conversation, a letter, or a shared meal",
          "A page of a book, a song, or a puzzle you already like",
          "One sleep cue you can keep, such as a dimmer room",
        ],
      },
    ],
  },
  {
    slug: "better-sleep",
    title: "Better Sleep",
    summary: "Sleep ideas you can try. They do not promise a full night.",
    minutes: "About 4 minutes",
    topic: "sleep",
    pdfFile: "/library/pdfs/better-sleep.pdf",
    related: [
      { href: "/choices/sleep", label: "Daily choice: sleep" },
      { href: "/library/lessons/sleep", label: "Sleep lesson" },
      { href: "https://www.nhlbi.nih.gov/health/sleep/how-much-sleep", label: "NHLBI: How Much Sleep Is Enough?" },
    ],
    sections: [
      {
        heading: "A cue, not a perfect night",
        paragraphs: [
          "The National Heart, Lung, and Blood Institute discusses sleep as a health topic. People need different amounts, and this page does not assign you one. It also does not promise that tonight will go well.",
        ],
        bullets: [
          "Keep a wake time you can manage on most days.",
          "Dim one light in the evening if a brighter room keeps you alert.",
          "If caffeine late in the day keeps you awake, try it earlier. There is no single cutoff hour for every person.",
          "A short wind-down can be washing your face, reading a paper page, or sitting quietly.",
        ],
      },
      {
        heading: "When sleep is a medical question",
        paragraphs: [
          "Pain, breathing pauses, restless legs, or a mood problem that will not lift belongs with a clinician. If you are in immediate distress in the United States, call or text 988.",
        ],
      },
    ],
  },
  {
    slug: "stress-relief",
    title: "Stress Relief",
    summary: "Five breathing practices you can do seated. Stop if breathing feels difficult.",
    minutes: "About 5 minutes",
    topic: "sleep",
    pdfFile: "/library/pdfs/stress-relief.pdf",
    related: [
      { href: "/choices/stress", label: "Daily choice: stress" },
      { href: "/urges", label: "Urges" },
      { href: "/academy/move/seated-breath", label: "Seated quiet breathing" },
      { href: "https://www.nimh.nih.gov/health/publications/so-stressed-out-fact-sheet", label: "NIMH: I'm So Stressed Out!" },
    ],
    sections: [
      {
        heading: "Five ways to breathe, all seated",
        paragraphs: [
          "NIMH lists relaxation and breathing as things people can try when they feel stressed. These five are lifeZoi examples. They are not a copied video and not a treatment for anxiety or for a breathing illness.",
          "Sit in the posture you already use. Stop if you feel dizzy or short of breath. Trouble breathing needs urgent care, not another exercise.",
        ],
        bullets: [
          "Ordinary breath: sit and breathe as you already do for about a minute.",
          "Counted breath: in for a comfortable count of 3, out for 3. Skip the count if it feels forced.",
          "Longer exhale: let the out-breath be a little longer if that is easy. Stop if you get lightheaded.",
          "Hand on the belly: rest a hand there and notice the breath. Do not force the belly out.",
          "One sigh: a slightly deeper breath in, a relaxed breath out, then return to ordinary breathing.",
        ],
      },
      {
        heading: "If the moment is heavy",
        paragraphs: [
          "A breathing idea is not a crisis plan. If you are in immediate distress in the United States, call or text 988. The Having a hard moment pages are short and nonjudgmental.",
        ],
      },
    ],
  },
  {
    slug: "nature-wellbeing",
    title: "Nature and Well-Being",
    summary: "Daylight, a window, or a few minutes outside. Nature is not medicine.",
    minutes: "About 4 minutes",
    topic: "nature",
    pdfFile: "/library/pdfs/nature-wellbeing.pdf",
    related: [
      { href: "/nature", label: "Nature" },
      { href: "/nature/sunlight", label: "Sunlight" },
      { href: "/nature/trees", label: "Trees" },
      { href: "/nature/outside", label: "Time outside" },
    ],
    sections: [
      {
        heading: "Outside is optional",
        paragraphs: [
          "A window is daylight. It is not the same as time outdoors, and it still counts as a way to notice the day. A doorway, a bench, or a short walk are other options. Skip unsafe ground, traffic, and weather that does not suit you.",
          "Nature does not treat a disease. The Nature section of lifeZoi says this at more length, including sun safety.",
        ],
        bullets: [
          "Sit where daylight reaches you.",
          "Notice one tree, plant, bird, or patch of sky.",
          "If you go out, use shade, clothing, and the sun-safety steps on the Nature page.",
          "Come back in when you want. There is no required number of minutes.",
        ],
      },
    ],
  },
  {
    slug: "thirty-day-habits",
    title: "30 Days of Small Healthy Habits",
    summary: "Thirty small ideas. Skip any day. Nothing here is a score.",
    minutes: "About 5 minutes",
    topic: "habits",
    pdfFile: "/library/pdfs/thirty-day-habits.pdf",
    related: [
      { href: "/habits", label: "Shared challenges" },
      { href: "/library/practice", label: "Habit picker and calendar" },
      { href: "/library/lessons", label: "Daily lessons" },
    ],
    sections: [
      {
        heading: "How to use the list",
        paragraphs: [
          "Do the idea that fits today. Skip any day, repeat a favorite, or stop. A gap is not a failure. lifeZoi does not keep a streak and does not score you. NIH describes habits as cues you can practice, and setbacks as part of change.",
        ],
      },
      {
        heading: "Days 1 to 10",
        bullets: [
          "Day 1. Drink water with one meal if a clinician has not limited your fluids.",
          "Day 2. Put a fruit where you can see it.",
          "Day 3. Read the Added Sugars line on one package.",
          "Day 4. Walk for a few minutes, or march in place.",
          "Day 5. Sit by a window.",
          "Day 6. Add one vegetable you already like.",
          "Day 7. Roll your shoulders for a minute, seated if you prefer.",
          "Day 8. Send a message to one person.",
          "Day 9. Set out one breakfast ingredient for tomorrow.",
          "Day 10. Stand from a chair once, using your hands if you need them, or press your palms together.",
        ],
        paragraphs: [],
      },
      {
        heading: "Days 11 to 20",
        bullets: [
          "Day 11. Before an evening snack, notice whether you are hungry. Eat if you are.",
          "Day 12. Step outside, or stay in the doorway.",
          "Day 13. Open and close your hands slowly.",
          "Day 14. Choose a food you already like instead of hunting for a new product.",
          "Day 15. Dim one light in the evening.",
          "Day 16. Shift your weight while holding a counter, or skip balance work and sit tall.",
          "Day 17. Write one sentence about what you want tomorrow to include.",
          "Day 18. Rinse canned beans and add them to a meal.",
          "Day 19. Do an easy seated reach.",
          "Day 20. Leave walking shoes where you will see them.",
        ],
        paragraphs: [],
      },
      {
        heading: "Days 21 to 30",
        bullets: [
          "Day 21. Eat one meal without a screen if that feels possible.",
          "Day 22. Circle your ankles.",
          "Day 23. Look at a tree, a plant, or the sky.",
          "Day 24. Wash and prepare one piece of fruit.",
          "Day 25. Take a slightly longer route, or march while the kettle heats.",
          "Day 26. Thank someone, including yourself, in one sentence.",
          "Day 27. Read the first ingredient on a bread or cereal package.",
          "Day 28. Sit for one minute of ordinary breathing.",
          "Day 29. Put a chair where a stretch is easy to start.",
          "Day 30. Pick one idea from this list to repeat. Leave the rest.",
        ],
        paragraphs: ["The practice page can hold a habit you want to keep. The calendar does not mark a blank day as a miss."],
      },
    ],
  },
];

export function guideBySlug(slug: string) {
  return libraryGuides.find((guide) => guide.slug === slug) ?? null;
}

export const PDF_SLUGS = libraryGuides.map((guide) => guide.slug);
