import { ALLERGENS, type Allergen } from "@/lib/food-plan/types";

/**
 * Health profile answers added to the lifestyle assessment.
 * Every field is optional. "unknown" and "prefer-not" are real answers and
 * are never replaced by a guessed value.
 */

export const BLOOD_SUGAR_STATUSES = ["normal", "high", "low", "diabetes", "unknown", "prefer-not"] as const;
export const CHOLESTEROL_STATUSES = ["normal", "high", "unknown", "prefer-not"] as const;
export const BLOOD_PRESSURE_STATUSES = ["normal", "high", "low", "unknown", "prefer-not"] as const;

export const EATING_PATTERNS = [
  "regular",
  "skip-meals",
  "frequent-snacks",
  "late-evening",
  "irregular",
  "prefer-not",
] as const;

export const DIET_RESTRICTIONS = [
  "vegetarian",
  "vegan",
  "pescatarian",
  "gluten-free",
  "lactose-free",
  "halal",
  "kosher",
  "low-salt-advised",
  "texture-soft",
] as const;

export const MOBILITY_LIMITS = [
  "none",
  "walking-aid",
  "wheelchair",
  "limited-standing",
  "balance-concerns",
  "joint-pain",
  "breathlessness",
  "prefer-not",
] as const;

export const WELLNESS_GOALS = [
  "lose-weight",
  "gain-weight",
  "maintain-weight",
  "blood-sugar",
  "cholesterol",
  "energy",
  "memory",
  "sleep",
  "flexibility-balance",
  "stress",
  "well-being",
] as const;

export type BloodSugarStatus = (typeof BLOOD_SUGAR_STATUSES)[number];
export type CholesterolStatus = (typeof CHOLESTEROL_STATUSES)[number];
export type BloodPressureStatus = (typeof BLOOD_PRESSURE_STATUSES)[number];
export type EatingPattern = (typeof EATING_PATTERNS)[number];
export type DietRestriction = (typeof DIET_RESTRICTIONS)[number];
export type MobilityLimit = (typeof MOBILITY_LIMITS)[number];
export type WellnessGoal = (typeof WELLNESS_GOALS)[number];

export type HealthProfileFields = {
  desiredWeightKg: string;
  eatingPattern: EatingPattern | "";
  bloodSugarStatus: BloodSugarStatus | "";
  cholesterolStatus: CholesterolStatus | "";
  bloodPressureStatus: BloodPressureStatus | "";
  foodAllergies: Allergen[];
  allergyNote: string;
  dietRestrictions: DietRestriction[];
  dietNote: string;
  mobilityLimits: MobilityLimit[];
  exerciseRestrictions: string;
  wellnessGoals: WellnessGoal[];
  primaryGoal: WellnessGoal | "";
};

export const EMPTY_HEALTH_PROFILE: HealthProfileFields = {
  desiredWeightKg: "",
  eatingPattern: "",
  bloodSugarStatus: "",
  cholesterolStatus: "",
  bloodPressureStatus: "",
  foodAllergies: [],
  allergyNote: "",
  dietRestrictions: [],
  dietNote: "",
  mobilityLimits: [],
  exerciseRestrictions: "",
  wellnessGoals: [],
  primaryGoal: "",
};

export function emptyHealthProfile(): HealthProfileFields {
  return {
    ...EMPTY_HEALTH_PROFILE,
    foodAllergies: [],
    dietRestrictions: [],
    mobilityLimits: [],
    wellnessGoals: [],
  };
}

export const bloodSugarLabels: Record<BloodSugarStatus, string> = {
  normal: "Normal, as far as I know",
  high: "High",
  low: "Low (I have had low blood sugar)",
  diabetes: "Diabetes or prediabetes",
  unknown: "I don't know",
  "prefer-not": "Prefer not to answer",
};

export const cholesterolLabels: Record<CholesterolStatus, string> = {
  normal: "Normal, as far as I know",
  high: "High",
  unknown: "I don't know",
  "prefer-not": "Prefer not to answer",
};

export const bloodPressureLabels: Record<BloodPressureStatus, string> = {
  normal: "Normal, as far as I know",
  high: "High",
  low: "Low",
  unknown: "I don't know",
  "prefer-not": "Prefer not to answer",
};

export const eatingPatternLabels: Record<EatingPattern, string> = {
  regular: "Regular meals most days",
  "skip-meals": "I often skip meals",
  "frequent-snacks": "I snack often",
  "late-evening": "I often eat late in the evening",
  irregular: "It changes a lot",
  "prefer-not": "Prefer not to answer",
};

export const allergenLabels: Record<Allergen, string> = {
  milk: "Milk",
  egg: "Egg",
  peanut: "Peanut",
  "tree-nut": "Tree nuts",
  fish: "Fish",
  shellfish: "Shellfish",
  soy: "Soy",
  wheat: "Wheat",
  sesame: "Sesame",
};

export const dietRestrictionLabels: Record<DietRestriction, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  pescatarian: "Pescatarian",
  "gluten-free": "Gluten-free",
  "lactose-free": "Lactose-free",
  halal: "Halal",
  kosher: "Kosher",
  "low-salt-advised": "Low salt, as advised by a clinician",
  "texture-soft": "Soft foods or easy to chew",
};

export const mobilityLabels: Record<MobilityLimit, string> = {
  none: "No mobility limits",
  "walking-aid": "I use a cane or walker",
  wheelchair: "I use a wheelchair",
  "limited-standing": "Standing for long is hard",
  "balance-concerns": "I worry about balance or falls",
  "joint-pain": "Joint pain limits some movement",
  breathlessness: "I get short of breath easily",
  "prefer-not": "Prefer not to answer",
};

export const wellnessGoalLabels: Record<WellnessGoal, string> = {
  "lose-weight": "Lose weight",
  "gain-weight": "Gain weight",
  "maintain-weight": "Maintain weight",
  "blood-sugar": "Improve blood sugar management",
  cholesterol: "Improve cholesterol management",
  energy: "Improve energy",
  memory: "Improve memory",
  sleep: "Sleep better",
  "flexibility-balance": "Improve flexibility and balance",
  stress: "Reduce stress",
  "well-being": "Improve general well-being",
};

const WEIGHT_GOALS: WellnessGoal[] = ["lose-weight", "gain-weight", "maintain-weight"];

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function cleanText(value: unknown, limit: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, limit);
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | "" {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : "";
}

function listOf<T extends string>(value: unknown, allowed: readonly T[]): T[] {
  if (!Array.isArray(value)) return [];
  const picked: T[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !allowed.includes(item as T) || picked.includes(item as T)) continue;
    picked.push(item as T);
  }
  return picked;
}

/** Clean the health profile part of a stored or submitted assessment. */
export function coerceHealthProfile(input: unknown): HealthProfileFields {
  const record = asRecord(input) ?? {};
  let mobilityLimits = listOf(record.mobilityLimits, MOBILITY_LIMITS);
  if (mobilityLimits.includes("none") && mobilityLimits.length > 1) {
    mobilityLimits = mobilityLimits.filter((item) => item !== "none");
  }
  if (mobilityLimits.includes("prefer-not")) mobilityLimits = ["prefer-not"];
  let wellnessGoals = listOf(record.wellnessGoals, WELLNESS_GOALS);
  // Losing and gaining weight at once cannot both be followed; keep the first one chosen.
  const weight = wellnessGoals.filter((goal) => WEIGHT_GOALS.includes(goal));
  if (weight.length > 1) {
    wellnessGoals = wellnessGoals.filter((goal) => !WEIGHT_GOALS.includes(goal) || goal === weight[0]);
  }
  const chosenPrimary = oneOf(record.primaryGoal, WELLNESS_GOALS);
  const primaryGoal = chosenPrimary && wellnessGoals.includes(chosenPrimary) ? chosenPrimary : wellnessGoals[0] ?? "";
  return {
    desiredWeightKg: cleanText(record.desiredWeightKg, 3),
    eatingPattern: oneOf(record.eatingPattern, EATING_PATTERNS),
    bloodSugarStatus: oneOf(record.bloodSugarStatus, BLOOD_SUGAR_STATUSES),
    cholesterolStatus: oneOf(record.cholesterolStatus, CHOLESTEROL_STATUSES),
    bloodPressureStatus: oneOf(record.bloodPressureStatus, BLOOD_PRESSURE_STATUSES),
    foodAllergies: listOf(record.foodAllergies, ALLERGENS),
    allergyNote: cleanText(record.allergyNote, 140),
    dietRestrictions: listOf(record.dietRestrictions, DIET_RESTRICTIONS),
    dietNote: cleanText(record.dietNote, 140),
    mobilityLimits,
    exerciseRestrictions: cleanText(record.exerciseRestrictions, 280),
    wellnessGoals,
    primaryGoal,
  };
}

/** Field errors for the health step. Every field is optional; only typed numbers are checked. */
export function validateHealthProfile(profile: HealthProfileFields): Record<string, string> {
  const errors: Record<string, string> = {};
  const raw = profile.desiredWeightKg.trim();
  if (raw) {
    const value = Number(raw);
    if (!/^\d+$/.test(raw) || !Number.isInteger(value) || value < 30 || value > 300) {
      errors.desiredWeightKg = "Enter desired weight in kilograms from 30 to 300, or leave it blank.";
    }
  }
  return errors;
}

export function hasWeightGoal(profile: Pick<HealthProfileFields, "wellnessGoals">): boolean {
  return profile.wellnessGoals.some((goal) => WEIGHT_GOALS.includes(goal));
}

export type SafetyFlags = {
  /** Diabetes, prediabetes, or low blood sugar was reported. */
  bloodSugarCare: boolean;
  lowBloodSugar: boolean;
  allergies: boolean;
  /** Movement should stay seated, supported, or gentle. */
  gentleMovement: boolean;
  /** Wheelchair or limited standing: prefer seated choices. */
  seatedFirst: boolean;
  fallRisk: boolean;
  /** A clinician-advised restriction was reported. */
  clinicianDiet: boolean;
  injuryNote: boolean;
};

const INJURY = /\b(pain|injur(?:y|ies|ed)?|surgery|fracture|sprain|hernia|replacement|pacemaker|heart|chest)\b/i;

/** Safety rules derived only from what the person reported. Nothing is inferred from silence. */
export function safetyFlags(profile: HealthProfileFields): SafetyFlags {
  const limits = profile.mobilityLimits;
  const seatedFirst = limits.includes("wheelchair") || limits.includes("limited-standing");
  const fallRisk = limits.includes("balance-concerns") || limits.includes("walking-aid");
  const injuryNote = INJURY.test(profile.exerciseRestrictions);
  return {
    bloodSugarCare: profile.bloodSugarStatus === "diabetes" || profile.bloodSugarStatus === "low",
    lowBloodSugar: profile.bloodSugarStatus === "low",
    allergies: profile.foodAllergies.length > 0 || profile.allergyNote.length > 0,
    gentleMovement:
      seatedFirst ||
      fallRisk ||
      limits.includes("joint-pain") ||
      limits.includes("breathlessness") ||
      injuryNote,
    seatedFirst,
    fallRisk,
    clinicianDiet: profile.dietRestrictions.includes("low-salt-advised"),
    injuryNote,
  };
}

export function safetyNotes(flags: SafetyFlags): string[] {
  const notes: string[] = [];
  if (flags.bloodSugarCare) {
    notes.push(
      "You reported diabetes, prediabetes, or low blood sugar. Keep to the meal timing and medicines your care team set. LifeZoi does not change medication, and meal ideas here do not replace that plan.",
    );
  }
  if (flags.lowBloodSugar) {
    notes.push("Because you reported low blood sugar, avoid long gaps without food and keep a quick snack nearby during activity.");
  }
  if (flags.allergies) {
    notes.push("Meal ideas skip the allergens you listed, but always read labels. LifeZoi cannot guarantee a food is free of an allergen.");
  }
  if (flags.seatedFirst) notes.push("Movement starts with seated options because you said standing for long is hard or you use a wheelchair.");
  if (flags.fallRisk) notes.push("Balance work is shown with a sturdy chair or counter for support, because you mentioned balance or a walking aid.");
  if (flags.injuryNote) {
    notes.push("You described an injury, pain, or a heart-related restriction. Ask a qualified professional before trying new exercise, and skip anything that hurts.");
  }
  if (flags.clinicianDiet) notes.push("You follow a clinician-advised diet. Keep to their advice; LifeZoi ideas are general.");
  return notes;
}
