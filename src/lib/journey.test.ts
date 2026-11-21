import { describe, expect, it } from "vitest";
import { bodySummary, journeyPlan, journeySteps } from "@/lib/journey";
import { createSampleSession } from "@/lib/sample";
import { validateComplete } from "@/lib/validation";

function sampleAnswers(overrides: Record<string, unknown> = {}) {
  const raw = { ...createSampleSession("2026-01-15").history[0].answers, displayName: "Test person", ...overrides };
  const parsed = validateComplete(raw);
  if (!parsed.ok) throw new Error("test answers did not validate");
  return parsed.value;
}

describe("journeySteps", () => {
  it("points to the questionnaire before anything is saved", () => {
    const steps = journeySteps({ assessmentSaved: false, draftStarted: false });
    expect(steps.map((step) => step.state)).toEqual(["done", "current", "next", "next"]);
    expect(steps[1].href).toBe("/assessment");
  });

  it("offers to continue a started draft", () => {
    expect(journeySteps({ assessmentSaved: false, draftStarted: true })[1].cta).toBe("Continue the questionnaire");
  });

  it("opens the profile and plan once saved", () => {
    const steps = journeySteps({ assessmentSaved: true, draftStarted: true });
    expect(steps.map((step) => step.state)).toEqual(["done", "done", "current", "current"]);
    expect(steps[1].cta).toBe("Update my answers");
  });
});

describe("bodySummary", () => {
  it("reports the difference only when both weights are known", () => {
    expect(bodySummary(sampleAnswers({ weightKg: "82", desiredWeightKg: "75" })).changeKg).toBe(-7);
    expect(bodySummary(sampleAnswers({ weightKg: "", desiredWeightKg: "75" })).changeKg).toBeNull();
  });
});

describe("journeyPlan", () => {
  it("gives a general plan without answers, every item linking inside LifeZoi", () => {
    const items = journeyPlan(null);
    expect(items.map((item) => item.id)).toEqual(["nutrition", "meals", "movement", "sleep", "stress", "brain", "habit", "goals"]);
    for (const item of items) expect(item.href.startsWith("/")).toBe(true);
  });

  it("follows the answers", () => {
    const items = journeyPlan(sampleAnswers({ wellnessGoals: ["lose-weight"], social: "isolated", smoking: "daily" }));
    const byId = Object.fromEntries(items.map((item) => [item.id, item]));
    expect(byId.nutrition.href).toBe("/food-plan/simple/plate");
    expect(byId.connection.href).toBe("/community");
    expect(byId.urges.href).toBe("/urges");
  });

  it("starts seated when standing is hard", () => {
    const items = journeyPlan(sampleAnswers({ mobilityLimits: ["wheelchair"] }));
    expect(items.find((item) => item.id === "movement")?.href).toBe("/academy/move/studio/chair-yoga");
  });

  it("never mentions starting or changing a medicine", () => {
    const text = journeyPlan(sampleAnswers()).map((item) => `${item.action} ${item.why}`).join(" ").toLowerCase();
    expect(text).not.toMatch(/medication|medicine|dose|pill/);
  });
});
