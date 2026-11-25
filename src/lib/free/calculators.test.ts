import { describe, expect, it } from "vitest";
import { compareBloodPressure } from "@/lib/health-diary/ranges";
import {
  bedtimes,
  bpCategory,
  estimateCalories,
  feetInchesToCm,
  formatClock,
  glasses,
  parseClock,
  parseNumber,
  parseReading,
  poundsToKg,
  restingEnergy,
  LIMITS,
  WATER_NASEM,
} from "./calculators";
import { FREE_HUB } from "./hub";

describe("calorie estimate", () => {
  it("uses the Mifflin–St Jeor equation", () => {
    // 10 × 70 + 6.25 × 175 − 5 × 40 + 5 = 1598.75
    expect(restingEnergy({ sex: "male", age: 40, heightCm: 175, weightKg: 70 })).toBeCloseTo(1598.75);
    // 10 × 60 + 6.25 × 165 − 5 × 35 − 161 = 1295.25
    expect(restingEnergy({ sex: "female", age: 35, heightCm: 165, weightKg: 60 })).toBeCloseTo(1295.25);
  });

  it("multiplies by the activity factor and rounds to 10 kcal", () => {
    expect(estimateCalories({ sex: "female", age: 35, heightCm: 165, weightKg: 60, activity: "moderate" })).toEqual({
      resting: 1300,
      daily: 2010,
      factor: 1.55,
    });
  });

  it("converts pounds and feet", () => {
    expect(poundsToKg(154)).toBeCloseTo(69.85, 1);
    expect(feetInchesToCm(5, 9)).toBeCloseTo(175.26, 1);
  });

  it("refuses numbers outside adult limits", () => {
    expect(parseNumber("17", LIMITS.age)).toBeNull();
    expect(parseNumber("70,5", LIMITS.weightKg)).toBe(70.5);
    expect(parseNumber("-3", LIMITS.weightKg)).toBeNull();
    expect(parseNumber("abc", LIMITS.heightCm)).toBeNull();
  });
});

describe("water guide", () => {
  it("shows the National Academies amounts and glasses of 250 ml", () => {
    expect(WATER_NASEM.female).toEqual({ total: 2.7, drinks: 2.2 });
    expect(glasses(WATER_NASEM.male.drinks)).toBe(12);
    expect(glasses(2.2)).toBe(9);
  });
});

describe("bedtime", () => {
  it("counts back from the wake-up time, across midnight", () => {
    expect(parseClock("6:30")).toBe(390);
    expect(parseClock("24:00")).toBeNull();
    expect(formatClock(-30)).toBe("23:30");
    expect(bedtimes("06:30", "adult", 15)).toEqual([
      { hours: 9, bedtime: "21:15" },
      { hours: 8, bedtime: "22:15" },
      { hours: 7, bedtime: "23:15" },
    ]);
    expect(bedtimes("07:00", "senior", 0)?.map((row) => row.bedtime)).toEqual(["23:00", "00:00"]);
    expect(bedtimes("late", "adult", 0)).toBeNull();
  });
});

describe("blood pressure ranges", () => {
  it("matches the health diary's American Heart Association categories", () => {
    const label: Record<string, string> = {
      normal: "Normal range",
      elevated: "Elevated range",
      stage1: "Stage 1 high blood pressure range",
      stage2: "Stage 2 high blood pressure range",
      severe: "Severely high: see the safety note",
      low: "Lower than the usual range",
    };
    for (const [s, d] of [[118, 76], [124, 78], [134, 70], [118, 84], [142, 88], [150, 95], [185, 100], [170, 125], [85, 55]])
      expect(label[bpCategory(s, d)]).toBe(compareBloodPressure({ systolic: s, diastolic: d }).label);
  });

  it("needs the top number above the bottom one", () => {
    expect(parseReading("120", "80")).toEqual({ systolic: 120, diastolic: 80 });
    expect(parseReading("80", "120")).toBeNull();
    expect(parseReading("", "80")).toBeNull();
  });
});

describe("free hub", () => {
  it("lists only addresses under /free, once each", () => {
    const hrefs = FREE_HUB.map((entry) => entry.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const href of hrefs) expect(href.startsWith("/free/")).toBe(true);
  });
});
