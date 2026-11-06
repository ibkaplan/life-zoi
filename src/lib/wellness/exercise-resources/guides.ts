import { LIFEZOI_ORIGIN, safetyNote, type ResourceTier } from "@/lib/wellness/exercise-resources/copy";
import { linkById, type ExternalLinkId } from "@/lib/wellness/exercise-resources/links";
import { routines, type Routine, type SketchKind } from "@/lib/wellness/exercise-resources/routines";

export type GuideSection = {
  heading: string;
  lines: string[];
};

export type GuideLink = {
  label: string;
  url: string;
  source: string;
};

export type Guide = {
  slug: string;
  filename: string;
  title: string;
  summary: string;
  safety: string;
  sections: GuideSection[];
  links: GuideLink[];
  sketch: SketchKind | null;
  tier: ResourceTier;
};

function fromIds(ids: readonly ExternalLinkId[]): GuideLink[] {
  return ids.map((id) => {
    const link = linkById(id);
    return { label: link.title, url: link.url, source: link.source };
  });
}

function internal(label: string, path: string): GuideLink {
  return { label, url: `${LIFEZOI_ORIGIN}${path}`, source: "lifeZoi" };
}

function fromRoutine(routine: Routine, slug: string, filename: string): Guide {
  return {
    slug,
    filename,
    title: routine.title,
    summary: routine.summary,
    safety: routine.safety,
    sections: [
      {
        heading: "Time",
        lines: [routine.minutes, "Rest whenever you want. You do not have to finish every part."],
      },
      ...routine.moves.map((move) => ({
        heading: move.name,
        lines: [move.how, `How much: ${move.dose}`, `An easier way: ${move.easier}`],
      })),
    ],
    links: fromIds(routine.linkIds),
    sketch: routine.sketch,
    tier: "free",
  };
}

function routineNamed(slug: string): Routine {
  const routine = routines.find((item) => item.slug === slug);
  if (!routine) throw new Error(`Missing routine: ${slug}`);
  return routine;
}

const routineGuides: Guide[] = [
  fromRoutine(routineNamed("ten-minute-chair"), "chair-exercise", "lifezoi-chair-exercise.pdf"),
  fromRoutine(routineNamed("ten-minute-morning"), "morning-stretch", "lifezoi-morning-stretch.pdf"),
  fromRoutine(routineNamed("beginner-balance"), "beginner-balance", "lifezoi-beginner-balance.pdf"),
  fromRoutine(routineNamed("hand-and-finger"), "hand-and-finger", "lifezoi-hand-and-finger.pdf"),
  fromRoutine(routineNamed("feet-and-ankle"), "feet-and-ankle", "lifezoi-feet-and-ankle.pdf"),
  fromRoutine(routineNamed("gentle-strength"), "gentle-strength", "lifezoi-gentle-strength.pdf"),
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const guides: Guide[] = [
  ...routineGuides,
  {
    slug: "weekly-movement-planner",
    filename: "lifezoi-weekly-movement-planner.pdf",
    title: "Weekly movement planner",
    summary: "A blank week for your own notes. It does not assign a plan.",
    safety: safetyNote("Rest is allowed. Skip a day, or write a seated idea instead of a walk."),
    sections: days.map((day) => ({
      heading: day,
      lines: ["[ ] Plan:", "[ ] What I did:", "[ ] Notes:"],
    })),
    links: [
      ...fromIds(["cdc-older", "nia-tips"]),
      internal("Free exercise resources", "/academy/move/resources"),
    ],
    sketch: null,
    tier: "free",
  },
  {
    slug: "daily-walking-tracker",
    filename: "lifezoi-daily-walking-tracker.pdf",
    title: "Daily walking tracker",
    summary: "A blank place to write a walk you chose. lifeZoi does not set a step goal.",
    safety: safetyNote("Stop a walk if you feel unwell. Use the support you usually use."),
    sections: days.map((day) => ({
      heading: day,
      lines: ["Place:", "Minutes I choose to write:", "How it felt: easy, okay, or too much."],
    })),
    links: [
      ...fromIds(["nia-outdoor", "cdc-older", "medlineplus-how-much"]),
      internal("Walking and daily movement", "/academy/move/resources/categories/walking-and-daily-movement"),
    ],
    sketch: null,
    tier: "free",
  },
  {
    slug: "healthy-grocery-checklist",
    filename: "lifezoi-healthy-grocery-checklist.pdf",
    title: "Healthy grocery checklist",
    summary: "A shopping list of food types. Choose what you can find, afford, and tolerate. This is not a meal plan.",
    safety: safetyNote("If a clinician has limited a food or a fluid, follow that advice. lifeZoi does not assign a calorie target."),
    sections: [
      {
        heading: "Foods to consider",
        lines: [
          "[ ] Vegetables, fresh or frozen",
          "[ ] Fruit",
          "[ ] Beans or lentils",
          "[ ] Whole grains you already eat",
          "[ ] Eggs",
          "[ ] Fish, if you eat it",
          "[ ] Nuts or seeds",
          "[ ] Milk or yogurt, if you use them",
          "[ ] Unsweetened drinks",
        ],
      },
      {
        heading: "How to use the list",
        lines: [
          "Check only the foods you want this week.",
          "A shorter list is fine.",
          "The Dietary Guidelines site is the public reference. lifeZoi does not copy that publication.",
        ],
      },
    ],
    links: [
      ...fromIds(["dietary-guidelines"]),
      internal("Nutrition", "/academy/meals"),
    ],
    sketch: null,
    tier: "free",
  },
  {
    slug: "fiber-rich-foods",
    filename: "lifezoi-fiber-rich-foods.pdf",
    title: "Fiber-rich foods",
    summary: "Examples of foods people often use when they want more fiber. This sheet does not set a gram target.",
    safety: safetyNote(
      "Add fiber slowly. Drink the fluids you are allowed to drink. If a clinician limited fiber or fluids, use that plan. This is not treatment.",
    ),
    sections: [
      {
        heading: "Examples",
        lines: [
          "Oats",
          "Beans and lentils",
          "Berries and pears",
          "Broccoli and other vegetables you tolerate",
          "Whole-grain bread, when that bread fits your eating",
          "Nuts and seeds",
        ],
      },
      {
        heading: "A small start",
        lines: [
          "Add one food you already know, not a new pile of fiber at one meal.",
          "MedlinePlus explains fiber on its own page. Open that page rather than treating this sheet as the full article.",
          "lifeZoi also has a fiber lesson in Nutrition.",
        ],
      },
    ],
    links: [
      ...fromIds(["medlineplus-fiber"]),
      internal("Fiber lesson", "/academy/meals/fiber"),
    ],
    sketch: null,
    tier: "free",
  },
  {
    slug: "added-sugar-label-reading",
    filename: "lifezoi-added-sugar-label-reading.pdf",
    title: "Added-sugar label reading",
    summary: "A short way to find added sugars on a food label. lifeZoi does not set a personal sugar limit.",
    safety: safetyNote("This is label reading, not a diet and not a diagnosis. A registered dietitian or clinician can help with personal food decisions."),
    sections: [
      {
        heading: "Find the line",
        lines: [
          "Pick up the package and find the Nutrition Facts label.",
          "Find Total Sugars, then the line for Added Sugars.",
          "The word includes means the added sugars are part of the total sugars.",
        ],
      },
      {
        heading: "Compare",
        lines: [
          "Look at two products you might actually buy.",
          "Read the Added Sugars line on each.",
          "Then read the ingredient list for sugar, honey, or syrup.",
        ],
      },
      {
        heading: "Where to read more",
        lines: [
          "The FDA page explains how added sugars are listed. Use that page for the label rules.",
          "lifeZoi Nutrition has an added-sugar section. This PDF does not replace it.",
        ],
      },
    ],
    links: [
      ...fromIds(["fda-added-sugars"]),
      internal("Labels and added sugar", "/academy/meals#sugar-hiding"),
    ],
    sketch: null,
    tier: "free",
  },
];

export const requiredGuideSlugs = [
  "chair-exercise",
  "morning-stretch",
  "hand-and-finger",
  "feet-and-ankle",
  "beginner-balance",
  "weekly-movement-planner",
  "daily-walking-tracker",
  "healthy-grocery-checklist",
  "fiber-rich-foods",
  "added-sugar-label-reading",
] as const;

export function guideBySlug(slug: string): Guide | null {
  return guides.find((item) => item.slug === slug) ?? null;
}

export function guideForRoutine(routine: Routine): Guide | null {
  return guideBySlug(routine.guideSlug);
}
