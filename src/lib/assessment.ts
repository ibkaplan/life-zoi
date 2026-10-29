export const GOALS = [
  { id: "sleep", label: "Sleep", hint: "A more restful routine" },
  { id: "movement", label: "Movement", hint: "A bit more walking or activity" },
  { id: "food", label: "Everyday eating", hint: "Meals you can keep up" },
  { id: "stress", label: "Stress", hint: "A calmer response to busy days" },
  { id: "connection", label: "People", hint: "More contact that feels good" },
  { id: "tobacco", label: "Tobacco", hint: "Cutting back or stopping" },
  { id: "alcohol", label: "Alcohol", hint: "Drinking less, if you drink" },
  { id: "energy", label: "Daytime energy", hint: "Feeling more steady through the day" },
] as const;

export type GoalId = (typeof GOALS)[number]["id"];

export const SLEEP_HOUR_OPTIONS = [
  { value: "under-6", label: "Under 6 hours" },
  { value: "6-7", label: "About 6 to 7 hours" },
  { value: "7-9", label: "About 7 to 9 hours" },
  { value: "over-9", label: "More than 9 hours" },
] as const;

export const SLEEP_QUALITY_OPTIONS = [
  { value: "restless", label: "Often restless" },
  { value: "mixed", label: "Mixed" },
  { value: "usually-rested", label: "Usually rested" },
] as const;

export const ACTIVITY_OPTIONS = [
  { value: "none", label: "I rarely do intentional activity" },
  { value: "1-2", label: "1 to 2 days a week" },
  { value: "3-4", label: "3 to 4 days a week" },
  { value: "5-plus", label: "5 or more days a week" },
] as const;

export const SEDENTARY_OPTIONS = [
  { value: "little", label: "I sit for short stretches" },
  { value: "some", label: "I sit for part of the day" },
  { value: "most-of-day", label: "I sit for most of the day" },
] as const;

export const PLANTS_OPTIONS = [
  { value: "rarely", label: "Rarely" },
  { value: "some-days", label: "Some days" },
  { value: "most-days", label: "Most days" },
] as const;

export const MEAL_OPTIONS = [
  { value: "irregular", label: "Mealtimes are irregular" },
  { value: "mixed", label: "A mix of regular and irregular" },
  { value: "mostly-regular", label: "Mostly regular" },
] as const;

export const HYDRATION_OPTIONS = [
  { value: "rarely", label: "I rarely choose water" },
  { value: "sometimes", label: "Sometimes" },
  { value: "often", label: "Water is a usual drink" },
] as const;

export const SMOKING_OPTIONS = [
  { value: "never", label: "I have never smoked regularly" },
  { value: "former", label: "I used to smoke, and do not now" },
  { value: "some-days", label: "I smoke on some days" },
  { value: "daily", label: "I smoke daily" },
  { value: "skip", label: "Prefer not to say" },
] as const;

export const ALCOHOL_OPTIONS = [
  { value: "none", label: "I do not drink alcohol" },
  { value: "occasional", label: "Occasionally" },
  { value: "weekly", label: "About weekly" },
  { value: "most-days", label: "Most days" },
  { value: "skip", label: "Prefer not to say" },
] as const;

export const STRESS_OPTIONS = [
  { value: "low", label: "Mostly manageable" },
  { value: "moderate", label: "Often noticeable" },
  { value: "high", label: "High on many days" },
] as const;

export const MOOD_OPTIONS = [
  { value: "low", label: "Low lately" },
  { value: "mixed", label: "Mixed" },
  { value: "steady", label: "Mostly steady" },
  { value: "skip", label: "Prefer not to say" },
] as const;

export const SOCIAL_OPTIONS = [
  { value: "limited", label: "Limited contact" },
  { value: "some", label: "Some contact" },
  { value: "regular", label: "Regular contact that feels supportive" },
] as const;

export const AGE_OPTIONS = [
  { value: "18-29", label: "18 to 29" },
  { value: "30-44", label: "30 to 44" },
  { value: "45-59", label: "45 to 59" },
  { value: "60-plus", label: "60 or older" },
  { value: "skip", label: "Prefer not to say" },
] as const;

type OptionValue<T extends readonly { value: string }[]> = T[number]["value"];

export type Answers = {
  goals: GoalId[];
  goalNote: string;
  sleepHours: OptionValue<typeof SLEEP_HOUR_OPTIONS> | "";
  sleepQuality: OptionValue<typeof SLEEP_QUALITY_OPTIONS> | "";
  activityDays: OptionValue<typeof ACTIVITY_OPTIONS> | "";
  sedentary: OptionValue<typeof SEDENTARY_OPTIONS> | "";
  plants: OptionValue<typeof PLANTS_OPTIONS> | "";
  mealRhythm: OptionValue<typeof MEAL_OPTIONS> | "";
  hydration: OptionValue<typeof HYDRATION_OPTIONS> | "";
  smoking: OptionValue<typeof SMOKING_OPTIONS> | "";
  alcohol: OptionValue<typeof ALCOHOL_OPTIONS> | "";
  stress: OptionValue<typeof STRESS_OPTIONS> | "";
  mood: OptionValue<typeof MOOD_OPTIONS> | "";
  social: OptionValue<typeof SOCIAL_OPTIONS> | "";
  ageRange: OptionValue<typeof AGE_OPTIONS> | "";
};

export type FieldError = { field: string; message: string };

export const STEPS = [
  { id: "intro", title: "Before you start" },
  { id: "goals", title: "What you want to work on" },
  { id: "sleep", title: "Sleep" },
  { id: "movement", title: "Movement" },
  { id: "eating", title: "Eating and drinking" },
  { id: "substances", title: "Tobacco and alcohol" },
  { id: "mind", title: "Stress and connection" },
  { id: "about", title: "About you" },
  { id: "review", title: "Review" },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

const GOAL_NOTE_MAX = 280;

export function emptyAnswers(): Answers {
  return {
    goals: [],
    goalNote: "",
    sleepHours: "",
    sleepQuality: "",
    activityDays: "",
    sedentary: "",
    plants: "",
    mealRhythm: "",
    hydration: "",
    smoking: "",
    alcohol: "",
    stress: "",
    mood: "",
    social: "",
    ageRange: "",
  };
}

function valuesOf<T extends string>(options: readonly { value: T }[]): T[] {
  return options.map((option) => option.value);
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | "" | null {
  if (value === "" || value === undefined) return "";
  if (typeof value === "string" && allowed.includes(value as T)) return value as T;
  return null;
}

function cleanNote(value: unknown): string | null {
  if (value === undefined) return "";
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
  if (trimmed.length > GOAL_NOTE_MAX) return null;
  return trimmed;
}

export function parseAnswers(input: unknown): { ok: true; answers: Answers } | { ok: false; errors: FieldError[] } {
  if (!input || typeof input !== "object") {
    return { ok: false, errors: [{ field: "answers", message: "Enter the assessment before saving it." }] };
  }
  const raw = input as Record<string, unknown>;
  const errors: FieldError[] = [];

  const goalIds = GOALS.map((goal) => goal.id);
  let goals: GoalId[] = [];
  if (!Array.isArray(raw.goals) || raw.goals.length > GOALS.length) {
    errors.push({ field: "goals", message: "Choose from the listed focuses." });
  } else {
    const seen = new Set<string>();
    for (const item of raw.goals) {
      if (typeof item !== "string" || !goalIds.includes(item as GoalId) || seen.has(item)) {
        errors.push({ field: "goals", message: "Choose from the listed focuses." });
        break;
      }
      seen.add(item);
    }
    goals = [...seen] as GoalId[];
  }

  const goalNote = cleanNote(raw.goalNote);
  if (goalNote === null) {
    errors.push({ field: "goalNote", message: `Keep your note to ${GOAL_NOTE_MAX} characters.` });
  }

  const sleepHours = oneOf(raw.sleepHours, valuesOf(SLEEP_HOUR_OPTIONS));
  const sleepQuality = oneOf(raw.sleepQuality, valuesOf(SLEEP_QUALITY_OPTIONS));
  const activityDays = oneOf(raw.activityDays, valuesOf(ACTIVITY_OPTIONS));
  const sedentary = oneOf(raw.sedentary, valuesOf(SEDENTARY_OPTIONS));
  const plants = oneOf(raw.plants, valuesOf(PLANTS_OPTIONS));
  const mealRhythm = oneOf(raw.mealRhythm, valuesOf(MEAL_OPTIONS));
  const hydration = oneOf(raw.hydration, valuesOf(HYDRATION_OPTIONS));
  const smoking = oneOf(raw.smoking, valuesOf(SMOKING_OPTIONS));
  const alcohol = oneOf(raw.alcohol, valuesOf(ALCOHOL_OPTIONS));
  const stress = oneOf(raw.stress, valuesOf(STRESS_OPTIONS));
  const mood = oneOf(raw.mood, valuesOf(MOOD_OPTIONS));
  const social = oneOf(raw.social, valuesOf(SOCIAL_OPTIONS));
  const ageRange = oneOf(raw.ageRange, valuesOf(AGE_OPTIONS));

  const checked: [string, unknown, string][] = [
    ["sleepHours", sleepHours, "Choose a sleep range."],
    ["sleepQuality", sleepQuality, "Choose a sleep quality description."],
    ["activityDays", activityDays, "Choose how often you are active."],
    ["sedentary", sedentary, "Choose the sitting description that fits."],
    ["plants", plants, "Choose how often vegetables or fruit are part of eating."],
    ["mealRhythm", mealRhythm, "Choose the meal pattern that fits."],
    ["hydration", hydration, "Choose the water description that fits."],
    ["smoking", smoking, "Choose a tobacco answer, including Prefer not to say."],
    ["alcohol", alcohol, "Choose an alcohol answer, including Prefer not to say."],
    ["stress", stress, "Choose the stress description that fits."],
    ["mood", mood, "Choose a mood answer, including Prefer not to say."],
    ["social", social, "Choose the contact description that fits."],
    ["ageRange", ageRange, "Choose an age range, or Prefer not to say."],
  ];

  for (const [field, value, message] of checked) {
    if (value === null) errors.push({ field, message });
  }

  if (errors.length > 0 || goalNote === null) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    answers: {
      goals,
      goalNote,
      sleepHours: sleepHours ?? "",
      sleepQuality: sleepQuality ?? "",
      activityDays: activityDays ?? "",
      sedentary: sedentary ?? "",
      plants: plants ?? "",
      mealRhythm: mealRhythm ?? "",
      hydration: hydration ?? "",
      smoking: smoking ?? "",
      alcohol: alcohol ?? "",
      stress: stress ?? "",
      mood: mood ?? "",
      social: social ?? "",
      ageRange: ageRange ?? "",
    },
  };
}

function requireValue(answers: Answers, field: keyof Answers, message: string, errors: FieldError[]) {
  if (!answers[field] || (Array.isArray(answers[field]) && answers[field].length === 0)) {
    errors.push({ field, message });
  }
}

export function validateStep(step: StepId, answers: Answers): FieldError[] {
  const errors: FieldError[] = [];
  if (step === "goals") {
    if (answers.goals.length === 0) {
      errors.push({ field: "goals", message: "Choose at least one focus. You can change it later." });
    }
    if (answers.goalNote.length > GOAL_NOTE_MAX) {
      errors.push({ field: "goalNote", message: `Keep your note to ${GOAL_NOTE_MAX} characters.` });
    }
  }
  if (step === "sleep") {
    requireValue(answers, "sleepHours", "Choose a sleep range.", errors);
    requireValue(answers, "sleepQuality", "Choose a sleep quality description.", errors);
  }
  if (step === "movement") {
    requireValue(answers, "activityDays", "Choose how often you are active.", errors);
    requireValue(answers, "sedentary", "Choose the sitting description that fits.", errors);
  }
  if (step === "eating") {
    requireValue(answers, "plants", "Choose how often vegetables or fruit are part of eating.", errors);
    requireValue(answers, "mealRhythm", "Choose the meal pattern that fits.", errors);
    requireValue(answers, "hydration", "Choose the water description that fits.", errors);
  }
  if (step === "substances") {
    requireValue(answers, "smoking", "Choose a tobacco answer, including Prefer not to say.", errors);
    requireValue(answers, "alcohol", "Choose an alcohol answer, including Prefer not to say.", errors);
  }
  if (step === "mind") {
    requireValue(answers, "stress", "Choose the stress description that fits.", errors);
    requireValue(answers, "mood", "Choose a mood answer, including Prefer not to say.", errors);
    requireValue(answers, "social", "Choose the contact description that fits.", errors);
  }
  if (step === "about") {
    requireValue(answers, "ageRange", "Choose an age range, or Prefer not to say.", errors);
  }
  if (step === "review") {
    const complete = validateComplete(answers);
    return complete.ok ? [] : complete.errors;
  }
  return errors;
}

export function validateComplete(answers: Answers): { ok: true } | { ok: false; errors: FieldError[] } {
  const parsed = parseAnswers(answers);
  if (!parsed.ok) return parsed;
  const errors: FieldError[] = [];
  for (const step of STEPS) {
    if (step.id === "intro" || step.id === "review") continue;
    errors.push(...validateStep(step.id, parsed.answers));
  }
  return errors.length > 0 ? { ok: false, errors } : { ok: true };
}

function labelFor(options: readonly { value: string; label: string }[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? "Not answered";
}

export type ReviewRow = { field: string; label: string; value: string; step: StepId };

export function reviewRows(answers: Answers): ReviewRow[] {
  const goalLabels = answers.goals
    .map((id) => GOALS.find((goal) => goal.id === id)?.label ?? id)
    .join(", ");
  return [
    { field: "goals", label: "Focuses", value: goalLabels || "None selected", step: "goals" },
    { field: "goalNote", label: "Your note", value: answers.goalNote || "None", step: "goals" },
    { field: "sleepHours", label: "Sleep amount", value: labelFor(SLEEP_HOUR_OPTIONS, answers.sleepHours), step: "sleep" },
    { field: "sleepQuality", label: "Sleep quality", value: labelFor(SLEEP_QUALITY_OPTIONS, answers.sleepQuality), step: "sleep" },
    { field: "activityDays", label: "Activity", value: labelFor(ACTIVITY_OPTIONS, answers.activityDays), step: "movement" },
    { field: "sedentary", label: "Sitting", value: labelFor(SEDENTARY_OPTIONS, answers.sedentary), step: "movement" },
    { field: "plants", label: "Vegetables and fruit", value: labelFor(PLANTS_OPTIONS, answers.plants), step: "eating" },
    { field: "mealRhythm", label: "Meal rhythm", value: labelFor(MEAL_OPTIONS, answers.mealRhythm), step: "eating" },
    { field: "hydration", label: "Water", value: labelFor(HYDRATION_OPTIONS, answers.hydration), step: "eating" },
    { field: "smoking", label: "Tobacco", value: labelFor(SMOKING_OPTIONS, answers.smoking), step: "substances" },
    { field: "alcohol", label: "Alcohol", value: labelFor(ALCOHOL_OPTIONS, answers.alcohol), step: "substances" },
    { field: "stress", label: "Stress", value: labelFor(STRESS_OPTIONS, answers.stress), step: "mind" },
    { field: "mood", label: "Mood", value: labelFor(MOOD_OPTIONS, answers.mood), step: "mind" },
    { field: "social", label: "Connection", value: labelFor(SOCIAL_OPTIONS, answers.social), step: "mind" },
    { field: "ageRange", label: "Age range", value: labelFor(AGE_OPTIONS, answers.ageRange), step: "about" },
  ];
}

export function lifestyleLines(answers: Answers): string[] {
  const lines: string[] = [];
  if (answers.goals.length > 0) {
    const labels = answers.goals.map((id) => GOALS.find((goal) => goal.id === id)?.label.toLowerCase() ?? id);
    lines.push(`You said you want to work on ${labels.join(", ")}.`);
  }
  if (answers.goalNote) lines.push(`In your words: ${answers.goalNote}`);
  if (answers.sleepHours) lines.push(`Sleep amount you reported: ${labelFor(SLEEP_HOUR_OPTIONS, answers.sleepHours)}.`);
  if (answers.sleepQuality) lines.push(`Sleep quality you reported: ${labelFor(SLEEP_QUALITY_OPTIONS, answers.sleepQuality)}.`);
  if (answers.activityDays) lines.push(`Activity you reported: ${labelFor(ACTIVITY_OPTIONS, answers.activityDays)}.`);
  if (answers.sedentary) lines.push(`Sitting you reported: ${labelFor(SEDENTARY_OPTIONS, answers.sedentary)}.`);
  if (answers.plants) lines.push(`Vegetables and fruit you reported: ${labelFor(PLANTS_OPTIONS, answers.plants)}.`);
  if (answers.mealRhythm) lines.push(`Meal rhythm you reported: ${labelFor(MEAL_OPTIONS, answers.mealRhythm)}.`);
  if (answers.hydration) lines.push(`Water you reported: ${labelFor(HYDRATION_OPTIONS, answers.hydration)}.`);
  if (answers.smoking) lines.push(`Tobacco you reported: ${labelFor(SMOKING_OPTIONS, answers.smoking)}.`);
  if (answers.alcohol) lines.push(`Alcohol you reported: ${labelFor(ALCOHOL_OPTIONS, answers.alcohol)}.`);
  if (answers.stress) lines.push(`Stress you reported: ${labelFor(STRESS_OPTIONS, answers.stress)}.`);
  if (answers.mood) lines.push(`Mood you reported: ${labelFor(MOOD_OPTIONS, answers.mood)}.`);
  if (answers.social) lines.push(`Connection you reported: ${labelFor(SOCIAL_OPTIONS, answers.social)}.`);
  if (answers.ageRange && answers.ageRange !== "skip") {
    lines.push(`Age range you chose to share: ${labelFor(AGE_OPTIONS, answers.ageRange)}.`);
  }
  return lines;
}
