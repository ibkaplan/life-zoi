import { describe, expect, it } from "vitest";
import { addExplored, emptyCompanion, sanitizeCompanion, setFeeling, skipFeeling, isEmptyCompanion } from "@/lib/companion/state";
import { emptySession, EMPTY_ASSESSMENT, type Assessment, type UserSession } from "@/lib/types";
import { emptyHealthProfile } from "@/lib/health-profile";
import {
  dayNumber,
  matchTopics,
  pickToday,
  progressIndicators,
  tipFor,
  TIPS,
  TOPICS,
  weeklyReport,
} from "@/lib/daily/daily";

const TODAY = "2026-11-22";

function answers(change: Partial<Assessment> = {}): Assessment {
  return {
    ...EMPTY_ASSESSMENT,
    ...emptyHealthProfile(),
    displayName: "Test",
    ageRange: "60-69",
    sleepHours: "7.5",
    sleepQuality: "good",
    activityDays: "5",
    activityMinutes: "40",
    sedentaryHours: "5",
    vegetables: "daily",
    hydration: "most-days",
    smoking: "never",
    alcohol: "none",
    stress: "low",
    mood: "steady",
    social: "connected",
    goals: ["connection"],
    ...change,
  };
}

function withHistory(...list: Assessment[]): UserSession {
  return {
    ...emptySession(),
    history: list.map((item, index) => ({ id: `a${index}`, completedAt: `2026-11-${String(20 - index * 10).padStart(2, "0")}T10:00:00.000Z`, answers: item })),
  };
}

describe("LifeZoi Daily topics", () => {
  it("puts the person's chosen goals first, then what the answers show", () => {
    const matches = matchTopics(answers({ goals: ["sleep"], sleepHours: "6", strength: "rarely" }));
    expect(matches[0]).toMatchObject({ topic: "sleep", score: 3 });
    expect(matches.find((m) => m.topic === "balance")?.score).toBe(2);
  });

  it("never offers weight unless the person chose a weight goal", () => {
    expect(matchTopics(answers({ weightKg: "120", heightCm: "160" })).some((m) => m.topic === "weight")).toBe(false);
    const pick = pickToday(answers(), TODAY);
    expect([pick.topic.id, ...pick.more.map((m) => m.topic.id)]).not.toContain("weight");
    const chosen = matchTopics(answers({ wellnessGoals: ["lose-weight"] }));
    expect(chosen.some((m) => m.topic === "weight")).toBe(true);
  });

  it("gives one suggestion a day that stays the same all day and changes over days", () => {
    const a = answers({ goals: ["sleep", "walk"], wellnessGoals: ["memory"] });
    expect(pickToday(a, TODAY).topic.id).toBe(pickToday(a, TODAY).topic.id);
    const seen = new Set([0, 1, 2, 3].map((n) => pickToday(a, `2026-11-2${n}`).topic.id));
    expect(seen.size).toBeGreaterThan(1);
  });

  it("only picks from the person's goals and needs when there are any", () => {
    const a = answers({ goals: ["sleep"] });
    for (let d = 10; d < 20; d += 1) expect(pickToday(a, `2026-11-${d}`).topic.id).toBe("sleep");
  });

  it("offers every other topic under Explore more", () => {
    const pick = pickToday(answers({ goals: ["sleep"] }), TODAY);
    expect(pick.more.map((m) => m.topic.id)).not.toContain(pick.topic.id);
    expect(pick.more.length).toBe(6); // eight topics, minus today's, minus weight
  });

  it("works without an assessment and says it is not personalized", () => {
    const pick = pickToday(null, TODAY);
    expect(pick.personalized).toBe(false);
    expect(pick.reason).toBe("");
  });

  it("switches to the gentle version on a low-energy day", () => {
    const a = answers({ goals: ["walk"] });
    expect(pickToday(a, TODAY, "low").advice).toBe(TOPICS.walking.gentle);
    expect(TOPICS.walking.advice).toContain(pickToday(a, TODAY, "great").advice);
  });

  it("has one tip each day, with a source", () => {
    const tip = tipFor(TODAY, "sleep");
    expect(TIPS).toContain(tip);
    expect(tip.source.url).toMatch(/^https:\/\//);
    expect(dayNumber("2000-01-02")).toBe(1);
  });
});

describe("feelings and topics in the companion state", () => {
  it("saves one feeling per day, can clear it, and keeps skip separate", () => {
    let state = setFeeling(emptyCompanion(), TODAY, "great");
    expect(state.daily.feelings[TODAY]).toBe("great");
    state = setFeeling(state, TODAY, "great");
    expect(state.daily.feelings[TODAY]).toBeUndefined();
    state = skipFeeling(state, TODAY);
    expect(state.daily.skipped).toEqual([TODAY]);
    state = setFeeling(state, TODAY, "low");
    expect(state.daily.skipped).toEqual([]);
  });

  it("records an explored topic once per day", () => {
    const state = addExplored(addExplored(emptyCompanion(), TODAY, "sleep"), TODAY, "sleep");
    expect(state.daily.explored).toHaveLength(1);
    expect(isEmptyCompanion(state)).toBe(false);
  });

  it("drops bad stored values and keeps older saved state working", () => {
    const clean = sanitizeCompanion({ daily: { feelings: { [TODAY]: "great", "2026-02-31": "okay", "2026-11-01": "angry" }, explored: [{ date: TODAY, topic: "nope" }] } });
    expect(clean.daily.feelings).toEqual({ [TODAY]: "great" });
    expect(clean.daily.explored).toEqual([]);
    expect(sanitizeCompanion({}).daily).toEqual({ feelings: {}, skipped: [], explored: [] });
  });
});

describe("progress indicators", () => {
  it("keeps the three indicators separate and honest when nothing is saved", () => {
    const result = progressIndicators(emptySession(), emptyCompanion(), TODAY);
    expect(result.assessment.status).toBe("none");
    expect(result.lifestyle.status).toBe("no-assessment");
    expect(result.engagement).toEqual({ activeDays: 0, actions: 0 });
  });

  it("never counts app use as lifestyle progress", () => {
    let companion = setFeeling(emptyCompanion(), TODAY, "great");
    companion = addExplored(companion, TODAY, "sleep");
    const result = progressIndicators(withHistory(answers()), companion, TODAY);
    expect(result.lifestyle.status).toBe("one-assessment");
    expect(result.engagement.activeDays).toBe(1);
    expect(result.engagement.actions).toBe(2);
  });

  it("compares two saved assessments for lifestyle progress", () => {
    const before = answers({ sleepHours: "5", sleepQuality: "poor" });
    const after = answers();
    const result = progressIndicators(withHistory(after, before), emptyCompanion(), TODAY);
    expect(result.lifestyle.status).toBe("compared");
    if (result.lifestyle.status === "compared") expect(result.lifestyle.improved).toContain("sleep");
  });
});

describe("weekly report", () => {
  it("is empty and invents nothing when nothing was recorded", () => {
    const report = weeklyReport(emptySession(), emptyCompanion(), TODAY);
    expect(report.empty).toBe(true);
    expect(report.activities).toEqual([]);
    expect(report.weights).toBeNull();
    expect(report.suggestAssessment).toBe(true);
    expect(report.window).toEqual({ start: "2026-11-16", end: TODAY });
  });

  it("counts only what was recorded inside the last seven days", () => {
    let companion = emptyCompanion();
    companion = setFeeling(companion, "2026-11-21", "low");
    companion = setFeeling(companion, "2026-11-20", "low");
    companion = setFeeling(companion, "2026-11-01", "great");
    companion = addExplored(companion, "2026-11-21", "balance");
    companion = {
      ...companion,
      breathe: { ...companion.breathe, sessions: [{ id: "b1", date: "2026-11-19", seconds: 300, complete: true, feltAfter: null }, { id: "b0", date: "2026-10-01", seconds: 300, complete: true, feltAfter: null }] },
    };
    const session = { ...withHistory(answers({ goals: ["walk"] })), weightEntries: [{ id: "w", date: "2026-11-18", value: 70, unit: "kg" as const }] };
    const report = weeklyReport(session, companion, TODAY);
    expect(report.empty).toBe(false);
    expect(report.feelings).toEqual({ great: 0, okay: 0, low: 2 });
    expect(report.topics).toEqual(["balance"]);
    expect(report.activities).toEqual([{ id: "breathing", label: "Breathing sessions", count: 1 }]);
    expect(report.weights).toEqual({ first: { date: "2026-11-18", value: 70, unit: "kg" }, last: null });
    expect(report.focusNext[0].topic.id).toBe("sleep");
    expect(report.focusNext.map((item) => item.topic.id)).toContain("walking");
  });
});
