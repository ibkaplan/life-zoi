export const EVIDENCE_KINDS = [
  "established",
  "emerging",
  "observational",
  "individual",
  "belief",
] as const;

export type EvidenceKind = (typeof EVIDENCE_KINDS)[number];

export type CommercialReuse = "permitted" | "unclear-link-out";

export type SourceRecord = {
  id: string;
  name: string;
  publisher: string;
  url: string;
  license: string;
  commercialReuse: CommercialReuse;
  accessMethod: string;
  attribution: string;
  lastChecked: string;
  dataUpdated: string | null;
};

export type SourcedNote = {
  text: string;
  sourceIds: string[];
  evidence: EvidenceKind;
  evidenceNote: string;
};

export type Practice = {
  id: string;
  title: string;
  why: string;
  what: string;
  when: string;
  supplies: string;
  alternative: string;
  sourceIds: string[];
  evidence: EvidenceKind;
  evidenceNote: string;
};

export type ChallengeDay = {
  title: string;
  what: string;
  when: string;
  alternative: string;
  sourceIds: string[];
};

export type Challenge = {
  id: string;
  title: string;
  summary: string;
  plan: ChallengeDay[];
};

export type LessonBlock = {
  heading: string;
  body: string;
  sourceIds: string[];
  evidence: EvidenceKind;
  evidenceNote: string;
};

export type LearnModule = {
  slug: string;
  title: string;
  summary: string;
  blocks: LessonBlock[];
  practices: Practice[];
  challengeId?: string;
};

export type FoodPreparation = "raw" | "cooked" | "dried" | "unspecified";

export type FoodRecord = {
  id: string;
  plainName: string;
  group: string;
  groupLabel: string;
  fdcId: number;
  description: string;
  preparation: FoodPreparation;
  dataType: string;
  publicationDate: string;
  datasetRelease: string;
  per100g: {
    caloriesKcal: number | null;
    proteinG: number | null;
    totalFatG: number | null;
    saturatedFatG: number | null;
    carbohydrateG: number | null;
    fiberG: number | null;
    sodiumMg: number | null;
  };
  micronutrients: { name: string; amount: number; unit: string }[];
  url: string;
};

export type Activity = {
  slug: string;
  title: string;
  category: string;
  duration: string;
  steps: string[];
  beginner: string;
  accessible: string;
  safety: string;
  sketch: "walk" | "chair" | "balance" | "band" | "stretch";
  sourceIds: string[];
  evidence: EvidenceKind;
  evidenceNote: string;
};

export type ChoiceTopic = {
  slug: string;
  title: string;
  categories: string[];
  why: SourcedNote;
  body: SourcedNote;
  research: SourcedNote[];
  actions: string[];
  actionSourceIds: string[];
  challengeId: string;
};

export type WellnessCheck = {
  id: string;
  date: string;
  done: boolean;
  reflection: string;
};

export type WellnessMotivation = {
  experience: string;
  people: string;
  activities: string;
  accomplishments: string;
  energyFor: string;
};

export type ReminderSlot = "morning" | "midday" | "evening";

export const URGE_FACTORS = [
  "hunger",
  "last-meal",
  "tired",
  "stressed",
  "bored",
  "lonely",
  "comfort",
  "automatic",
] as const;

export type UrgeFactor = (typeof URGE_FACTORS)[number];

export const SUPPORT_FLAGS = [
  "often-out-of-control",
  "severe-distress",
  "binge-pattern",
  "restrictive-pattern",
] as const;

export type SupportFlag = (typeof SUPPORT_FLAGS)[number];

export const NEXT_CHOICES = [
  "eat",
  "water",
  "moment",
  "move",
  "connect",
  "portion",
  "support",
  "rest",
  "other",
] as const;

export type NextChoice = (typeof NEXT_CHOICES)[number];

export type UrgeEntry = {
  id: string;
  date: string;
  time: string;
  want: string;
  feeling: string;
  before: string;
  intensity: number;
  factors: UrgeFactor[];
  choice: NextChoice | "";
  choiceNote: string;
  breaths: boolean;
  pauseMinutes: 0 | 5 | 10;
  outcome: string;
  supportFlags: SupportFlag[];
};

export const MOMENT_MINUTES = [5, 10, 20, 30] as const;
export type MomentMinutes = (typeof MOMENT_MINUTES)[number];

export const MOMENT_FILTERS = ["move", "relax", "learn", "accomplish", "connect", "create"] as const;
export type MomentFilter = (typeof MOMENT_FILTERS)[number];

export const MOMENT_CATEGORIES = ["important", "body", "mind", "people", "create", "rest"] as const;
export type MomentCategory = (typeof MOMENT_CATEGORIES)[number];

export const MOMENT_STATUSES = ["ready", "started", "done", "postponed"] as const;
export type MomentStatus = (typeof MOMENT_STATUSES)[number];

export type MomentPlan = {
  id: string;
  date: string;
  minutes: MomentMinutes;
  filters: MomentFilter[];
  categories: MomentCategory[];
  prompt: string;
  title: string;
  detail: string;
  status: MomentStatus;
};

export type LifeHabit = {
  id: string;
  slug: string;
  title: string;
  cadence: "daily" | "weekly";
  target: number;
  paused: boolean;
  createdOn: string;
  note: string;
};

export type HabitMark = {
  id: string;
  slug: string;
  date: string;
};

export type IfThenPlan = {
  id: string;
  cue: string;
  action: string;
};

export const NATURE_ACTIVITY_IDS = [
  "window",
  "balcony",
  "bench",
  "walk",
  "roll",
  "garden",
  "tree",
  "water-watch",
  "birds",
  "stretch",
  "sit",
  "herbs",
] as const;

export type NatureActivityId = (typeof NATURE_ACTIVITY_IDS)[number];

export const NATURE_WEATHER = ["sunny", "cloudy", "rainy", "window"] as const;
export type NatureWeather = (typeof NATURE_WEATHER)[number];

export type NatureEntry = {
  id: string;
  date: string;
  outdoorMinutes: number | null;
  weather: NatureWeather | "";
  moodBefore: number | null;
  moodAfter: number | null;
  energy: number | null;
  sleep: number | null;
  activities: NatureActivityId[];
  movement: string;
  connection: string;
  reflection: string;
};

export type NatureRoutine = {
  morning: string;
  afternoon: string;
  evening: string;
};

export type WellnessLog = {
  checks: WellnessCheck[];
  challengeStarts: { challengeId: string; startedOn: string }[];
  motivation: WellnessMotivation;
  reminders: ReminderSlot[];
  reminderSeenOn: string;
  urges: UrgeEntry[];
  moments: MomentPlan[];
  habits: LifeHabit[];
  habitMarks: HabitMark[];
  ifThen: IfThenPlan[];
  natureEntries: NatureEntry[];
  natureRoutine: NatureRoutine;
  naturePicks: NatureActivityId[];
};
