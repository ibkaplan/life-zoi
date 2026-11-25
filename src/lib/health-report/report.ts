import { addIsoDays, isRealISODate } from "@/lib/dates";
import type { CompanionState, DailyFeeling } from "@/lib/companion/state";
import { csvCell, KIND_LABELS, CONTEXT_LABELS, localTime } from "@/lib/health-diary/csv";
import { localDay, summarize, type Summary } from "@/lib/health-diary/series";
import type { BloodPressureReading, CholesterolReading, GlucoseContext, GlucoseReading, GlucoseUnit, HealthReading } from "@/lib/health-diary/types";
import { glucoseFromMgdl, lipidFromMgdl } from "@/lib/health-diary/units";
import { msg, type Translate } from "@/lib/i18n/translate";

/**
 * Weekly report for a doctor: one page that puts the person's own health diary
 * readings (blood pressure, blood sugar, cholesterol) next to the sleep, mood,
 * and energy they noted in My Day and the one-tap feeling from LifeZoi Daily.
 *
 * It only lists and counts what the person typed. It adds no score, no range
 * verdict, and no advice, and nothing is sent anywhere: the page, the print,
 * and the CSV are all made on the device.
 */

export const REPORT_DAYS = 7;

export type ReportDay = {
  date: string;
  sleepHours: number | null;
  /** 1 low to 5 high, as the person tapped it in My Day. */
  mood: number | null;
  energy: number | null;
  feeling: DailyFeeling | null;
};

export type GlucoseGroup = { context: GlucoseContext; summary: Summary; readings: GlucoseReading[] };

export type WeeklyReport = {
  /** First and last calendar day, inclusive, "YYYY-MM-DD". */
  from: string;
  to: string;
  bloodPressure: {
    readings: BloodPressureReading[];
    systolic: Summary | null;
    diastolic: Summary | null;
    pulse: Summary | null;
  };
  glucose: GlucoseGroup[];
  cholesterol: CholesterolReading[];
  /** The most recent cholesterol result before the week, shown when the week has none. */
  earlierCholesterol: CholesterolReading | null;
  days: ReportDay[];
  sleep: Summary | null;
  mood: Summary | null;
  energy: Summary | null;
  feelings: Record<DailyFeeling, number>;
  /** True when nothing at all was recorded in the week. */
  empty: boolean;
};

/** The seven days ending on `to` (inclusive). An invalid date falls back to `today`. */
export function reportWindow(to: string, today: string): { from: string; to: string } {
  const end = isRealISODate(to) && to <= today ? to : today;
  return { from: addIsoDays(end, -(REPORT_DAYS - 1)), to: end };
}

function byDay<T extends HealthReading>(readings: readonly HealthReading[], kind: T["kind"], from: string, to: string): T[] {
  return readings
    .filter((reading): reading is T => reading.kind === kind)
    .filter((reading) => {
      const day = localDay(reading.measuredAt);
      return day >= from && day <= to;
    })
    .sort((a, b) => a.measuredAt.localeCompare(b.measuredAt));
}

const points = (values: (number | null)[]) =>
  values.filter((value): value is number => value !== null).map((value, index) => ({ at: index, value, label: "" }));

const CONTEXT_ORDER: GlucoseContext[] = ["fasting", "before_meal", "after_meal", "bedtime", "other"];

export function buildWeeklyReport(readings: readonly HealthReading[], companion: Pick<CompanionState, "days" | "daily">, window: { from: string; to: string }): WeeklyReport {
  const { from, to } = window;
  const bp = byDay<BloodPressureReading>(readings, "blood_pressure", from, to);
  const sugar = byDay<GlucoseReading>(readings, "glucose", from, to);
  const lipids = byDay<CholesterolReading>(readings, "cholesterol", from, to);
  const earlier = lipids.length
    ? null
    : readings
        .filter((reading): reading is CholesterolReading => reading.kind === "cholesterol" && localDay(reading.measuredAt) < from)
        .reduce<CholesterolReading | null>((best, reading) => (!best || reading.measuredAt > best.measuredAt ? reading : best), null);

  const glucose = CONTEXT_ORDER.flatMap((context) => {
    const group = sugar.filter((reading) => reading.context === context);
    const summary = summarize(points(group.map((reading) => reading.glucose)));
    return summary ? [{ context, summary, readings: group }] : [];
  });

  const days: ReportDay[] = [];
  for (let offset = 0; offset < REPORT_DAYS; offset += 1) {
    const date = addIsoDays(from, offset);
    const log = companion.days[date];
    days.push({
      date,
      sleepHours: log?.sleepHours ?? null,
      mood: log?.mood ?? null,
      energy: log?.energy ?? null,
      feeling: companion.daily.feelings[date] ?? null,
    });
  }
  const feelings: Record<DailyFeeling, number> = { great: 0, okay: 0, low: 0 };
  for (const day of days) if (day.feeling) feelings[day.feeling] += 1;

  const hasDays = days.some((day) => day.sleepHours !== null || day.mood !== null || day.energy !== null || day.feeling !== null);
  return {
    from,
    to,
    bloodPressure: {
      readings: bp,
      systolic: summarize(points(bp.map((reading) => reading.systolic))),
      diastolic: summarize(points(bp.map((reading) => reading.diastolic))),
      pulse: summarize(points(bp.map((reading) => reading.pulse))),
    },
    glucose,
    cholesterol: lipids,
    earlierCholesterol: earlier,
    days,
    sleep: summarize(points(days.map((day) => day.sleepHours))),
    mood: summarize(points(days.map((day) => day.mood))),
    energy: summarize(points(days.map((day) => day.energy))),
    feelings,
    empty: bp.length === 0 && sugar.length === 0 && lipids.length === 0 && !hasDays,
  };
}

/**
 * Sleep, mood, and energy for the labeled sample (Sample visitor). Made up,
 * shown only while the sample is on, and never saved.
 */
export function sampleDays(today: string): Pick<CompanionState, "days" | "daily"> {
  const sleep = [7, 6.5, 7.5, 6, 7, 8, 7];
  const mood = [4, 3, 4, 3, 4, 5, 4];
  const energy = [3, 3, 4, 2, 3, 4, 4];
  const feeling: (DailyFeeling | null)[] = ["okay", "okay", "great", "low", null, "great", "okay"];
  const days: CompanionState["days"] = {};
  const feelings: Record<string, DailyFeeling> = {};
  sleep.forEach((hours, index) => {
    const date = addIsoDays(today, index - (sleep.length - 1));
    days[date] = {
      date,
      entries: {},
      walkingMinutes: 0,
      exerciseMinutes: 0,
      readingPages: 0,
      listeningMinutes: 0,
      brainGames: 0,
      nutritionHabits: 0,
      sleepHours: hours,
      mood: mood[index] ?? null,
      energy: energy[index] ?? null,
      stayInside: false,
      movementBreaks: 0,
    };
    const tapped = feeling[index];
    if (tapped) feelings[date] = tapped;
  });
  return { days, daily: { feelings, skipped: [], explored: [] } };
}

export const FEELING_LABELS: Record<DailyFeeling, string> = {
  great: msg("Great"),
  okay: msg("Okay"),
  low: msg("Low Energy"),
};

export const REPORT_CSV_HEADERS = [
  msg("Date"),
  msg("Time"),
  msg("Type"),
  msg("Value"),
  msg("Unit"),
  msg("When measured"),
  msg("Note"),
];

const DAY_KIND = {
  sleep: msg("Sleep"),
  mood: msg("Mood (1 low, 5 high)"),
  energy: msg("Energy (1 low, 5 high)"),
  feeling: msg("How I felt"),
};

/** The week as a spreadsheet: one row per reading and one per noted day value, oldest first. */
export function reportToCsv(report: WeeklyReport, unit: GlucoseUnit, t: Translate): string {
  const rows: (string | number | null)[][] = [];
  const all: HealthReading[] = [...report.bloodPressure.readings, ...report.glucose.flatMap((group) => group.readings), ...report.cholesterol].sort((a, b) =>
    a.measuredAt.localeCompare(b.measuredAt),
  );
  for (const reading of all) {
    const base = [localDay(reading.measuredAt), localTime(reading.measuredAt), t(KIND_LABELS[reading.kind])];
    if (reading.kind === "blood_pressure") {
      rows.push([...base, `${reading.systolic}/${reading.diastolic}`, "mmHg", null, reading.note || null]);
      if (reading.pulse !== null) rows.push([...base, reading.pulse, t("beats per minute"), null, null]);
    } else if (reading.kind === "glucose") {
      rows.push([...base, glucoseFromMgdl(reading.glucose, unit), unit, t(CONTEXT_LABELS[reading.context] ?? reading.context), reading.note || null]);
    } else {
      const parts = (["total", "ldl", "hdl", "triglycerides"] as const)
        .filter((part) => reading[part] !== null)
        .map((part) => `${t(LIPID_NAMES[part])} ${lipidFromMgdl(reading[part] as number, unit, part)}`)
        .join("; ");
      rows.push([...base, parts, unit, null, reading.note || null]);
    }
  }
  for (const day of report.days) {
    if (day.sleepHours !== null) rows.push([day.date, null, t(DAY_KIND.sleep), day.sleepHours, t("hours"), null, null]);
    if (day.mood !== null) rows.push([day.date, null, t(DAY_KIND.mood), day.mood, "1–5", null, null]);
    if (day.energy !== null) rows.push([day.date, null, t(DAY_KIND.energy), day.energy, "1–5", null, null]);
    if (day.feeling !== null) rows.push([day.date, null, t(DAY_KIND.feeling), t(FEELING_LABELS[day.feeling]), null, null, null]);
  }
  rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])) || String(a[1] ?? "").localeCompare(String(b[1] ?? "")));
  const header = REPORT_CSV_HEADERS.map((text) => csvCell(t(text))).join(",");
  // A byte order mark lets spreadsheet programs open Cyrillic and Greek text correctly.
  return `﻿${[header, ...rows.map((row) => row.map(csvCell).join(","))].join("\r\n")}\r\n`;
}

export const LIPID_NAMES = {
  total: msg("Total cholesterol"),
  ldl: msg("LDL"),
  hdl: msg("HDL"),
  triglycerides: msg("Triglycerides"),
} as const;
