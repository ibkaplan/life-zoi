/**
 * Brain games for enjoyment and focus. Results are a record of play,
 * never a measure of memory, intelligence, or health.
 */

export const GAME_IDS = ["sudoku", "memory", "words", "attention", "logic"] as const;
export type GameId = (typeof GAME_IDS)[number];

export const GAME_INFO: Record<GameId, { title: string; blurb: string }> = {
  sudoku: { title: "Sudoku", blurb: "Fill the grid so every row, column, and box has each number once." },
  memory: { title: "Memory match", blurb: "Turn over two cards at a time and find the pairs." },
  words: { title: "Word scramble", blurb: "Put the letters back in order to make a word." },
  attention: { title: "Spot the odd one", blurb: "Find the one symbol that is different from the rest." },
  logic: { title: "What comes next?", blurb: "Find the pattern and choose the next number." },
};

export const GAME_NOTICE = "These games are for enjoyment and focus. They are not a medical or cognitive test, and your results say nothing about your health.";

export function rng(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

// ---------- Sudoku ----------

export type SudokuSize = 4 | 6 | 9;
export type Sudoku = { size: SudokuSize; boxRows: number; boxCols: number; solution: number[]; puzzle: (number | null)[] };

const BOXES: Record<SudokuSize, [number, number]> = { 4: [2, 2], 6: [2, 3], 9: [3, 3] };
const BLANKS: Record<SudokuSize, number> = { 4: 8, 6: 18, 9: 40 };

/** A valid, filled grid from a shuffled base pattern, with some cells hidden. */
export function makeSudoku(seed: string, size: SudokuSize): Sudoku {
  const random = rng(`sudoku:${seed}:${size}`);
  const [boxRows, boxCols] = BOXES[size];
  const bands = size / boxRows;
  const stacks = size / boxCols;
  const rows = shuffle([...Array(bands).keys()], random).flatMap((band) => shuffle([...Array(boxRows).keys()], random).map((r) => band * boxRows + r));
  const cols = shuffle([...Array(stacks).keys()], random).flatMap((stack) => shuffle([...Array(boxCols).keys()], random).map((c) => stack * boxCols + c));
  const digits = shuffle([...Array(size).keys()].map((n) => n + 1), random);
  const pattern = (r: number, c: number) => (boxCols * (r % boxRows) + Math.floor(r / boxRows) + c) % size;
  const solution: number[] = [];
  for (const r of rows) for (const c of cols) solution.push(digits[pattern(r, c)] as number);
  const hidden = new Set(shuffle([...Array(size * size).keys()], random).slice(0, BLANKS[size]));
  return { size, boxRows, boxCols, solution, puzzle: solution.map((value, index) => (hidden.has(index) ? null : value)) };
}

/** True when every row, column, and box holds each number once. */
export function sudokuValid(grid: (number | null)[], size: SudokuSize): boolean {
  const [boxRows, boxCols] = BOXES[size];
  const groups: number[][] = [];
  for (let i = 0; i < size; i += 1) {
    groups.push([...Array(size).keys()].map((c) => i * size + c));
    groups.push([...Array(size).keys()].map((r) => r * size + i));
  }
  for (let br = 0; br < size; br += boxRows) {
    for (let bc = 0; bc < size; bc += boxCols) {
      const cells: number[] = [];
      for (let r = 0; r < boxRows; r += 1) for (let c = 0; c < boxCols; c += 1) cells.push((br + r) * size + bc + c);
      groups.push(cells);
    }
  }
  return groups.every((cells) => {
    const values = cells.map((index) => grid[index]);
    return values.every((value) => typeof value === "number" && value >= 1 && value <= size) && new Set(values).size === size;
  });
}

// ---------- Memory match ----------

const SYMBOLS = ["🍎", "🌻", "🐦", "🌙", "⭐", "🍐", "🌿", "🐟", "☀️", "🍋", "🌷", "🦋"];

export function memoryDeck(seed: string, pairs: number): string[] {
  const random = rng(`memory:${seed}`);
  const chosen = shuffle(SYMBOLS, random).slice(0, Math.min(pairs, SYMBOLS.length));
  return shuffle([...chosen, ...chosen], random);
}

// ---------- Word scramble ----------

export const WORDS = [
  "garden", "window", "morning", "teapot", "sunshine", "pebble", "harbour", "violin", "blanket", "orchard",
  "lantern", "meadow", "biscuit", "compass", "kettle", "rainbow", "picnic", "library", "pillow", "basket",
  "almond", "breeze", "candle", "forest", "island", "lemon", "puzzle", "river", "summer", "walnut",
];

export function scramble(word: string, seed: string): string {
  const random = rng(`word:${seed}:${word}`);
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const mixed = shuffle(word.split(""), random).join("");
    if (mixed !== word) return mixed;
  }
  return word.split("").reverse().join("");
}

export function wordRound(seed: string, count = 5): { word: string; mixed: string }[] {
  const random = rng(`words:${seed}`);
  return shuffle(WORDS, random)
    .slice(0, count)
    .map((word) => ({ word, mixed: scramble(word, seed) }));
}

// ---------- Spot the odd one ----------

const PAIRS: [string, string][] = [
  ["O", "Q"],
  ["E", "F"],
  ["b", "d"],
  ["M", "N"],
  ["6", "9"],
  ["C", "G"],
  ["p", "q"],
  ["8", "B"],
];

export function oddOneRound(seed: string, round: number, cells = 20): { symbols: string[]; odd: number } {
  const random = rng(`odd:${seed}:${round}`);
  const [common, odd] = PAIRS[Math.floor(random() * PAIRS.length)] as [string, string];
  const at = Math.floor(random() * cells);
  return { symbols: [...Array(cells).keys()].map((index) => (index === at ? odd : common)), odd: at };
}

// ---------- What comes next? ----------

export type LogicQuestion = { shown: number[]; answer: number; choices: number[]; rule: string };

export function logicQuestion(seed: string, round: number): LogicQuestion {
  const random = rng(`logic:${seed}:${round}`);
  const kind = Math.floor(random() * 4);
  const start = 1 + Math.floor(random() * 9);
  const step = 2 + Math.floor(random() * 5);
  let shown: number[];
  let answer: number;
  let rule: string;
  if (kind === 0) {
    shown = [0, 1, 2, 3].map((i) => start + i * step);
    answer = start + 4 * step;
    rule = `Add ${step} each time.`;
  } else if (kind === 1) {
    const top = start + 6 * step;
    shown = [0, 1, 2, 3].map((i) => top - i * step);
    answer = top - 4 * step;
    rule = `Take away ${step} each time.`;
  } else if (kind === 2) {
    shown = [0, 1, 2, 3].map((i) => start * 2 ** i);
    answer = start * 16;
    rule = "Double each time.";
  } else {
    shown = [0, 1, 2, 3].map((i) => start + (i * (i + 1)) / 2);
    answer = start + 10;
    rule = "Add 1, then 2, then 3, then 4.";
  }
  const wrong = new Set<number>();
  for (const delta of shuffle([1, -1, 2, -2, step, -step, 3], random)) {
    const value = answer + delta;
    if (value > 0 && value !== answer) wrong.add(value);
    if (wrong.size === 3) break;
  }
  return { shown, answer, rule, choices: shuffle([answer, ...wrong], random) };
}
