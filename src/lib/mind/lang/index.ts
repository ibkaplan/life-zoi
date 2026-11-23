import type { Locale } from "@/lib/i18n/config";
import ru from "./ru.json";
import { russianCues } from "./ru-cues";
import uk from "./uk.json";
import { ukrainianCues } from "./uk-cues";

/**
 * Languages LifeZoi Mind's written conversation can hold. Others see the English
 * conversation, with a note in their own language.
 */
export type MindLang = "en" | "ru" | "uk";

export type MindTranslate = (english: string, values?: Record<string, string | number>) => string;

export const MIND_TEXT: Record<Exclude<MindLang, "en">, Record<string, string>> = { ru, uk };

export function mindLangFor(locale: Locale): MindLang {
  return locale === "ru" || locale === "uk" ? locale : "en";
}

function fill(text: string, values?: Record<string, string | number>): string {
  if (!values) return text;
  return text.replace(/\{(\w+)\}/g, (whole, key: string) => (key in values ? String(values[key]) : whole));
}

const identity: MindTranslate = (english, values) => fill(english, values);

/** Translates the conversation's English text. Anything without a translation stays in English. */
export function mindTranslator(lang: MindLang): MindTranslate {
  if (lang === "en") return identity;
  const table = MIND_TEXT[lang];
  return (english, values) => fill(table[english] ?? english, values);
}

/** The keywords the conversation's patterns read, for a message in `lang`. */
export function mindCues(lang: MindLang, text: string): string {
  return lang === "ru" ? russianCues(text) : lang === "uk" ? ukrainianCues(text) : text;
}
