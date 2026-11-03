import type { WellnessMotivation } from "@/lib/wellness/types";

export type MotivationIdea = {
  title: string;
  href: string;
  reason: string;
};

const SUGGESTIONS: { words: string[]; idea: MotivationIdea }[] = [
  {
    words: ["sleep", "tired", "rest", "energy", "morning"],
    idea: {
      title: "Sleep routine",
      href: "/choices/sleep",
      reason: "Your words mention rest or energy. The sleep notes are one place to look. They do not assume how much energy you should have.",
    },
  },
  {
    words: ["walk", "travel", "trip", "stairs", "independent", "mobility", "grandchild", "garden", "move"],
    idea: {
      title: "Walking, strength, and balance",
      href: "/choices/muscles",
      reason: "Your words mention movement, travel, or staying able to do something. Start with the smallest version that fits. Skip the rest.",
    },
  },
  {
    words: ["food", "cook", "eat", "meal", "weight", "vegetable"],
    idea: {
      title: "Meal skills",
      href: "/academy/meals/planning",
      reason: "Your words mention food. The meal modules teach planning and swaps. They do not set calories.",
    },
  },
  {
    words: ["sugar", "sweet", "soda", "dessert"],
    idea: {
      title: "Sugar curiosity",
      href: "/choices/sugar",
      reason: "Your words mention something sweet. The sugar notes are about labels and habits, without shame.",
    },
  },
  {
    words: ["stress", "worry", "anxious", "overwhelm"],
    idea: {
      title: "Stress and support",
      href: "/choices/stress",
      reason: "Your words mention stress. NIMH’s coping ideas are education. A professional is the right place for treatment.",
    },
  },
  {
    words: ["smoke", "cigarette", "alcohol", "drink"],
    idea: {
      title: "Tobacco and alcohol information",
      href: "/choices/tobacco-alcohol",
      reason: "Your words mention smoking or drinking. Public support pages are linked. You choose whether to open them.",
    },
  },
];

export function motivationSuggestions(motivation: WellnessMotivation): MotivationIdea[] {
  const text = Object.values(motivation).join(" ").toLowerCase();
  if (!text.trim()) {
    return [
      {
        title: "Write what you want more of",
        href: "/choices/motivation",
        reason: "The ideas appear after you describe an experience, a person, an activity, or a kind of energy that would help. Examples are only examples.",
      },
    ];
  }
  const matches = SUGGESTIONS.filter((item) => item.words.some((word) => text.includes(word))).map(
    (item) => item.idea,
  );
  if (matches.length === 0) {
    return [
      {
        title: "Habit skills",
        href: "/wellness-coach",
        reason: "Your note does not match a narrower module. The habit lesson is a general place to turn a wish into one small cue.",
      },
    ];
  }
  return matches;
}

export const MOTIVATION_EXAMPLES = [
  "A trip you hope to take",
  "More energy for a hobby you already enjoy",
  "Staying able to do a daily task that matters to you",
] as const;
