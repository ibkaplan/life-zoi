import { mondayOf } from "@/lib/dates";
import type { BloodPressureReading, CholesterolReading, GlucoseContext, GlucoseReading, HealthReading } from "./types";

export const PERIODS = ["30d", "90d", "1y", "all"] as const;
export type Period = (typeof PERIODS)[number];

const PERIOD_DAYS: Record<Period, number | null> = { "30d": 30, "90d": 90, "1y": 365, all: null };

/** Readings inside the period, oldest first. */
export function inPeriod<T extends HealthReading>(readings: readonly T[], period: Period, now: Date = new Date()): T[] {
  const days = PERIOD_DAYS[period];
  const from = days === null ? -Infinity : now.getTime() - days * 86_400_000;
  return readings.filter((reading) => Date.parse(reading.measuredAt) >= from).sort((a, b) => a.measuredAt.localeCompare(b.measuredAt));
}

export type SeriesPoint = { at: number; value: number; label: string };
export type Series = { key: string; name: string; points: SeriesPoint[] };

/** Local calendar date of an ISO time, "YYYY-MM-DD". */
export function localDay(iso: string): string {
  const at = new Date(iso);
  return `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}-${String(at.getDate()).padStart(2, "0")}`;
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Long periods would put hundreds of dots on a phone screen, so readings over
 * more than 90 days are drawn as one point per week (the week's average). The
 * table under each chart always lists every reading.
 */
export function groupForChart(points: SeriesPoint[], period: Period): SeriesPoint[] {
  if (period === "30d" || period === "90d") return points;
  const weeks = new Map<string, SeriesPoint[]>();
  for (const point of points) {
    const week = mondayOf(localDay(new Date(point.at).toISOString()));
    weeks.set(week, [...(weeks.get(week) ?? []), point]);
  }
  return [...weeks.entries()].map(([week, group]) => ({
    at: Date.parse(`${week}T12:00:00`),
    value: Math.round(average(group.map((point) => point.value)) * 10) / 10,
    label: week,
  }));
}

export function bloodPressureSeries(readings: readonly BloodPressureReading[]): Series[] {
  const point = (reading: BloodPressureReading, value: number) => ({ at: Date.parse(reading.measuredAt), value, label: reading.measuredAt });
  const series: Series[] = [
    { key: "systolic", name: "Systolic (upper)", points: readings.map((reading) => point(reading, reading.systolic)) },
    { key: "diastolic", name: "Diastolic (lower)", points: readings.map((reading) => point(reading, reading.diastolic)) },
  ];
  const pulses = readings.filter((reading) => reading.pulse !== null);
  if (pulses.length > 0) series.push({ key: "pulse", name: "Pulse", points: pulses.map((reading) => point(reading, reading.pulse as number)) });
  return series;
}

/** One line per measuring context the person used, so fasting and after-meal values are not mixed. */
export function glucoseSeries(readings: readonly GlucoseReading[]): Series[] {
  const byContext = new Map<GlucoseContext, GlucoseReading[]>();
  for (const reading of readings) byContext.set(reading.context, [...(byContext.get(reading.context) ?? []), reading]);
  return [...byContext.entries()].map(([context, group]) => ({
    key: context,
    name: context,
    points: group.map((reading) => ({ at: Date.parse(reading.measuredAt), value: reading.glucose, label: reading.measuredAt })),
  }));
}

export function cholesterolSeries(readings: readonly CholesterolReading[]): Series[] {
  const parts = ["total", "ldl", "hdl", "triglycerides"] as const;
  return parts
    .map((part) => ({
      key: part,
      name: part,
      points: readings
        .filter((reading) => reading[part] !== null)
        .map((reading) => ({ at: Date.parse(reading.measuredAt), value: reading[part] as number, label: reading.measuredAt })),
    }))
    .filter((series) => series.points.length > 0);
}

export type Summary = { count: number; average: number; lowest: number; highest: number; first: number; last: number };

/** Count, average, lowest, highest, first and last value of one line. Null when it has no points. */
export function summarize(points: readonly SeriesPoint[]): Summary | null {
  if (points.length === 0) return null;
  const values = points.map((point) => point.value);
  return {
    count: values.length,
    average: Math.round(average(values) * 10) / 10,
    lowest: Math.min(...values),
    highest: Math.max(...values),
    first: values[0] as number,
    last: values.at(-1) as number,
  };
}

/** The most recent reading of a kind, or null. */
export function latest<T extends HealthReading>(readings: readonly T[]): T | null {
  return readings.reduce<T | null>((best, reading) => (!best || reading.measuredAt > best.measuredAt ? reading : best), null);
}

/** Chart scale: nice rounded bounds that always include the reference lines. */
export function niceRange(values: number[], extra: number[] = []): { min: number; max: number } {
  const all = [...values, ...extra];
  if (all.length === 0) return { min: 0, max: 100 };
  const low = Math.min(...all);
  const high = Math.max(...all);
  const span = Math.max(high < 30 ? 1 : 10, high - low);
  const step = high < 30 ? (span > 10 ? 5 : 1) : span > 400 ? 100 : span > 150 ? 50 : span > 40 ? 20 : 10;
  return { min: Math.max(0, Math.floor((low - span * 0.08) / step) * step), max: Math.ceil((high + span * 0.08) / step) * step };
}
