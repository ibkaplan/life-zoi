import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  emptyAnswers,
  validateComplete,
  validateStep,
  type Answers,
} from "@/lib/assessment";
import { canAccessRecord } from "@/lib/access";
import { describeDataMode } from "@/lib/mode";
import { summarizeMonth, supportiveNote } from "@/lib/progress";
import { buildRecommendations, recommendationText } from "@/lib/recommendations";
import { isSamplePayload, samplePreview } from "@/lib/sample-data";
import { findUnsafeClaims } from "@/lib/safety";
import { getScenario, scenarioText, scenarios } from "@/lib/scenarios";
import { sources } from "@/lib/sources";
import {
  completeAssessment,
  createEmptyUserData,
  parseStoredUserData,
  saveScenario,
  upsertCheckIn,
  saveGoal,
} from "@/lib/user-data";

function filled(overrides: Partial<Answers> = {}): Answers {
  return {
    ...emptyAnswers(),
    goals: ["sleep"],
    sleepHours: "7-9",
    sleepQuality: "usually-rested",
    activityDays: "3-4",
    sedentary: "some",
    plants: "most-days",
    mealRhythm: "mostly-regular",
    hydration: "often",
    smoking: "never",
    alcohol: "none",
    stress: "low",
    mood: "steady",
    social: "regular",
    ageRange: "skip",
    ...overrides,
  };
}

describe("lifestyle assessment", () => {
  it("lets someone pass the introduction and blocks an empty sleep step", () => {
    expect(validateStep("intro", emptyAnswers())).toEqual([]);
    const errors = validateStep("sleep", emptyAnswers());
    expect(errors.map((error) => error.field)).toEqual(["sleepHours", "sleepQuality"]);
  });

  it("accepts prefer-not-to-say on sensitive questions and rejects a missing focus", () => {
    const answers = filled({ smoking: "skip", alcohol: "skip", mood: "skip", goals: [] });
    expect(validateStep("substances", answers)).toEqual([]);
    expect(validateComplete(answers).ok).toBe(false);
    expect(validateComplete(filled()).ok).toBe(true);
  });

  it("rejects an unknown smoking value", () => {
    const parsed = validateComplete(filled({ smoking: "often" as Answers["smoking"] }));
    expect(parsed.ok).toBe(false);
  });
});

describe("WHAT IF scenarios", () => {
  it("keeps every scenario qualitative, sourced, and free of personal predictions", () => {
    const profiles = [null, filled(), filled({ smoking: "daily", activityDays: "none", sleepHours: "under-6", social: "limited" })];
    for (const scenario of scenarios) {
      expect(scenario.sourceIds.length).toBeGreaterThan(0);
      for (const sourceId of scenario.sourceIds) {
        expect(sources[sourceId].url.startsWith("https://")).toBe(true);
      }
      for (const option of scenario.options) {
        for (const answers of profiles) {
          const hits = scenarioText(scenario, answers, option.id).flatMap((line) => findUnsafeClaims(line));
          expect(hits).toEqual([]);
        }
      }
    }
  });

  it("uses the person's own smoking answer in the current routine", () => {
    const scenario = getScenario("smoking");
    expect(scenario?.currentRoutine(filled({ smoking: "never" }))).toMatch(/not a plan for you/);
    expect(scenario?.currentRoutine(null)).toMatch(/no current routine/i);
  });
});

describe("guidance", () => {
  it("returns a small maintenance idea when answers show no particular gap", () => {
    const items = buildRecommendations(filled());
    expect(items.map((item) => item.id)).toEqual(["maintenance"]);
  });

  it("keeps smoking in the list and stays within four ideas", () => {
    const items = buildRecommendations(
      filled({
        goals: ["tobacco", "sleep", "movement", "food", "stress"],
        smoking: "daily",
        sleepHours: "under-6",
        sleepQuality: "restless",
        activityDays: "none",
        sedentary: "most-of-day",
        plants: "rarely",
        mood: "low",
        stress: "high",
        alcohol: "most-days",
        social: "limited",
        hydration: "rarely",
      }),
    );
    expect(items.length).toBeLessThanOrEqual(4);
    expect(items.some((item) => item.id === "smoking")).toBe(true);
    for (const item of items) {
      expect(item.sourceIds.length).toBeGreaterThan(0);
      expect(findUnsafeClaims(recommendationText(item).join("\n"))).toEqual([]);
    }
  });
});

describe("local data rules", () => {
  it("refuses to treat sample data as a user record", () => {
    expect(samplePreview.label).toBe("Sample data");
    expect(isSamplePayload({ sample: true })).toBe(true);
    const parsed = parseStoredUserData({ ...createEmptyUserData(), sample: true });
    expect(parsed.ok).toBe(false);
  });

  it("updates a check-in for the same day and rejects a future day", () => {
    let data = createEmptyUserData();
    const goal = saveGoal(data, {
      id: "goal-1",
      title: "Short walk",
      detail: "",
      cadence: "most-days",
      sourceScenarioId: null,
      now: "2026-10-01T00:00:00.000Z",
    });
    expect(goal.ok).toBe(true);
    if (!goal.ok) return;
    data = goal.data;
    const first = upsertCheckIn(data, {
      id: "check-1",
      goalId: "goal-1",
      date: "2026-10-02",
      status: "skipped",
      note: "Rain",
      now: "2026-10-02T00:00:00.000Z",
      today: "2026-10-03",
    });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const corrected = upsertCheckIn(first.data, {
      id: "check-2",
      goalId: "goal-1",
      date: "2026-10-02",
      status: "done",
      note: "Walked later",
      now: "2026-10-03T00:00:00.000Z",
      today: "2026-10-03",
    });
    expect(corrected.ok).toBe(true);
    if (!corrected.ok) return;
    expect(corrected.data.checkIns).toHaveLength(1);
    expect(corrected.data.checkIns[0]?.status).toBe("done");
    const future = upsertCheckIn(corrected.data, {
      id: "check-3",
      goalId: "goal-1",
      date: "2026-10-04",
      status: "done",
      note: "",
      now: "2026-10-03T00:00:00.000Z",
      today: "2026-10-03",
    });
    expect(future.ok).toBe(false);
  });

  it("saves a known scenario and rejects an unknown one", () => {
    const saved = saveScenario(createEmptyUserData(), {
      id: "saved-1",
      scenarioId: "walk",
      optionId: "short",
      note: "Try after lunch",
      now: "2026-10-03T00:00:00.000Z",
    });
    expect(saved.ok).toBe(true);
    const unknown = saveScenario(createEmptyUserData(), {
      id: "saved-2",
      scenarioId: "lifespan",
      optionId: "short",
      note: "",
      now: "2026-10-03T00:00:00.000Z",
    });
    expect(unknown.ok).toBe(false);
  });

  it("stores a completed assessment only when the answers are complete", () => {
    const saved = completeAssessment(createEmptyUserData(), filled(), "2026-10-03T00:00:00.000Z", "assessment-1");
    expect(saved.ok).toBe(true);
    if (saved.ok) expect(saved.data.draft).toBeNull();
    expect(completeAssessment(createEmptyUserData(), emptyAnswers(), "2026-10-03T00:00:00.000Z", "assessment-2").ok).toBe(false);
  });
});

describe("access control", () => {
  it("lets an account read only its own records", () => {
    expect(canAccessRecord({ kind: "account", userId: "user-a" }, "user-a")).toBe(true);
    expect(canAccessRecord({ kind: "account", userId: "user-a" }, "user-b")).toBe(false);
    expect(canAccessRecord({ kind: "local-device" }, "local-device")).toBe(true);
    expect(canAccessRecord({ kind: "local-device" }, "user-a")).toBe(false);
    expect(canAccessRecord({ kind: "account", userId: "user-a" }, "local-device")).toBe(false);
  });

  it("requires row level security for every stored table", () => {
    const sql = readFileSync(new URL("../../supabase/schema.sql", import.meta.url), "utf8").toLowerCase();
    for (const table of ["profiles", "assessments", "saved_scenarios", "habit_goals", "check_ins"]) {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
    }
    expect(sql).toContain("auth.uid() = user_id");
    expect(sql).not.toContain("using (true)");
    expect(sql).toContain("revoke all on public.assessments from anon");
  });
});

describe("progress copy", () => {
  it("counts a month without inventing days and stays nonjudgmental", () => {
    const summary = summarizeMonth(
      [
        { id: "1", goalId: "g", date: "2026-10-02", status: "done", note: "", updatedAt: "" },
        { id: "2", goalId: "g", date: "2026-10-09", status: "skipped", note: "", updatedAt: "" },
      ],
      2026,
      9,
    );
    expect(summary.done).toBe(1);
    expect(summary.skipped).toBe(1);
    expect(summary.weeks[0]?.done).toBe(1);
    expect(summary.weeks[1]?.skipped).toBe(1);
    expect(supportiveNote(summary)).toMatch(/not a failure/i);
    expect(findUnsafeClaims(supportiveNote(summary))).toEqual([]);
  });
});

describe("data mode", () => {
  it("stays local when credentials are missing or merely present", () => {
    expect(describeDataMode({}).reason).toBe("missing-credentials");
    expect(describeDataMode({ supabaseUrl: "https://example.supabase.co", supabaseAnonKey: "public" }).reason).toBe(
      "remote-not-activated",
    );
    expect(describeDataMode({ supabaseUrl: "https://example.supabase.co" }).reason).toBe("missing-credentials");
  });
});
