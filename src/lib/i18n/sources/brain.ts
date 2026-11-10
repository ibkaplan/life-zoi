import { ATTENTION_MODES, CATEGORIES, MEMORY_MODES, allActivities } from "@/lib/brain-quiz/catalog";
import { nativeIds } from "@/lib/brain-quiz/localize";

/**
 * Data from the "brain" area that pages show through `t(value)`, for example a list of lessons.
 * Every text string found in these values must have a translation in catalog/<locale>/brain.json.
 *
 * Puzzles that are written natively for each language (see `brain-quiz/native-*.ts`) only need
 * their English title and prompt here, for tab titles and page descriptions.
 */
const native = nativeIds();

const sources: unknown[] = [
  CATEGORIES.map(({ title, blurb }) => ({ title, blurb })),
  MEMORY_MODES.map(({ title, prompt }) => ({ title, prompt })),
  ATTENTION_MODES.map(({ title, prompt }) => ({ title, prompt })),
  allActivities
    .filter((activity) => activity.kind !== "memory" && activity.kind !== "attention")
    .map((activity) => {
      const shown = { title: activity.title, prompt: activity.prompt };
      if (native.has(activity.id)) return shown;
      if (activity.kind === "choice" || activity.kind === "multi" || activity.kind === "rebus") {
        return { ...shown, choices: activity.choices, explanations: activity.explanations };
      }
      if (activity.kind === "crossword") return { ...shown, clues: activity.clues.map(({ text }) => text) };
      return shown;
    }),
];
export default sources;
