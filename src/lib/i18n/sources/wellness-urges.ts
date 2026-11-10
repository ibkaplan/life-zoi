import {
  CHOICE_LABELS,
  EVENING_EXAMPLE,
  FACTOR_LABELS,
  STRONGER_LINE,
  SUPPORT_LABELS,
  SUPPORT_NOTE,
  TOOLKITS,
  URGE_LESSONS,
} from "@/lib/wellness/urges";
import { EXAMPLE_MOMENT_STORY, MOMENT_CATEGORY_COPY, MOMENT_FILTER_COPY, MOMENT_IDEAS } from "@/lib/wellness/moments";
import { LIFE_HABITS } from "@/lib/wellness/life-plan";
import { NATURE_ACTIVITIES, NATURE_CLOSE, NATURE_QUOTE, natureModules, outdoorMoodSentence } from "@/lib/wellness/nature";
import type { NatureEntry } from "@/lib/wellness/types";
import { exerciseApps } from "@/lib/wellness/exercise-resources/apps";
import { categories } from "@/lib/wellness/exercise-resources/categories";
import {
  ASK_A_PROFESSIONAL,
  BRAND_LINE,
  FREE_EXERCISE_MESSAGE,
  FREE_EXERCISE_TITLE,
  NOT_TREATMENT,
} from "@/lib/wellness/exercise-resources/copy";
import { guides } from "@/lib/wellness/exercise-resources/guides";
import { routines } from "@/lib/wellness/exercise-resources/routines";
import { videoGroups, videos } from "@/lib/wellness/exercise-resources/videos";
import {
  ASK_FIRST,
  FALL_SUPPORT,
  SAFETY_LINE,
  STUDIO_HERO,
  STUDIO_SECTION,
  goalLabel,
  levelLabel,
  positionLabel,
  studioCategories,
  studioLessons,
} from "@/lib/wellness/movement-studio/catalog";
import { PROGRESS_COPY, missionPlan } from "@/lib/wellness/movement-studio/progress";
import { SCRIPT_LABEL } from "@/lib/wellness/movement-studio/scripts";

/** Lines a routine guide builds as "How much: …" and "An easier way: …"; the page translates the two parts. */
/** Sample notes that make each of the three journal pattern sentences appear. They are not saved anywhere. */
const note = (outdoor: boolean, moodAfter: number) => ({ outdoorMinutes: outdoor ? 10 : null, weather: "", moodAfter }) as NatureEntry;
const patternSentences = [
  outdoorMoodSentence([]),
  outdoorMoodSentence([note(true, 5), note(true, 5), note(false, 1), note(false, 1)]),
  outdoorMoodSentence([note(true, 1), note(true, 1), note(false, 5), note(false, 5)]),
];

const builtLine = (line: string) => line.startsWith("How much: ") || line.startsWith("An easier way: ");

/**
 * Data from the "wellness-urges" area that pages show through `t(value)`: Master Your Urges,
 * the power of nature, free exercise resources, and the Movement Studio.
 * Every text string found in these values must have a translation in catalog/<locale>/wellness-urges.json.
 * Outside page titles, publishers, and published film titles stay as published and are not listed.
 */
const sources: unknown[] = [
  URGE_LESSONS.map(({ title, summary, blocks, actions }) => ({
    title,
    summary,
    actions,
    blocks: blocks.map(({ heading, body, evidenceNote }) => ({ heading, body, evidenceNote })),
  })),
  FACTOR_LABELS,
  CHOICE_LABELS,
  SUPPORT_LABELS,
  SUPPORT_NOTE,
  STRONGER_LINE,
  EVENING_EXAMPLE,
  TOOLKITS.map(({ title, text }) => ({ title, text })),
  MOMENT_CATEGORY_COPY.map(({ label, text }) => ({ label, text })),
  MOMENT_FILTER_COPY.map(({ label }) => label),
  MOMENT_IDEAS.map(({ title, detail }) => ({ title, detail })),
  EXAMPLE_MOMENT_STORY,
  "A short rest",
  LIFE_HABITS.map(({ title, detail }) => ({ title, detail })),
  NATURE_QUOTE,
  NATURE_CLOSE,
  NATURE_ACTIVITIES.map(({ label, text }) => ({ label, text })),
  natureModules.map(({ title, summary, blocks }) => ({
    title,
    summary,
    blocks: blocks.map(({ heading, body, evidenceNote }) => ({ heading, body, evidenceNote })),
  })),
  patternSentences,
  FREE_EXERCISE_TITLE,
  FREE_EXERCISE_MESSAGE,
  BRAND_LINE,
  ASK_A_PROFESSIONAL,
  NOT_TREATMENT,
  exerciseApps.map(({ summary }) => summary),
  categories.map(({ title, intro, steps, safety }) => ({ title, intro, steps, safety })),
  routines.map(({ title, minutes, summary, moves, safety }) => ({ title, minutes, summary, moves, safety })),
  guides.map(({ title, summary, safety, sections, links }) => ({
    title,
    summary,
    safety,
    sections: sections.map(({ heading, lines }) => ({ heading, lines: lines.filter((line) => !builtLine(line)) })),
    links: links.filter((link) => link.source === "lifeZoi").map(({ label }) => label),
  })),
  videoGroups.map(({ title }) => title),
  videos.map(({ duration, description }) => ({ duration, description })),
  STUDIO_HERO,
  STUDIO_SECTION,
  SAFETY_LINE,
  FALL_SUPPORT,
  ASK_FIRST,
  SCRIPT_LABEL,
  studioCategories.map(({ title, summary }) => ({ title, summary })),
  studioLessons.map((lesson) =>
    lesson.kind === "script"
      ? { title: lesson.title, summary: lesson.summary, safety: lesson.safety, cues: lesson.script.cues }
      : { summary: lesson.summary, safety: lesson.safety, license: lesson.license.license },
  ),
  positionLabel,
  goalLabel,
  levelLabel,
  missionPlan.map(({ label, focus }) => ({ label, focus })),
  PROGRESS_COPY,
];
export default sources;
