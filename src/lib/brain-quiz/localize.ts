import type { Activity } from "@/lib/brain-quiz/activities";
import { NATIVE_EL } from "@/lib/brain-quiz/native-el";
import { NATIVE_RU } from "@/lib/brain-quiz/native-ru";
import type { NativeSet } from "@/lib/brain-quiz/native-types";
import { NATIVE_UK } from "@/lib/brain-quiz/native-uk";
import type { Locale } from "@/lib/i18n/config";
import { msg, type Translate } from "@/lib/i18n/translate";

export const NATIVE: Readonly<Record<Exclude<Locale, "en">, NativeSet>> = { uk: NATIVE_UK, ru: NATIVE_RU, el: NATIVE_EL };

/** Ids of activities that are written natively for every other language. */
export function nativeIds(): Set<string> {
  const sets = Object.values(NATIVE);
  const ids = Object.keys(sets[0]?.variants ?? {});
  return new Set(ids.filter((id) => sets.every((set) => Boolean(set.variants[id]))));
}

/**
 * The activity as it should be played in this language. Word puzzles, riddles, and
 * picture puzzles that depend on English spelling are swapped for native ones with the
 * same id; everything else is translated at render time with `t`.
 */
export function localizeActivity<A extends Activity>(activity: A, locale: Locale): A {
  if (locale === "en") return activity;
  const variant = NATIVE[locale].variants[activity.id];
  return variant ? ({ ...activity, ...variant } as A) : activity;
}

export function memoryWordsFor(locale: Locale): readonly string[] | undefined {
  return locale === "en" ? undefined : NATIVE[locale].memoryWords;
}

/** Titles such as "Color sequence · easy" are translated part by part. */
export function titleText(title: string, t: Translate): string {
  return title
    .split(" · ")
    .map((part) => t(part))
    .join(" · ");
}

/** Names of colors, pictures, and shapes that the games show or read aloud. */
export const THING_NAMES = [
  msg("blue"),
  msg("purple"),
  msg("teal"),
  msg("gold"),
  msg("eye"),
  msg("sun"),
  msg("moon"),
  msg("rain"),
  msg("book"),
  msg("star"),
  msg("tree"),
  msg("heart"),
  msg("hand"),
  msg("foot"),
  msg("clock"),
  msg("circle"),
  msg("square"),
  msg("triangle"),
  msg("house"),
  msg("hill"),
  msg("box"),
] as const;

/** Level and category names shown in lower case, as stored in each activity. */
export const LABEL_WORDS = [
  msg("easy"),
  msg("medium"),
  msg("hard"),
  msg("logic"),
  msg("riddles"),
  msg("memory"),
  msg("attention"),
  msg("numbers"),
  msg("words"),
  msg("habits"),
] as const;

/**
 * Result notes are saved in English so they read the same after a language change.
 * Notes that carry a value are matched to their template and translated with the value.
 */
const NOTE_TEMPLATES: readonly { pattern: RegExp; text: string }[] = [
  { pattern: /^The sequence was (.+)\.$/, text: msg("The sequence was {items}.") },
  { pattern: /^The digits were (.+)\.$/, text: msg("The digits were {items}.") },
  { pattern: /^The words were (.+)\.$/, text: msg("The words were {items}.") },
  { pattern: /^The order was (.+)\.$/, text: msg("The order was {items}.") },
  { pattern: /^The changed shapes were (.+)\.$/, text: msg("The changed shapes were {items}.") },
  { pattern: /^The missing object was (.+)\.$/, text: msg("The missing object was {items}.") },
  { pattern: /^The odd shape was number (.+)\.$/, text: msg("The odd shape was number {items}.") },
  { pattern: /^The mistake was (.+)\.$/, text: msg("The mistake was {items}.") },
  { pattern: /^The word is (.+)\.$/, text: msg("The word is {items}.") },
  { pattern: /^The word was (.+)\.$/, text: msg("The word was {items}.") },
  { pattern: /^The hidden word is (.+)\.$/, text: msg("The hidden word is {items}.") },
  { pattern: /^The hidden word was (.+)\.$/, text: msg("The hidden word was {items}.") },
];

export function listText(items: readonly string[], t: Translate): string {
  return items.map((item) => t(item)).join(", ");
}

export function noteText(note: string, t: Translate): string {
  for (const template of NOTE_TEMPLATES) {
    const match = template.pattern.exec(note);
    if (match?.[1]) return t(template.text, { items: listText(match[1].split(", "), t) });
  }
  return t(note);
}
