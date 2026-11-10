import {
  LIBRARY_BRAND,
  LIBRARY_DISCLAIMER,
  LIBRARY_HEADLINE,
  LIBRARY_SUBTITLE,
  healthCards,
  libraryCategories,
  searchHits,
} from "@/lib/library/catalog";
import { libraryGuides } from "@/lib/library/guides";
import { dailyLessons, dailyMissions, hardMoments } from "@/lib/library/lessons";
import { MOVEMENT_GROUPS, libraryExercises, movementPrograms } from "@/lib/library/movement";
import { BOOKS, PUBLIC_DOMAIN_LIBRARIES } from "@/lib/companion/books";
import { MUSIC_CATEGORY_LABEL, TRACKS } from "@/lib/companion/music";
import { GAME_INFO, GAME_NOTICE } from "@/lib/companion/games";
import { COST_TEXT, SOURCES, VIDEOS, reviewQueue } from "@/lib/wellness-library/catalog";
import { CATEGORY_INFO } from "@/lib/wellness-library/moves";
import { LIFE_HABITS } from "@/lib/wellness/life-plan";

const links = (items: { label: string }[]) => items.map(({ label }) => label);

/**
 * Data from the "library" area that pages show through `t(value)`: the Health Library,
 * books, music, brain games, and the Wellness Library pages.
 * Every text string found in these values must have a translation in catalog/<locale>/library.json.
 */
const sources: unknown[] = [
  [LIBRARY_HEADLINE, LIBRARY_SUBTITLE, LIBRARY_BRAND, LIBRARY_DISCLAIMER],
  libraryCategories.map(({ title, description, links: items }) => [title, description, links(items)]),
  healthCards.map(({ title, text }) => [title, text]),
  // Exercise and hard-moment results are built from pieces; the page rebuilds them from their parts.
  searchHits()
    .filter((hit) => !hit.id.startsWith("exercise-") && !hit.id.startsWith("moment-"))
    .map(({ title, text }) => [title, text]),
  // Recipe sections are built from pieces; the guide page rebuilds them from `recipes`.
  libraryGuides.map((guide) => {
    const recipeIds = new Set((guide.recipes ?? []).map((recipe) => recipe.id));
    return {
      title: guide.title,
      summary: guide.summary,
      minutes: guide.minutes,
      related: links(guide.related),
      sections: guide.sections
        .filter((section) => !section.id || !recipeIds.has(section.id))
        .map(({ heading, paragraphs, bullets }) => ({ heading, paragraphs, bullets })),
      recipes: (guide.recipes ?? []).map(({ title, addedSugar, ingredients, steps, note }) => ({ title, addedSugar, ingredients, steps, note })),
    };
  }),
  dailyLessons.map(({ title, minutes, explanation, action, reflection, related }) => [title, minutes, explanation, action, reflection, links(related)]),
  hardMoments.map(({ title, body, next, related }) => [title, body, next, links(related)]),
  dailyMissions.map(({ text }) => text),
  MOVEMENT_GROUPS,
  libraryExercises.map((item) => [
    item.title,
    item.group,
    item.duration,
    item.difficulty,
    item.equipment,
    item.instructions,
    item.beginner,
    item.seated,
    item.safety,
    item.sourceNote,
  ]),
  movementPrograms.map(({ title, summary, equipment, blocks, safety }) => [
    title,
    summary,
    equipment,
    blocks.map(({ text, seated }) => [text, seated]),
    safety,
  ]),
  BOOKS.map(({ title, summary, credit, pages }) => [title, summary, credit, pages]),
  PUBLIC_DOMAIN_LIBRARIES.map(({ note }) => note),
  MUSIC_CATEGORY_LABEL,
  TRACKS.map(({ title, description, credit }) => [title, description, credit]),
  GAME_INFO,
  GAME_NOTICE,
  // The Wellness Library page and its sources page show these from the wellness-library data.
  Object.values(CATEGORY_INFO),
  COST_TEXT,
  SOURCES.map(({ notes }) => notes),
  ["LifeZoi guided sessions", "Free YouTube yoga classes (Chair Yoga Studio)", "Yoga.org schedule"],
  VIDEOS.map(({ description }) => description),
  reviewQueue()
    .map(({ problem }) => problem)
    .filter((problem) => !problem.startsWith("Same video as ")),
  // The habit picker on the practice page.
  LIFE_HABITS.map(({ title, detail }) => [title, detail]),
];
export default sources;
