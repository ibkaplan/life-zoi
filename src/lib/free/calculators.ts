import { msg } from "@/lib/i18n/translate";

/**
 * The free public calculators. Everything here is a pure function: the pages
 * run it in the browser, send nothing to a server, and save nothing.
 * Each result is general information from the published source named on the
 * page, not a diagnosis and not a personal target.
 */

export type Sex = "female" | "male";

export const LIMITS = {
  age: { min: 18, max: 100 },
  heightCm: { min: 120, max: 230 },
  weightKg: { min: 35, max: 300 },
  systolic: { min: 60, max: 300 },
  diastolic: { min: 30, max: 200 },
  fallAsleep: { min: 0, max: 90 },
} as const;

/** A number typed by a person (comma or dot as the decimal mark), within limits, or null. */
export function parseNumber(value: string | number, limits: { min: number; max: number }): number | null {
  const text = typeof value === "number" ? String(value) : value.trim().replace(",", ".");
  if (!/^\d+(?:\.\d+)?$/.test(text)) return null;
  const n = Number(text);
  if (!Number.isFinite(n) || n < limits.min || n > limits.max) return null;
  return n;
}

export const LB_PER_KG = 2.20462;
export const CM_PER_INCH = 2.54;

export function poundsToKg(pounds: number): number {
  return pounds / LB_PER_KG;
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * CM_PER_INCH;
}

/* ---------- Calories ---------- */

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very";

/** Activity multipliers commonly used with resting energy equations. */
export const ACTIVITY: readonly { key: ActivityLevel; factor: number; label: string; detail: string }[] = [
  { key: "sedentary", factor: 1.2, label: msg("Mostly sitting"), detail: msg("Little or no planned exercise") },
  { key: "light", factor: 1.375, label: msg("Lightly active"), detail: msg("Light exercise or walks 1 to 3 days a week") },
  { key: "moderate", factor: 1.55, label: msg("Moderately active"), detail: msg("Moderate exercise 3 to 5 days a week") },
  { key: "active", factor: 1.725, label: msg("Very active"), detail: msg("Hard exercise 6 to 7 days a week") },
  { key: "very", factor: 1.9, label: msg("Extra active"), detail: msg("Physical job plus hard exercise most days") },
];

/** Resting energy, kcal a day, by the Mifflin–St Jeor equation (1990). */
export function restingEnergy(input: { sex: Sex; age: number; heightCm: number; weightKg: number }): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  return input.sex === "male" ? base + 5 : base - 161;
}

export type CalorieResult = { resting: number; daily: number; factor: number };

/** Resting energy and the daily estimate for an activity level, both rounded to 10 kcal. */
export function estimateCalories(input: { sex: Sex; age: number; heightCm: number; weightKg: number; activity: ActivityLevel }): CalorieResult {
  const factor = ACTIVITY.find((level) => level.key === input.activity)?.factor ?? 1.2;
  const resting = restingEnergy(input);
  const round10 = (n: number) => Math.round(n / 10) * 10;
  return { resting: round10(resting), daily: round10(resting * factor), factor };
}

/* ---------- Water ---------- */

export type WaterGroup = "female" | "male" | "pregnant" | "breastfeeding";

/**
 * Adequate intake of total water for adults from the U.S. National Academies
 * (Dietary Reference Intakes for water, released 2004, published 2005): litres a day from all drinks and
 * food, and the part that usually comes from drinks.
 */
export const WATER_NASEM: Record<WaterGroup, { total: number; drinks: number }> = {
  female: { total: 2.7, drinks: 2.2 },
  male: { total: 3.7, drinks: 3.0 },
  pregnant: { total: 3.0, drinks: 2.3 },
  breastfeeding: { total: 3.8, drinks: 3.1 },
};

export const GLASS_ML = 250;

export function glasses(litres: number): number {
  return Math.round((litres * 1000) / GLASS_ML);
}

/* ---------- Sleep ---------- */

export type SleepAge = "teen" | "adult" | "older" | "senior";

/** Hours of sleep a night recommended by the U.S. CDC, by age group. */
export const SLEEP_HOURS: Record<SleepAge, { label: string; min: number; max: number; orMore: boolean }> = {
  teen: { label: msg("13 to 17 years"), min: 8, max: 10, orMore: false },
  adult: { label: msg("18 to 60 years"), min: 7, max: 9, orMore: true },
  older: { label: msg("61 to 64 years"), min: 7, max: 9, orMore: false },
  senior: { label: msg("65 years and older"), min: 7, max: 8, orMore: false },
};

/** "HH:MM" to minutes after midnight, or null. */
export function parseClock(value: string): number | null {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

export function formatClock(minutes: number): string {
  const day = 24 * 60;
  const m = ((Math.round(minutes) % day) + day) % day;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** For each recommended number of hours, the time to go to bed so that you wake at `wake`. */
export function bedtimes(wake: string, age: SleepAge, fallAsleepMinutes: number): { hours: number; bedtime: string }[] | null {
  const wakeAt = parseClock(wake);
  if (wakeAt === null) return null;
  const { min, max } = SLEEP_HOURS[age];
  const out: { hours: number; bedtime: string }[] = [];
  for (let hours = max; hours >= min; hours -= 1) out.push({ hours, bedtime: formatClock(wakeAt - hours * 60 - fallAsleepMinutes) });
  return out;
}

/* ---------- Blood pressure ---------- */

export type BpCategory = "low" | "normal" | "elevated" | "stage1" | "stage2" | "severe";

/** The adult categories of the American Heart Association, top to bottom of the table. */
export const BP_TABLE: readonly { key: BpCategory; label: string; systolic: string; join: string; diastolic: string }[] = [
  { key: "normal", label: msg("Normal"), systolic: msg("Less than 120"), join: msg("and"), diastolic: msg("Less than 80") },
  { key: "elevated", label: msg("Elevated"), systolic: "120–129", join: msg("and"), diastolic: msg("Less than 80") },
  { key: "stage1", label: msg("High blood pressure, stage 1"), systolic: "130–139", join: msg("or"), diastolic: "80–89" },
  { key: "stage2", label: msg("High blood pressure, stage 2"), systolic: msg("140 or higher"), join: msg("or"), diastolic: msg("90 or higher") },
  { key: "severe", label: msg("Hypertensive crisis"), systolic: msg("Higher than 180"), join: msg("and/or"), diastolic: msg("Higher than 120") },
];

/** Which row a reading falls in. The higher of the two numbers decides. Below 90/60 is shown as lower than usual. */
export function bpCategory(systolic: number, diastolic: number): BpCategory {
  if (systolic > 180 || diastolic > 120) return "severe";
  if (systolic >= 140 || diastolic >= 90) return "stage2";
  if (systolic >= 130 || diastolic >= 80) return "stage1";
  if (systolic >= 120) return "elevated";
  if (systolic < 90 || diastolic < 60) return "low";
  return "normal";
}

/** Both numbers typed and plausible, with the top number above the bottom one. */
export function parseReading(systolic: string, diastolic: string): { systolic: number; diastolic: number } | null {
  const s = parseNumber(systolic, LIMITS.systolic);
  const d = parseNumber(diastolic, LIMITS.diastolic);
  if (s === null || d === null || s <= d) return null;
  return { systolic: Math.round(s), diastolic: Math.round(d) };
}
