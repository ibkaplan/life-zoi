import type { CategoryId, Difficulty } from "@/lib/brain-quiz/progress";

export type SourceLink = { name: string; url: string };
export type Four = readonly [string, string, string, string];

export type IconName =
  | "eye"
  | "sun"
  | "moon"
  | "rain"
  | "book"
  | "star"
  | "tree"
  | "heart"
  | "hand"
  | "foot"
  | "clock";

export type RebusPiece =
  | { type: "text"; text: string; scale?: "sm" | "md" | "lg" }
  | { type: "icon"; icon: IconName }
  | { type: "rule" };

export type RebusLayout =
  | { arrangement: "stack" | "row"; pieces: RebusPiece[] }
  | { arrangement: "between"; text: string }
  | { arrangement: "frame"; frame: string; inner: string }
  | { arrangement: "repeat"; text: string; count: number }
  | { arrangement: "flip"; text: string };

type Base = {
  id: string;
  category: CategoryId;
  difficulty: Difficulty;
  title: string;
  prompt: string;
};

export type ChoiceActivity = Base & {
  kind: "choice";
  choices: Four;
  correctIndex: 0 | 1 | 2 | 3;
  explanations: Four;
  sources?: SourceLink[];
};

export type MultiActivity = Base & {
  kind: "multi";
  choices: Four;
  correctIndexes: readonly number[];
  explanations: Four;
  sources?: SourceLink[];
};

export type RebusActivity = Base & {
  kind: "rebus";
  rebus: RebusLayout;
  choices: Four;
  correctIndex: 0 | 1 | 2 | 3;
  explanations: Four;
};

export type MemoryMode = "sequence" | "numbers" | "words" | "pairs" | "order";
export type MemoryActivity = Base & { kind: "memory"; category: "memory"; mode: MemoryMode };

export type AttentionMode = "differences" | "missing" | "odd" | "pattern" | "mistake" | "hidden";
export type AttentionActivity = Base & { kind: "attention"; category: "attention"; mode: AttentionMode };

export type WordSearchActivity = Base & {
  kind: "word-search";
  category: "words";
  rows: readonly string[];
  words: readonly string[];
};

export type LetterActivity = Base & {
  kind: "letters";
  category: "words";
  pattern: string;
  bank: readonly string[];
  answer: string;
};

export type AcrosticActivity = Base & {
  kind: "acrostic";
  category: "words";
  words: readonly string[];
  answer: string;
};

export type CrosswordActivity = Base & {
  kind: "crossword";
  category: "words";
  grid: readonly string[];
  numbers: Readonly<Record<string, number>>;
  clues: readonly { number: number; dir: "across" | "down"; text: string }[];
};

export type Activity =
  | ChoiceActivity
  | MultiActivity
  | RebusActivity
  | MemoryActivity
  | AttentionActivity
  | WordSearchActivity
  | LetterActivity
  | AcrosticActivity
  | CrosswordActivity;

export function isLockedKind(activity: Activity): boolean {
  return activity.kind === "choice" || activity.kind === "multi" || activity.kind === "rebus";
}

export function choice(
  id: string,
  category: ChoiceActivity["category"],
  difficulty: Difficulty,
  title: string,
  prompt: string,
  choices: Four,
  correctIndex: 0 | 1 | 2 | 3,
  explanations: Four,
  sources?: SourceLink[],
): ChoiceActivity {
  return { kind: "choice", id, category, difficulty, title, prompt, choices, correctIndex, explanations, sources };
}

export function multi(
  id: string,
  category: MultiActivity["category"],
  difficulty: Difficulty,
  title: string,
  prompt: string,
  choices: Four,
  correctIndexes: readonly number[],
  explanations: Four,
  sources?: SourceLink[],
): MultiActivity {
  return { kind: "multi", id, category, difficulty, title, prompt, choices, correctIndexes, explanations, sources };
}

export function rebus(
  id: string,
  difficulty: Difficulty,
  title: string,
  layout: RebusLayout,
  choices: Four,
  correctIndex: 0 | 1 | 2 | 3,
  explanations: Four,
): RebusActivity {
  return {
    kind: "rebus",
    id,
    category: "riddles",
    difficulty,
    title,
    prompt: "What phrase or word does this picture show?",
    rebus: layout,
    choices,
    correctIndex,
    explanations,
  };
}
