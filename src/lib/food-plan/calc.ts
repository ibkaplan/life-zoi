import { makeTranslate, msg, type Translate } from "@/lib/i18n/translate";
import type { ActivityLevel, EquationSex, ProteinGoal, ProteinInputs } from "@/lib/food-plan/types";

/** Common multipliers used to turn a resting equation into a full-day estimate. They are not a measurement. */
export const ACTIVITY_FACTORS: Record<ActivityLevel, { factor: number; label: string }> = {
  sedentary: { factor: 1.2, label: msg("Mostly sitting") },
  light: { factor: 1.375, label: msg("Light movement most days") },
  moderate: { factor: 1.55, label: msg("Moderate activity") },
  active: { factor: 1.725, label: msg("Hard activity most days") },
  very: { factor: 1.9, label: msg("Very hard activity") },
};

export const RDA_G_PER_KG = 0.8;
export const REFERENCE_LOW_G_PER_KG = 1.2;
export const REFERENCE_HIGH_G_PER_KG = 1.6;
export const CALORIE_FLOOR = 1500;
export const LOSS_FRACTION = 0.15;
export const GAIN_FRACTION = 0.1;

const LB_PER_KG = 2.2046226218;
const english = makeTranslate(null);

export type BodyNumbers = {
  age: number;
  sex: EquationSex;
  heightCm: number;
  weightKg: number;
};

export type TargetResult =
  | { ok: false; reason: string }
  | {
      ok: true;
      body: BodyNumbers;
      resting: number;
      activityFactor: number;
      activityLabel: string;
      dayKcal: number;
      calorieTarget: number | null;
      calorieNote: string;
      rdaGrams: number;
      referenceLow: number;
      referenceHigh: number;
      chosenPerKg: number;
      proteinGrams: number;
      proteinNote: string;
      raisedBlocked: boolean;
    };

export function toKilograms(value: number, unit: "kg" | "lb"): number {
  return unit === "lb" ? value / LB_PER_KG : value;
}

export function toCentimeters(value: number, unit: "cm" | "in"): number {
  return unit === "in" ? value * 2.54 : value;
}

/** Mifflin–St Jeor resting estimate. Male form adds 5. Female form subtracts 161. */
export function mifflinStJeor(sex: EquationSex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function parseBody(input: ProteinInputs, t: Translate = english): { ok: true; body: BodyNumbers } | { ok: false; reason: string } {
  const age = Number(input.age);
  const height = Number(input.height);
  const weight = Number(input.weight);
  if (!input.sex) return { ok: false, reason: t("Choose the female or male form of the equation.") };
  if (!Number.isInteger(age) || age < 18 || age > 100) {
    return { ok: false, reason: t("This estimator is for adults 18 to 100. A clinician can help with other ages.") };
  }
  if (!Number.isFinite(height) || height <= 0) return { ok: false, reason: t("Enter a height.") };
  if (!Number.isFinite(weight) || weight <= 0) return { ok: false, reason: t("Enter a weight.") };
  const heightCm = toCentimeters(height, input.heightUnit);
  const weightKg = toKilograms(weight, input.weightUnit);
  if (heightCm < 120 || heightCm > 230 || weightKg < 35 || weightKg > 250) {
    return { ok: false, reason: t("Check the height and weight. The numbers look outside the range this estimator uses.") };
  }
  return { ok: true, body: { age, sex: input.sex, heightCm, weightKg } };
}

export function needsProfessional(flags: {
  pregnancy: boolean;
  kidney: boolean;
  liver: boolean;
  eatingDisorder: boolean;
  complexMedical: boolean;
}): boolean {
  return flags.pregnancy || flags.kidney || flags.liver || flags.eatingDisorder || flags.complexMedical;
}

export function proteinRaiseBlocked(flags: { pregnancy: boolean; kidney: boolean; liver: boolean }): boolean {
  return flags.pregnancy || flags.kidney || flags.liver;
}

function caloriePlan(dayKcal: number, goal: ProteinGoal | "", t: Translate): { target: number | null; note: string } {
  if (!goal || goal === "maintain" || goal === "muscle" || goal === "nutrition") {
    return {
      target: Math.round(dayKcal),
      note: t("The day estimate is shown as the calorie figure. Weight loss is not assumed."),
    };
  }
  if (goal === "gain") {
    return {
      target: Math.round(dayKcal * (1 + GAIN_FRACTION)),
      note: t("A 10 percent addition to the day estimate. This is an estimate, not a promise of weight gain."),
    };
  }
  const reduced = dayKcal * (1 - LOSS_FRACTION);
  if (dayKcal <= CALORIE_FLOOR) {
    return {
      target: null,
      note: t("The day estimate is already at or below 1,500 kcal. LifeZoi will not suggest a lower target or a very-low-calorie diet."),
    };
  }
  if (reduced < CALORIE_FLOOR) {
    return {
      target: CALORIE_FLOOR,
      note: t("A 15 percent reduction would fall below 1,500 kcal, so the figure stays at 1,500. This is not a very-low-calorie diet."),
    };
  }
  return {
    target: Math.round(reduced),
    note: t("A 15 percent reduction from the day estimate. It is a moderate estimate, not a prescription, and it is not a very-low-calorie diet."),
  };
}

export function buildTargets(
  input: ProteinInputs,
  flags: { pregnancy: boolean; kidney: boolean; liver: boolean; eatingDisorder: boolean; complexMedical: boolean },
  t: Translate = english,
): TargetResult {
  if (needsProfessional(flags)) {
    const bits = [
      flags.pregnancy ? t("pregnancy") : "",
      flags.kidney ? t("kidney disease") : "",
      flags.liver ? t("liver disease") : "",
      flags.eatingDisorder ? t("an eating disorder") : "",
      flags.complexMedical ? t("a complex medical diet") : "",
    ].filter(Boolean);
    return {
      ok: false,
      reason: t("LifeZoi will not set a personal protein or calorie target for {conditions}. Please consult a qualified professional. Protein is not raised here.", {
        conditions: bits.join(", "),
      }),
    };
  }
  if (!input.activity) return { ok: false, reason: t("Choose an activity level to see a day estimate.") };
  const parsed = parseBody(input, t);
  if (!parsed.ok) return parsed;
  const { body } = parsed;
  const resting = mifflinStJeor(body.sex, body.weightKg, body.heightCm, body.age);
  const activity = ACTIVITY_FACTORS[input.activity];
  const dayKcal = resting * activity.factor;
  const calories = caloriePlan(dayKcal, input.goal, t);
  const chosenPerKg =
    input.gramsPerKg === null
      ? RDA_G_PER_KG
      : Math.min(REFERENCE_HIGH_G_PER_KG, Math.max(RDA_G_PER_KG, input.gramsPerKg));
  return {
    ok: true,
    body,
    resting,
    activityFactor: activity.factor,
    activityLabel: t(activity.label),
    dayKcal,
    calorieTarget: calories.target,
    calorieNote: calories.note,
    rdaGrams: body.weightKg * RDA_G_PER_KG,
    referenceLow: body.weightKg * REFERENCE_LOW_G_PER_KG,
    referenceHigh: body.weightKg * REFERENCE_HIGH_G_PER_KG,
    chosenPerKg,
    proteinGrams: body.weightKg * chosenPerKg,
    proteinNote:
      input.goal === "lose"
        ? t("A weight-loss goal does not by itself raise the protein figure. The general adult RDA is the starting point until you move it.")
        : t("The starting point is the general adult RDA, 0.8 g per kg per day. A higher figure is a reference you can choose, not a prescription."),
    raisedBlocked: false,
  };
}

export function clampProteinRate(value: number): number {
  if (!Number.isFinite(value)) return RDA_G_PER_KG;
  const stepped = Math.round(value * 10) / 10;
  return Math.min(REFERENCE_HIGH_G_PER_KG, Math.max(RDA_G_PER_KG, stepped));
}
