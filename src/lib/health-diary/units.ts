import type { GlucoseUnit } from "./types";

/**
 * Standard laboratory conversion factors between mg/dL and mmol/L:
 * glucose 18.016 (molar mass 180.16 g/mol), cholesterol 38.67, triglycerides 88.57.
 */
export const GLUCOSE_FACTOR = 18.016;
export const CHOLESTEROL_FACTOR = 38.67;
export const TRIGLYCERIDE_FACTOR = 88.57;

export type LipidPart = "total" | "ldl" | "hdl" | "triglycerides";

function round(value: number, places: number): number {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

function lipidFactor(part: LipidPart): number {
  return part === "triglycerides" ? TRIGLYCERIDE_FACTOR : CHOLESTEROL_FACTOR;
}

/** A typed glucose value in mg/dL, kept to one decimal place. */
export function glucoseToMgdl(value: number, unit: GlucoseUnit): number {
  return round(unit === "mmol/L" ? value * GLUCOSE_FACTOR : value, 1);
}

export function glucoseFromMgdl(mgdl: number, unit: GlucoseUnit): number {
  return unit === "mmol/L" ? round(mgdl / GLUCOSE_FACTOR, 1) : Math.round(mgdl);
}

export function lipidToMgdl(value: number, unit: GlucoseUnit, part: LipidPart): number {
  return round(unit === "mmol/L" ? value * lipidFactor(part) : value, 1);
}

export function lipidFromMgdl(mgdl: number, unit: GlucoseUnit, part: LipidPart): number {
  return unit === "mmol/L" ? round(mgdl / lipidFactor(part), 2) : Math.round(mgdl);
}

/**
 * Reads a number the way people type it: "5,6" and "5.6" are both 5.6.
 * Empty text is null; anything else that is not a plain number is NaN.
 */
export function parseNumber(text: string): number | null {
  const trimmed = text.trim().replace(",", ".");
  if (trimmed === "") return null;
  if (!/^\d+(?:\.\d+)?$/.test(trimmed)) return Number.NaN;
  return Number(trimmed);
}
