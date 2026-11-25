import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { TrendChart } from "@/components/health-diary/trend-chart";
import { makeTranslate } from "@/lib/i18n/translate";
import { csvCell, readingsToCsv } from "./csv";
import { compareBloodPressure, compareCholesterol, compareGlucose, safetyNoteFor } from "./ranges";
import { dueReminders, sanitizeReminders } from "./reminders";
import { insertReading, loadReadings, readingToRow, removeAllReadings, removeReading, rowToReading, type HealthRow } from "./repository";
import { sampleReadings } from "./sample";
import { bloodPressureSeries, glucoseSeries, groupForChart, inPeriod, latest, niceRange, summarize } from "./series";
import type { HealthReading } from "./types";
import { glucoseFromMgdl, glucoseToMgdl, lipidFromMgdl, lipidToMgdl, parseNumber } from "./units";
import { toMeasuredAt, validateReading } from "./validate";

const NOW = new Date(2026, 10, 25, 12, 0);
const t = makeTranslate(null);

describe("unit conversion", () => {
  it("converts glucose between mg/dL and mmol/L", () => {
    expect(glucoseToMgdl(5.6, "mmol/L")).toBe(100.9);
    expect(glucoseFromMgdl(100, "mmol/L")).toBe(5.6);
    expect(glucoseFromMgdl(126, "mmol/L")).toBe(7);
    expect(glucoseFromMgdl(70, "mmol/L")).toBe(3.9);
    expect(glucoseToMgdl(98, "mg/dL")).toBe(98);
    expect(glucoseFromMgdl(98.4, "mg/dL")).toBe(98);
  });

  it("converts cholesterol and triglycerides with their own factors", () => {
    expect(lipidFromMgdl(200, "mmol/L", "total")).toBe(5.17);
    expect(lipidFromMgdl(150, "mmol/L", "triglycerides")).toBe(1.69);
    expect(lipidToMgdl(5.17, "mmol/L", "ldl")).toBe(199.9);
    expect(lipidToMgdl(1.7, "mmol/L", "triglycerides")).toBe(150.6);
  });

  it("round-trips a typed mmol/L value", () => {
    for (const value of [3.9, 5.5, 7.8, 11.1, 22.2]) expect(glucoseFromMgdl(glucoseToMgdl(value, "mmol/L"), "mmol/L")).toBe(value);
  });

  it("reads numbers with a comma or a dot and refuses other text", () => {
    expect(parseNumber("5,6")).toBe(5.6);
    expect(parseNumber(" 120 ")).toBe(120);
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("12a")).toBeNaN();
    expect(parseNumber("-5")).toBeNaN();
  });
});

describe("validation", () => {
  const base = { date: "2026-11-25", time: "08:15" };

  it("accepts a normal blood pressure reading with pulse", () => {
    const result = validateReading({ kind: "blood_pressure", ...base, systolic: "124", diastolic: "79", pulse: "68", note: " calm " }, NOW);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.reading).toMatchObject({ kind: "blood_pressure", systolic: 124, diastolic: 79, pulse: 68, note: "calm" });
  });

  it("refuses implausible blood pressure and a swapped order", () => {
    const tooHigh = validateReading({ kind: "blood_pressure", ...base, systolic: "1240", diastolic: "79" }, NOW);
    expect(tooHigh.ok).toBe(false);
    if (!tooHigh.ok) expect(tooHigh.errors.systolic?.values).toMatchObject({ min: 60, max: 260 });
    const swapped = validateReading({ kind: "blood_pressure", ...base, systolic: "80", diastolic: "120" }, NOW);
    expect(swapped.ok).toBe(false);
    if (!swapped.ok) expect(Object.keys(swapped.errors)).toEqual(["diastolic"]);
    const decimal = validateReading({ kind: "blood_pressure", ...base, systolic: "120.5", diastolic: "80" }, NOW);
    expect(decimal.ok).toBe(false);
    const missing = validateReading({ kind: "blood_pressure", ...base, systolic: "", diastolic: "80" }, NOW);
    expect(missing.ok).toBe(false);
  });

  it("stores glucose in mg/dL whatever unit was typed", () => {
    const mmol = validateReading({ kind: "glucose", ...base, glucose: "5,4", context: "fasting", unit: "mmol/L" }, NOW);
    expect(mmol.ok && mmol.reading.kind === "glucose" && mmol.reading.glucose).toBe(97.3);
    const mg = validateReading({ kind: "glucose", ...base, glucose: "97", context: "after_meal", unit: "mg/dL" }, NOW);
    expect(mg.ok && mg.reading.kind === "glucose" && mg.reading.glucose).toBe(97);
  });

  it("catches mg/dL typed as mmol/L and the other way round, with limits in the typed unit", () => {
    const asMmol = validateReading({ kind: "glucose", ...base, glucose: "98", context: "fasting", unit: "mmol/L" }, NOW);
    expect(asMmol.ok).toBe(false);
    if (!asMmol.ok) expect(asMmol.errors.glucose?.values).toMatchObject({ min: 1.1, max: 33.3, unit: "mmol/L" });
    const asMg = validateReading({ kind: "glucose", ...base, glucose: "5.4", context: "fasting", unit: "mg/dL" }, NOW);
    expect(asMg.ok).toBe(false);
  });

  it("needs a context and a unit for glucose", () => {
    expect(validateReading({ kind: "glucose", ...base, glucose: "100", context: "sometime", unit: "mg/dL" }, NOW).ok).toBe(false);
    expect(validateReading({ kind: "glucose", ...base, glucose: "100", context: "fasting", unit: "g/L" }, NOW).ok).toBe(false);
  });

  it("accepts any subset of cholesterol numbers but not none", () => {
    const some = validateReading({ kind: "cholesterol", ...base, ldl: "3.1", hdl: "1.4", unit: "mmol/L" }, NOW);
    expect(some.ok).toBe(true);
    if (some.ok && some.reading.kind === "cholesterol") {
      expect(some.reading.total).toBeNull();
      expect(some.reading.ldl).toBe(119.9);
      expect(some.reading.hdl).toBe(54.1);
    }
    expect(validateReading({ kind: "cholesterol", ...base, unit: "mg/dL" }, NOW).ok).toBe(false);
    expect(validateReading({ kind: "cholesterol", ...base, triglycerides: "5000", unit: "mg/dL" }, NOW).ok).toBe(false);
  });

  it("refuses a reading in the future, an impossible date, and a long note", () => {
    expect(validateReading({ kind: "blood_pressure", date: "2026-11-26", time: "08:00", systolic: "120", diastolic: "80" }, NOW).ok).toBe(false);
    expect(validateReading({ kind: "blood_pressure", date: "2026-02-30", time: "08:00", systolic: "120", diastolic: "80" }, NOW).ok).toBe(false);
    expect(validateReading({ kind: "blood_pressure", date: "1985-01-01", time: "08:00", systolic: "120", diastolic: "80" }, NOW).ok).toBe(false);
    expect(validateReading({ kind: "blood_pressure", ...base, systolic: "120", diastolic: "80", note: "x".repeat(301) }, NOW).ok).toBe(false);
    expect(toMeasuredAt("2026-11-25", "25:00")).toBeNull();
  });
});

describe("general reference ranges", () => {
  it("places blood pressure in the AHA categories", () => {
    expect(compareBloodPressure({ systolic: 118, diastolic: 76 }).label).toBe("Normal range");
    expect(compareBloodPressure({ systolic: 125, diastolic: 78 }).label).toBe("Elevated range");
    expect(compareBloodPressure({ systolic: 125, diastolic: 82 }).label).toBe("Stage 1 high blood pressure range");
    expect(compareBloodPressure({ systolic: 142, diastolic: 70 }).label).toBe("Stage 2 high blood pressure range");
    expect(compareBloodPressure({ systolic: 182, diastolic: 100 }).tone).toBe("urgent");
    expect(compareBloodPressure({ systolic: 160, diastolic: 121 }).tone).toBe("urgent");
    expect(compareBloodPressure({ systolic: 180, diastolic: 120 }).tone).toBe("high");
    expect(compareBloodPressure({ systolic: 86, diastolic: 56 }).tone).toBe("low");
  });

  it("compares fasting glucose only when it was fasting, and always flags low", () => {
    expect(compareGlucose({ glucose: 92, context: "fasting" })?.tone).toBe("ok");
    expect(compareGlucose({ glucose: 110, context: "fasting" })?.tone).toBe("watch");
    expect(compareGlucose({ glucose: 126, context: "fasting" })?.tone).toBe("high");
    expect(compareGlucose({ glucose: 150, context: "after_meal" })).toBeNull();
    expect(compareGlucose({ glucose: 65, context: "after_meal" })?.tone).toBe("low");
  });

  it("compares each cholesterol number on its own", () => {
    const parts = compareCholesterol({ total: 210, ldl: 95, hdl: 45, triglycerides: 170 });
    expect(parts.map((part) => [part.part, part.comparison.tone])).toEqual([
      ["total", "high"],
      ["ldl", "ok"],
      ["hdl", "watch"],
      ["triglycerides", "watch"],
    ]);
    expect(compareCholesterol({ total: null, ldl: null, hdl: 62, triglycerides: 210 }).map((part) => part.comparison.label)).toEqual(["In the best range", "Above the general range"]);
  });

  it("gives a safety note for very high or low readings and none for ordinary ones", () => {
    const high = safetyNoteFor({ kind: "blood_pressure", measuredAt: "", systolic: 185, diastolic: 95, pulse: null, note: "" });
    expect(high?.emergency).toBe(true);
    expect(high?.body).toContain("emergency");
    expect(safetyNoteFor({ kind: "blood_pressure", measuredAt: "", systolic: 130, diastolic: 85, pulse: null, note: "" })).toBeNull();
    expect(safetyNoteFor({ kind: "glucose", measuredAt: "", glucose: 62, context: "other", unit: "mg/dL", note: "" })?.title).toContain("low");
    expect(safetyNoteFor({ kind: "glucose", measuredAt: "", glucose: 140, context: "after_meal", unit: "mg/dL", note: "" })).toBeNull();
  });

  it("never names a medicine or a dose", () => {
    const notes = [
      safetyNoteFor({ kind: "blood_pressure", measuredAt: "", systolic: 190, diastolic: 125, pulse: null, note: "" }),
      safetyNoteFor({ kind: "blood_pressure", measuredAt: "", systolic: 85, diastolic: 55, pulse: null, note: "" }),
      safetyNoteFor({ kind: "glucose", measuredAt: "", glucose: 50, context: "other", unit: "mg/dL", note: "" }),
    ];
    for (const note of notes) expect(`${note?.title} ${note?.body}`).not.toMatch(/insulin|tablet|\bmg\b|dose|grams|juice/i);
  });
});

const ROWS: HealthRow[] = [
  { id: "a", kind: "blood_pressure", measured_at: "2026-11-20T08:00:00+00:00", systolic: 124, diastolic: 79, pulse: 70, glucose_mgdl: null, glucose_context: null, total_mgdl: null, ldl_mgdl: null, hdl_mgdl: null, triglycerides_mgdl: null, unit: null, note: null },
  { id: "b", kind: "glucose", measured_at: "2026-11-21T07:00:00+00:00", systolic: null, diastolic: null, pulse: null, glucose_mgdl: "97.3", glucose_context: "fasting", total_mgdl: null, ldl_mgdl: null, hdl_mgdl: null, triglycerides_mgdl: null, unit: "mmol/L", note: "after sleep" },
  { id: "c", kind: "cholesterol", measured_at: "2026-11-22T09:00:00+00:00", systolic: null, diastolic: null, pulse: null, glucose_mgdl: null, glucose_context: null, total_mgdl: "196", ldl_mgdl: null, hdl_mgdl: "55.0", triglycerides_mgdl: null, unit: "mg/dL", note: null },
  { id: "d", kind: "weight", measured_at: "2026-11-22T09:00:00+00:00", systolic: null, diastolic: null, pulse: null, glucose_mgdl: null, glucose_context: null, total_mgdl: null, ldl_mgdl: null, hdl_mgdl: null, triglycerides_mgdl: null, unit: null, note: null },
];

/** A stand-in for the Supabase client that records each call chain. */
function fakeClient(result: { data: unknown; error: { code?: string; message?: string } | null }) {
  const calls: unknown[][] = [];
  const chain: Record<string, unknown> = {};
  for (const name of ["from", "select", "eq", "order", "limit", "insert", "delete", "single"]) {
    chain[name] = (...args: unknown[]) => {
      calls.push([name, ...args]);
      return chain;
    };
  }
  chain.then = (resolve: (value: unknown) => void) => resolve(result);
  return { client: chain as unknown as SupabaseClient, calls };
}

describe("account storage", () => {
  it("turns rows into readings and skips rows it does not understand", () => {
    const readings = ROWS.map(rowToReading);
    expect(readings[0]).toMatchObject({ kind: "blood_pressure", systolic: 124, pulse: 70, note: "" });
    expect(readings[1]).toMatchObject({ kind: "glucose", glucose: 97.3, unit: "mmol/L", context: "fasting" });
    expect(readings[2]).toMatchObject({ kind: "cholesterol", total: 196, hdl: 55, ldl: null });
    expect(readings[3]).toBeNull();
    expect(rowToReading({ ...ROWS[0]!, systolic: 999 })).toBeNull();
  });

  it("writes only the columns of the reading's kind", () => {
    const row = readingToRow({ kind: "glucose", measuredAt: "2026-11-21T07:00:00.000Z", glucose: 97.3, context: "fasting", unit: "mmol/L", note: "" }, "user-1");
    expect(row).toMatchObject({ user_id: "user-1", kind: "glucose", glucose_mgdl: 97.3, glucose_context: "fasting", unit: "mmol/L", systolic: null, total_mgdl: null, note: null });
    const back = rowToReading({ ...row, id: "x" });
    expect(back).toMatchObject({ kind: "glucose", glucose: 97.3 });
  });

  it("loads only the signed-in person's rows, newest first", async () => {
    const { client, calls } = fakeClient({ data: ROWS, error: null });
    const result = await loadReadings(client, "user-1");
    expect(result.ok && result.value.length).toBe(3);
    expect(calls).toContainEqual(["from", "health_readings"]);
    expect(calls).toContainEqual(["eq", "user_id", "user-1"]);
    expect(calls).toContainEqual(["order", "measured_at", { ascending: false }]);
  });

  it("reports a missing table so the page can say storage is not set up", async () => {
    const { client } = fakeClient({ data: null, error: { code: "PGRST205", message: "Could not find the table 'public.health_readings'" } });
    expect(await loadReadings(client, "user-1")).toEqual({ ok: false, missingTable: true });
    const other = fakeClient({ data: null, error: { code: "500", message: "timeout" } });
    expect(await loadReadings(other.client, "user-1")).toEqual({ ok: false, missingTable: false });
  });

  it("inserts, deletes one, and deletes all within the person's own rows", async () => {
    const insert = fakeClient({ data: ROWS[0], error: null });
    const saved = await insertReading(insert.client, "user-1", { kind: "blood_pressure", measuredAt: "2026-11-20T08:00:00.000Z", systolic: 124, diastolic: 79, pulse: 70, note: "" });
    expect(saved.ok).toBe(true);
    expect((insert.calls.find((call) => call[0] === "insert")?.[1] as { user_id: string }).user_id).toBe("user-1");

    const one = fakeClient({ data: null, error: null });
    expect(await removeReading(one.client, "user-1", "a")).toBe(true);
    expect(one.calls).toContainEqual(["eq", "user_id", "user-1"]);
    expect(one.calls).toContainEqual(["eq", "id", "a"]);

    const all = fakeClient({ data: null, error: null });
    expect(await removeAllReadings(all.client, "user-1")).toBe(true);
    expect(all.calls).toContainEqual(["delete"]);
    expect(all.calls).toContainEqual(["eq", "user_id", "user-1"]);
  });
});

describe("trends and charts", () => {
  const readings = sampleReadings(NOW);
  const bp = readings.filter((reading) => reading.kind === "blood_pressure");

  it("keeps the sample labeled and made of ids that cannot be real rows", () => {
    expect(readings.every((reading) => reading.id.startsWith("sample-"))).toBe(true);
  });

  it("filters by period, oldest first", () => {
    const month = inPeriod(bp, "30d", NOW);
    expect(month.length).toBeGreaterThan(0);
    expect(month.every((reading) => Date.parse(reading.measuredAt) >= NOW.getTime() - 30 * 86_400_000)).toBe(true);
    expect(month[0]!.measuredAt < month.at(-1)!.measuredAt).toBe(true);
    expect(inPeriod(bp, "all", NOW)).toHaveLength(bp.length);
  });

  it("draws systolic, diastolic, and pulse lines and summarizes them", () => {
    const series = bloodPressureSeries(inPeriod(bp, "all", NOW));
    expect(series.map((line) => line.key)).toEqual(["systolic", "diastolic", "pulse"]);
    const summary = summarize(series[0]!.points);
    expect(summary).toMatchObject({ count: 10, first: 128, last: 120, highest: 131, lowest: 119 });
    expect(summarize([])).toBeNull();
  });

  it("keeps fasting and after-meal glucose on separate lines", () => {
    const glucose = readings.filter((reading) => reading.kind === "glucose");
    expect(glucoseSeries(glucose).map((line) => line.key).sort()).toEqual(["after_meal", "fasting"]);
  });

  it("averages by week for long periods so phone charts stay readable", () => {
    const points = Array.from({ length: 14 }, (_, day) => ({ at: new Date(2026, 10, 2 + day, 9).getTime(), value: 100 + day, label: "" }));
    const weekly = groupForChart(points, "1y");
    expect(weekly).toHaveLength(2);
    expect(weekly[0]!.value).toBe(103);
    expect(groupForChart(points, "30d")).toHaveLength(14);
  });

  it("finds the latest reading and a scale that includes the guide lines", () => {
    expect(latest(bp)?.id).toBe("sample-bp-9");
    const range = niceRange([118, 131], [80, 120]);
    expect(range.min).toBeLessThanOrEqual(80);
    expect(range.max).toBeGreaterThanOrEqual(131);
  });

  it("renders an accessible chart with one marker per reading", () => {
    const html = renderToStaticMarkup(
      createElement(TrendChart, {
        lines: [{ key: "systolic", name: "Systolic", tone: 0, points: [{ at: 1, value: 120, label: "" }, { at: 2, value: 125, label: "" }] }],
        guides: [{ value: 120, label: "120" }],
        unit: "mmHg",
        title: "Chart of your blood pressure readings",
        format: () => "date",
      }),
    );
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Chart of your blood pressure readings"');
    expect(html.match(/<circle/g)).toHaveLength(2);
    expect(renderToStaticMarkup(createElement(TrendChart, { lines: [], guides: [], unit: "", title: "x", format: () => "" }))).toBe("");
  });
});

describe("export and reminders", () => {
  it("exports CSV in the typed unit, oldest first, with formula text neutralized", () => {
    const rows = ROWS.map(rowToReading).filter((reading): reading is HealthReading => reading !== null);
    rows[0] = { ...rows[0]!, note: "=HYPERLINK(1)" };
    const csv = readingsToCsv(rows, t);
    const lines = csv.replace(/\r\n$/, "").split("\r\n");
    expect(lines[0]!.startsWith("﻿Date,Time,Type")).toBe(true);
    expect(lines).toHaveLength(4);
    expect(lines[1]).toContain("124,79,70");
    expect(lines[1]).toContain("'=HYPERLINK(1)");
    expect(lines[2]).toContain("5.4,Fasting (8 hours or more without food)");
    expect(lines[2]).toContain("mmol/L");
    expect(csvCell('say "hi", ok')).toBe('"say ""hi"", ok"');
  });

  it("is due when the chosen interval passed or there is no reading yet", () => {
    const prefs = sanitizeReminders({ blood_pressure: "weekly", glucose: "daily", cholesterol: "nonsense" });
    expect(prefs.cholesterol).toBe("off");
    const readings: HealthReading[] = [
      { id: "1", kind: "blood_pressure", measuredAt: new Date(2026, 10, 20, 9).toISOString(), systolic: 120, diastolic: 80, pulse: null, note: "" },
      { id: "2", kind: "glucose", measuredAt: new Date(2026, 10, 25, 7).toISOString(), glucose: 95, context: "fasting", unit: "mg/dL", note: "" },
    ];
    expect(dueReminders(prefs, readings, NOW)).toEqual([]);
    expect(dueReminders(prefs, readings, new Date(2026, 10, 27, 9))).toEqual(["blood_pressure", "glucose"]);
    expect(dueReminders({ ...prefs, cholesterol: "quarterly" }, readings, NOW)).toEqual(["cholesterol"]);
  });
});
