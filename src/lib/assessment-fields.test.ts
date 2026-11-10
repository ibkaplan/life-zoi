import { describe, expect, it } from "vitest";
import { ASSESSMENT_FIELDS, fieldLabel, fieldStep, friendlyError, orderedErrorFields } from "@/lib/assessment-fields";
import { validateHealthProfile } from "@/lib/health-profile";
import { EMPTY_ASSESSMENT, STEP_IDS, type Assessment } from "@/lib/types";
import { coerceAssessment, validateStep } from "@/lib/validation";

function blank(): Assessment {
  return coerceAssessment({ ...EMPTY_ASSESSMENT, goals: [] });
}

describe("assessment field names", () => {
  it("names every field that step validation can report, on a real step", () => {
    const draft = {
      ...blank(),
      displayName: "Sample visitor",
      exactAge: "abc",
      heightCm: "abc",
      weightKg: "abc",
      desiredWeightKg: "abc",
      activityDays: "3",
      habitNote: "x".repeat(300),
      purposeHope: "x".repeat(300),
    };
    const reported = new Set<string>();
    for (const step of STEP_IDS) for (const field of Object.keys(validateStep(step, draft))) reported.add(field);
    for (const field of Object.keys(validateHealthProfile(draft))) reported.add(field);
    expect(reported.size).toBeGreaterThan(10);
    for (const field of reported) {
      expect(ASSESSMENT_FIELDS[field], field).toBeDefined();
      expect(STEP_IDS).toContain(fieldStep(field));
    }
  });

  it("turns a generic choice message into one that names the question", () => {
    const errors = validateStep("sleep", { ...blank(), sleepHours: "7" });
    expect(friendlyError("sleepQuality", errors.sleepQuality)).toBe(
      "Please choose an answer for “How does that sleep usually feel?”",
    );
    expect(friendlyError("goals", validateStep("goals", blank()).goals)).toBe(
      "Please choose at least one option for “Habits to track day by day”.",
    );
    expect(fieldLabel("goals")).toContain("Habits to track day by day");
  });

  it("asks for a missing number by name and keeps range messages as they are", () => {
    expect(friendlyError("sleepHours", validateStep("sleep", blank()).sleepHours)).toBe("Please enter your hours of sleep.");
    const range = validateStep("about", { ...blank(), exactAge: "12" }).exactAge;
    expect(friendlyError("exactAge", range)).toBe(range);
    expect(friendlyError("form", "Something else.")).toBe("Something else.");
  });

  it("orders errors by step and then by question, leaving out the form message", () => {
    expect(orderedErrorFields({ form: "x", mood: "x", desiredWeightKg: "x", stress: "x", sleepHours: "x" })).toEqual([
      "desiredWeightKg",
      "sleepHours",
      "stress",
      "mood",
    ]);
  });

  it("points the desired weight error, reported on the health step, back to the About you step", () => {
    const errors = validateStep("health", { ...blank(), desiredWeightKg: "999" });
    expect(Object.keys(errors)).toEqual(["desiredWeightKg"]);
    expect(fieldStep("desiredWeightKg")).toBe("about");
  });
});
