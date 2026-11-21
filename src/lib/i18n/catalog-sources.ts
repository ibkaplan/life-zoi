import core from "./sources/core";
import pages from "./sources/pages";
import nutrition from "./sources/nutrition";
import wellness_challenges from "./sources/wellness-challenges";
import wellness_academy from "./sources/wellness-academy";
import wellness_urges from "./sources/wellness-urges";
import brain from "./sources/brain";
import library from "./sources/library";
import companion from "./sources/companion";
import habits from "./sources/habits";
import focus from "./sources/focus";
import assistant from "./sources/assistant";

/**
 * English text that the app stores in data and shows through `t(value)`, by area.
 * The catalog test checks that every one of these has a translation, so a new
 * option or lesson cannot ship in English only. Add a data module to the area's
 * file in `./sources/` when a page starts showing it with `t`.
 */
export const AREA_SOURCES: Record<string, unknown[]> = { "core": core, "pages": pages, "nutrition": nutrition, "wellness-challenges": wellness_challenges, "wellness-academy": wellness_academy, "wellness-urges": wellness_urges, "brain": brain, "library": library, "companion": companion, "habits": habits, "focus": focus, "assistant": assistant };

/** Keys, ids, links, and other strings that are never shown as words. */
function isText(value: string): boolean {
  if (!/[A-Za-z]/.test(value)) return false;
  if (/^(https?:|\/|#|mailto:)/.test(value)) return false;
  if (/^[a-z0-9]+(?:[-_.][a-z0-9]+)*$/.test(value)) return false;
  return true;
}

function collect(value: unknown, out: Set<string>, skipKeys: ReadonlySet<string>) {
  if (typeof value === "string") {
    if (isText(value)) out.add(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collect(item, out, skipKeys);
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) if (!skipKeys.has(key)) collect(item, out, skipKeys);
  }
}

/** Fields that hold ids, links, or sources rather than text a person reads. */
export const NON_TEXT_KEYS: ReadonlySet<string> = new Set([
  "id",
  "href",
  "url",
  "src",
  "videoId",
  "youtubeId",
  "icon",
  "art",
  "slug",
  "key",
  "step",
]);

export function CATALOG_TEXT(): string[] {
  const out = new Set<string>();
  collect(Object.values(AREA_SOURCES), out, NON_TEXT_KEYS);
  return [...out];
}
