import { msg, type Translate } from "@/lib/i18n/translate";
import type { HealthReading } from "./types";
import { glucoseFromMgdl, lipidFromMgdl } from "./units";
import { localDay } from "./series";

export const CSV_HEADERS = [
  msg("Date"),
  msg("Time"),
  msg("Type"),
  msg("Systolic (mmHg)"),
  msg("Diastolic (mmHg)"),
  msg("Pulse (beats per minute)"),
  msg("Blood sugar"),
  msg("When measured"),
  msg("Total cholesterol"),
  msg("LDL"),
  msg("HDL"),
  msg("Triglycerides"),
  msg("Unit"),
  msg("Note"),
];

export const KIND_LABELS: Record<HealthReading["kind"], string> = {
  blood_pressure: msg("Blood pressure"),
  glucose: msg("Blood sugar"),
  cholesterol: msg("Cholesterol"),
};

export const CONTEXT_LABELS: Record<string, string> = {
  fasting: msg("Fasting (8 hours or more without food)"),
  before_meal: msg("Before a meal"),
  after_meal: msg("1 to 2 hours after a meal"),
  bedtime: msg("At bedtime"),
  other: msg("Other time"),
};

/** Quotes a cell and stops spreadsheet programs from reading it as a formula. */
export function csvCell(value: string | number | null): string {
  if (value === null) return "";
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function localTime(iso: string): string {
  const at = new Date(iso);
  return `${String(at.getHours()).padStart(2, "0")}:${String(at.getMinutes()).padStart(2, "0")}`;
}

/** Every reading, oldest first, in the unit the person typed it in. */
export function readingsToCsv(readings: readonly HealthReading[], t: Translate): string {
  const rows = [...readings].sort((a, b) => a.measuredAt.localeCompare(b.measuredAt)).map((reading) => {
    const cells: (string | number | null)[] = [localDay(reading.measuredAt), localTime(reading.measuredAt), t(KIND_LABELS[reading.kind])];
    if (reading.kind === "blood_pressure") cells.push(reading.systolic, reading.diastolic, reading.pulse, null, null, null, null, null, null, "mmHg");
    else if (reading.kind === "glucose")
      cells.push(null, null, null, glucoseFromMgdl(reading.glucose, reading.unit), t(CONTEXT_LABELS[reading.context] ?? reading.context), null, null, null, null, reading.unit);
    else {
      const value = (part: "total" | "ldl" | "hdl" | "triglycerides") => (reading[part] === null ? null : lipidFromMgdl(reading[part] as number, reading.unit, part));
      cells.push(null, null, null, null, null, value("total"), value("ldl"), value("hdl"), value("triglycerides"), reading.unit);
    }
    cells.push(reading.note || null);
    return cells.map(csvCell).join(",");
  });
  // A byte order mark lets spreadsheet programs open Cyrillic and Greek text correctly.
  return `﻿${[CSV_HEADERS.map((header) => csvCell(t(header))).join(","), ...rows].join("\r\n")}\r\n`;
}
