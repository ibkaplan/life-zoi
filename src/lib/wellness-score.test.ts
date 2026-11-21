import { describe, expect, it } from "vitest";
import { createSampleSession } from "@/lib/sample";
import { wellnessScore, bandOf, snapshotOf } from "@/lib/wellness-score";
import type { CompletedAssessment } from "@/lib/types";

const sample = createSampleSession("2026-11-12");
const base = sample.history[0];

function record(id: string, completedAt: string, changes: Partial<CompletedAssessment["answers"]>): CompletedAssessment {
  return { id, completedAt, answers: { ...base.answers, displayName: "Test person", ...changes } };
}

describe("wellness score", () => {
  it("is empty without a saved assessment, never invented", () => {
    expect(wellnessScore([])).toBeNull();
  });

  it("counts habit areas from saved answers and compares with the previous save", () => {
    const older = record("a", "2026-08-01T10:00:00.000Z", { sleepHours: "6", sleepQuality: "poor", activityDays: "1", activityMinutes: "20", smoking: "never", alcohol: "occasional", social: "some" });
    const newer = record("b", "2026-11-01T10:00:00.000Z", { sleepHours: "8", sleepQuality: "good", activityDays: "5", activityMinutes: "30", smoking: "never", alcohol: "occasional", social: "some" });
    const score = wellnessScore([newer, older]);
    expect(score).not.toBeNull();
    expect(score!.current.id).toBe("b");
    expect(score!.previous?.id).toBe("a");
    expect(score!.improved).toEqual(expect.arrayContaining(["sleep", "movement"]));
    expect(score!.current.attention).toContain("connection");
    expect(score!.history.map((item) => item.id)).toEqual(["a", "b"]);
    expect(score!.current.met.length + score!.current.attention.length).toBe(score!.current.counted);
  });

  it("leaves out areas the person preferred not to answer", () => {
    const snap = snapshotOf(record("c", "2026-11-01T10:00:00.000Z", { smoking: "prefer-not", alcohol: "prefer-not" }));
    expect(snap?.counted).toBe(5);
    expect(snap && bandOf(snap).label).toBeTruthy();
  });
});
