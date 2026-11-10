import { STEP_IDS, type StepId } from "@/lib/types";
import { makeTranslate, type Translate } from "@/lib/i18n/translate";

const english = makeTranslate(null);

/**
 * Plain names for every assessment answer that can show a validation message.
 * The wizard uses them to say exactly which question needs attention, and to
 * move the person to it, even when the message comes from another step.
 * Kept here, not in the component, so the translation catalogs have one place to read.
 * Labels and nouns are English keys; `t` turns them into the chosen language.
 */
export const ASSESSMENT_FIELDS: Record<string, { label: string; step: StepId; noun?: string }> = {
  displayName: { label: "What should lifeZoi call you?", step: "about", noun: "your name" },
  exactAge: { label: "How old are you?", step: "about", noun: "your age" },
  heightCm: { label: "What is your height in centimeters?", step: "about", noun: "your height in centimeters" },
  weightKg: { label: "What is your current weight in kilograms?", step: "about", noun: "your weight in kilograms" },
  desiredWeightKg: { label: "What weight would you like to reach, in kilograms?", step: "about", noun: "your desired weight in kilograms" },
  sleepHours: { label: "How many hours do you sleep on a typical night?", step: "sleep", noun: "your hours of sleep" },
  sleepQuality: { label: "How does that sleep usually feel?", step: "sleep" },
  activityDays: { label: "On how many days in a typical week are you physically active?", step: "movement", noun: "the number of active days" },
  activityMinutes: { label: "About how many minutes are you active on those days?", step: "movement", noun: "the minutes on those days" },
  sedentaryHours: { label: "How many hours a day do you sit or recline while awake?", step: "movement", noun: "your sitting hours" },
  vegetables: { label: "Vegetables or fruit", step: "nourishment" },
  hydration: { label: "Water across the day", step: "nourishment" },
  stress: { label: "Stress lately", step: "mind" },
  mood: { label: "Mood lately", step: "mind" },
  social: { label: "Connection with other people", step: "mind" },
  goals: { label: "Habits to track day by day (choose one or more)", step: "goals" },
  habitNote: { label: "Anything you want to remember", step: "goals" },
  purposeHope: { label: "What would you like your health to help you experience or accomplish?", step: "goals" },
};

export function fieldLabel(field: string, t: Translate = english): string {
  return t(ASSESSMENT_FIELDS[field]?.label ?? "This question");
}

/** The step a field is shown on, or null for form-level messages such as `form`. */
export function fieldStep(field: string): StepId | null {
  return ASSESSMENT_FIELDS[field]?.step ?? null;
}

/**
 * Turns a validation message into one that names the question. The validation
 * rules and their messages are unchanged; this only adds the missing context.
 */
export function friendlyError(
  field: string,
  message: string,
  t: Translate = english,
  /** Translates a message this function leaves as it is, such as a range message. */
  fallback: (message: string) => string = (text) => text,
): string {
  const entry = ASSESSMENT_FIELDS[field];
  if (!entry) return fallback(message);
  const question = t(entry.label).replace(/\s*\(.*\)$/, "");
  const end = /[?.!;]$/.test(question) ? "" : ".";
  if (/^Choose the option that fits best\.?$/i.test(message)) {
    return t("Please choose an answer for “{question}”{end}", { question, end });
  }
  if (/^Choose at least one/i.test(message)) {
    return t("Please choose at least one option for “{question}”{end}", { question, end });
  }
  if (/^Add .+\.$/.test(message) && entry.noun) {
    return t("Please enter {noun}.", { noun: t(entry.noun) });
  }
  return fallback(message);
}

/** Error fields in the order the questions appear, step by step, so the first one is the one to show. */
export function orderedErrorFields(errors: Record<string, string>): string[] {
  const order = Object.keys(ASSESSMENT_FIELDS);
  return Object.keys(errors)
    .filter((field) => field !== "form" && errors[field])
    .sort((a, b) => {
      const stepA = STEP_IDS.indexOf(fieldStep(a) ?? "review");
      const stepB = STEP_IDS.indexOf(fieldStep(b) ?? "review");
      if (stepA !== stepB) return stepA - stepB;
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      return (ia === -1 ? order.length : ia) - (ib === -1 ? order.length : ib);
    });
}
