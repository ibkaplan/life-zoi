export const AGE_RANGES = [
  "18-29",
  "30-39",
  "40-49",
  "50-59",
  "60-69",
  "70+",
  "prefer-not",
] as const;

export const SLEEP_QUALITIES = ["poor", "fair", "good", "very-good"] as const;
export const VEGETABLE_PATTERNS = [
  "rarely",
  "some-days",
  "most-days",
  "daily",
] as const;
export const HYDRATION_PATTERNS = ["rarely", "some", "most-days"] as const;
export const SMOKING_PATTERNS = [
  "never",
  "former",
  "some-days",
  "daily",
  "prefer-not",
] as const;
export const ALCOHOL_PATTERNS = [
  "none",
  "occasional",
  "most-weeks",
  "prefer-not",
] as const;
export const STRESS_LEVELS = ["low", "moderate", "high"] as const;
export const MOOD_LEVELS = ["low", "mixed", "steady"] as const;
export const SOCIAL_LEVELS = ["isolated", "some", "connected"] as const;

export const HABIT_IDS = [
  "walk",
  "sleep",
  "eating",
  "smoking",
  "stress",
  "alcohol",
  "connection",
  "custom",
] as const;

export const TRACKABLE_HABIT_IDS = [
  "walk",
  "sleep",
  "eating",
  "smoking",
  "stress",
  "alcohol",
  "connection",
] as const;

export const GOAL_IDS = TRACKABLE_HABIT_IDS;

export type AgeRange = (typeof AGE_RANGES)[number];
export type SleepQuality = (typeof SLEEP_QUALITIES)[number];
export type VegetablePattern = (typeof VEGETABLE_PATTERNS)[number];
export type HydrationPattern = (typeof HYDRATION_PATTERNS)[number];
export type SmokingPattern = (typeof SMOKING_PATTERNS)[number];
export type AlcoholPattern = (typeof ALCOHOL_PATTERNS)[number];
export type StressLevel = (typeof STRESS_LEVELS)[number];
export type MoodLevel = (typeof MOOD_LEVELS)[number];
export type SocialLevel = (typeof SOCIAL_LEVELS)[number];
export type HabitId = (typeof HABIT_IDS)[number];
export type TrackableHabitId = (typeof TRACKABLE_HABIT_IDS)[number];
export type GoalId = (typeof GOAL_IDS)[number];

export type Assessment = {
  displayName: string;
  ageRange: AgeRange | "";
  sleepHours: string;
  sleepQuality: SleepQuality | "";
  activityDays: string;
  activityMinutes: string;
  sedentaryHours: string;
  vegetables: VegetablePattern | "";
  hydration: HydrationPattern | "";
  smoking: SmokingPattern | "";
  alcohol: AlcoholPattern | "";
  stress: StressLevel | "";
  mood: MoodLevel | "";
  social: SocialLevel | "";
  goals: GoalId[];
  habitNote: string;
};

export type NormalizedAssessment = {
  displayName: string;
  ageRange: AgeRange | null;
  sleepHours: number;
  sleepQuality: SleepQuality;
  activityDays: number;
  activityMinutes: number;
  sedentaryHours: number;
  vegetables: VegetablePattern;
  hydration: HydrationPattern;
  smoking: SmokingPattern | null;
  alcohol: AlcoholPattern | null;
  stress: StressLevel;
  mood: MoodLevel;
  social: SocialLevel;
  goals: GoalId[];
  habitNote: string;
};

export type CompletedAssessment = {
  id: string;
  completedAt: string;
  answers: Assessment;
};

export type SavedScenario = {
  id: string;
  habitId: HabitId;
  note: string;
  savedAt: string;
};

export type HabitGoal = {
  habitId: TrackableHabitId;
  daysPerWeek: number;
};

export type CheckIn = {
  id: string;
  date: string;
  habitId: TrackableHabitId;
  done: boolean;
  note: string;
};

export type UserSession = {
  draft: Assessment;
  draftStep: number;
  history: CompletedAssessment[];
  scenarios: SavedScenario[];
  goals: HabitGoal[];
  checkIns: CheckIn[];
};

export type FieldErrors = Record<string, string>;

export type Source = {
  name: string;
  title: string;
  url: string;
};

export const STEP_IDS = [
  "about",
  "sleep",
  "movement",
  "nourishment",
  "substances",
  "mind",
  "goals",
  "review",
] as const;

export type StepId = (typeof STEP_IDS)[number];

export const EMPTY_ASSESSMENT: Assessment = {
  displayName: "",
  ageRange: "",
  sleepHours: "",
  sleepQuality: "",
  activityDays: "",
  activityMinutes: "",
  sedentaryHours: "",
  vegetables: "",
  hydration: "",
  smoking: "",
  alcohol: "",
  stress: "",
  mood: "",
  social: "",
  goals: [],
  habitNote: "",
};

export function emptySession(): UserSession {
  return {
    draft: { ...EMPTY_ASSESSMENT, goals: [] },
    draftStep: 0,
    history: [],
    scenarios: [],
    goals: [],
    checkIns: [],
  };
}
