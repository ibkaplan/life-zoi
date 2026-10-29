import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { containsProhibitedClaim } from "@/lib/claims";
import { buildScenario, scenarioText } from "@/lib/scenarios";
import { HABIT_IDS } from "@/lib/types";
import { validateComplete } from "@/lib/validation";
import { validAnswers } from "@/lib/validation.test";

const banned = /date of death|you will die|life expectancy|lifespan|years of life|\b\d+\s*%|\bpercent\b/i;

describe("WHAT IF scenarios", () => {
  it("describes a walk with and without an assessment", () => {
    const parsed = validateComplete(validAnswers({ activityDays: "2", activityMinutes: "20" }));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const withAssessment = buildScenario("walk", parsed.value, "");
    expect(withAssessment.currentRoutine).toContain("2 days");
    expect(withAssessment.currentRoutine).toContain("150 minutes");
    expect(withAssessment.sources.length).toBeGreaterThan(0);
    expect(withAssessment.withheld).toBe(false);

    const without = buildScenario("walk", null, "");
    expect(without.currentRoutine).toContain("No completed assessment");
    expect(banned.test(scenarioText(without))).toBe(false);
  });

  it("keeps every preset educational and sourced", () => {
    const parsed = validateComplete(validAnswers({ smoking: "daily", stress: "high", mood: "low" }));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    for (const habitId of HABIT_IDS) {
      if (habitId === "custom") continue;
      const scenario = buildScenario(habitId, parsed.value, "");
      expect(scenario.sources.length).toBeGreaterThan(0);
      expect(scenario.sources.every((source) => source.url.startsWith("https://"))).toBe(true);
      expect(scenario.uncertain.toLowerCase()).toContain("not a medical prediction");
      expect(banned.test(scenarioText(scenario))).toBe(false);
      expect(containsProhibitedClaim(scenarioText(scenario))).toBe(false);
      expect(scenarioText(scenario).toLowerCase()).not.toContain("date of death");
    }
  });

  it("does not invent evidence for a custom note", () => {
    const scenario = buildScenario("custom", null, "Cycle to the station");
    expect(scenario.sources).toEqual([]);
    expect(scenario.likelyBenefits).toEqual([]);
    expect(scenario.established.toLowerCase()).toContain("does not");
    expect(scenario.yourNote).toBe("Cycle to the station");
    expect(banned.test(scenarioText(scenario))).toBe(false);
  });
});

describe("prepared database rules", () => {
  it("enables row level security for every user table", () => {
    const sql = readFileSync("supabase/schema.sql", "utf8");
    for (const table of ["profiles", "assessments", "scenarios", "habit_goals", "check_ins"]) {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
    }
    expect(sql.match(/auth\.uid\(\) = user_id/g)?.length).toBeGreaterThanOrEqual(10);
    expect(sql.toLowerCase()).not.toContain("using (true)");
    expect(sql.toLowerCase()).not.toContain("disable row level security");
  });
});
