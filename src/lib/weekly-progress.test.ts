import { describe, expect, it } from "vitest";
import { prepareAccountWrite, rowsToSession, shouldCopyLocalIntoAccount } from "@/lib/account-records";
import { isBlankSession } from "@/lib/account-records";
import { mondayOf } from "@/lib/dates";
import { createSampleSession } from "@/lib/sample";
import { sanitizeSession } from "@/lib/session";
import { emptySession, type UserSession } from "@/lib/types";
import {
  describeWeightTrend,
  energyFace,
  habitTally,
  journeyStatus,
  movementLogsFromMeasurements,
  selectedAccomplishments,
  sumMovementMinutes,
  weekRange,
  WEEKLY_ACCOMPLISHMENTS,
} from "@/lib/weekly-progress";

const USER = "11111111-1111-4111-8111-111111111111";
const WHEN = "2026-11-06T12:00:00.000Z";

describe("weekly progress", () => {
  it("uses the Monday week and does not invent a movement total", () => {
    expect(mondayOf("2026-11-06")).toBe("2026-11-02");
    expect(weekRange("2026-11-08")).toEqual({ start: "2026-11-02", end: "2026-11-08" });
    expect(sumMovementMinutes([], "2026-11-02", "2026-11-08")).toBeNull();
    expect(
      sumMovementMinutes(
        [
          { date: "2026-11-03", minutes: 20 },
          { date: "2026-10-28", minutes: 45 },
          { date: "2026-11-04", minutes: 0 },
        ],
        "2026-11-02",
        "2026-11-08",
      ),
    ).toBe(20);
  });

  it("counts only movement minutes the visitor entered", () => {
    const logs = movementLogsFromMeasurements([
      { kind: "Walking minutes", unit: "minutes", value: 12, measuredOn: "2026-11-04" },
      { kind: "Weight", unit: "lb", value: 150, measuredOn: "2026-11-04" },
      { kind: "Screen minutes", unit: "minutes", value: 45, measuredOn: "2026-11-04" },
    ]);
    expect(logs).toEqual([{ date: "2026-11-04", minutes: 12 }]);
  });

  it("counts marked check-in items out of the real list, never a sample 5 of 7", () => {
    expect(WEEKLY_ACCOMPLISHMENTS).toHaveLength(5);
    expect(habitTally(null)).toBeNull();
    expect(habitTally([])).toBeNull();
    expect(habitTally(["nope"])).toBeNull();
    expect(habitTally(["water", "sleep", "water"])).toEqual({ marked: 2, total: 5 });
    expect(selectedAccomplishments({ water: false, sleep: true, movement: false })).toEqual(["sleep"]);
    const sample = createSampleSession("2026-11-06");
    expect(sample.weeklyCheckIns).toEqual([]);
    expect(sample.weightEntries).toEqual([]);
    expect(habitTally(sample.weeklyCheckIns[0]?.accomplishments ?? [])).toBeNull();
  });

  it("shows an energy face only for a chosen level", () => {
    expect(energyFace(null)).toBeNull();
    expect(energyFace(1)).toBe("😴");
    expect(energyFace(5)).toBe("⚡");
  });

  it("marks journey steps only when saved dates reach that span", () => {
    expect(journeyStatus([]).every((step) => !step.reached)).toBe(true);
    const one = journeyStatus(["2026-11-06"]);
    expect(one.map((step) => step.reached)).toEqual([true, false, false, false]);
    expect(one.map((step) => step.label)).toEqual([
      "Starting Point",
      "First Week",
      "30-Day Progress",
      "90-Day Reflection",
    ]);
    expect(journeyStatus(["2026-01-01", "2026-01-08"]).find((step) => step.id === "week")?.reached).toBe(true);
    expect(journeyStatus(["2026-01-01", "2026-01-08"]).find((step) => step.id === "month")?.reached).toBe(false);
    expect(journeyStatus(["2026-01-01", "2026-01-31"]).find((step) => step.id === "month")?.reached).toBe(true);
    expect(journeyStatus(["2026-01-01", "2026-04-01"]).find((step) => step.id === "reflect")?.reached).toBe(true);
    expect(journeyStatus(["2026-01-01", "2026-04-01"]).some((step) => step.label.includes("Transformation"))).toBe(false);
  });

  it("describes weight numbers without a goal or a judgment", () => {
    expect(describeWeightTrend([])).toBeNull();
    const one = describeWeightTrend([{ date: "2026-11-01", value: 150, unit: "lb" }]);
    expect(one).toMatch(/Two or more/);
    const trend = describeWeightTrend([
      { date: "2026-11-01", value: 150, unit: "lb" },
      { date: "2026-11-20", value: 148.5, unit: "lb" },
    ]);
    expect(trend).toContain("150");
    expect(trend).toContain("148.5");
    expect(trend?.toLowerCase()).not.toMatch(/goal|lost|gained|better|worse|overweight|bmi/);
    expect(
      describeWeightTrend([
        { date: "2026-11-01", value: 150, unit: "lb" },
        { date: "2026-11-02", value: 68, unit: "kg" },
      ]),
    ).toMatch(/same unit/);
  });

  it("keeps a saved week in the browser session and drops invented fields", () => {
    const cleaned = sanitizeSession({
      weeklyCheckIns: [
        {
          id: "week-0001",
          weekStart: "2026-11-06",
          savedAt: WHEN,
          energy: 9,
          accomplishments: ["water", "calories", "water"],
          proudOf: "  A walk \u0000 ",
        },
      ],
      weightEntries: [
        { id: "weight-01", date: "2026-11-06", value: 150, unit: "lb" },
        { id: "weight-02", date: "2026-11-06", value: -4, unit: "lb" },
        { id: "weight-03", date: "2026-11-06", value: 70, unit: "stone" },
      ],
    });
    expect(cleaned.weeklyCheckIns).toEqual([
      {
        id: "week-0001",
        weekStart: "2026-11-02",
        savedAt: WHEN,
        energy: null,
        accomplishments: ["water"],
        proudOf: "A walk",
      },
    ]);
    expect(cleaned.weightEntries).toEqual([{ id: "weight-01", date: "2026-11-06", value: 150, unit: "lb" }]);
    expect(JSON.stringify(cleaned)).not.toMatch(/calories|diagnosis|45 min|5 \/ 7/);
  });

  it("round-trips the week inside the existing profile session", () => {
    const session: UserSession = {
      ...emptySession(),
      weeklyCheckIns: [
        {
          id: "44444444-4444-4444-8444-444444444444",
          weekStart: "2026-11-02",
          savedAt: WHEN,
          energy: 4,
          accomplishments: ["relax"],
          proudOf: "A quiet evening",
        },
      ],
      weightEntries: [
        {
          id: "55555555-5555-4555-8555-555555555555",
          date: "2026-11-06",
          value: 70,
          unit: "kg",
        },
      ],
    };
    expect(isBlankSession(session)).toBe(false);
    expect(shouldCopyLocalIntoAccount(emptySession(), session)).toBe(true);
    const prepared = prepareAccountWrite(session, USER, WHEN);
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    expect(prepared.rows.profile.session_state.weeklyCheckIns[0]?.proudOf).toBe("A quiet evening");
    const loaded = rowsToSession({
      profile: {
        display_name: null,
        session_state: prepared.rows.profile.session_state,
      },
      assessments: [],
      scenarios: [],
      goals: [],
      checkIns: [],
    });
    expect(loaded.weeklyCheckIns[0]?.energy).toBe(4);
    expect(loaded.weeklyCheckIns[0]?.accomplishments).toEqual(["relax"]);
    expect(loaded.weightEntries[0]?.value).toBe(70);
  });
});
