import { isRealISODate } from "@/lib/dates";
import {
  AGE_RANGES,
  ALCOHOL_PATTERNS,
  EMPTY_ASSESSMENT,
  GOAL_IDS,
  HABIT_IDS,
  HYDRATION_PATTERNS,
  MOOD_LEVELS,
  SLEEP_QUALITIES,
  SMOKING_PATTERNS,
  SOCIAL_LEVELS,
  STEP_IDS,
  STRESS_LEVELS,
  TRACKABLE_HABIT_IDS,
  VEGETABLE_PATTERNS,
  type Assessment,
  type FieldErrors,
  type GoalId,
  type HabitId,
  type NormalizedAssessment,
  type StepId,
  type TrackableHabitId,
} from "@/lib/types";

const NOTE_LIMIT = 280;
const NAME_LIMIT = 40;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function cleanText(value: unknown, limit: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, limit);
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | "" {
  return typeof value === "string" && allowed.includes(value as T)
    ? (value as T)
    : "";
}

function parseNumber(value: string): number | null {
  if (!/^\d+(\.\d)?$/.test(value)) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

export function coerceAssessment(input: unknown): Assessment {
  const record = asRecord(input);
  if (!record) return { ...EMPTY_ASSESSMENT, goals: [] };
  const goals = Array.isArray(record.goals)
    ? record.goals.filter(
        (goal): goal is GoalId =>
          typeof goal === "string" && GOAL_IDS.includes(goal as GoalId),
      )
    : [];
  return {
    displayName: cleanText(record.displayName, NAME_LIMIT),
    ageRange: oneOf(record.ageRange, AGE_RANGES),
    sleepHours: cleanText(record.sleepHours, 5),
    sleepQuality: oneOf(record.sleepQuality, SLEEP_QUALITIES),
    activityDays: cleanText(record.activityDays, 2),
    activityMinutes: cleanText(record.activityMinutes, 3),
    sedentaryHours: cleanText(record.sedentaryHours, 5),
    vegetables: oneOf(record.vegetables, VEGETABLE_PATTERNS),
    hydration: oneOf(record.hydration, HYDRATION_PATTERNS),
    smoking: oneOf(record.smoking, SMOKING_PATTERNS),
    alcohol: oneOf(record.alcohol, ALCOHOL_PATTERNS),
    stress: oneOf(record.stress, STRESS_LEVELS),
    mood: oneOf(record.mood, MOOD_LEVELS),
    social: oneOf(record.social, SOCIAL_LEVELS),
    goals: [...new Set(goals)],
    habitNote: cleanText(record.habitNote, NOTE_LIMIT),
  };
}

function numberInRange(
  raw: string,
  label: string,
  min: number,
  max: number,
  integer = false,
): { value?: number; error?: string } {
  if (!raw.trim()) return { error: `Add ${label}.` };
  const parsed = parseNumber(raw.trim());
  if (parsed === null) return { error: `Enter ${label} as a number.` };
  if (integer && !Number.isInteger(parsed)) {
    return { error: `Enter ${label} as a whole number.` };
  }
  if (parsed < min || parsed > max) {
    return { error: `Enter ${label} from ${min} to ${max}.` };
  }
  return { value: parsed };
}

export function validateStep(step: StepId, draft: Assessment): FieldErrors {
  const errors: FieldErrors = {};
  if (step === "about") {
    if (draft.displayName.trim().length > NAME_LIMIT) {
      errors.displayName = `Use ${NAME_LIMIT} characters or fewer.`;
    }
  }
  if (step === "sleep") {
    const hours = numberInRange(draft.sleepHours, "hours of sleep", 0, 24);
    if (hours.error) errors.sleepHours = hours.error;
    if (!draft.sleepQuality) errors.sleepQuality = "Choose the option that fits best.";
  }
  if (step === "movement") {
    const days = numberInRange(draft.activityDays, "days per week", 0, 7, true);
    if (days.error) errors.activityDays = days.error;
    const daysValue = days.value ?? null;
    if (daysValue === 0) {
      if (draft.activityMinutes.trim()) {
        const minutes = numberInRange(
          draft.activityMinutes,
          "minutes",
          0,
          300,
          true,
        );
        if (minutes.error) errors.activityMinutes = minutes.error;
      }
    } else if (daysValue !== null) {
      const minutes = numberInRange(
        draft.activityMinutes,
        "minutes on those days",
        0,
        300,
        true,
      );
      if (minutes.error) errors.activityMinutes = minutes.error;
    }
    const sedentary = numberInRange(
      draft.sedentaryHours,
      "sitting or reclining hours",
      0,
      24,
    );
    if (sedentary.error) errors.sedentaryHours = sedentary.error;
  }
  if (step === "nourishment") {
    if (!draft.vegetables) errors.vegetables = "Choose the option that fits best.";
    if (!draft.hydration) errors.hydration = "Choose the option that fits best.";
  }
  if (step === "mind") {
    if (!draft.stress) errors.stress = "Choose the option that fits best.";
    if (!draft.mood) errors.mood = "Choose the option that fits best.";
    if (!draft.social) errors.social = "Choose the option that fits best.";
  }
  if (step === "goals") {
    if (draft.goals.length === 0) errors.goals = "Choose at least one focus.";
    if (draft.habitNote.length > NOTE_LIMIT) {
      errors.habitNote = `Use ${NOTE_LIMIT} characters or fewer.`;
    }
  }
  return errors;
}

export function validateComplete(
  input: unknown,
): { ok: true; value: NormalizedAssessment } | { ok: false; fields: FieldErrors } {
  const draft = coerceAssessment(input);
  const fields: FieldErrors = {};
  for (const step of STEP_IDS) {
    if (step === "review" || step === "substances") continue;
    Object.assign(fields, validateStep(step, draft));
  }
  if (
    !draft.sleepQuality ||
    !draft.vegetables ||
    !draft.hydration ||
    !draft.stress ||
    !draft.mood ||
    !draft.social
  ) {
    return { ok: false, fields };
  }
  if (Object.keys(fields).length > 0) return { ok: false, fields };
  const sleepHours = Number(draft.sleepHours);
  const activityDays = Number(draft.activityDays);
  const activityMinutes =
    draft.activityDays === "0" && !draft.activityMinutes.trim()
      ? 0
      : Number(draft.activityMinutes);
  const sedentaryHours = Number(draft.sedentaryHours);
  return {
    ok: true,
    value: {
      displayName: draft.displayName,
      ageRange: draft.ageRange || null,
      sleepHours,
      sleepQuality: draft.sleepQuality,
      activityDays,
      activityMinutes,
      sedentaryHours,
      vegetables: draft.vegetables,
      hydration: draft.hydration,
      smoking: draft.smoking || null,
      alcohol: draft.alcohol || null,
      stress: draft.stress,
      mood: draft.mood,
      social: draft.social,
      goals: draft.goals,
      habitNote: draft.habitNote,
    },
  };
}

export function firstInvalidStep(draft: Assessment): StepId | null {
  for (const step of STEP_IDS) {
    if (step === "review" || step === "substances") continue;
    if (Object.keys(validateStep(step, draft)).length > 0) return step;
  }
  return null;
}

export function isHabitId(value: unknown): value is HabitId {
  return typeof value === "string" && HABIT_IDS.includes(value as HabitId);
}

export function isTrackableHabitId(value: unknown): value is TrackableHabitId {
  return (
    typeof value === "string" &&
    TRACKABLE_HABIT_IDS.includes(value as TrackableHabitId)
  );
}

export function validateScenarioRequest(input: unknown):
  | { ok: true; habitId: HabitId; note: string; assessment: NormalizedAssessment | null }
  | { ok: false; fields: FieldErrors } {
  const record = asRecord(input);
  if (!record) return { ok: false, fields: { request: "The request could not be read." } };
  if (!isHabitId(record.habitId)) {
    return { ok: false, fields: { habitId: "Choose a habit from the list." } };
  }
  const note = cleanText(record.note, NOTE_LIMIT);
  if (record.habitId === "custom" && !note) {
    return {
      ok: false,
      fields: { note: "Describe the change in a short sentence." },
    };
  }
  if (record.assessment == null) {
    return { ok: true, habitId: record.habitId, note, assessment: null };
  }
  const parsed = validateComplete(record.assessment);
  if (!parsed.ok) return { ok: false, fields: parsed.fields };
  return { ok: true, habitId: record.habitId, note, assessment: parsed.value };
}

export function validateCheckInDate(date: string, today: string): string | null {
  if (!isRealISODate(date)) return "Choose a real date.";
  if (date > today) return "Choose today or an earlier date.";
  return null;
}

export function validateDaysPerWeek(value: number): string | null {
  if (!Number.isInteger(value) || value < 1 || value > 7) {
    return "Choose 1 to 7 days per week.";
  }
  return null;
}
