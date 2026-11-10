import type {
  Activity,
  AttentionActivity,
  AttentionMode,
  MemoryActivity,
  MemoryMode,
} from "@/lib/brain-quiz/activities";
import { habitQuestions } from "@/lib/brain-quiz/questions-habits";
import { logicQuestions } from "@/lib/brain-quiz/questions-logic";
import { numberQuestions } from "@/lib/brain-quiz/questions-numbers";
import { riddleQuestions } from "@/lib/brain-quiz/questions-riddles";
import { wordQuestions } from "@/lib/brain-quiz/questions-words";
import { CATEGORY_IDS, type CategoryId, type Difficulty } from "@/lib/brain-quiz/progress";

export const CATEGORIES: readonly { id: CategoryId; title: string; blurb: string }[] = [
  { id: "logic", title: "Logic", blurb: "Sequences, patterns, and short reasoning puzzles." },
  { id: "riddles", title: "Riddles & rebus", blurb: "Word riddles and picture layouts you can see." },
  { id: "memory", title: "Memory", blurb: "Repeat a sequence, numbers, words, pairs, or a picture order." },
  { id: "attention", title: "Attention", blurb: "Find a change, a missing piece, an odd one, or a hidden star." },
  { id: "numbers", title: "Numbers", blurb: "Quantities, comparisons, and number patterns." },
  { id: "words", title: "Words", blurb: "Anagrams, a word search, hidden letters, and a small crossword." },
  { id: "habits", title: "Habits & health", blurb: "Everyday learning about sleep, food, movement, and habits." },
];

export const MEMORY_MODES: readonly { mode: MemoryMode; title: string; prompt: string }[] = [
  { mode: "sequence", title: "Color sequence", prompt: "Watch the colors, then tap them in the same order." },
  { mode: "numbers", title: "Number span", prompt: "Watch the digits, then enter them in the same order." },
  { mode: "words", title: "Word list", prompt: "Study the words, then select every word you saw. The full set is required." },
  { mode: "pairs", title: "Match pairs", prompt: "Turn cards over and match every pair." },
  { mode: "order", title: "Picture order", prompt: "Remember the picture order, then tap the pictures in that order." },
];

export const ATTENTION_MODES: readonly { mode: AttentionMode; title: string; prompt: string }[] = [
  { mode: "differences", title: "Find the differences", prompt: "The right picture changed. Select every shape that differs, then check." },
  { mode: "missing", title: "Missing object", prompt: "Look at the first set. One object is missing from the second set. Choose it." },
  { mode: "odd", title: "Odd one out", prompt: "Tap the shape that does not match the others." },
  { mode: "pattern", title: "Continue the pattern", prompt: "Choose the shape that continues the row." },
  { mode: "mistake", title: "Find the mistake", prompt: "One number breaks the count. Tap it." },
  { mode: "hidden", title: "Hidden object", prompt: "Find the star among the shapes." },
];

const LEVELS: readonly Difficulty[] = ["easy", "medium", "hard"];

function memoryActivities(): MemoryActivity[] {
  return MEMORY_MODES.flatMap((item) =>
    LEVELS.map((difficulty) => ({
      kind: "memory" as const,
      id: `M-${item.mode}-${difficulty[0]}`,
      category: "memory" as const,
      difficulty,
      mode: item.mode,
      title: `${item.title} · ${difficulty}`,
      prompt: item.prompt,
    })),
  );
}

function attentionActivities(): AttentionActivity[] {
  return ATTENTION_MODES.flatMap((item) =>
    LEVELS.map((difficulty) => ({
      kind: "attention" as const,
      id: `A-${item.mode}-${difficulty[0]}`,
      category: "attention" as const,
      difficulty,
      mode: item.mode,
      title: `${item.title} · ${difficulty}`,
      prompt: item.prompt,
    })),
  );
}

export const allActivities: readonly Activity[] = [
  ...logicQuestions,
  ...riddleQuestions,
  ...memoryActivities(),
  ...attentionActivities(),
  ...numberQuestions,
  ...wordQuestions,
  ...habitQuestions,
];

const byId = new Map(allActivities.map((activity) => [activity.id, activity]));

export function isCategory(value: string): value is CategoryId {
  return (CATEGORY_IDS as readonly string[]).includes(value);
}

export function categoryMeta(id: CategoryId) {
  const found = CATEGORIES.find((item) => item.id === id);
  if (!found) throw new Error("Unknown category");
  return found;
}

export function activityById(id: string): Activity | undefined {
  return byId.get(id);
}

export function activitiesFor(category: CategoryId, difficulty?: Difficulty): Activity[] {
  return allActivities.filter((activity) => activity.category === category && (!difficulty || activity.difficulty === difficulty));
}

export function parseDifficulty(value: string | null | undefined): Difficulty {
  if (value === "medium" || value === "hard" || value === "easy") return value;
  return "easy";
}
