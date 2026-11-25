import { describe, expect, it } from "vitest";
import { QUIZ_QUESTIONS, isComplete, parseAge, quizResult, type QuizAnswers } from "@/lib/health-age/quiz";
import { HABIT_AREAS } from "@/lib/wellness-score";

const all = (pick: (index: number) => number): QuizAnswers =>
  Object.fromEntries(QUIZ_QUESTIONS.map((q) => [q.id, q.options[pick(q.options.length)].id]));

describe("habits check", () => {
  it("asks one question for each habit area of My Wellness Score", () => {
    expect(QUIZ_QUESTIONS.map((q) => q.area).sort()).toEqual(HABIT_AREAS.map((a) => a.id).sort());
  });

  it("gives no result until every question is answered", () => {
    expect(quizResult({}, 40)).toBeNull();
    const partial = all(() => 0);
    delete partial.sleep;
    expect(isComplete(partial)).toBe(false);
    expect(quizResult(partial, 40)).toBeNull();
    expect(quizResult({ ...all(() => 0), sleep: "made-up" }, 40)).toBeNull();
  });

  it("counts areas on track and shows the strong band when all are", () => {
    const result = quizResult(all(() => 0), 40)!;
    expect(result.met).toHaveLength(7);
    expect(result.counted).toBe(7);
    expect(result.band.id).toBe("strong");
    expect(result.nextSteps).toEqual([]);
  });

  it("leaves 'prefer not to say' out of the count", () => {
    const answers: QuizAnswers = { ...all(() => 0), tobacco: "skip", alcohol: "skip" };
    const result = quizResult(answers, 40)!;
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
    const result = quizResult(answers, 40)!;
    expect(result.met).toEqual([]);
    expect(result.band.id).toBe("start");
    expect(result.nextSteps.map((s) => s.area)).toEqual(["sleep", "movement"]);
  });

  it("accepts only a whole age from 18 to 100", () => {
    expect(parseAge("40")).toBe(40);
    expect(parseAge(" 18 ")).toBe(18);
    for (const bad of ["", "17", "101", "4.5", "-30", "abc", null, undefined]) expect(parseAge(bad)).toBeNull();
    expect(quizResult(all(() => 0), "12")).toBeNull();
  });

  it("moves the lifestyle age one year per area, stated as the rule", () => {
    expect(quizResult(all(() => 0), 40)).toMatchObject({ age: 40, lifestyleAge: 33, difference: -7 });
    const worst: QuizAnswers = {
      sleep: "short", movement: "less", food: "rarely", tobacco: "current", alcohol: "most", stress: "hard", connection: "rarely",
    };
    expect(quizResult(worst, 40)).toMatchObject({ lifestyleAge: 47, difference: 7 });
    const skipped: QuizAnswers = { ...all(() => 0), tobacco: "skip", alcohol: "skip", sleep: "short" };
    expect(quizResult(skipped, 40)).toMatchObject({ lifestyleAge: 37 });
  });

  it("never goes below 18", () => {
    expect(quizResult(all(() => 0), 20)!.lifestyleAge).toBe(18);
  });
});
