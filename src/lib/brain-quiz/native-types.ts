import type { Four, RebusLayout } from "@/lib/brain-quiz/activities";

/**
 * A puzzle written natively for one language. It replaces the English fields of the
 * activity with the same id, so the id, category, difficulty, and correct answer
 * position (always the first choice) stay the same and saved progress still matches.
 */
export type NativeVariant = {
  title?: string;
  prompt?: string;
  choices?: Four;
  explanations?: Four;
  rebus?: RebusLayout;
  rows?: readonly string[];
  words?: readonly string[];
  pattern?: string;
  bank?: readonly string[];
  answer?: string;
  grid?: readonly string[];
  numbers?: Readonly<Record<string, number>>;
  clues?: readonly { number: number; dir: "across" | "down"; text: string }[];
};

export type NativeSet = {
  /** Words for the word-list memory game. */
  memoryWords: readonly string[];
  /** Puzzles that depend on spelling, letters, or sounds, by activity id. */
  variants: Readonly<Record<string, NativeVariant>>;
};
