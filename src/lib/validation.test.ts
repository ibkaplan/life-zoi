import { describe, expect, it } from "vitest";
import { EMPTY_ASSESSMENT, type Assessment } from "@/lib/types";
import {
  firstInvalidStep,
  validateComplete,
  validateScenarioRequest,
  validateStep,
} from "@/lib/validation";

export function validAnswers(overrides: Partial<Assessment> = {}): Assessment {
  return {
    ...EMPTY_ASSESSMENT,
    sleepHours: "7.5",
    sleepQuality: "good",
    activityDays: "3",
    activityMinutes: "40",
    sedentaryHours: "6",
    vegetables: "most-days",
    hydration: "most-days",
    stress: "low",
    mood: "steady",
    social: "connected",
    goals: ["sleep"],
    ...overrides,
  };
}

describe("questionnaire validation", () => {
  it("accepts a complete assessment and keeps optional answers empty", () => {
    const parsed = validateComplete(validAnswers());
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.sleepHours).toBe(7.5);
    expect(parsed.value.smoking).toBeNull();
    expect(parsed.value.alcohol).toBeNull();
    expect(parsed.value.ageRange).toBeNull();
  });

  it("rejects missing sleep, impossible numbers, and an empty goal list", () => {
    expect(validateStep("sleep", validAnswers({ sleepHours: "", sleepQuality: "" }))).toMatchObject({
      sleepHours: expect.any(String),
      sleepQuality: expect.any(String),
    });
    expect(validateStep("sleep", validAnswers({ sleepHours: "25" })).sleepHours).toMatch(/0 to 24/);
    expect(validateStep("sleep", validAnswers({ sleepHours: "abc" })).sleepHours).toBeTruthy();
    expect(validateStep("movement", validAnswers({ activityDays: "8" })).activityDays).toBeTruthy();
    expect(
      validateStep("movement", validAnswers({ activityDays: "3", activityMinutes: "" })).activityMinutes,
    ).toBeTruthy();
    expect(
      validateStep("movement", validAnswers({ activityDays: "0", activityMinutes: "" })).activityMinutes,
    ).toBeUndefined();
    expect(validateStep("goals", validAnswers({ goals: [] })).goals).toBeTruthy();
    expect(firstInvalidStep(validAnswers({ sleepHours: "" }))).toBe("sleep");
  });

  it("does not treat a partial draft as complete", () => {
    const parsed = validateComplete(validAnswers({ vegetables: "", goals: [] }));
    expect(parsed.ok).toBe(false);
  });

  it("requires a note for a custom scenario and rejects an unknown habit", () => {
    expect(validateScenarioRequest({ habitId: "custom", note: "   ", assessment: null }).ok).toBe(false);
    expect(validateScenarioRequest({ habitId: "fly", note: "", assessment: null }).ok).toBe(false);
    const parsed = validateScenarioRequest({
      habitId: "walk",
      note: "after lunch",
      assessment: validAnswers(),
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.assessment?.activityDays).toBe(3);
  });
});
