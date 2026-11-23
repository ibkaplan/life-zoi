import { foldForSafety, isUrgentMessage } from "@/lib/assistant";
import { detectCrisis } from "@/lib/emotional-wellness/crisis";
import type { CrisisKind } from "@/lib/emotional-wellness/types";

/**
 * LifeZoi Mind safety checks. These run before any other reply, in the browser,
 * and do not call a model. They reuse the Emotional Wellness crisis patterns and
 * add a softer "severe distress" check that keeps the conversation going but
 * puts the 988 information in front of the person.
 *
 * This check has not been reviewed by a licensed clinician. The 988 and 911
 * wording is for the United States and still needs review before launch.
 */

export type SafetyLevel = "none" | "distress" | "crisis";

export type SafetyCheck = {
  level: SafetyLevel;
  kinds: CrisisKind[];
};

const SEVERE_DISTRESS = [
  /\b(can'?t|cannot) (go on|take (it|this) any ?more|cope any ?more|do this any ?more|keep going)\b/i,
  /\b(feel|feeling|am|i'm) (completely |totally )?hopeless\b/i,
  /\bno way out\b/i,
  /\bnothing (will ever|is ever going to) (get|be) better\b/i,
  /\b(everyone|everybody) would be better off without me\b/i,
  /\bi('m| am) a burden\b/i,
  /\bfalling apart\b/i,
  /\bbreaking down\b/i,
  /\bpanic attack\b/i,
];

/**
 * Suicide and self-harm wording in Ukrainian, Russian, and Greek, matched on folded text.
 * Mind's replies are in English for now, but people may still type or speak in their own
 * language, and a crisis must never be missed because of that. Other urgent wording from
 * the assistant's shared check (for example chest pain) is treated as a medical emergency.
 */
const SUICIDE_LOCAL =
  /суицид|суіцид|самогубств|самоуби|вбити себе|убить себя|покінчити з собою|покончить с собой|хочу померти|хочу умереть|не хочу жити|не хочу жить|жить не хочу|жити не хочу|не хочу больше жить|не хочу більше жити|передозуванн|передозировк|αυτοκτον|σκοτωσω τον εαυτο μου|να σκοτωθω|θελω να πεθανω|δεν θελω να ζω/;
const SELF_HARM_LOCAL = /порезать себя|порезаться|порізати себе|порізатися|навредить себе|нашкодити собі|причинить себе вред|завдати собі шкоди|режу себя|ріжу себе|αυτοτραυματ|να κοψω τον εαυτο μου/;

/** Crisis kinds found in Ukrainian, Russian, or Greek text. */
export function detectLocalCrisis(text: string): CrisisKind[] {
  const folded = foldForSafety(text);
  const kinds: CrisisKind[] = [];
  if (SUICIDE_LOCAL.test(folded)) kinds.push("suicide");
  if (SELF_HARM_LOCAL.test(folded)) kinds.push("self-harm");
  if (kinds.length === 0 && isUrgentMessage(text) && /[\u0400-\u04ff\u0370-\u03ff]/.test(text)) kinds.push("medical-emergency");
  return kinds;
}

const NEGATION = /\b(not|no|never|don't|dont|do not|isn't|wasn't)\s+\w*\s*$/i;

export function checkSafety(text: string): SafetyCheck {
  const value = text.replace(/\s+/g, " ").trim();
  if (!value) return { level: "none", kinds: [] };
  const kinds = detectCrisis(value);
  for (const kind of detectLocalCrisis(value)) if (!kinds.includes(kind)) kinds.push(kind);
  // "Everyone would be better off without me" is treated as possible suicidal thinking.
  if (/\b(everyone|everybody|they|my family) would be better off without me\b/i.test(value) && !kinds.includes("suicide")) {
    kinds.unshift("suicide");
  }
  if (kinds.length > 0) return { level: "crisis", kinds };
  for (const pattern of SEVERE_DISTRESS) {
    const match = pattern.exec(value);
    if (match && !NEGATION.test(value.slice(Math.max(0, match.index - 20), match.index))) {
      return { level: "distress", kinds: [] };
    }
  }
  return { level: "none", kinds: [] };
}

export type CrisisAction = { label: string; href: string; detail: string };

/** United States resources. Each link opens the phone's dialer or the official site. */
export const US_CRISIS_ACTIONS: readonly CrisisAction[] = [
  { label: "Call 988", href: "tel:988", detail: "988 Suicide & Crisis Lifeline, free, 24 hours a day" },
  { label: "Text 988", href: "sms:988", detail: "Send a text message to 988" },
  { label: "Visit 988lifeline.org", href: "https://988lifeline.org/", detail: "Chat and more information on the official site" },
  { label: "Call 911", href: "tel:911", detail: "If you or someone else is in immediate danger" },
];

export const OUTSIDE_US_LINE =
  "Outside the United States, contact your local emergency number. LifeZoi Mind does not list crisis numbers for other countries yet, and it will not guess one.";

export const STANDING_SAFETY_LINE =
  "If you are thinking about suicide or hurting yourself, or you are in danger, call or text 988 (United States) or call 911 now. LifeZoi Mind is not a crisis service.";

export type CrisisMessage = { title: string; paragraphs: string[] };

/** What LifeZoi Mind says instead of ordinary coaching when a crisis is detected. */
export function crisisMessage(kinds: readonly CrisisKind[], tr: (english: string) => string = (english) => english): CrisisMessage {
  const paragraphs: string[] = [];
  const emotional = kinds.includes("suicide") || kinds.includes("self-harm");
  const danger = kinds.includes("immediate-danger");
  const others = kinds.includes("harm-to-others");
  const medical = kinds.includes("medical-emergency");
  if (emotional) {
    paragraphs.push(
      tr("Thank you for telling me. What you just wrote matters, and you deserve real support from a person right now, not only from an app."),
      tr("Please call or text 988 to reach the 988 Suicide & Crisis Lifeline. It is free, confidential, and open 24 hours a day. If you might act on these thoughts, or you have already hurt yourself, call 911 or go to the nearest emergency department now."),
      tr("If you can, move away from anything you could use to hurt yourself, and let someone near you know how you are feeling."),
    );
  }
  if (danger) {
    paragraphs.push(tr("If you are in danger right now, call 911. If it is safe, move to a place where other people are around."));
  }
  if (others) {
    paragraphs.push(
      tr("It sounds like you may be thinking about hurting someone. Please step away from the situation now. If anyone is in immediate danger, call 911. You can also call or text 988 to talk with a trained counselor about what you are feeling."),
    );
  }
  if (medical) {
    paragraphs.push(tr("This may be a medical emergency. LifeZoi Mind cannot assess symptoms. Call 911 or go to the nearest emergency department."));
  }
  paragraphs.push(
    tr("I have paused the ordinary conversation. LifeZoi Mind is not a crisis counselor and cannot contact anyone for you. When you are safe, you are welcome to come back and keep talking."),
  );
  return { title: tr("Your safety comes first"), paragraphs };
}

export const DISTRESS_NOTE =
  "It sounds like things feel very heavy right now. If it ever starts to feel unsafe, you can call or text 988 at any time, day or night (United States).";
