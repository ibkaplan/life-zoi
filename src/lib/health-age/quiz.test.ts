import { describe, expect, it } from "vitest";
import { QUIZ_QUESTIONS, isComplete, quizResult, type QuizAnswers } from "@/lib/health-age/quiz";
import { HABIT_AREAS } from "@/lib/wellness-score";

const all = (pick: (index: number) => number): QuizAnswers =>
  Object.fromEntries(QUIZ_QUESTIONS.map((q) => [q.id, q.options[pick(q.options.length)].id]));

describe("habits check", () => {
  it("asks one question for each habit area of My Wellness Score", () => {
    expect(QUIZ_QUESTIONS.map((q) => q.area).sort()).toEqual(HABIT_AREAS.map((a) => a.id).sort());
  });

  it("gives no result until every question is answered", () => {
    expect(quizResult({})).toBeNull();
    const partial = all(() => 0);
    delete partial.sleep;
    expect(isComplete(partial)).toBe(false);
    expect(quizResult(partial)).toBeNull();
    expect(quizResult({ ...all(() => 0), sleep: "made-up" })).toBeNull();
  });

  it("counts areas on track and shows the strong band when all are", () => {
    const result = quizResult(all(() => 0))!;
    expect(result.met).toHaveLength(7);
    expect(result.counted).toBe(7);
    expect(result.band.id).toBe("strong");
    expect(result.nextSteps).toEqual([]);
  });

  it("leaves 'prefer not to say' out of the count", () => {
    const answers: QuizAnswers = { ...all(() => 0), tobacco: "skip", alcohol: "skip" };
    const result = quizResult(answers)!;
    expect(result.counted).toBe(5);
    expect(result.met).toHaveLength(5);
  });

  it("offers at most two next steps for areas that need attention", () => {
    const answers: QuizAnswers = {
      sleep: "short",
      movement: "less",
      food: "rarely",
      tobacco: "current",
      alcohol: "most",
      stress: "hard",
      connection: "rarely",
    };
    const result = quizResult(answers)!;
    expect(result.met).toEqual([]);
    expect(result.band.id).toBe("start");
    expect(result.nextSteps.map((s) => s.area)).toEqual(["sleep", "movement"]);
  });

  it("never returns a figure in years", () => {
    const result = quizResult(all(() => 0))!;
    expect(Object.keys(result)).not.toContain("age");
    expect(JSON.stringify(result)).not.toMatch(/year/i);
  });
});
