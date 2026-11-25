import { msg } from "@/lib/i18n/translate";
import {
  GLUCOSE_CONTEXTS,
  NOTE_MAX,
  type GlucoseContext,
  type GlucoseUnit,
  type NewReading,
  type ReadingKind,
} from "./types";
import { glucoseFromMgdl, glucoseToMgdl, lipidFromMgdl, lipidToMgdl, parseNumber, type LipidPart } from "./units";

/**
 * The range of numbers the diary accepts. These are not health targets. They
 * only catch typing mistakes (an extra zero, mmol/L typed as mg/dL). The same
 * limits are CHECK constraints in the health_readings table, so the database
 * refuses anything outside them even if this check is skipped.
 */
export const LIMITS = {
  systolic: { min: 60, max: 260 },
  diastolic: { min: 30, max: 160 },
  pulse: { min: 30, max: 220 },
  glucose: { min: 20, max: 600 },
  total: { min: 50, max: 500 },
  ldl: { min: 10, max: 400 },
  hdl: { min: 10, max: 150 },
  triglycerides: { min: 20, max: 2000 },
} as const;

export const EARLIEST_YEAR = 1990;

export type ReadingForm = {
  kind: ReadingKind;
  /** Local date "YYYY-MM-DD" and time "HH:MM" from the form. */
  date: string;
  time: string;
  systolic?: string;
  diastolic?: string;
  pulse?: string;
  glucose?: string;
  context?: string;
  total?: string;
  ldl?: string;
  hdl?: string;
  triglycerides?: string;
  unit?: string;
  note?: string;
};

/** Field name → English message (translated with `t` when shown). `values` fills its {placeholders}. */
export type FieldErrors = Record<string, { text: string; values?: Record<string, string | number> }>;

export type ValidationResult = { ok: true; reading: NewReading } | { ok: false; errors: FieldErrors };

const OUT_OF_RANGE = msg("Enter a number from {min} to {max} {unit}.");

function isUnit(value: string | undefined): value is GlucoseUnit {
  return value === "mg/dL" || value === "mmol/L";
}

/** Local date and time from the form, as an ISO timestamp, or null if it is not a real moment. */
export function toMeasuredAt(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [year, month, day] = date.split("-").map(Number) as [number, number, number];
  const [hour, minute] = time.split(":").map(Number) as [number, number];
  const at = new Date(year, month - 1, day, hour, minute);
  if (at.getFullYear() !== year || at.getMonth() !== month - 1 || at.getDate() !== day || at.getHours() !== hour) return null;
  return at.toISOString();
}

export function validateReading(form: ReadingForm, now: Date = new Date()): ValidationResult {
  const errors: FieldErrors = {};
  const measuredAt = toMeasuredAt(form.date, form.time);
  if (!measuredAt) {
    errors.date = { text: msg("Choose the date and time of the reading.") };
  } else {
    const at = new Date(measuredAt);
    if (at.getTime() > now.getTime() + 5 * 60_000) errors.date = { text: msg("The reading cannot be in the future.") };
    else if (at.getFullYear() < EARLIEST_YEAR) errors.date = { text: msg("Choose a date from {year} or later."), values: { year: EARLIEST_YEAR } };
  }
  const note = (form.note ?? "").trim();
  if (note.length > NOTE_MAX) errors.note = { text: msg("Keep the note under {max} characters."), values: { max: NOTE_MAX } };

  const whole = (field: keyof typeof LIMITS, text: string | undefined, required: boolean, unit: string): number | null => {
    const value = parseNumber(text ?? "");
    const { min, max } = LIMITS[field];
    if (value === null) {
      if (required) errors[field] = { text: msg("This number is needed.") };
      return null;
    }
    if (Number.isNaN(value) || value < min || value > max) {
      errors[field] = { text: OUT_OF_RANGE, values: { min, max, unit } };
      return null;
    }
    return value;
  };

  if (form.kind === "blood_pressure") {
    const systolic = whole("systolic", form.systolic, true, "mmHg");
    const diastolic = whole("diastolic", form.diastolic, true, "mmHg");
    const pulse = whole("pulse", form.pulse, false, msg("beats per minute"));
    for (const [field, value] of [["systolic", systolic], ["diastolic", diastolic], ["pulse", pulse]] as const) {
      if (value !== null && !Number.isInteger(value)) errors[field] = { text: msg("Use a whole number.") };
    }
    if (systolic !== null && diastolic !== null && diastolic >= systolic && !errors.diastolic) {
      errors.diastolic = { text: msg("The lower number (diastolic) should be smaller than the upper number (systolic). Check the order.") };
    }
    if (Object.keys(errors).length > 0 || systolic === null || diastolic === null) return { ok: false, errors };
    return { ok: true, reading: { kind: "blood_pressure", measuredAt: measuredAt as string, systolic, diastolic, pulse, note } };
  }

  if (!isUnit(form.unit)) {
    errors.unit = { text: msg("Choose mg/dL or mmol/L.") };
    return { ok: false, errors };
  }
  const unit = form.unit;

  /** Reads a value in the typed unit and checks it against the mg/dL limits. */
  const measured = (field: "glucose" | LipidPart, text: string | undefined, required: boolean): number | null => {
    const value = parseNumber(text ?? "");
    const { min, max } = LIMITS[field];
    const shown = (mgdl: number) => (field === "glucose" ? glucoseFromMgdl(mgdl, unit) : lipidFromMgdl(mgdl, unit, field));
    if (value === null) {
      if (required) errors[field] = { text: msg("This number is needed.") };
      return null;
    }
    const mgdl = Number.isNaN(value) ? Number.NaN : field === "glucose" ? glucoseToMgdl(value, unit) : lipidToMgdl(value, unit, field);
    if (Number.isNaN(mgdl) || mgdl < min || mgdl > max) {
      errors[field] = { text: OUT_OF_RANGE, values: { min: shown(min), max: shown(max), unit } };
      return null;
    }
    return mgdl;
  };

  if (form.kind === "glucose") {
    const glucose = measured("glucose", form.glucose, true);
    const context = GLUCOSE_CONTEXTS.includes(form.context as GlucoseContext) ? (form.context as GlucoseContext) : null;
    if (!context) errors.context = { text: msg("Choose when it was measured.") };
    if (Object.keys(errors).length > 0 || glucose === null || !context) return { ok: false, errors };
    return { ok: true, reading: { kind: "glucose", measuredAt: measuredAt as string, glucose, context, unit, note } };
  }

  const total = measured("total", form.total, false);
  const ldl = measured("ldl", form.ldl, false);
  const hdl = measured("hdl", form.hdl, false);
  const triglycerides = measured("triglycerides", form.triglycerides, false);
  const anyTyped = [form.total, form.ldl, form.hdl, form.triglycerides].some((text) => (text ?? "").trim() !== "");
  if (!anyTyped) errors.total = { text: msg("Enter at least one of the four numbers.") };
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, reading: { kind: "cholesterol", measuredAt: measuredAt as string, total, ldl, hdl, triglycerides, unit, note } };
}
