import type { Difficulty } from "@/lib/brain-quiz/progress";

export function hashSeed(id: string): number {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let next = Math.imul(state ^ (state >>> 15), 1 | state);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rand() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap] as T;
    copy[swap] = current as T;
  }
  return copy;
}

export const TILE_COLORS = ["blue", "purple", "teal", "gold"] as const;
export const PAIR_ICONS = ["sun", "moon", "heart", "star", "tree", "rain", "book", "eye"] as const;

const MEMORY_WORDS = [
  "river", "apple", "chair", "cloud", "piano", "garden", "window", "silver", "maple", "orange",
  "pencil", "bridge", "candle", "pocket", "meadow", "lantern", "button", "forest", "circle", "market",
];

function span(difficulty: Difficulty, easy: number, medium: number, hard: number): number {
  if (difficulty === "easy") return easy;
  if (difficulty === "medium") return medium;
  return hard;
}

export function buildSequence(id: string, difficulty: Difficulty): string[] {
  const rand = mulberry32(hashSeed(id));
  const length = span(difficulty, 3, 5, 7);
  return Array.from({ length }, () => TILE_COLORS[Math.floor(rand() * TILE_COLORS.length)] ?? "blue");
}

export function buildDigits(id: string, difficulty: Difficulty): string {
  const rand = mulberry32(hashSeed(`${id}:digits`));
  const length = span(difficulty, 3, 5, 7);
  return Array.from({ length }, () => String(Math.floor(rand() * 10))).join("");
}

export function buildWordRecall(id: string, difficulty: Difficulty): { shown: string[]; options: string[] } {
  const count = span(difficulty, 3, 4, 6);
  const rand = mulberry32(hashSeed(`${id}:words`));
  const bag = shuffle(MEMORY_WORDS, rand);
  const shown = bag.slice(0, count);
  return { shown, options: shuffle([...shown, ...bag.slice(count, count + count)], rand) };
}

export function buildPairs(id: string, difficulty: Difficulty): string[] {
  const pairs = span(difficulty, 3, 4, 6);
  const rand = mulberry32(hashSeed(`${id}:pairs`));
  const icons = shuffle(PAIR_ICONS, rand).slice(0, pairs);
  return shuffle([...icons, ...icons], rand);
}

export function buildOrder(id: string, difficulty: Difficulty): string[] {
  const count = span(difficulty, 3, 4, 5);
  const rand = mulberry32(hashSeed(`${id}:order`));
  return shuffle(PAIR_ICONS, rand).slice(0, count);
}

export type SceneShape = {
  id: string;
  shape: "circle" | "square" | "triangle" | "tree" | "house";
  x: number;
  y: number;
  color: string;
};

const BASE_SCENE: readonly SceneShape[] = [
  { id: "sun", shape: "circle", x: 18, y: 24, color: "#23706A" },
  { id: "hill", shape: "triangle", x: 72, y: 30, color: "#6A3DA8" },
  { id: "tree", shape: "tree", x: 32, y: 68, color: "#0E7490" },
  { id: "house", shape: "house", x: 58, y: 66, color: "#52288A" },
  { id: "box", shape: "square", x: 84, y: 58, color: "#EFE5FA" },
];

const ALT_COLORS = ["#172554", "#8a2f28", "#3E4E80", "#C4B5FD"];

export function buildDifferences(id: string, difficulty: Difficulty): {
  left: SceneShape[];
  right: SceneShape[];
  changedIds: string[];
} {
  const count = span(difficulty, 2, 3, 4);
  const rand = mulberry32(hashSeed(`${id}:diff`));
  const changedIds = shuffle(BASE_SCENE.map((shape) => shape.id), rand).slice(0, count);
  const right = BASE_SCENE.map((shape) => {
    if (!changedIds.includes(shape.id)) return { ...shape };
    const options = ALT_COLORS.filter((color) => color.toLowerCase() !== shape.color.toLowerCase());
    return { ...shape, color: options[Math.floor(rand() * options.length)] ?? ALT_COLORS[0] };
  });
  return { left: BASE_SCENE.map((shape) => ({ ...shape })), right, changedIds };
}

export type OddCell = { shape: string; color: string; odd: boolean };

export function buildOdd(id: string, difficulty: Difficulty): { cells: OddCell[] } {
  const rand = mulberry32(hashSeed(`${id}:odd`));
  const shapes = ["circle", "square", "triangle"];
  const colors = ["#23706A", "#6A3DA8", "#0E7490"];
  const shape = shapes[Math.floor(rand() * shapes.length)] ?? "circle";
  const color = colors[Math.floor(rand() * colors.length)] ?? colors[0];
  const oddIndex = Math.floor(rand() * 9);
  const oddShape = shapes.find((item) => item !== shape) ?? "square";
  const oddColor = colors.find((item) => item !== color) ?? colors[1];
  return {
    cells: Array.from({ length: 9 }, (_, index) => {
      if (index !== oddIndex) return { shape, color, odd: false };
      if (difficulty === "medium") return { shape, color: oddColor, odd: true };
      if (difficulty === "hard") return { shape: oddShape, color: oddColor, odd: true };
      return { shape: oddShape, color, odd: true };
    }),
  };
}

export type PatternToken = { shape: string; color: string };

export function buildPattern(id: string, difficulty: Difficulty): {
  shown: PatternToken[];
  options: PatternToken[];
  correctIndex: number;
} {
  const rand = mulberry32(hashSeed(`${id}:pat`));
  const sequence: PatternToken[] =
    difficulty === "easy"
      ? [
          { shape: "circle", color: "#23706A" },
          { shape: "square", color: "#6A3DA8" },
          { shape: "circle", color: "#23706A" },
          { shape: "square", color: "#6A3DA8" },
          { shape: "circle", color: "#23706A" },
        ]
      : difficulty === "medium"
        ? [
            { shape: "circle", color: "#0E7490" },
            { shape: "square", color: "#0E7490" },
            { shape: "triangle", color: "#0E7490" },
            { shape: "circle", color: "#0E7490" },
            { shape: "square", color: "#0E7490" },
          ]
        : [
            { shape: "circle", color: "#23706A" },
            { shape: "square", color: "#6A3DA8" },
            { shape: "triangle", color: "#0E7490" },
            { shape: "star", color: "#52288A" },
            { shape: "circle", color: "#23706A" },
          ];
  const answer = sequence[4] as PatternToken;
  const decoys: PatternToken[] = [
    { shape: "triangle", color: "#8a2f28" },
    { shape: "square", color: "#172554" },
    { shape: "star", color: "#EFE5FA" },
    { shape: "circle", color: "#3E4E80" },
  ].filter((item) => item.shape !== answer.shape || item.color !== answer.color);
  const options = shuffle([answer, decoys[0] as PatternToken, decoys[1] as PatternToken, decoys[2] as PatternToken], rand);
  return {
    shown: sequence.slice(0, 4),
    options,
    correctIndex: options.findIndex((item) => item.shape === answer.shape && item.color === answer.color),
  };
}

export function buildMistake(id: string, difficulty: Difficulty): { values: string[]; wrongIndex: number; rule: string } {
  const rand = mulberry32(hashSeed(`${id}:mis`));
  const start = 2 + Math.floor(rand() * 4);
  const step = span(difficulty, 2, 3, 5);
  const values = Array.from({ length: 6 }, (_, index) => String(start + index * step));
  const wrongIndex = 2 + Math.floor(rand() * 3);
  values[wrongIndex] = String(Number(values[wrongIndex]) + (difficulty === "hard" ? 2 : 1));
  return { values, wrongIndex, rule: `The count goes up by ${step} each time.` };
}

export function buildMissing(id: string, difficulty: Difficulty): {
  first: string[];
  second: string[];
  options: string[];
  correct: string;
} {
  const count = span(difficulty, 4, 5, 6);
  const rand = mulberry32(hashSeed(`${id}:miss`));
  const icons = shuffle(PAIR_ICONS, rand);
  const first = icons.slice(0, count);
  const missing = first[Math.floor(rand() * first.length)] ?? first[0] ?? "star";
  const rest = icons.filter((icon) => !first.includes(icon));
  return {
    first,
    second: first.filter((icon) => icon !== missing),
    options: shuffle([missing, rest[0] ?? "book", rest[1] ?? "rain", rest[2] ?? "eye"], rand),
    correct: missing,
  };
}

export type HiddenItem = { id: string; icon: string; x: number; y: number; target: boolean };

export function buildHidden(id: string, difficulty: Difficulty): { items: HiddenItem[]; clue: string } {
  const count = span(difficulty, 6, 8, 10);
  const rand = mulberry32(hashSeed(`${id}:hid`));
  const fillers = ["circle", "square", "triangle", "tree", "house", "moon", "heart", "book", "rain", "sun"];
  const targetIndex = Math.floor(rand() * count);
  const items = Array.from({ length: count }, (_, index) => ({
    id: `h${index}`,
    icon: index === targetIndex ? "star" : fillers[index % fillers.length] ?? "circle",
    x: 14 + (index % 5) * 18,
    y: index < 5 ? 32 : 68,
    target: index === targetIndex,
  }));
  return { items, clue: "Find the star." };
}

export function wordInGrid(rows: readonly string[], word: string): boolean {
  const grid = rows.map((row) => row.toUpperCase());
  const target = word.toUpperCase();
  const height = grid.length;
  const width = grid[0]?.length ?? 0;
  const dirs = [
    [1, 0],
    [0, 1],
    [1, 1],
    [-1, 0],
    [0, -1],
    [-1, -1],
    [1, -1],
    [-1, 1],
  ];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      for (const [dx, dy] of dirs) {
        let found = true;
        for (let step = 0; step < target.length; step += 1) {
          const nextX = x + (dx ?? 0) * step;
          const nextY = y + (dy ?? 0) * step;
          if (nextY < 0 || nextX < 0 || nextY >= height || nextX >= width || grid[nextY]?.[nextX] !== target[step]) {
            found = false;
            break;
          }
        }
        if (found) return true;
      }
    }
  }
  return false;
}

export function lineBetween(rows: readonly string[], start: readonly [number, number], end: readonly [number, number]): string | null {
  const x1 = start[0];
  const y1 = start[1];
  const x2 = end[0];
  const y2 = end[1];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  if (!(dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy))) return null;
  const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
  const stepY = dy === 0 ? 0 : dy / Math.abs(dy);
  let word = "";
  for (let step = 0; step <= steps; step += 1) {
    const letter = rows[y1 + stepY * step]?.[x1 + stepX * step];
    if (!letter) return null;
    word += letter;
  }
  return word.toUpperCase();
}

export function crosswordMatches(grid: readonly string[], entries: readonly string[]): boolean {
  if (entries.length !== grid.length) return false;
  return grid.every((row, index) => {
    const guess = (entries[index] ?? "").toUpperCase();
    if (guess.length !== row.length) return false;
    return row.toUpperCase().split("").every((letter, cell) => letter === "#" || guess[cell] === letter);
  });
}
