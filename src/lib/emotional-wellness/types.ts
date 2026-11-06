export const CONTEXT_IDS = [
  "cancer",
  "treatment",
  "diabetes",
  "chronic",
  "pain",
  "recovery",
  "caregiver",
  "loneliness",
  "general",
] as const;

export type ContextId = (typeof CONTEXT_IDS)[number];

export const COUNTRY_CHOICES = ["unset", "us", "other"] as const;

export type CountryChoice = (typeof COUNTRY_CHOICES)[number];

export const CRISIS_KINDS = [
  "suicide",
  "self-harm",
  "immediate-danger",
  "harm-to-others",
  "medical-emergency",
] as const;

export type CrisisKind = (typeof CRISIS_KINDS)[number];

export type CompanionMode = "listen" | "open";

export type PrivateNote = {
  id: string;
  createdAt: string;
  text: string;
};

export type EmotionalStore = {
  version: 1;
  country: CountryChoice;
  countryNote: string;
  context: ContextId;
  journal: PrivateNote[];
  joys: PrivateNote[];
  caregiverNotes: PrivateNote[];
};

export type NoteBucket = "journal" | "joys" | "caregiverNotes";
