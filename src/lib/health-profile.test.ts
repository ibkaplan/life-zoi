import { describe, expect, it } from "vitest";
import { coerceHealthProfile, safetyFlags, safetyNotes, validateHealthProfile } from "@/lib/health-profile";
import { sanitizeSession } from "@/lib/session";
import { coerceAssessment, validateComplete } from "@/lib/validation";
import { EMPTY_ASSESSMENT } from "@/lib/types";

const complete = {
  ...EMPTY_ASSESSMENT,
  sleepHours: "7",
  sleepQuality: "good",
  activityDays: "2",
  activityMinutes: "20",
  sedentaryHours: "6",
  vegetables: "most-days",
  hydration: "most-days",
  stress: "low",
  mood: "steady",
  social: "some",
  goals: ["walk"],
};

describe("health profile", () => {
  it("keeps unknown and prefer-not answers and never fills a value", () => {
    const profile = coerceHealthProfile({ bloodSugarStatus: "unknown", cholesterolStatus: "prefer-not" });
    expect(profile.bloodSugarStatus).toBe("unknown");
    expect(profile.cholesterolStatus).toBe("prefer-not");
    expect(profile.bloodPressureStatus).toBe("");
    expect(profile.desiredWeightKg).toBe("");
  });

  it("drops unknown values and duplicate list items", () => {
    const profile = coerceHealthProfile({
      bloodSugarStatus: "very-high",
      foodAllergies: ["peanut", "peanut", "glitter"],
      mobilityLimits: ["none", "wheelchair"],
    });
    expect(profile.bloodSugarStatus).toBe("");
    expect(profile.foodAllergies).toEqual(["peanut"]);
    expect(profile.mobilityLimits).toEqual(["wheelchair"]);
  });

  it("keeps only one weight direction and a primary goal from the chosen goals", () => {
    const profile = coerceHealthProfile({ wellnessGoals: ["lose-weight", "gain-weight", "sleep"], primaryGoal: "memory" });
    expect(profile.wellnessGoals).toEqual(["lose-weight", "sleep"]);
    expect(profile.primaryGoal).toBe("lose-weight");
    expect(coerceHealthProfile({ wellnessGoals: ["sleep", "stress"], primaryGoal: "stress" }).primaryGoal).toBe("stress");
  });

  it("keeps reaction types and exclusive answers", () => {
    const profile = coerceHealthProfile({
      foodReactions: [{ food: "Avocado", type: "allergy" }, { food: "avocado", type: "intolerance" }, { food: "milk", type: "guess" }],
      dietRequirements: ["halal", "prefer-not"],
      dietPatterns: ["none"],
    });
    expect(profile.foodReactions).toEqual([{ food: "avocado", type: "allergy" }]);
    expect(profile.dietRequirements).toEqual(["halal"]);
    expect(profile.dietPatterns).toEqual(["none"]);
  });

  it("checks desired weight only when typed", () => {
    expect(validateHealthProfile(coerceHealthProfile({}))).toEqual({});
    expect(validateHealthProfile(coerceHealthProfile({ desiredWeightKg: "10" })).desiredWeightKg).toBeTruthy();
  });

  it("derives safety rules from what was reported", () => {
    const flags = safetyFlags(
      coerceHealthProfile({ bloodSugarStatus: "low", foodAllergies: ["egg"], mobilityLimits: ["wheelchair"], exerciseRestrictions: "knee pain" }),
    );
    expect(flags.bloodSugarCare && flags.lowBloodSugar && flags.allergies && flags.seatedFirst && flags.injuryNote).toBe(true);
    expect(safetyNotes(flags).join(" ")).toMatch(/does not change medication/);
    expect(safetyFlags(coerceHealthProfile({})).gentleMovement).toBe(false);
  });

  it("keeps older saved assessments valid without the new fields", () => {
    const old = { ...complete } as Record<string, unknown>;
    for (const key of ["wellnessGoals", "primaryGoal", "foodAllergies", "mobilityLimits", "dietRequirements", "foodReactions"]) delete old[key];
    expect(validateComplete(old).ok).toBe(true);
    const session = sanitizeSession({ history: [{ id: "abcdefgh-1234", completedAt: "2026-11-01T10:00:00Z", answers: old }] });
    expect(session.history).toHaveLength(1);
    expect(session.history[0]?.answers.wellnessGoals).toEqual([]);
  });

  it("round-trips the new fields through the assessment", () => {
    const answers = coerceAssessment({ ...complete, wellnessGoals: ["memory"], foodAllergies: ["sesame"], desiredWeightKg: "70" });
    expect(answers.primaryGoal).toBe("memory");
    expect(answers.foodAllergies).toEqual(["sesame"]);
    expect(answers.desiredWeightKg).toBe("70");
  });
});
