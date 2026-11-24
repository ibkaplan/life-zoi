import { describe, expect, it } from "vitest";
import { buildRound, FACT_QUESTIONS, questionFact, quizCategories, ROUND_SIZE, scoreMessage } from "@/lib/encyclopedia/fact-quiz";
import { FACT_CATEGORIES, findFact } from "@/lib/encyclopedia/facts";

function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return value / 2147483648;
  };
}

describe("Health Facts Quiz", () => {
  it("builds every question on a fact that exists, once each, with a source", () => {
    const ids = FACT_QUESTIONS.map((question) => question.fact);
    expect(new Set(ids).size).toBe(ids.length);
    for (const question of FACT_QUESTIONS) {
      const fact = findFact(question.fact);
      expect(fact, question.fact).toBeDefined();
      expect(fact!.sources.length, question.fact).toBeGreaterThan(0);
      expect(new Set(question.choices).size, question.fact).toBe(3);
      expect(question.explanation.length, question.fact).toBeGreaterThan(20);
    }
  });

  it("covers every fact category", () => {
    expect(new Set(quizCategories())).toEqual(new Set(FACT_CATEGORIES.map((category) => category.slug)));
  });

  it("asks a round of distinct questions with all three choices shown", () => {
    const round = buildRound({ random: seeded(7) });
    expect(round).toHaveLength(ROUND_SIZE);
    expect(new Set(round.map((question) => question.fact)).size).toBe(ROUND_SIZE);
    for (const question of round) expect([...question.order].sort()).toEqual([0, 1, 2]);
  });

  it("starts with the linked fact and keeps a category round in its category", () => {
    expect(buildRound({ firstFact: "penicillin", random: seeded(3) })[0].fact).toBe("penicillin");
    const sleep = buildRound({ category: "sleep", random: seeded(5) });
    expect(sleep.length).toBeGreaterThan(0);
    for (const question of sleep) expect(questionFact(question).category).toBe("sleep");
  });

  it("gives a message for every score", () => {
    for (let score = 0; score <= ROUND_SIZE; score += 1) expect(scoreMessage(score, ROUND_SIZE)).not.toBe("");
  });
});
