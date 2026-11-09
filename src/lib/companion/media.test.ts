import { describe, expect, it } from "vitest";
import { BOOKS } from "@/lib/companion/books";
import { GAME_NOTICE, logicQuestion, makeSudoku, memoryDeck, oddOneRound, scramble, sudokuValid, wordRound } from "@/lib/companion/games";
import { breathPhase, MUSIC_CATEGORIES, notesBetween, TRACKS } from "@/lib/companion/music";

describe("wellness music", () => {
  it("has at least one track in every category, each with a credit", () => {
    for (const category of MUSIC_CATEGORIES) expect(TRACKS.some((track) => track.category === category)).toBe(true);
    for (const track of TRACKS) expect(track.credit.length).toBeGreaterThan(10);
    expect(new Set(TRACKS.map((track) => track.id)).size).toBe(TRACKS.length);
  });

  it("schedules notes only inside the window and never past the end", () => {
    const track = TRACKS.find((item) => item.id === "ode-to-joy");
    if (!track) throw new Error("missing track");
    const events = notesBetween(track, 10, 20);
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((event) => event.at >= 10 && event.at < 20)).toBe(true);
    expect(notesBetween(track, track.minutes * 60, track.minutes * 60 + 30)).toEqual([]);
  });

  it("follows the breathing pattern", () => {
    expect(breathPhase([4, 0, 6], 1).phase).toBe("in");
    expect(breathPhase([4, 0, 6], 5).phase).toBe("out");
    expect(breathPhase([4, 4, 4], 6).phase).toBe("hold");
    expect(breathPhase([4, 4, 4], 12).phase).toBe("in");
  });
});

describe("books", () => {
  it("are original texts with pages", () => {
    for (const book of BOOKS) {
      expect(book.credit).toMatch(/LifeZoi/);
      expect(book.pages.length).toBeGreaterThan(1);
      expect(book.pages.every((page) => page.length > 0)).toBe(true);
    }
  });
});

describe("brain games", () => {
  it("makes valid Sudoku grids in every size, the same for the same day", () => {
    for (const size of [4, 6, 9] as const) {
      for (const seed of ["2026-11-09", "2026-11-10", "x"]) {
        const game = makeSudoku(seed, size);
        expect(sudokuValid(game.solution, size)).toBe(true);
        expect(game.puzzle.filter((cell) => cell === null).length).toBeGreaterThan(0);
        game.puzzle.forEach((cell, index) => cell === null || expect(cell).toBe(game.solution[index]));
      }
    }
    expect(makeSudoku("a", 6)).toEqual(makeSudoku("a", 6));
  });

  it("rejects an invalid Sudoku", () => {
    const game = makeSudoku("a", 4);
    const broken = [...game.solution];
    [broken[0], broken[1]] = [broken[1] as number, broken[0] as number];
    expect(sudokuValid(broken, 4)).toBe(false);
  });

  it("builds a memory deck of pairs", () => {
    const deck = memoryDeck("a", 6);
    expect(deck).toHaveLength(12);
    for (const symbol of deck) expect(deck.filter((item) => item === symbol)).toHaveLength(2);
  });

  it("scrambles words without leaving them unchanged", () => {
    for (const { word, mixed } of wordRound("seed", 8)) {
      expect(mixed).not.toBe(word);
      expect(mixed.split("").sort().join("")).toBe(word.split("").sort().join(""));
    }
    expect(scramble("garden", "a")).not.toBe("garden");
  });

  it("has exactly one odd symbol and logic answers among the choices", () => {
    const round = oddOneRound("a", 1);
    const odd = round.symbols[round.odd];
    expect(round.symbols.filter((symbol) => symbol === odd)).toHaveLength(1);
    for (let i = 0; i < 20; i += 1) {
      const question = logicQuestion("a", i);
      expect(question.choices).toContain(question.answer);
      expect(new Set(question.choices).size).toBe(question.choices.length);
    }
  });

  it("never presents play as a diagnosis", () => {
    expect(GAME_NOTICE).toMatch(/not a medical or cognitive test/);
  });
});
