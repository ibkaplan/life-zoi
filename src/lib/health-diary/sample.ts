import type { HealthReading } from "./types";

/**
 * Readings for the labeled sample (Sample visitor). They are made up, shown
 * only while the sample is on, and never saved to anyone's diary.
 */
export function sampleReadings(now: Date = new Date()): HealthReading[] {
  const at = (daysAgo: number, hour: number) => {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, hour, 0);
    return day.toISOString();
  };
  const out: HealthReading[] = [];
  const bp = [
    [128, 82, 72], [131, 84, 75], [126, 80, 70], [124, 79, 68], [127, 81, 71],
    [122, 78, 69], [125, 80, 70], [121, 77, 67], [119, 76, 66], [120, 77, 68],
  ] as const;
  bp.forEach(([systolic, diastolic, pulse], index) => {
    out.push({ id: `sample-bp-${index}`, kind: "blood_pressure", measuredAt: at(54 - index * 6, 8), systolic, diastolic, pulse, note: "" });
  });
  const fasting = [104, 101, 99, 97, 98, 95, 96, 94];
  fasting.forEach((glucose, index) => {
    out.push({ id: `sample-glucose-${index}`, kind: "glucose", measuredAt: at(56 - index * 8, 7), glucose, context: "fasting", unit: "mg/dL", note: "" });
  });
  [138, 131, 126].forEach((glucose, index) => {
    out.push({ id: `sample-glucose-meal-${index}`, kind: "glucose", measuredAt: at(50 - index * 20, 14), glucose, context: "after_meal", unit: "mg/dL", note: "" });
  });
  out.push(
    { id: "sample-lipids-0", kind: "cholesterol", measuredAt: at(170, 9), total: 214, ldl: 132, hdl: 52, triglycerides: 158, unit: "mg/dL", note: "" },
    { id: "sample-lipids-1", kind: "cholesterol", measuredAt: at(20, 9), total: 196, ldl: 116, hdl: 55, triglycerides: 132, unit: "mg/dL", note: "" },
  );
  return out.sort((a, b) => b.measuredAt.localeCompare(a.measuredAt));
}
