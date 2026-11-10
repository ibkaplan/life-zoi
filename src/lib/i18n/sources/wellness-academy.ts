import { FIND_TEXT_SOURCES } from "@/lib/wellness/movement-studio/find-videos";

/**
 * Data from the "wellness-academy" area that pages show through `t(value)`, for example a list of lessons.
 * Every text string found in these values must have a translation in catalog/<locale>/wellness-academy.json.
 *
 * Left out on purpose: publication titles, publishers, and attribution lines in the source registry
 * (shown as published), USDA record descriptions, official USDA label names, YouTube video titles and
 * channel names, and search keywords that are never shown.
 */
import { activities, mealModules } from "@/lib/wellness/academy";
import { coachModules, habitLesson, ORGANIC_LABELS } from "@/lib/wellness/coach";
import { FOOD_GROUPS, foods } from "@/lib/wellness/foods";
import { EXAMPLE_MOMENT_STORY, MOMENT_CATEGORY_COPY, MOMENT_FILTER_COPY, MOMENT_IDEAS } from "@/lib/wellness/moments";
import { EVIDENCE_LABELS, wellnessSources } from "@/lib/wellness/sources";
import { COST_TEXT, SOURCES, VIDEOS } from "@/lib/wellness-library/catalog";
import {
  AUDIENCE_TEXT,
  CHAIR_YOGA_TEXT,
  DURATION_BANDS,
  LEVEL_TEXT,
  POSITION_TEXT,
  SECTION_INFO,
} from "@/lib/wellness-library/chair-yoga";
import { STUDIO_VIDEO_SEEDS } from "@/lib/wellness-library/chair-yoga-videos";
import { CATEGORY_INFO, COOL_DOWN, MOVES, WARM_UP } from "@/lib/wellness-library/moves";

/** Library sources whose name is LifeZoi's own description rather than an organization's name. */
const DESCRIBED_SOURCES = new Set(["lifezoi", "youtube-studio", "yoga-org"]);

const sources: unknown[] = [
  FIND_TEXT_SOURCES,
  mealModules,
  activities,
  coachModules,
  habitLesson,
  ORGANIC_LABELS.map(({ text }) => text),
  wellnessSources.map(({ license, accessMethod }) => ({ license, accessMethod })),
  EVIDENCE_LABELS,
  MOMENT_CATEGORY_COPY,
  MOMENT_FILTER_COPY,
  MOMENT_IDEAS.map(({ title, detail }) => ({ title, detail })),
  EXAMPLE_MOMENT_STORY,
  foods.map(({ plainName, groupLabel, micronutrients }) => ({ plainName, groupLabel, nutrients: micronutrients.map(({ name }) => name) })),
  FOOD_GROUPS.map(({ label }) => label),
  SOURCES.map(({ id, name, notes }) => (DESCRIBED_SOURCES.has(id) ? { name, notes } : { notes })),
  VIDEOS.filter((video) => video.sourceId === "nhs").map(({ title, description, instructor }) => ({ title, description, instructor })),
  STUDIO_VIDEO_SEEDS.map(({ note }) => note),
  COST_TEXT,
  CATEGORY_INFO,
  [WARM_UP, COOL_DOWN, Object.values(MOVES)].flat(2).map(({ name, cue, easier }) => ({ name, cue, easier })),
  CHAIR_YOGA_TEXT,
  Object.values(SECTION_INFO).map(({ title, summary, includes }) => ({ title, summary, includes })),
  POSITION_TEXT,
  AUDIENCE_TEXT,
  LEVEL_TEXT,
  DURATION_BANDS.map(({ label }) => label),
];
export default sources;
