import type { FeedbackCue, GrowthLesson } from "@/lib/growth-academy/types";

/**
 * Every lesson-body sentence a reader sees, in page order. The catalog test
 * (through `src/lib/i18n/sources/growth-academy.ts`) requires a Ukrainian,
 * Russian, and Greek translation of each one in
 * `src/lib/i18n/catalog/<locale>/growth-<course>-lessons.json`.
 */
export function lessonBodyText(lesson: GrowthLesson): string[] {
  const out: string[] = [];
  const add = (text: string | undefined) => {
    if (text) out.push(text);
  };
  lesson.intro.forEach(add);
  add(lesson.care);
  for (const section of lesson.learn) {
    add(section.heading);
    section.paragraphs.forEach(add);
    section.bullets?.forEach(add);
  }
  add(lesson.example.title);
  lesson.example.story.forEach(add);
  add(lesson.example.point);
  add(lesson.exercise.title);
  lesson.exercise.steps.forEach(add);
  for (const field of lesson.exercise.fields) {
    add(field.label);
    add(field.placeholder);
  }
  add(lesson.practice.prompt);
  for (const example of lesson.practice.examples) {
    add(example.text);
    add(example.why);
  }
  lesson.practice.lookFors.forEach(add);
  for (const cue of lesson.practice.cues ?? []) add(cue.say);
  lesson.reflection.forEach(add);
  lesson.takeaways.forEach(add);
  return out;
}

export const CUE_SEPARATOR = " | ";

/**
 * Catalog key for one feedback cue's words. The translation lists words or
 * short phrases in that language, separated by " | ", for example
 * "cue: thank | thanks" → "спасиб | благодар". A word of four or more letters
 * also matches longer words that start with it, so a stem covers its endings.
 */
export function cueKey(cue: FeedbackCue): string {
  return `cue: ${cue.anyOf.join(CUE_SEPARATOR)}`;
}
