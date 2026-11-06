import { addIsoDays, daysBetween, formatLongDate, isRealISODate, mondayOf } from "@/lib/dates";
import {
  WEEKLY_ACCOMPLISHMENT_IDS,
  type EnergyLevel,
  type WeeklyAccomplishmentId,
  type WeightUnit,
} from "@/lib/types";

export const ENERGY_CHOICES: { level: EnergyLevel; face: string }[] = [
  { level: 1, face: "😴" },
  { level: 2, face: "😕" },
  { level: 3, face: "😐" },
  { level: 4, face: "🙂" },
  { level: 5, face: "⚡" },
];

export const WEEKLY_ACCOMPLISHMENTS: { id: WeeklyAccomplishmentId; label: string }[] = [
  { id: "movement", label: "I completed my movement lessons." },
  { id: "food", label: "I made healthier food choices." },
  { id: "water", label: "I drank enough water." },
  { id: "sleep", label: "I worked on my sleep." },
  { id: "relax", label: "I made time to relax." },
];

export const JOURNEY_STEPS = [
  { id: "start", label: "Starting Point", minDays: 0 },
  { id: "week", label: "First Week", minDays: 7 },
  { id: "month", label: "30-Day Progress", minDays: 30 },
  { id: "reflect", label: "90-Day Reflection", minDays: 90 },
] as const;

const MOVEMENT_KIND = /walk|movement|exercise|activity|strength|stretch|balance|cardio|lesson|yoga|chair|mobility/i;

export type MinuteLog = {
  date: string;
  minutes: number;
};

export type HabitTally = {
  marked: number;
  total: number;
};

export function weekRange(isoDate: string): { start: string; end: string } | null {
  const start = mondayOf(isoDate);
  if (!start) return null;
  const end = addIsoDays(start, 6);
  if (!end) return null;
  return { start, end };
}

export function formatWeekRange(start: string, end: string): string {
  return `${formatLongDate(start)} – ${formatLongDate(end)}`;
}

export function energyFace(level: EnergyLevel | null): string | null {
  if (level === null) return null;
  return ENERGY_CHOICES.find((choice) => choice.level === level)?.face ?? null;
}

export function selectedAccomplishments(
  flags: Partial<Record<WeeklyAccomplishmentId, boolean>>,
): WeeklyAccomplishmentId[] {
  return WEEKLY_ACCOMPLISHMENT_IDS.filter((id) => flags[id] === true);
}

export function flagsFromIds(ids: readonly string[]): Record<WeeklyAccomplishmentId, boolean> {
  return {
    movement: ids.includes("movement"),
    food: ids.includes("food"),
    water: ids.includes("water"),
    sleep: ids.includes("sleep"),
    relax: ids.includes("relax"),
  };
}

export function habitTally(markedIds: readonly string[] | null): HabitTally | null {
  if (!markedIds || markedIds.length === 0) return null;
  const allowed = new Set<string>(WEEKLY_ACCOMPLISHMENT_IDS);
  const marked = new Set(markedIds.filter((id) => allowed.has(id)));
  if (marked.size === 0) return null;
  return { marked: marked.size, total: WEEKLY_ACCOMPLISHMENT_IDS.length };
}

export function isMovementMinuteMeasurement(kind: string, unit: string): boolean {
  const normalized = unit.trim().toLowerCase();
  if (normalized !== "minute" && normalized !== "minutes" && normalized !== "min") return false;
  return MOVEMENT_KIND.test(kind);
}

export function movementLogsFromMeasurements(
  rows: { kind: string; unit: string; value: number; measuredOn: string }[],
): MinuteLog[] {
  const logs: MinuteLog[] = [];
  for (const row of rows) {
    if (!isMovementMinuteMeasurement(row.kind, row.unit)) continue;
    if (!isRealISODate(row.measuredOn)) continue;
    if (typeof row.value !== "number" || !Number.isFinite(row.value) || row.value <= 0) continue;
    logs.push({ date: row.measuredOn, minutes: row.value });
  }
  return logs;
}

export function sumMovementMinutes(logs: readonly MinuteLog[], weekStart: string, weekEnd: string): number | null {
  let total = 0;
  let found = false;
  for (const log of logs) {
    if (!isRealISODate(log.date) || log.date < weekStart || log.date > weekEnd) continue;
    if (!Number.isFinite(log.minutes) || log.minutes <= 0) continue;
    total += log.minutes;
    found = true;
  }
  if (!found) return null;
  return total;
}

export function formatMinuteTotal(value: number): string {
  const nearest = Math.round(value);
  if (Math.abs(value - nearest) < 0.001) return String(nearest);
  return (Math.round(value * 10) / 10).toFixed(1);
}

export function progressDates(input: {
  assessments: readonly string[];
  checkInDates: readonly string[];
  weeklyWeekStarts: readonly string[];
  weightDates: readonly string[];
  movementDates: readonly string[];
}): string[] {
  return [
    ...input.assessments,
    ...input.checkInDates,
    ...input.weeklyWeekStarts,
    ...input.weightDates,
    ...input.movementDates,
  ]
    .map((value) => value.slice(0, 10))
    .filter((value) => isRealISODate(value));
}

export function journeyStatus(dates: readonly string[]): { id: string; label: string; reached: boolean }[] {
  const real = [...new Set(dates.filter((date) => isRealISODate(date)))].sort();
  const start = real[0];
  return JOURNEY_STEPS.map((step) => ({
    id: step.id,
    label: step.label,
    reached: start
      ? real.some((date) => {
          const span = daysBetween(start, date);
          return span !== null && span >= step.minDays;
        })
      : false,
  }));
}

export function formatWeightValue(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

export function describeWeightTrend(
  entries: readonly { date: string; value: number; unit: WeightUnit }[],
): string | null {
  const real = entries.filter((entry) => isRealISODate(entry.date) && Number.isFinite(entry.value));
  if (real.length === 0) return null;
  const sorted = [...real].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 1) {
    return "One measurement is saved. Two or more are needed before a change over time can be shown.";
  }
  const unit = sorted[sorted.length - 1]?.unit;
  const same = sorted.filter((entry) => entry.unit === unit);
  if (!unit || same.length < 2) {
    return "Measurements use more than one unit. A change over time is shown only when at least two use the same unit.";
  }
  const first = same[0];
  const last = same[same.length - 1];
  if (!first || !last) return null;
  if (first.date === last.date) {
    return `Two ${unit} measurements are saved on ${formatLongDate(first.date)}.`;
  }
  if (first.value === last.value) {
    return `The earliest and latest ${unit} numbers you entered are the same.`;
  }
  return `From ${formatLongDate(first.date)} to ${formatLongDate(last.date)}, the ${unit} numbers you entered are ${formatWeightValue(first.value)} and ${formatWeightValue(last.value)}.`;
}
