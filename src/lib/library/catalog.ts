import { BRAND_LINE } from "@/lib/purpose";
import { libraryGuides } from "@/lib/library/guides";
import { dailyLessons, hardMoments } from "@/lib/library/lessons";
import { libraryExercises, movementPrograms } from "@/lib/library/movement";

export const LIBRARY_HEADLINE = "YOUR FREE LIBRARY FOR A HEALTHIER LIFE";
export const LIBRARY_SUBTITLE =
  "Discover practical health guides, nutrition tips, exercise routines, recipes, and simple habits you can use every day.";
export const LIBRARY_BRAND = BRAND_LINE;
export const LIBRARY_DISCLAIMER =
  "Educational only. lifeZoi does not diagnose, treat, or promise a result, and it does not promise a longer life. Stop any movement that hurts. Talk with a clinician about personal medical decisions.";

export type ArtName =
  | "bowl"
  | "gut"
  | "label"
  | "bread"
  | "walk"
  | "chair"
  | "balance"
  | "mind"
  | "moon"
  | "tree"
  | "path"
  | "calendar"
  | "breath"
  | "leaf";

export type LibraryCategory = {
  slug: string;
  title: string;
  description: string;
  art: ArtName;
  links: { href: string; label: string }[];
};

export const libraryCategories: LibraryCategory[] = [
  {
    slug: "nutrition",
    title: "Nutrition & Healthy Eating",
    description: "Meal lessons, breakfast ideas, and a food comparison that stays in the Nutrition section.",
    art: "bowl",
    links: [
      { href: "/academy/meals", label: "Open Nutrition" },
      { href: "/academy/meals#daily-choices", label: "Daily food choices" },
      { href: "/library/guides/healthy-breakfast", label: "Healthy Breakfast Guide" },
      { href: "/academy/compare", label: "Food comparison" },
    ],
  },
  {
    slug: "gut",
    title: "Gut Health & Digestion",
    description: "A short gut guide here, and the longer food notes and photos in Nutrition.",
    art: "gut",
    links: [
      { href: "/library/guides/gut-basics", label: "Gut Health Basics" },
      { href: "/academy/meals#feed-your-gut", label: "Nutrition: gut health" },
      { href: "/library/guides/fiber-foods", label: "Fiber guide" },
      { href: "/academy/meals/fiber", label: "Fiber lesson" },
    ],
  },
  {
    slug: "sugar",
    title: "Sugar & Heart Health",
    description: "How to read added sugar, with the detailed label lesson left in Nutrition.",
    art: "label",
    links: [
      { href: "/library/guides/hidden-sugar", label: "Hidden Sugar Guide" },
      { href: "/academy/meals#sugar-hiding", label: "Nutrition: added sugar" },
      { href: "/food-labels", label: "Food Intelligence" },
      { href: "/sugar-detective", label: "Sugar Detective" },
      { href: "/choices/sugar", label: "Daily choice: sugar" },
    ],
  },
  {
    slug: "bread",
    title: "Homemade Bread & Recipes",
    description: "Short original breads in this library, and the three longer loaves in Nutrition.",
    art: "bread",
    links: [
      { href: "/library/guides/homemade-bread", label: "Homemade Bread Collection" },
      { href: "/academy/meals#bake-bread", label: "Nutrition: bake bread" },
      { href: "/academy/meals/rustic-sourdough", label: "Rustic sourdough" },
      { href: "/academy/meals/sunflower-walnut-bread", label: "Sunflower and walnut bread" },
      { href: "/academy/meals/oatmeal-seed-bread", label: "Oatmeal and seed bread" },
    ],
  },
  {
    slug: "movement",
    title: "Movement & Exercise",
    description: "Text-guided movement, seated options, and the original academy sketches.",
    art: "walk",
    links: [
      { href: "/library/move", label: "Expanded movement library" },
      { href: "/academy/move", label: "Academy movement" },
      { href: "/library/programs/full-body-25", label: "25-minute full-body session" },
    ],
  },
  {
    slug: "chair",
    title: "Chair Exercises",
    description: "Seated movement for days when standing is not the plan.",
    art: "chair",
    links: [
      { href: "/library/guides/chair-exercises", label: "Chair Exercises guide" },
      { href: "/library/move/chair-yoga", label: "Chair yoga" },
      { href: "/library/programs/chair-yoga-5", label: "5-minute chair yoga" },
      { href: "/library/programs/chair-yoga-10", label: "10-minute chair yoga" },
      { href: "/library/programs/chair-yoga-15", label: "15-minute chair yoga" },
    ],
  },
  {
    slug: "balance",
    title: "Balance & Fall Prevention",
    description: "Practice while holding on. This is not a fall-risk score.",
    art: "balance",
    links: [
      { href: "/library/guides/beginner-balance", label: "Beginner Balance" },
      { href: "/balance-challenge", label: "Balance and Brain Challenge" },
      { href: "/academy/move/heel-to-toe", label: "Supported heel-to-toe" },
      { href: "/library/move/supported-balance", label: "Supported balance practice" },
    ],
  },
  {
    slug: "brain",
    title: "Brain Health & Memory",
    description: "Sleep, movement, and attention as everyday ideas. Not a memory test.",
    art: "mind",
    links: [
      { href: "/library/guides/brain-aging", label: "Brain Health and Healthy Aging" },
      { href: "/library/lessons/brain-health", label: "Brain health lesson" },
      { href: "/balance-challenge", label: "Balance and Brain Challenge" },
    ],
  },
  {
    slug: "sleep",
    title: "Sleep & Stress",
    description: "Sleep cues and five seated breathing ideas. No promise of a perfect night.",
    art: "moon",
    links: [
      { href: "/library/guides/better-sleep", label: "Better Sleep" },
      { href: "/library/guides/stress-relief", label: "Stress Relief" },
      { href: "/choices/sleep", label: "Daily choice: sleep" },
      { href: "/choices/stress", label: "Daily choice: stress" },
      { href: "/library/moments", label: "Having a hard moment" },
    ],
  },
  {
    slug: "nature",
    title: "Nature & Outdoor Wellness",
    description: "Windows, doorways, and short time outside. Nature is not medicine.",
    art: "tree",
    links: [
      { href: "/nature", label: "Nature" },
      { href: "/library/guides/nature-wellbeing", label: "Nature and Well-Being" },
      { href: "/nature/sunlight", label: "Sunlight" },
      { href: "/nature/outside", label: "Time outside" },
    ],
  },
  {
    slug: "aging",
    title: "Healthy Aging & Longevity",
    description: "Everyday movement and attention as you get older. lifeZoi does not promise a longer life.",
    art: "path",
    links: [
      { href: "/library/guides/brain-aging", label: "Brain Health and Healthy Aging" },
      { href: "/library/lessons/muscle-with-age", label: "Muscle as you get older" },
      { href: "/academy/move/chair-stand", label: "Stand from a chair" },
      { href: "/library/move", label: "Movement library" },
    ],
  },
  {
    slug: "habits",
    title: "Daily Healthy Habits",
    description: "Lessons, a friendly habit list, and a calendar that does not punish a gap.",
    art: "calendar",
    links: [
      { href: "/library/lessons", label: "Daily lessons" },
      { href: "/library/practice", label: "Habit picker and calendar" },
      { href: "/library/guides/thirty-day-habits", label: "30 days of small habits" },
      { href: "/habits", label: "Shared challenges" },
    ],
  },
];

export function categoryBySlug(slug: string) {
  return libraryCategories.find((item) => item.slug === slug) ?? null;
}

export type SearchKind = "article" | "guide" | "recipe" | "exercise" | "video" | "pdf";

export type SearchHit = {
  id: string;
  title: string;
  text: string;
  href: string;
  kinds: SearchKind[];
};

export const healthCards = [
  {
    slug: "fiber-card",
    title: "Add one fiber food",
    text: "Oats, beans, or fruit with the skin are ordinary places to start. Go slowly, and drink the fluids you are allowed.",
    href: "/library/guides/fiber-foods",
  },
  {
    slug: "walking-card",
    title: "Walk, or march in the chair",
    text: "A short walk at a talking pace counts. If walking is not available, a seated march is the same idea.",
    href: "/academy/move/easy-walk",
  },
  {
    slug: "gut-foods-card",
    title: "Three everyday foods",
    text: "Oats, beans, and plain yogurt with live cultures are foods, not a treatment. Read added sugar on flavored yogurt.",
    href: "/library/guides/gut-basics",
  },
  {
    slug: "label-card",
    title: "Read added sugar once",
    text: "Find the Added Sugars line on one package. The serving size comes first. There is no score.",
    href: "/library/guides/hidden-sugar",
  },
  {
    slug: "chair-card",
    title: "Five chair movements",
    text: "March, reach, heel lifts, a gentle towel pull, and a sit-to-stand or a palm press. Stop if it hurts.",
    href: "/library/guides/chair-exercises",
  },
  {
    slug: "sleep-brain-card",
    title: "Sleep and attention",
    text: "A dimmer evening and a few minutes of something you enjoy are ideas, not a memory test and not a promise.",
    href: "/library/guides/brain-aging",
  },
  {
    slug: "habits-card",
    title: "One small habit",
    text: "Pick one action you can repeat. A missed day is not a failure, and nothing here guarantees a result.",
    href: "/library/guides/thirty-day-habits",
  },
] as const;

export function cardBySlug(slug: string) {
  return healthCards.find((card) => card.slug === slug) ?? null;
}

const recipeHits: SearchHit[] = [
  {
    id: "recipe-skillet",
    title: "Skillet flatbread",
    text: "Flour, water, salt, and olive oil. Added sugar in this recipe is 0 g.",
    href: "/library/guides/homemade-bread#skillet-flatbread",
    kinds: ["recipe"],
  },
  {
    id: "recipe-chickpea",
    title: "Chickpea skillet bread",
    text: "Chickpea flour, water, salt, olive oil, and optional cumin. Added sugar is 0 g as written.",
    href: "/library/guides/homemade-bread#chickpea-skillet",
    kinds: ["recipe"],
  },
  {
    id: "recipe-herb",
    title: "Same-day herb rolls",
    text: "Flour, water, yeast, salt, olive oil, and dried herb. Added sugar is 0 g as written.",
    href: "/library/guides/homemade-bread#herb-rolls",
    kinds: ["recipe"],
  },
  {
    id: "recipe-sourdough",
    title: "Rustic sourdough",
    text: "The longer sourdough loaf lives in Nutrition.",
    href: "/academy/meals/rustic-sourdough",
    kinds: ["recipe"],
  },
  {
    id: "recipe-sunflower",
    title: "Sunflower and walnut bread",
    text: "The longer seeded loaf lives in Nutrition.",
    href: "/academy/meals/sunflower-walnut-bread",
    kinds: ["recipe"],
  },
  {
    id: "recipe-oatmeal",
    title: "Oatmeal and seed bread",
    text: "The longer oat loaf lives in Nutrition.",
    href: "/academy/meals/oatmeal-seed-bread",
    kinds: ["recipe"],
  },
];

export function searchHits(): SearchHit[] {
  const guides: SearchHit[] = libraryGuides.map((guide) => ({
    id: `guide-${guide.slug}`,
    title: guide.title,
    text: guide.summary,
    href: `/library/guides/${guide.slug}`,
    kinds: ["guide", "pdf"],
  }));
  const lessons: SearchHit[] = dailyLessons.map((lesson) => ({
    id: `lesson-${lesson.slug}`,
    title: lesson.title,
    text: lesson.explanation[0],
    href: `/library/lessons/${lesson.slug}`,
    kinds: ["article"],
  }));
  const moments: SearchHit[] = hardMoments.map((moment) => ({
    id: `moment-${moment.slug}`,
    title: `Having a hard moment: ${moment.title}`,
    text: moment.body[0],
    href: `/library/moments/${moment.slug}`,
    kinds: ["article"],
  }));
  const exercises: SearchHit[] = libraryExercises.map((item) => ({
    id: `exercise-${item.slug}`,
    title: item.title,
    text: `${item.group}. ${item.duration}`,
    href: `/library/move/${item.slug}`,
    kinds: ["exercise"],
  }));
  const programs: SearchHit[] = movementPrograms.map((item) => ({
    id: `program-${item.slug}`,
    title: item.title,
    text: item.summary,
    href: `/library/programs/${item.slug}`,
    kinds: ["exercise"],
  }));
  return [...guides, ...recipeHits, ...lessons, ...moments, ...exercises, ...programs];
}

export function filterLibrary(query: string, kind: SearchKind | "all"): SearchHit[] {
  const needle = query.trim().toLowerCase();
  return searchHits().filter((hit) => {
    if (kind !== "all" && !hit.kinds.includes(kind)) return false;
    if (!needle) return true;
    return `${hit.title} ${hit.text}`.toLowerCase().includes(needle);
  });
}

export function libraryPlainText(): string {
  const parts: string[] = [
    LIBRARY_HEADLINE,
    LIBRARY_SUBTITLE,
    LIBRARY_BRAND,
    LIBRARY_DISCLAIMER,
  ];
  for (const category of libraryCategories) {
    parts.push(category.title, category.description, ...category.links.map((link) => link.label));
  }
  for (const guide of libraryGuides) {
    parts.push(guide.title, guide.summary);
    for (const section of guide.sections) {
      parts.push(section.heading, ...section.paragraphs, ...(section.bullets ?? []));
    }
    for (const recipe of guide.recipes ?? []) {
      parts.push(recipe.title, recipe.note, ...recipe.ingredients, ...recipe.steps);
    }
  }
  for (const card of healthCards) parts.push(card.title, card.text);
  for (const lesson of dailyLessons) {
    parts.push(lesson.title, ...lesson.explanation, lesson.action, lesson.reflection);
  }
  for (const moment of hardMoments) parts.push(moment.title, ...moment.body, moment.next);
  for (const exercise of libraryExercises) {
    parts.push(
      exercise.title,
      exercise.group,
      exercise.duration,
      exercise.equipment,
      exercise.beginner,
      exercise.seated,
      exercise.safety,
      exercise.sourceNote,
      ...exercise.instructions,
    );
  }
  for (const program of movementPrograms) {
    parts.push(program.title, program.summary, program.safety);
    for (const block of program.blocks) parts.push(block.text, block.seated);
  }
  return parts.join("\n");
}
