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
  reason: string;
  href: string;
};

const GENERAL: FocusCard[] = [
  {
    id: "habits",
    title: "How a habit is built",
    reason: "No completed assessment is stored in this tab. The habit lesson is a useful start, and the full library stays open.",
    href: "/wellness-coach",
  },
  {
    id: "meals",
    title: "Meal skills",
    reason: "Planning, portions, and shopping are educational modules. They do not set a calorie target.",
    href: "/academy/meals/planning",
  },
  {
    id: "move",
    title: "Movement you can modify",
    reason: "Walking, chair stands, and balance options are listed with ways to make them smaller.",
    href: "/academy/move",
  },
];

export function coachingFocus(answers: Assessment | null): FocusCard[] {
  if (!answers) return GENERAL;
  const cards: FocusCard[] = [];
  const sleepHours = Number(answers.sleepHours);
  const activityDays = Number(answers.activityDays);

  if (answers.ageRange === "60-69" || answers.ageRange === "70+") {
    cards.push({
      id: "aging",
      title: "Strength, balance, and daily tasks",
      reason: `You reported an age range of ${ageLabels[answers.ageRange]}. CDC’s older-adult guidance is listed first. Skip any move that does not fit your body. A person’s worth does not depend on physical ability.`,
      href: "/choices/muscles",
    });
  }
  if (answers.hydration === "rarely" || answers.hydration === "some") {
    cards.push({
      id: "hydration",
      title: "Hydration routine",
      reason: `You reported water ${hydrationLabels[answers.hydration].toLowerCase()}. The coach teaches a bottle cue. It does not assign an amount, and a medical fluid limit comes first.`,
      href: "/wellness-coach/hydration",
    });
  }
  if (answers.vegetables === "rarely" || answers.vegetables === "some-days") {
    cards.push({
      id: "vegetables",
      title: "Vegetables, fruit, and fiber",
      reason: `You reported vegetables ${vegetableLabels[answers.vegetables].toLowerCase()}. The food modules start with one food you already like.`,
      href: "/wellness-coach/food",
    });
  }
  if (
    (Number.isFinite(sleepHours) && (sleepHours < 7 || sleepHours > 9)) ||
    answers.sleepQuality === "poor" ||
    answers.sleepQuality === "fair"
  ) {
    const quality = answers.sleepQuality ? sleepQualityLabels[answers.sleepQuality] : "a sleep note";
    cards.push({
      id: "sleep",
      title: "Sleep routine",
      reason: `You reported about ${answers.sleepHours || "an unstated number of"} hours, with sleep that felt “${quality}.” NHLBI describes a 7 to 9 hour range for adults and says a doctor can help if sleep stays off. This is not a diagnosis.`,
      href: "/choices/sleep",
    });
  }
  if (Number.isFinite(activityDays) && activityDays < 5) {
    cards.push({
      id: "walking",
      title: "Short walks and breaks from sitting",
      reason: `You reported activity on ${answers.activityDays || "0"} days in a typical week. CDC says some activity is better than none, and that time can be split up.`,
      href: "/habits/walking",
    });
  }
  if (answers.stress === "high" || answers.stress === "moderate") {
    cards.push({
      id: "stress",
      title: "Stress and food cues",
      reason: `You reported stress as “${stressLabels[answers.stress]}.” The notes are coping ideas from NIMH. They are not mental health treatment.`,
      href: "/choices/stress",
    });
  }
  if (answers.smoking === "daily" || answers.smoking === "some-days") {
    cards.push({
      id: "smoking",
      title: "Smoking information and free support",
      reason: `You reported smoking ${smokingLabels[answers.smoking].toLowerCase()}. CDC describes benefits of quitting at any age. There is no shame, and lifeZoi does not change medication.`,
      href: "/choices/tobacco-alcohol",
    });
  }
  if (answers.alcohol === "most-weeks") {
    cards.push({
      id: "alcohol",
      title: "Alcohol information",
      reason: `You reported alcohol ${alcoholLabels[answers.alcohol].toLowerCase()}. NIAAA’s public pages describe effects and where to find treatment information. lifeZoi does not assign a drink quota.`,
      href: "/choices/tobacco-alcohol",
    });
  }
  if (answers.goals.includes("eating") || answers.goals.includes("walk")) {
    cards.push({
      id: "weight-education",
      title: "Weight and eating education",
      reason:
        "You included eating or walking among your focus areas. The academy explains planning and movement. It does not set a calorie target or promise weight change.",
      href: "/academy/meals/planning",
    });
  }
  cards.push({
    id: "heart-glucose",
    title: "Heart and blood sugar education",
    reason:
      "These pages explain public statements about food patterns, sugary drinks, activity, and alcohol. They are not a diagnosis of heart disease or diabetes, and they do not set a glucose number.",
    href: "/choices/sugar",
  });
  if (cards.length === 1) {
    return [...GENERAL, ...cards];
  }
  return cards;
}
