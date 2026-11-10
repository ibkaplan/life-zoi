import * as labels from "@/lib/labels";
import * as health from "@/lib/health-profile";
import { ASSESSMENT_FIELDS } from "@/lib/assessment-fields";

/**
 * English text that the app stores in data and shows through `t(value)`.
 * The catalog test checks that every one of these has a translation, so a new
 * option or lesson cannot ship in English only. Add a data module here when a
 * page starts showing it with `t`.
 */
const SOURCES: unknown[] = [
  Object.entries(labels).filter(([name]) => name.endsWith("Labels")).map(([, value]) => value),
  Object.entries(health).filter(([name]) => name.endsWith("Labels")).map(([, value]) => value),
  Object.values(ASSESSMENT_FIELDS).map(({ label, noun }) => [label, noun]),
];

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
  collect(SOURCES, out, NON_TEXT_KEYS);
  return [...out];
}
