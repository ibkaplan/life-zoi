import type {
  AgeRange,
  AlcoholPattern,
  Assessment,
  GoalId,
  HabitId,
  HydrationPattern,
  MoodLevel,
  SleepQuality,
  SmokingPattern,
  SocialLevel,
  StressLevel,
  TrackableHabitId,
  VegetablePattern,
} from "@/lib/types";

export const ageLabels: Record<AgeRange, string> = {
  "18-29": "18–29",
  "30-39": "30–39",
  "40-49": "40–49",
  "50-59": "50–59",
  "60-69": "60–69",
  "70+": "70 or older",
  "prefer-not": "Prefer not to say",
};

export const sleepQualityLabels: Record<SleepQuality, string> = {
  poor: "Restless or unrefreshing",
  fair: "Mixed",
  good: "Usually okay",
  "very-good": "Usually rested",
};

export const vegetableLabels: Record<VegetablePattern, string> = {
  rarely: "Rarely",
  "some-days": "Some days",
  "most-days": "Most days",
  daily: "Daily",
};

export const hydrationLabels: Record<HydrationPattern, string> = {
  rarely: "Rarely",
  some: "Some of the time",
  "most-days": "Most days",
};

export const smokingLabels: Record<SmokingPattern, string> = {
  never: "I do not smoke",
  former: "I used to smoke",
  "some-days": "Some days",
  daily: "Daily",
  "prefer-not": "Prefer not to say",
};

export const alcoholLabels: Record<AlcoholPattern, string> = {
  none: "None",
  occasional: "Occasionally",
  "most-weeks": "Most weeks",
  "prefer-not": "Prefer not to say",
};

export const stressLabels: Record<StressLevel, string> = {
  low: "Mostly manageable",
  moderate: "Noticeable",
  high: "Often overwhelming",
};

export const moodLabels: Record<MoodLevel, string> = {
  low: "Often low",
  mixed: "Up and down",
  steady: "Mostly steady",
};

export const socialLabels: Record<SocialLevel, string> = {
  isolated: "I feel quite isolated",
  some: "A few connections",
  connected: "I feel connected",
};

export const habitLabels: Record<HabitId, string> = {
  walk: "Walk regularly",
  sleep: "Improve sleep",
  eating: "Gradual eating changes",
  smoking: "Reduce or stop smoking",
  stress: "Stress-management practices",
  alcohol: "Drink less often",
  connection: "More social connection",
  custom: "A change in your own words",
};

export const goalLabels: Record<GoalId, string> = {
  walk: "Movement",
  sleep: "Sleep",
  eating: "Eating patterns",
  smoking: "Tobacco",
  stress: "Stress",
  alcohol: "Alcohol",
  connection: "Time with other people",
};

export function habitTitle(id: TrackableHabitId | HabitId): string {
  return habitLabels[id];
}

export function weeklyActivityMinutes(days: number, minutes: number): number {
  return days * minutes;
}

export function assessmentHasAnswers(draft: Assessment): boolean {
  return Boolean(
    draft.displayName.trim() ||
      draft.ageRange ||
      draft.sleepHours.trim() ||
      draft.sleepQuality ||
      draft.activityDays.trim() ||
      draft.activityMinutes.trim() ||
      draft.sedentaryHours.trim() ||
      draft.vegetables ||
      draft.hydration ||
      draft.smoking ||
      draft.alcohol ||
      draft.stress ||
      draft.mood ||
      draft.social ||
      draft.goals.length > 0 ||
      draft.habitNote.trim(),
  );
}
