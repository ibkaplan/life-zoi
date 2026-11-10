import { describe, expect, it } from "vitest";
import { prepareAccountWrite, rowsToSession, shouldCopyLocalIntoAccount } from "@/lib/account-records";
import { activitiesFor, activityById, allActivities, isCategory } from "@/lib/brain-quiz/catalog";
import { dailyPools, dailyRound } from "@/lib/brain-quiz/daily";
import {
  buildDifferences,
  buildDigits,
  buildHidden,
  buildMistake,
  buildOdd,
  buildOrder,
  buildPairs,
  buildPattern,
  buildSequence,
  buildWordRecall,
  crosswordMatches,
  foldLetters,
  wordInGrid,
} from "@/lib/brain-quiz/engines";
import { localizeActivity, NATIVE, nativeIds, noteText } from "@/lib/brain-quiz/localize";
import {
  completeDaily,
  emptyBrainProgress,
  POINT_VALUES,
  recordOutcome,
  sanitizeBrain,
} from "@/lib/brain-quiz/progress";
import { addIsoDays } from "@/lib/dates";
import { sanitizeSession } from "@/lib/session";
import { emptySession } from "@/lib/types";

const USER = "11111111-1111-4111-8111-111111111111";

function texts(activity: { prompt?: string; title?: string; choices?: readonly string[]; explanations?: readonly string[] }) {
  return [activity.title, activity.prompt, ...(activity.choices ?? []), ...(activity.explanations ?? [])].join(" ").toLowerCase();
}

describe("brain quiz catalog", () => {
  it("meets the question counts and keeps ids unique", () => {
    expect(activitiesFor("logic").length).toBeGreaterThanOrEqual(25);
    expect(activitiesFor("riddles").length).toBeGreaterThanOrEqual(25);
    expect(allActivities.filter((item) => item.kind === "rebus").length).toBeGreaterThanOrEqual(15);
    expect(activitiesFor("numbers").length).toBeGreaterThanOrEqual(25);
    expect(activitiesFor("words").length).toBeGreaterThanOrEqual(25);
    expect(activitiesFor("habits").length).toBeGreaterThanOrEqual(50);
    expect(activitiesFor("memory").length).toBe(15);
    expect(activitiesFor("attention").length).toBe(18);
    expect(new Set(allActivities.map((item) => item.id)).size).toBe(allActivities.length);
  });

  it("gives every choice four explanations and habit sources", () => {
    for (const activity of allActivities) {
      if (activity.kind === "choice" || activity.kind === "rebus") {
        expect(activity.choices).toHaveLength(4);
        expect(activity.explanations).toHaveLength(4);
        expect(activity.correctIndex).toBeGreaterThanOrEqual(0);
        expect(activity.correctIndex).toBeLessThan(4);
      }
      if (activity.kind === "multi") {
        expect(activity.choices).toHaveLength(4);
        expect(activity.explanations).toHaveLength(4);
        expect(activity.correctIndexes.length).toBeGreaterThanOrEqual(2);
        expect(new Set(activity.correctIndexes).size).toBe(activity.correctIndexes.length);
      }
      if (activity.kind === "rebus") {
        expect(activity.rebus.arrangement.length).toBeGreaterThan(0);
      }
      if (activity.category === "habits" && (activity.kind === "choice" || activity.kind === "multi")) {
        expect(activity.sources && activity.sources.length > 0).toBe(true);
        for (const source of activity.sources ?? []) expect(source.url.startsWith("https://")).toBe(true);
      }
    }
  });

  it("does not claim the quiz prevents dementia or diagnoses anyone", () => {
    const habits = allActivities.filter((item) => item.category === "habits");
    for (const activity of habits) {
      const blob = texts(activity);
      expect(blob).not.toMatch(/prevents? (dementia|alzheimer)/);
      expect(blob).not.toMatch(/stops memory illness/);
      expect(blob).not.toMatch(/reverse aging/);
      expect(blob).not.toMatch(/this quiz (diagnoses|treats|cures)/);
    }
  });

  it("places every word-search word in its grid and builds real games", () => {
    for (const activity of allActivities) {
      if (activity.kind === "word-search") {
        for (const word of activity.words) expect(wordInGrid(activity.rows, word)).toBe(true);
      }
      if (activity.kind === "letters") expect(activity.answer.length).toBe(activity.pattern.length);
      if (activity.kind === "acrostic") {
        expect(activity.words.map((word) => word[0]).join("").toUpperCase()).toBe(activity.answer);
      }
      if (activity.kind === "crossword") {
        expect(activity.grid.every((row) => row.length === activity.grid[0]?.length)).toBe(true);
        expect(activity.clues.length).toBeGreaterThan(0);
      }
    }
    expect(buildSequence("M-sequence-e", "easy")).toHaveLength(3);
    expect(buildDigits("M-numbers-h", "hard")).toHaveLength(7);
    expect(buildWordRecall("M-words-m", "medium").shown).toHaveLength(4);
    expect(new Set(buildPairs("M-pairs-e", "easy")).size).toBe(3);
    expect(buildOrder("M-order-h", "hard")).toHaveLength(5);
    const diff = buildDifferences("A-differences-e", "easy");
    expect(diff.changedIds).toHaveLength(2);
    for (const id of diff.changedIds) {
      const left = diff.left.find((shape) => shape.id === id);
      const right = diff.right.find((shape) => shape.id === id);
      expect(left?.color).not.toBe(right?.color);
    }
    expect(buildOdd("A-odd-m", "medium").cells.filter((cell) => cell.odd)).toHaveLength(1);
    const pattern = buildPattern("A-pattern-h", "hard");
    expect(pattern.shown).toHaveLength(4);
    expect(pattern.correctIndex).toBeGreaterThanOrEqual(0);
    const mistake = buildMistake("A-mistake-e", "easy");
    expect(mistake.values[mistake.wrongIndex]).not.toBe(String(Number(mistake.values[0]) + mistake.wrongIndex * 2));
    expect(buildHidden("A-hidden-e", "easy").items.filter((item) => item.target)).toHaveLength(1);
  });
});

describe("daily rotation and scoring", () => {
  it("is deterministic and does not keep the same five forever", () => {
    const first = dailyRound("2026-11-06").items.map((item) => item.id);
    expect(dailyRound("2026-11-06").items.map((item) => item.id)).toEqual(first);
    expect(dailyRound("2026-11-07").items.map((item) => item.id)).not.toEqual(first);
    const seen = new Set<string>();
    for (let day = 0; day < 40; day += 1) seen.add(dailyRound(addIsoDays("2026-11-06", day)).items[0]?.id ?? "");
    expect(seen.size).toBeGreaterThan(5);
    const round = dailyRound("2026-11-06");
    expect(round.items.map((item) => item.category)).toEqual(["logic", "memory", "riddles", expect.any(String), "habits"]);
    expect(round.items[2]?.kind).toBe("rebus");
    expect(["words", "numbers"]).toContain(round.items[3]?.category);
    expect(dailyPools().logicPool.length).toBeGreaterThanOrEqual(25);
  });

  it("awards easy, medium, hard, and one daily bonus without double scoring", () => {
    expect(POINT_VALUES).toEqual({ easy: 10, medium: 20, hard: 30, dailyBonus: 25 });
    let progress = emptyBrainProgress();
    const easy = recordOutcome(progress, { today: "2026-11-06", activityId: "L01", category: "logic", difficulty: "easy", correct: true, lock: true });
    expect(easy.gained).toBe(10);
    const again = recordOutcome(easy.progress, { today: "2026-11-06", activityId: "L01", category: "logic", difficulty: "easy", correct: true, lock: true });
    expect(again.gained).toBe(0);
    expect(again.already).toBe(true);
    expect(again.progress.points).toBe(10);
    progress = recordOutcome(again.progress, { today: "2026-11-07", activityId: "N01", category: "numbers", difficulty: "medium", correct: true, lock: true }).progress;
    progress = recordOutcome(progress, { today: "2026-11-09", activityId: "H01", category: "habits", difficulty: "hard", correct: true, lock: true }).progress;
    expect(progress.points).toBe(60);
    expect(progress.streak).toBe(1);
    expect(progress.bestStreak).toBe(2);
    const picks = [
      { id: "L02", correct: true, note: "ok", gained: 10, picked: [0] },
      { id: "M-sequence-e", correct: true, note: "ok", gained: 10, picked: [] },
      { id: "B01", correct: false, note: "no", gained: 0, picked: [1] },
      { id: "W01", correct: true, note: "ok", gained: 10, picked: [0] },
      { id: "H02", correct: true, note: "ok", gained: 10, picked: [] },
    ];
    progress = { ...progress, lastDaily: { date: "2026-11-10", picks } };
    const bonus = completeDaily(progress, "2026-11-10", 5);
    expect(bonus.gained).toBe(25);
    expect(bonus.progress.points).toBe(85);
    expect(completeDaily(bonus.progress, "2026-11-10", 5).gained).toBe(0);
    expect(bonus.progress.dailyScores[0]?.score).toBe(65);
  });

  it("keeps quiz marks inside the existing session", () => {
    const played = recordOutcome(emptyBrainProgress(), {
      today: "2026-11-06",
      activityId: "L01",
      category: "logic",
      difficulty: "easy",
      correct: true,
      lock: true,
    }).progress;
    const session = sanitizeSession({ ...emptySession(), brainQuiz: played });
    expect(session.brainQuiz.points).toBe(10);
    expect(shouldCopyLocalIntoAccount(emptySession(), session)).toBe(true);
    const prepared = prepareAccountWrite(session, USER, "2026-11-06T12:00:00.000Z");
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    expect(prepared.rows.profile.session_state.brainQuiz.points).toBe(10);
    const loaded = rowsToSession({
      profile: { display_name: null, session_state: prepared.rows.profile.session_state },
      assessments: [],
      scenarios: [],
      goals: [],
      checkIns: [],
    });
    expect(loaded.brainQuiz.awarded).toContain("L01");
    expect(sanitizeBrain({ points: -4, awarded: ["bad id", "L01"] }).awarded).toEqual(["L01"]);
    expect(isCategory("habits")).toBe(true);
  });
});

describe("native puzzles for other languages", () => {
  it("keep the same ids, kinds, and answer positions, and the word games work", () => {
    const native = nativeIds();
    for (const [locale, set] of Object.entries(NATIVE)) {
      expect(new Set(set.memoryWords).size, locale).toBe(set.memoryWords.length);
      expect(buildWordRecall("M-words-h", "hard", set.memoryWords).shown).toHaveLength(6);
      for (const id of Object.keys(set.variants)) {
        expect(native.has(id), `${locale} ${id}`).toBe(true);
        const base = activityById(id);
        expect(base, id).toBeDefined();
        if (!base) continue;
        const activity = localizeActivity(base, locale as "uk" | "ru" | "el");
        expect(activity.id).toBe(base.id);
        expect(activity.kind).toBe(base.kind);
        expect(activity.title).not.toBe(base.title);
        if ((activity.kind === "choice" || activity.kind === "rebus") && (base.kind === "choice" || base.kind === "rebus")) {
          expect(activity.correctIndex).toBe(base.correctIndex);
          expect(new Set(activity.choices).size, `${locale} ${id}`).toBe(4);
          expect(activity.explanations).toHaveLength(4);
          expect(activity.choices).not.toEqual(base.choices);
        }
        if (activity.kind === "rebus" && base.kind === "rebus") expect(activity.rebus).not.toEqual(base.rebus);
        if (activity.kind === "word-search") {
          expect(new Set(activity.rows).size).toBe(activity.rows.length);
          expect(activity.rows.every((row) => row.length === activity.rows[0]?.length), `${locale} ${id}`).toBe(true);
          for (const word of activity.words) expect(wordInGrid(activity.rows, word), `${locale} ${word}`).toBe(true);
        }
        if (activity.kind === "letters") {
          expect(activity.answer.length).toBe(activity.pattern.length);
          activity.pattern.split("").forEach((letter, index) => {
            if (letter === "_") expect(activity.bank, `${locale} ${id}`).toContain(activity.answer[index]);
            else expect(letter).toBe(activity.answer[index]);
          });
        }
        if (activity.kind === "acrostic") {
          expect(activity.words.map((word) => word[0]).join("").toUpperCase(), `${locale} ${id}`).toBe(activity.answer);
        }
        if (activity.kind === "crossword") {
          expect(new Set(activity.grid).size).toBe(activity.grid.length);
          expect(activity.grid.every((row) => row.length === activity.grid[0]?.length), `${locale} ${id}`).toBe(true);
          expect(crosswordMatches(activity.grid, activity.grid.map((row) => row.toLowerCase()))).toBe(true);
        }
      }
    }
  });

  it("matches typed Greek letters with or without accents", () => {
    expect(crosswordMatches(["ΝΕΡΟ"], ["νερό"])).toBe(true);
    expect(foldLetters("й")).toBe("Й");
    expect(crosswordMatches(["СОН"], ["сон"])).toBe(true);
  });

  it("translates saved result notes that carry a value", () => {
    const upper = (text: string, values?: Record<string, string | number>) =>
      (values ? Object.entries(values).reduce((out, [key, value]) => out.replace(`{${key}}`, String(value)), text) : text).toUpperCase();
    expect(noteText("The sequence was blue, gold.", upper)).toBe("THE SEQUENCE WAS BLUE, GOLD.");
    expect(noteText("You matched every pair.", upper)).toBe("YOU MATCHED EVERY PAIR.");
  });
});
