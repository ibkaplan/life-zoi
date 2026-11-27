import { msg } from "@/lib/i18n/translate";
import { CUE_SEPARATOR, cueKey } from "@/lib/growth-academy/lesson-text";
import type { FeedbackCue, LessonPractice } from "@/lib/growth-academy/types";

/**
 * Built-in practice feedback. No AI and no network call: it looks for the
 * lesson's own cue words and gives kind, specific notes. It never scores,
 * judges, or criticises an answer.
 */
export type PracticeFeedback = {
  /** Positive notes from the lesson's cues. Lesson text in English; the page shows it with `t`. */
  notes: string[];
  /** A general note (translated with `t`). */
  general: string;
};

export const FEEDBACK_EMPTY = msg("Write a few words or pick an example, then press Get feedback.");
export const FEEDBACK_SHORT = msg("Short answers are fine. If you like, add one detail about what you would say or do.");
export const FEEDBACK_GOOD = msg("Thank you for practicing. Compare your answer with the points below and keep what feels right for you.");

/**
 * Lower-case words without accents, so "Ευχαριστώ" matches "ευχαριστω" and
 * "ещё" matches "еще". The typographic apostrophe counts as an apostrophe.
 */
export function words(text: string): string[] {
  return (
    text
      .toLowerCase()
      .normalize("NFKC")
      .normalize("NFD")
      .replace(/\p{M}+/gu, "")
      .replace(/\u2019/g, "'")
      .match(/[\p{L}\p{N}']+/gu) ?? []
  );
}

/** Looks up translated text; returns undefined when there is none. */
export type CueLookup = (key: string) => string | undefined;

/**
 * The phrases one cue looks for: its English words plus, in another language,
 * the translated list stored under `cueKey(cue)` ("cue: спасиб | благодар").
 * English is always kept, so an answer typed in English still gets its note.
 */
export function cuePhrases(cue: FeedbackCue, lookup?: CueLookup): string[] {
  const translated = lookup?.(cueKey(cue));
  if (!translated || !translated.startsWith("cue: ")) return cue.anyOf;
  const local = translated
    .slice("cue: ".length)
    .split(CUE_SEPARATOR.trim())
    .map((phrase) => phrase.trim())
    .filter(Boolean);
  return [...local, ...cue.anyOf];
}

export function practiceFeedback(text: string, practice: LessonPractice, lookup?: CueLookup): PracticeFeedback {
  const clean = text.trim();
  if (!clean) return { notes: [], general: FEEDBACK_EMPTY };
  const tokens = words(clean);
  const notes = (practice.cues ?? [])
    .filter((cue) => cuePhrases(cue, lookup).some((phrase) => containsPhrase(tokens, words(phrase))))
    .map((cue) => cue.say);
  const general = tokens.length < 4 ? FEEDBACK_SHORT : FEEDBACK_GOOD;
  return { notes: [...new Set(notes)], general };
}

/**
 * True when the answer contains the phrase as whole words. The last word may
 * also match a longer word when it has four or more letters ("thank" matches
 * "thanks", "listen" matches "listening"), but "and" never matches "android".
 */
export function containsPhrase(tokens: string[], phrase: string[]): boolean {
  if (phrase.length === 0) return false;
  for (let start = 0; start + phrase.length <= tokens.length; start += 1) {
    let ok = true;
    for (let i = 0; i < phrase.length; i += 1) {
      const token = tokens[start + i] as string;
      const want = phrase[i] as string;
      const last = i === phrase.length - 1;
      if (token === want || (last && want.length >= 4 && token.startsWith(want))) continue;
      ok = false;
      break;
    }
    if (ok) return true;
  }
  return false;
}
