/**
 * Health diary: blood pressure, blood sugar, and cholesterol readings that a
 * person measured elsewhere (a home monitor, a meter, a lab report) and types in.
 * LifeZoi does not measure anything. Values are stored in mg/dL and mmHg; the
 * unit the person typed is kept so the diary can show it back the same way.
 */
export type ReadingKind = "blood_pressure" | "glucose" | "cholesterol";

export const READING_KINDS: readonly ReadingKind[] = ["blood_pressure", "glucose", "cholesterol"];

export type GlucoseUnit = "mg/dL" | "mmol/L";

export const GLUCOSE_CONTEXTS = ["fasting", "before_meal", "after_meal", "bedtime", "other"] as const;
export type GlucoseContext = (typeof GLUCOSE_CONTEXTS)[number];

export type BloodPressureReading = {
  id: string;
  kind: "blood_pressure";
  measuredAt: string;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  note: string;
};

export type GlucoseReading = {
  id: string;
  kind: "glucose";
  measuredAt: string;
  /** Always mg/dL. */
  glucose: number;
  context: GlucoseContext;
  unit: GlucoseUnit;
  note: string;
};

export type CholesterolReading = {
  id: string;
  kind: "cholesterol";
  measuredAt: string;
  /** All in mg/dL; any of them may be missing, at least one is present. */
  total: number | null;
  ldl: number | null;
  hdl: number | null;
  triglycerides: number | null;
  unit: GlucoseUnit;
  note: string;
};

export type HealthReading = BloodPressureReading | GlucoseReading | CholesterolReading;

/** Distributive omit, so each kind keeps its own fields. */
export type NewReading = HealthReading extends infer R ? (R extends HealthReading ? Omit<R, "id"> : never) : never;

export const NOTE_MAX = 300;
