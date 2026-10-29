import { describe, expect, it } from "vitest";
import { buildRecommendations } from "@/lib/recommendations";
import { sources } from "@/lib/sources";
import { validateComplete } from "@/lib/validation";
import { validAnswers } from "@/lib/validation.test";

describe("recommendations", () => {
  it("points short sleep at the NHLBI guidance", () => {
    const parsed = validateComplete(validAnswers({ sleepHours: "5", sleepQuality: "poor" }));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const result = buildRecommendations(parsed.value);
    const sleep = result.items.find((item) => item.id === "sleep");
    expect(sleep?.sources.map((source) => source.url)).toContain(sources.nhlbiSleep.url);
    expect(result.notice.toLowerCase()).toContain("clinician");
    expect(result.withheld).toBe(false);
  });

  it("offers maintenance when nothing was flagged and no goal is stored", () => {
    const parsed = validateComplete(
      validAnswers({
        sleepHours: "8",
        sleepQuality: "very-good",
        activityDays: "5",
        activityMinutes: "40",
        sedentaryHours: "4",
        vegetables: "daily",
        hydration: "most-days",
        smoking: "never",
        alcohol: "none",
        stress: "low",
        mood: "steady",
        social: "connected",
        goals: ["walk"],
      }),
    );
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const aligned = buildRecommendations(parsed.value);
    expect(aligned.items.map((item) => item.id)).toEqual(["walk-goal"]);
    const result = buildRecommendations({ ...parsed.value, goals: [] });
    expect(result.items.map((item) => item.kind)).toEqual(["maintenance"]);
    expect(result.items[0]?.why.toLowerCase()).not.toContain("you have");
  });

  it("talks about smoking as education and includes the crisis line when stress is high", () => {
    const parsed = validateComplete(
      validAnswers({
        smoking: "daily",
        stress: "high",
        mood: "low",
        goals: ["smoking", "stress"],
      }),
    );
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const result = buildRecommendations(parsed.value);
    const text = result.items.map((item) => `${item.why} ${item.actions.join(" ")}`).join(" ");
    expect(text.toLowerCase()).toContain("smokefree.gov");
    expect(text.toLowerCase()).toContain("does not recommend medication");
    expect(text).toContain("988");
    expect(text.toLowerCase()).not.toContain("stop your medication");
    expect(result.crisisNotice).toContain("988");
  });
});
