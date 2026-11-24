import { msg } from "@/lib/i18n/translate";
import type { LessonPractice } from "@/lib/growth-academy/types";

/**
 * Built-in practice feedback. No AI and no network call: it looks for the
 * lesson's own cue words and gives kind, specific notes. It never scores,
 * judges, or criticises an answer.
 */
export type PracticeFeedback = {
  /** Positive notes from the lesson's cues. Lesson text, in English. */
  notes: string[];
  /** A general note (translated with `t`). */
  general: string;
};

export const FEEDBACK_EMPTY = msg("Write a few words or pick an example, then press Get feedback.");
export const FEEDBACK_SHORT = msg("Short answers are fine. If you like, add one detail about what you would say or do.");
export const FEEDBACK_GOOD = msg("Thank you for practicing. Compare your answer with the points below and keep what feels right for you.");

export function words(text: string): string[] {
  return text.toLowerCase().normalize("NFKC").match(/[\p{L}\p{N}']+/gu) ?? [];
}

export function practiceFeedback(text: string, practice: LessonPractice): PracticeFeedback {
  const clean = text.trim();
  if (!clean) return { notes: [], general: FEEDBACK_EMPTY };
  const tokens = words(clean);
  const notes = (practice.cues ?? [])
    .filter((cue) => cue.anyOf.some((phrase) => containsPhrase(tokens, words(phrase))))
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
