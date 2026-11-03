import { describe, expect, it } from "vitest";
import { containsProhibitedClaim } from "@/lib/claims";
import {
  buildPlan,
  compareChangeLab,
  emptyChangeLab,
  encouragement,
  habitJourneySummary,
  sanitizeChangeLab,
} from "@/lib/change-lab";
import { markAgainstSuppliedRange, SYNTHETIC_REPORT } from "@/lib/lab-report";

describe("Change Lab", () => {
  it("builds a finite educational plan", () => {
    const week = buildPlan("walk", 7);
    const month = buildPlan("sleep", 30);
    expect(week).toHaveLength(7);
    expect(month).toHaveLength(30);
    expect(containsProhibitedClaim([...week, ...month].join(" "))).toBe(false);
    expect(week.join(" ").toLowerCase()).not.toContain("guarantee");
  });

  it("compares entered answers without calling a change a health effect", () => {
    const state = sanitizeChangeLab({
      ...emptyChangeLab(),
      baseline: { sleep: "short", sugar: "often" },
      followUp: { sleep: "steady", sugar: "often" },
      baselineMeasurements: [
        { id: "meas-0001", kind: "HbA1c", value: 6.1, unit: "lab unit", measuredOn: "2026-03-02" },
      ],
      followUpMeasurements: [
        { id: "meas-0002", kind: "HbA1c", value: 6, unit: "lab unit", measuredOn: "2026-04-02" },
      ],
    });
    const rows = compareChangeLab(state);
    const sleep = rows.find((row) => row.label === "Sleep lately");
    expect(sleep?.before).toContain("under a full night");
    expect(sleep?.after).toContain("steady");
    const text = rows.map((row) => `${row.before} ${row.after}`).join(" ");
    expect(containsProhibitedClaim(text)).toBe(false);
    expect(text.toLowerCase()).not.toContain("disease");
    expect(habitJourneySummary({ ...state, checkIns: [{ date: "2026-04-01", done: true, note: "" }] })).toContain(
      "not a biological age",
    );
    expect(encouragement(1, 7)).toContain("not a failure");
  });
});

describe("example lab report", () => {
  it("marks values only against the range printed on the example", () => {
    const a1c = SYNTHETIC_REPORT.results[0];
    expect(markAgainstSuppliedRange(a1c.value, a1c.rangeLow, a1c.rangeHigh)).toBe("above");
    expect(markAgainstSuppliedRange(96, 70, 99)).toBe("within");
    expect(markAgainstSuppliedRange(69, 70, 99)).toBe("below");
    expect(SYNTHETIC_REPORT.notice.toLowerCase()).toContain("not a real");
    expect(SYNTHETIC_REPORT.person).toBe("Sample visitor");
  });
});
