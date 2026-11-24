import type { ChoiceActivity, Four, TextValues } from "@/lib/brain-quiz/activities";
import { hashSeed, mulberry32, shuffle } from "@/lib/brain-quiz/engines";
import type { Difficulty } from "@/lib/brain-quiz/progress";
import { fmt } from "@/lib/i18n/config";
import { msg } from "@/lib/i18n/translate";

/**
 * Number puzzles that are built from a seed instead of written by hand, so the Logic and
 * Numbers categories never run out. Every answer is computed from the rule, never typed,
 * so it is always right. Ids look like `GL-e-0042`: category (L logic, N numbers), level,
 * and a seed. The same id always builds the same puzzle, so saved marks still match.
 *
 * To grow the bank, raise SEEDS_PER_LEVEL or add a rule below; no page has to change.
 */
export const SEEDS_PER_LEVEL = 1000;

const ID = /^G([LN])-([emh])-(\d{4})$/;
const LEVEL: Record<string, Difficulty> = { e: "easy", m: "medium", h: "hard" };

type Values = TextValues;

export type GeneratedActivity = ChoiceActivity & {
  generated: true;
  /** Values for the `{placeholders}` in the title, prompt, and explanations. */
  values: { prompt: Values; explanations: readonly [Values, Values, Values, Values] };
};

export function isGeneratedId(id: string): boolean {
  return ID.test(id);
}

export function generatedId(category: "logic" | "numbers", difficulty: Difficulty, seed: number): string {
  return `G${category === "logic" ? "L" : "N"}-${difficulty[0]}-${String(((seed % SEEDS_PER_LEVEL) + SEEDS_PER_LEVEL) % SEEDS_PER_LEVEL).padStart(4, "0")}`;
}

type Rule = { title: string; prompt: string; values: Values; answer: number; explain: string; explainValues: Values; near: number };

function int(rand: () => number, low: number, high: number): number {
  return low + Math.floor(rand() * (high - low + 1));
}

function sequence(items: number[]): string {
  return items.join(", ");
}

const NEXT = msg("{sequence}, … What comes next?");

function logicRule(difficulty: Difficulty, rand: () => number): Rule {
  const pick = Math.floor(rand() * 2);
  if (difficulty === "easy") {
    const step = int(rand, 2, 9);
    if (pick === 0) {
      const start = int(rand, 1, 20);
      const items = [0, 1, 2, 3].map((n) => start + n * step);
      const last = items[3] as number;
      return { title: msg("Counting up"), prompt: NEXT, values: { sequence: sequence(items) }, answer: last + step, explain: msg("Each number is {step} more, so {last} + {step} is {answer}."), explainValues: { step, last, answer: last + step }, near: step };
    }
    const start = int(rand, 50, 99);
    const items = [0, 1, 2, 3].map((n) => start - n * step);
    const last = items[3] as number;
    return { title: msg("Counting down"), prompt: NEXT, values: { sequence: sequence(items) }, answer: last - step, explain: msg("Each number is {step} less, so {last} − {step} is {answer}."), explainValues: { step, last, answer: last - step }, near: step };
  }
  if (difficulty === "medium") {
    if (pick === 0) {
      const factor = int(rand, 2, 3);
      const start = int(rand, 1, 5);
      const items = [0, 1, 2, 3].map((n) => start * factor ** n);
      const last = items[3] as number;
      return { title: msg("Multiplying pattern"), prompt: NEXT, values: { sequence: sequence(items) }, answer: last * factor, explain: msg("Each number is {factor} times the one before, so {last} × {factor} is {answer}."), explainValues: { factor, last, answer: last * factor }, near: last };
    }
    const start = int(rand, 1, 30);
    const first = int(rand, 1, 3);
    const items = [start];
    for (let gap = first; items.length < 5; gap += 1) items.push((items[items.length - 1] as number) + gap);
    const lastGap = first + 4;
    const last = items[4] as number;
    return { title: msg("Growing gaps"), prompt: NEXT, values: { sequence: sequence(items) }, answer: last + lastGap, explain: msg("The gap grows by one each time. The next gap is {gap}, so {last} + {gap} is {answer}."), explainValues: { gap: lastGap, last, answer: last + lastGap }, near: 1 };
  }
  if (pick === 0) {
    const a = int(rand, 1, 6);
    const b = int(rand, 1, 6);
    const items = [a, b];
    while (items.length < 6) items.push((items[items.length - 1] as number) + (items[items.length - 2] as number));
    const shown = items.slice(0, 5);
    return { title: msg("Add the two before"), prompt: NEXT, values: { sequence: sequence(shown) }, answer: items[5] as number, explain: msg("Each number is the sum of the two before it, so {a} + {b} is {answer}."), explainValues: { a: shown[3] as number, b: shown[4] as number, answer: items[5] as number }, near: shown[3] as number };
  }
  const up = int(rand, 4, 9);
  const down = int(rand, 1, up - 1);
  const start = int(rand, 5, 30);
  const items = [start];
  for (let index = 0; items.length < 6; index += 1) items.push((items[items.length - 1] as number) + (index % 2 === 0 ? up : -down));
  const shown = items.slice(0, 5);
  const last = shown[4] as number;
  return { title: msg("Up and down"), prompt: NEXT, values: { sequence: sequence(shown) }, answer: items[5] as number, explain: msg("The steps take turns: add {up}, then take away {down}. After {last} comes a step up, so the answer is {answer}."), explainValues: { up, down, last, answer: items[5] as number }, near: up };
}

function numberRule(difficulty: Difficulty, rand: () => number): Rule {
  const pick = Math.floor(rand() * 2);
  if (difficulty === "easy") {
    const a = int(rand, 12, 69);
    const b = int(rand, 11, 29);
    if (pick === 0) {
      return { title: msg("Quick sum"), prompt: msg("What is {a} + {b}?"), values: { a, b }, answer: a + b, explain: msg("{a} + {b} = {answer}."), explainValues: { a, b, answer: a + b }, near: 10 };
    }
    const big = a + b;
    return { title: msg("Quick difference"), prompt: msg("What is {a} − {b}?"), values: { a: big, b }, answer: a, explain: msg("{a} − {b} = {answer}."), explainValues: { a: big, b, answer: a }, near: 10 };
  }
  if (difficulty === "medium") {
    const a = int(rand, 3, 12);
    const b = int(rand, 4, 12);
    if (pick === 0) {
      return { title: msg("Times table"), prompt: msg("What is {a} × {b}?"), values: { a, b }, answer: a * b, explain: msg("{a} × {b} = {answer}."), explainValues: { a, b, answer: a * b }, near: a };
    }
    const total = a * b;
    return { title: msg("Fair shares"), prompt: msg("{total} apples are shared equally by {people} people. How many apples does each person get?"), values: { total, people: a }, answer: b, explain: msg("{total} ÷ {people} = {answer}, because {people} × {answer} = {total}."), explainValues: { total, people: a, answer: b }, near: 1 };
  }
  if (pick === 0) {
    const percent = [10, 20, 25, 50, 75][int(rand, 0, 4)] as number;
    const base = int(rand, 2, 16) * 20;
    const answer = (base * percent) / 100;
    return { title: msg("Percent of a number"), prompt: msg("What is {percent}% of {base}?"), values: { percent, base }, answer, explain: msg("{percent}% means {percent} out of every 100, so {percent}% of {base} is {answer}."), explainValues: { percent, base, answer }, near: Math.max(5, base / 10) };
  }
  const a = int(rand, 4, 12);
  const b = int(rand, 3, 9);
  const c = int(rand, 2, a * b - 1);
  const answer = a * b - c;
  return { title: msg("Two steps"), prompt: msg("What is {a} × {b} − {c}?"), values: { a, b, c }, answer, explain: msg("Multiply first: {a} × {b} = {product}. Then {product} − {c} = {answer}."), explainValues: { a, b, c, product: a * b, answer }, near: c };
}

function distractors(answer: number, near: number, rand: () => number): number[] {
  const step = Math.max(1, Math.round(near));
  const pool = [answer + step, answer - step, answer + 1, answer - 1, answer + 2 * step, answer + 10, answer - 10, answer * 2]
    .filter((value) => Number.isInteger(value) && value >= 0 && value !== answer);
  const unique = [...new Set(pool)];
  return shuffle(unique, rand).slice(0, 3);
}

const WRONG = msg("{value} does not follow the rule.");

/** The puzzle for a generated id, or undefined when the id is not a generated one. */
export function buildGenerated(id: string): GeneratedActivity | undefined {
  const match = ID.exec(id);
  if (!match) return undefined;
  const category = match[1] === "L" ? "logic" : "numbers";
  const difficulty = LEVEL[match[2] as string] as Difficulty;
  const rand = mulberry32(hashSeed(id));
  const rule = category === "logic" ? logicRule(difficulty, rand) : numberRule(difficulty, rand);
  const wrong = distractors(rule.answer, rule.near, rand);
  const order = shuffle([0, 1, 2, 3], rand);
  const values = [rule.answer, ...wrong];
  const choices = order.map((index) => String(values[index])) as unknown as Four;
  const explanations = order.map((index) => (index === 0 ? rule.explain : WRONG)) as unknown as Four;
  const explanationValues = order.map((index) => (index === 0 ? rule.explainValues : { value: values[index] as number })) as unknown as readonly [Values, Values, Values, Values];
  return {
    kind: "choice",
    generated: true,
    id,
    category,
    difficulty,
    title: rule.title,
    prompt: rule.prompt,
    choices,
    correctIndex: order.indexOf(0) as 0 | 1 | 2 | 3,
    explanations,
    values: { prompt: rule.values, explanations: explanationValues },
  };
}

/** English text with its values filled in, for page titles and descriptions. */
export function englishPrompt(activity: { prompt: string; values?: { prompt?: Values } }): string {
  return activity.values?.prompt ? fmt(activity.prompt, activity.values.prompt) : activity.prompt;
}
