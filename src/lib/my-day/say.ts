import { msg } from "@/lib/i18n/translate";

type Translate = (english: string, values?: Record<string, string | number>) => string;

/**
 * Sentences that My Day joins onto catalog text in `plan.ts`. They are listed here so the
 * catalog check finds them. The English strings in `plan.ts` stay as they are.
 */
export const JOINED_TEXT = [
  msg("The film plays on its Movement Studio page. This page does not add a play button."),
  msg("Use a meal you already know how to make. Vegetables, a protein food you already eat, and a starch can share the plate."),
  msg("A smaller plate of a meal you already make is enough."),
  msg("You reported vegetables {frequency}. The nutrition lesson is a place to read, not a menu."),
  msg("Portions stay the ones already saved."),
];

const VEGETABLES = /^You reported vegetables (.+)\. The nutrition lesson is a place to read, not a menu\.$/;

/**
 * Translate text that My Day built by joining whole sentences from the catalogs, such as a lesson
 * summary followed by a fixed note, or "Open" and a meal title. Each run of sentences that has a
 * translation is translated on its own. English comes back unchanged.
 */
export function sayJoined(t: Translate, text: string, english: boolean): string {
  if (english || !text) return text;
  const known = (part: string) => t(part) !== part;
  if (known(text)) return t(text);
  const open = /^Open (.+)$/.exec(text);
  if (open && known(open[1])) return t("Open {title}", { title: t(open[1]) });
  const sentences = text.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g)?.map((part) => part.trim()) ?? [text];
  const out: string[] = [];
  let index = 0;
  while (index < sentences.length) {
    let taken = 0;
    for (let end = sentences.length; end > index; end -= 1) {
      const run = sentences.slice(index, end).join(" ");
      const vegetables = VEGETABLES.exec(run);
      if (vegetables) {
        const label = vegetables[1];
        const capital = label.charAt(0).toUpperCase() + label.slice(1);
        const word = (known(label) ? t(label) : known(capital) ? t(capital) : label).toLowerCase();
        out.push(t("You reported vegetables {frequency}. The nutrition lesson is a place to read, not a menu.", { frequency: word }));
        taken = end - index;
        break;
      }
      if (known(run)) {
        out.push(t(run));
        taken = end - index;
        break;
      }
      // A step heading such as "Neck." is in the catalog without its full stop.
      if (end === index + 1 && run.endsWith(".") && known(run.slice(0, -1))) {
        out.push(`${t(run.slice(0, -1))}.`);
        taken = 1;
        break;
      }
    }
    if (!taken) {
      out.push(sentences[index]);
      taken = 1;
    }
    index += taken;
  }
  return out.join(" ");
}
