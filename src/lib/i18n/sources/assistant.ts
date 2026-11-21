import {
  GUIDE_ANSWERS,
  GUIDE_BACK,
  GUIDE_BACK_TOPICS,
  GUIDE_CARE,
  GUIDE_CHOOSE_QUESTION,
  GUIDE_CHOOSE_TOPIC,
  GUIDE_EMERGENCY,
  GUIDE_EXAMPLE,
  GUIDE_LISTEN,
  GUIDE_MORE,
  GUIDE_NOTE,
  GUIDE_QUESTIONS_COUNT,
  GUIDE_SECTIONS,
  GUIDE_TITLE,
  GUIDE_TOPICS,
  GUIDE_TRY,
  GUIDE_WELCOME,
} from "@/lib/wellness-assistant/guide";
import { HABIT_AREAS, SCORE_BANDS } from "@/lib/wellness-score";

/**
 * The Wellness Assistant question library and the dashboard score block.
 * Translations live in catalog/<locale>/assistant.json.
 */
const sources: unknown[] = [
  [
    GUIDE_TITLE,
    GUIDE_WELCOME,
    GUIDE_NOTE,
    GUIDE_EMERGENCY,
    GUIDE_CHOOSE_TOPIC,
    GUIDE_CHOOSE_QUESTION,
    GUIDE_BACK,
    GUIDE_BACK_TOPICS,
    GUIDE_TRY,
    GUIDE_EXAMPLE,
    GUIDE_CARE,
    GUIDE_LISTEN,
    GUIDE_MORE,
    GUIDE_SECTIONS,
    GUIDE_QUESTIONS_COUNT,
  ],
  GUIDE_TOPICS.map(({ label, description }) => ({ label, description })),
  GUIDE_ANSWERS.map(({ question, intro, tips, example, care, links }) => ({
    question,
    intro,
    tips,
    example,
    care,
    links: links.map(({ label }) => label),
  })),
  HABIT_AREAS.map(({ label, next }) => ({ label, next })),
  SCORE_BANDS.map(({ label }) => label),
];
export default sources;
