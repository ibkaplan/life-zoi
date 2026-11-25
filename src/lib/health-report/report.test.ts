import { describe, expect, it } from "vitest";
import { emptyCompanion } from "@/lib/companion/state";
import type { HealthReading } from "@/lib/health-diary/types";
import { buildWeeklyReport, reportToCsv, reportWindow, sampleDays } from "./report";

const at = (date: string, hour: number) => new Date(`${date}T${String(hour).padStart(2, "0")}:00:00`).toISOString();
const t = (text: string) => text;

const readings: HealthReading[] = [
  { id: "a", kind: "blood_pressure", measuredAt: at("2026-11-20", 8), systolic: 130, diastolic: 84, pulse: 70, note: "" },
  { id: "b", kind: "blood_pressure", measuredAt: at("2026-11-24", 8), systolic: 120, diastolic: 76, pulse: null, note: "after walk" },
  { id: "c", kind: "blood_pressure", measuredAt: at("2026-11-10", 8), systolic: 150, diastolic: 95, pulse: 80, note: "" },
  { id: "d", kind: "glucose", measuredAt: at("2026-11-21", 7), glucose: 100, context: "fasting", unit: "mg/dL", note: "" },
  { id: "e", kind: "glucose", measuredAt: at("2026-11-22", 7), glucose: 96, context: "fasting", unit: "mg/dL", note: "" },
  { id: "f", kind: "glucose", measuredAt: at("2026-11-22", 14), glucose: 140, context: "after_meal", unit: "mg/dL", note: "=SUM(A1)" },
  { id: "g", kind: "cholesterol", measuredAt: at("2026-10-01", 9), total: 200, ldl: 120, hdl: 50, triglycerides: null, unit: "mg/dL", note: "" },
];

describe("weekly report for a doctor", () => {
  it("covers the seven days ending on the chosen day, never a future week", () => {
    expect(reportWindow("2026-11-25", "2026-11-25")).toEqual({ from: "2026-11-19", to: "2026-11-25" });
    expect(reportWindow("2026-12-30", "2026-11-25")).toEqual({ from: "2026-11-19", to: "2026-11-25" });
    expect(reportWindow("nonsense", "2026-11-25").to).toBe("2026-11-25");
  });

  it("lists only the week's readings and summarizes them without judging", () => {
    const report = buildWeeklyReport(readings, emptyCompanion(), reportWindow("2026-11-25", "2026-11-25"));
    expect(report.bloodPressure.readings.map((reading) => reading.id)).toEqual(["a", "b"]);
    expect(report.bloodPressure.systolic).toMatchObject({ count: 2, average: 125, lowest: 120, highest: 130 });
    expect(report.bloodPressure.pulse).toMatchObject({ count: 1, average: 70 });
    expect(report.glucose.map((group) => [group.context, group.summary.count, group.summary.average])).toEqual([
      ["fasting", 2, 98],
      ["after_meal", 1, 140],
    ]);
    expect(report.cholesterol).toEqual([]);
    expect(report.earlierCholesterol?.id).toBe("g");
    expect(report.empty).toBe(false);
    expect(JSON.stringify(report)).not.toMatch(/score|risk/i);
  });

  it("adds the sleep, mood, energy, and feeling the person noted, and leaves blank days blank", () => {
    const companion = emptyCompanion();
    const report = buildWeeklyReport([], sampleDays("2026-11-25"), reportWindow("2026-11-25", "2026-11-25"));
    expect(report.days).toHaveLength(7);
    expect(report.sleep).toMatchObject({ count: 7, lowest: 6, highest: 8 });
    expect(report.feelings).toEqual({ great: 2, okay: 3, low: 1 });
    const blank = buildWeeklyReport([], companion, reportWindow("2026-11-25", "2026-11-25"));
    expect(blank.empty).toBe(true);
    expect(blank.sleep).toBeNull();
    expect(blank.days.every((day) => day.sleepHours === null && day.mood === null && day.feeling === null)).toBe(true);
  });

  it("downloads the week as a CSV with a byte order mark and neutralized formulas", () => {
    const report = buildWeeklyReport(readings, sampleDays("2026-11-25"), reportWindow("2026-11-25", "2026-11-25"));
    const csv = reportToCsv(report, "mmol/L", t);
    expect(csv.startsWith("﻿Date,Time,Type,Value,Unit,When measured,Note")).toBe(true);
    expect(csv).toContain("130/84,mmHg");
    expect(csv).toContain("5.3,mmol/L"); // 96 mg/dL
    expect(csv).toContain("'=SUM(A1)");
    expect(csv).toContain("Sleep,7,hours");
    expect(csv).not.toContain("2026-11-10");
  });
});
