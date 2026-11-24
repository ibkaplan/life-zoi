import { STORIES } from "@/lib/encyclopedia/stories";

/**
 * Data from the "encyclopedia" area that pages show through `t(value)`.
 * Every text string found in these values must have a translation in catalog/<locale>/encyclopedia.json.
 * Real Stories are translated in full. Source titles, publishers, and video titles stay in their
 * original language, so they are not listed here.
 */
const sources: unknown[] = [STORIES.map((story) => [story.title, story.teaser, story.place, story.story, story.science.map((item) => item.point), story.limits])];
export default sources;
