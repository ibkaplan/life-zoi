import { challenges } from "@/lib/wellness/challenges";
import { ACID_BASE_NOTE, CHOICE_CATEGORIES, choiceTopics } from "@/lib/wellness/choices";
import { LIFE_HABITS } from "@/lib/wellness/life-plan";

/**
 * Data from the "wellness-challenges" area that pages show through `t(value)`, for example a list of lessons.
 * Every text string found in these values must have a translation in catalog/<locale>/wellness-challenges.json.
 */
const note = ({ text, evidenceNote }: { text: string; evidenceNote: string }) => ({ text, evidenceNote });

const sources: unknown[] = [
  // Challenge titles, summaries, and days. The 30-day nature days repeat the 7-day nature
  // prompts with a "Day N: " prefix, which the challenge panel translates as a template.
  challenges.map(({ id, title, summary, plan }) => ({
    title,
    summary,
    plan: plan
      .filter((step) => !(id === "nature-30" && /^Day \d+: /.test(step.title)))
      .map(({ title: dayTitle, what, when, alternative }) => ({ dayTitle, what, when, alternative })),
  })),
  CHOICE_CATEGORIES,
  choiceTopics.map(({ title, categories, why, body, research, actions }) => ({
    title,
    categories,
    why: note(why),
    body: note(body),
    research: research.map(note),
    actions,
  })),
  note(ACID_BASE_NOTE),
  LIFE_HABITS.map(({ title, detail }) => ({ title, detail })),
];
export default sources;
