import { fmt } from "@/lib/i18n/config";
import { msg, type Translate } from "@/lib/i18n/translate";
import {
  ageLabels,
  alcoholLabels,
  hydrationLabels,
  sleepQualityLabels,
  smokingLabels,
  stressLabels,
  vegetableLabels,
} from "@/lib/labels";
import type { Assessment } from "@/lib/types";

export type FocusCard = {
  id: string;
  title: string;
  /** The English reason, filled in. */
  reason: string;
  /** For a reason built from answers: the English template and the raw answer labels, so it can be translated. */
  reasonTemplate?: string;
  reasonValues?: Record<string, string>;
  href: string;
};

const GENERAL: FocusCard[] = [
  {
    id: "habits",
    title: msg("How a habit is built"),
    reason: msg("No completed assessment is stored in this tab. The habit lesson is a useful start, and the full library stays open."),
    href: "/wellness-coach",
  },
  {
    id: "meals",
    title: msg("Meal skills"),
    reason: msg("Planning, portions, and shopping are educational modules. They do not set a calorie target."),
    href: "/academy/meals/planning",
  },
  {
    id: "move",
    title: msg("Movement you can modify"),
    reason: msg("Walking, chair stands, and balance options are listed with ways to make them smaller."),
    href: "/academy/move",
  },
];

/** The card's title in the current language. */
export function focusTitle(card: FocusCard, t: Translate): string {
  return t(card.title);
}

/**
 * The card's reason in the current language. English keeps the exact reason text.
 * Other languages get the translated template with each answer label translated.
 */
export function focusReason(card: FocusCard, t: Translate): string {
  if (!card.reasonTemplate) return t(card.reason);
  const translated = t(card.reasonTemplate);
  if (translated === card.reasonTemplate) return card.reason;
  const values = Object.fromEntries(Object.entries(card.reasonValues ?? {}).map(([key, value]) => [key, t(value)]));
  return fmt(translated, values);
}

export function coachingFocus(answers: Assessment | null): FocusCard[] {
  if (!answers) return GENERAL;
  const cards: FocusCard[] = [];
  const sleepHours = Number(answers.sleepHours);
  const activityDays = Number(answers.activityDays);

  if (answers.ageRange === "60-69" || answers.ageRange === "70+") {
    cards.push({
      id: "aging",
      title: msg("Strength, balance, and daily tasks"),
      reason: `You reported an age range of ${ageLabels[answers.ageRange]}. CDC’s older-adult guidance is listed first. Skip any move that does not fit your body. A person’s worth does not depend on physical ability.`,
      reasonTemplate: msg(
        "You reported an age range of {age}. CDC’s older-adult guidance is listed first. Skip any move that does not fit your body. A person’s worth does not depend on physical ability.",
      ),
      reasonValues: { age: ageLabels[answers.ageRange] },
      href: "/choices/muscles",
    });
  }
  if (answers.hydration === "rarely" || answers.hydration === "some") {
    cards.push({
      id: "hydration",
      title: msg("Hydration routine"),
      reason: `You reported water ${hydrationLabels[answers.hydration].toLowerCase()}. The coach teaches a bottle cue. It does not assign an amount, and a medical fluid limit comes first.`,
      reasonTemplate: msg(
        "You reported water {answer}. The coach teaches a bottle cue. It does not assign an amount, and a medical fluid limit comes first.",
      ),
      reasonValues: { answer: hydrationLabels[answers.hydration] },
      href: "/wellness-coach/hydration",
    });
  }
  if (answers.vegetables === "rarely" || answers.vegetables === "some-days") {
    cards.push({
      id: "vegetables",
      title: msg("Vegetables, fruit, and fiber"),
      reason: `You reported vegetables ${vegetableLabels[answers.vegetables].toLowerCase()}. The food modules start with one food you already like.`,
      reasonTemplate: msg("You reported vegetables {answer}. The food modules start with one food you already like."),
      reasonValues: { answer: vegetableLabels[answers.vegetables] },
      href: "/wellness-coach/food",
    });
  }
  if (
    (Number.isFinite(sleepHours) && (sleepHours < 7 || sleepHours > 9)) ||
    answers.sleepQuality === "poor" ||
    answers.sleepQuality === "fair"
  ) {
    const quality = answers.sleepQuality ? sleepQualityLabels[answers.sleepQuality] : "a sleep note";
    const reasonTemplate = answers.sleepHours
      ? answers.sleepQuality
        ? msg(
            "You reported about {hours} hours, with sleep that felt “{quality}.” NHLBI describes a 7 to 9 hour range for adults and says a doctor can help if sleep stays off. This is not a diagnosis.",
          )
        : msg(
            "You reported about {hours} hours, with sleep that felt “a sleep note.” NHLBI describes a 7 to 9 hour range for adults and says a doctor can help if sleep stays off. This is not a diagnosis.",
          )
      : answers.sleepQuality
        ? msg(
            "You reported about an unstated number of hours, with sleep that felt “{quality}.” NHLBI describes a 7 to 9 hour range for adults and says a doctor can help if sleep stays off. This is not a diagnosis.",
          )
        : msg(
            "You reported about an unstated number of hours, with sleep that felt “a sleep note.” NHLBI describes a 7 to 9 hour range for adults and says a doctor can help if sleep stays off. This is not a diagnosis.",
          );
    cards.push({
      id: "sleep",
      title: msg("Sleep routine"),
      reason: `You reported about ${answers.sleepHours || "an unstated number of"} hours, with sleep that felt “${quality}.” NHLBI describes a 7 to 9 hour range for adults and says a doctor can help if sleep stays off. This is not a diagnosis.`,
      reasonTemplate,
      reasonValues: { hours: answers.sleepHours, quality },
      href: "/choices/sleep",
    });
  }
  if (Number.isFinite(activityDays) && activityDays < 5) {
    cards.push({
      id: "walking",
      title: msg("Short walks and breaks from sitting"),
      reason: `You reported activity on ${answers.activityDays || "0"} days in a typical week. CDC says some activity is better than none, and that time can be split up.`,
      reasonTemplate: msg(
        "You reported activity on {days} days in a typical week. CDC says some activity is better than none, and that time can be split up.",
      ),
      reasonValues: { days: answers.activityDays || "0" },
      href: "/habits/walking",
    });
  }
  if (answers.stress === "high" || answers.stress === "moderate") {
    cards.push({
      id: "stress",
      title: msg("Stress and food cues"),
      reason: `You reported stress as “${stressLabels[answers.stress]}.” The notes are coping ideas from NIMH. They are not mental health treatment.`,
      reasonTemplate: msg(
        "You reported stress as “{answer}.” The notes are coping ideas from NIMH. They are not mental health treatment.",
      ),
      reasonValues: { answer: stressLabels[answers.stress] },
      href: "/choices/stress",
    });
  }
  if (answers.smoking === "daily" || answers.smoking === "some-days") {
    cards.push({
      id: "smoking",
      title: msg("Smoking information and free support"),
      reason: `You reported smoking ${smokingLabels[answers.smoking].toLowerCase()}. CDC describes benefits of quitting at any age. There is no shame, and lifeZoi does not change medication.`,
      reasonTemplate: msg(
        "You reported smoking {answer}. CDC describes benefits of quitting at any age. There is no shame, and lifeZoi does not change medication.",
      ),
      reasonValues: { answer: smokingLabels[answers.smoking] },
      href: "/choices/tobacco-alcohol",
    });
  }
  if (answers.alcohol === "most-weeks") {
    cards.push({
      id: "alcohol",
      title: msg("Alcohol information"),
      reason: `You reported alcohol ${alcoholLabels[answers.alcohol].toLowerCase()}. NIAAA’s public pages describe effects and where to find treatment information. lifeZoi does not assign a drink quota.`,
      reasonTemplate: msg(
        "You reported alcohol {answer}. NIAAA’s public pages describe effects and where to find treatment information. lifeZoi does not assign a drink quota.",
      ),
      reasonValues: { answer: alcoholLabels[answers.alcohol] },
      href: "/choices/tobacco-alcohol",
    });
  }
  if (answers.goals.includes("eating") || answers.goals.includes("walk")) {
    cards.push({
      id: "weight-education",
      title: msg("Weight and eating education"),
      reason: msg(
        "You included eating or walking among your focus areas. The academy explains planning and movement. It does not set a calorie target or promise weight change.",
      ),
      href: "/academy/meals/planning",
    });
  }
  cards.push({
    id: "heart-glucose",
    title: msg("Heart and blood sugar education"),
    reason: msg(
      "These pages explain public statements about food patterns, sugary drinks, activity, and alcohol. They are not a diagnosis of heart disease or diabetes, and they do not set a glucose number.",
    ),
    href: "/choices/sugar",
  });
  if (cards.length === 1) {
    return [...GENERAL, ...cards];
  }
  return cards;
}
