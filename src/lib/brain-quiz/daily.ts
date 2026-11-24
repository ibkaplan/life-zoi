import type { Activity } from "@/lib/brain-quiz/activities";
import { activitiesFor, activityById, allActivities } from "@/lib/brain-quiz/catalog";
import { hashSeed } from "@/lib/brain-quiz/engines";
import { generatedId, SEEDS_PER_LEVEL } from "@/lib/brain-quiz/generated";
import { baseActivityId, markSeen, type BrainProgress, type CategoryId, type Difficulty } from "@/lib/brain-quiz/progress";
import { isRealISODate } from "@/lib/dates";

const EPOCH = Date.UTC(2026, 0, 1);

/** Five parts every day. */
export const DAILY_SIZE = 5;
/** A question shown in the last this-many days is not picked again while others are left. */
export const RECENT_DAYS = 30;

export function dayNumber(isoDate: string): number {
  if (!isRealISODate(isoDate)) return 0;
  const [year, month, day] = isoDate.split("-").map(Number);
  return Math.floor((Date.UTC(year ?? 2026, (month ?? 1) - 1, day ?? 1) - EPOCH) / 86400000);
}

function mod(value: number, length: number): number {
  if (length <= 0) return 0;
  return ((value % length) + length) % length;
}

function at<T>(items: readonly T[], index: number): T {
  return items[mod(index, items.length)] as T;
}

const logicPool = allActivities.filter((item) => item.category === "logic");
const memoryPool = activitiesFor("memory");
const rebusPool = allActivities.filter((item) => item.kind === "rebus");
const wordPool = allActivities.filter((item) => item.category === "words" && (item.kind === "choice" || item.kind === "letters" || item.kind === "acrostic"));
const numberPool = allActivities.filter((item) => item.category === "numbers");
const habitPool = allActivities.filter((item) => item.category === "habits");

export type DailyRound = { date: string; items: Activity[] };

/**
 * The fixed rotation used before the daily challenge learned from each person's history.
 * It still decides the set for a day that was started under it, so that day's saved
 * answers keep matching.
 */
export function dailyRound(date: string): DailyRound {
  const n = dayNumber(date);
  const mixed = n % 2 === 0 ? at(wordPool, Math.floor(n / 2) * 3 + 1) : at(numberPool, Math.floor(n / 2) * 3 + 2);
  return {
    date,
    items: [at(logicPool, n), at(memoryPool, n * 3 + 1), at(rebusPool, n * 5 + 2), mixed, at(habitPool, n * 7 + 4)],
  };
}

export function featuredRebus(date: string): Activity {
  return at(rebusPool, dayNumber(date) * 11 + 3);
}

export function dailyPools() {
  return { logicPool, memoryPool, rebusPool, wordPool, numberPool, habitPool };
}

// ---------- rotation that learns from what the person has seen ----------

/** Categories in an interleaved ring, so any five neighbours mix puzzles, games, and learning. */
const RING: readonly CategoryId[] = ["logic", "memory", "riddles", "habits", "attention", "numbers", "words"];
/** Two easy, two medium, one hard each day, in a different order each day. */
const LEVEL_PATTERN: readonly Difficulty[] = ["easy", "medium", "easy", "hard", "medium"];

/** The five categories for a day. Neighbouring days always differ, and each category comes up five days a week. */
export function dailyCategories(date: string): CategoryId[] {
  const start = mod(dayNumber(date) * 3, RING.length);
  return Array.from({ length: DAILY_SIZE }, (_, index) => RING[(start + index) % RING.length] as CategoryId);
}

export function dailyLevels(date: string): Difficulty[] {
  const shift = mod(dayNumber(date), LEVEL_PATTERN.length);
  return Array.from({ length: DAILY_SIZE }, (_, index) => LEVEL_PATTERN[(index + shift) % LEVEL_PATTERN.length] as Difficulty);
}

/** Games that build a new layout from their id, so a daily copy is always new. */
function isBuiltGame(category: CategoryId): boolean {
  return category === "memory" || category === "attention";
}

/** Written questions that the daily challenge may use for a category. Long word puzzles stay in practice. */
function writtenPool(category: CategoryId, daily: boolean): Activity[] {
  if (category === "words" && daily) return wordPool;
  return activitiesFor(category);
}

type Picker = { date: string; day: number; progress: BrainProgress; used: Set<string>; answered: Set<string>; daily: boolean };

function ranked<T extends { id: string }>(items: readonly T[], picker: Picker, salt: string): T[] {
  return [...items].sort((a, b) => {
    const seenA = picker.progress.seen[a.id] ?? -Infinity;
    const seenB = picker.progress.seen[b.id] ?? -Infinity;
    if (seenA !== seenB) return seenA - seenB;
    return hashSeed(`${picker.date}:${salt}:${a.id}`) - hashSeed(`${picker.date}:${salt}:${b.id}`);
  });
}

function isRecent(picker: Picker, id: string): boolean {
  const seen = picker.progress.seen[id];
  return seen !== undefined && picker.day - seen < RECENT_DAYS;
}

/**
 * One activity for a category and level. In order of preference:
 * a written question never answered and not shown lately; for Logic and Numbers a newly
 * built puzzle; otherwise the question shown longest ago, as a daily copy so it can be
 * played again today. Memory and Attention use the game mode shown longest ago, built
 * fresh for the day.
 */
export function pickActivity(category: CategoryId, difficulty: Difficulty, picker: Picker): Activity | null {
  const salt = `${category}:${difficulty}`;
  if (isBuiltGame(category)) {
    const modes = activitiesFor(category, difficulty).filter((item) => !picker.used.has(item.id));
    const first = ranked(modes, picker, salt)[0];
    return first ? (activityById(`${first.id}_d${picker.day}`) ?? null) : null;
  }
  const pool = writtenPool(category, picker.daily).filter((item) => !picker.used.has(item.id));
  const atLevel = pool.filter((item) => item.difficulty === difficulty);
  const isFresh = (item: Activity) => !picker.answered.has(item.id) && !isRecent(picker, item.id);
  const freshAtLevel = atLevel.filter(isFresh);
  if (freshAtLevel.length > 0) return ranked(freshAtLevel, picker, salt)[0] ?? null;
  if (category === "logic" || category === "numbers") {
    const start = hashSeed(`${picker.date}:${salt}`) % SEEDS_PER_LEVEL;
    for (let step = 0; step < 60; step += 1) {
      const id = generatedId(category, difficulty, start + step * 37);
      if (picker.used.has(id) || picker.answered.has(id) || isRecent(picker, id)) continue;
      return activityById(id) ?? null;
    }
  }
  // Keep the level when its oldest question was shown long enough ago; otherwise a fresh
  // question at another level beats a recent repeat.
  const oldestAtLevel = ranked(atLevel, picker, salt)[0];
  const freshAnyLevel = pool.filter(isFresh);
  const chosen =
    oldestAtLevel && !isRecent(picker, oldestAtLevel.id)
      ? oldestAtLevel
      : freshAnyLevel.length > 0
        ? ranked(freshAnyLevel, picker, salt)[0]
        : ranked(pool, picker, salt)[0];
  if (!chosen) return null;
  return picker.answered.has(chosen.id) ? (activityById(`${chosen.id}_d${picker.day}`) ?? null) : chosen;
}

/** A new set of five for this person and day, chosen from what they have not seen lately. */
export function buildDailyRound(date: string, progress: BrainProgress): DailyRound {
  const picker: Picker = {
    date,
    day: dayNumber(date),
    progress,
    used: new Set<string>(),
    answered: new Set([...progress.attempted, ...progress.awarded]),
    daily: true,
  };
  const levels = dailyLevels(date);
  const items: Activity[] = [];
  dailyCategories(date).forEach((category, index) => {
    const item = pickActivity(category, levels[index] as Difficulty, picker);
    if (!item) return;
    picker.used.add(baseActivityId(item.id));
    items.push(item);
  });
  return { date, items };
}

/**
 * The five for a day: the saved set when there is one, so a refresh or another device
 * never changes it; the old fixed set when that day was started before this rotation;
 * otherwise a new set.
 */
export function dailyRoundFor(progress: BrainProgress, date: string): DailyRound {
  if (progress.round?.date === date) {
    const items = progress.round.ids.map((id) => activityById(id)).filter((item): item is Activity => Boolean(item));
    if (items.length === progress.round.ids.length && items.length > 0) return { date, items };
  }
  if (progress.lastDaily?.date === date && progress.lastDaily.picks.length > 0 && !progress.round) return dailyRound(date);
  return buildDailyRound(date, progress);
}

/** Save today's set once and mark it as shown. Returns the same object when nothing changed. */
export function ensureDailyRound(progress: BrainProgress, date: string): BrainProgress {
  if (!isRealISODate(date) || progress.round?.date === date) return progress;
  const round = dailyRoundFor(progress, date);
  const ids = round.items.map((item) => item.id);
  return { ...markSeen(progress, ids, dayNumber(date)), round: { date, ids } };
}

/**
 * Activities for a category page, freshest first: never answered and not shown lately,
 * then built puzzles (Logic, Numbers) or today's new layouts (Memory, Attention).
 */
export function freshFor(progress: BrainProgress, category: CategoryId, difficulty: Difficulty, date: string, count = 6): Activity[] {
  const picker: Picker = {
    date,
    day: dayNumber(date),
    progress,
    used: new Set(progress.round?.date === date ? progress.round.ids.map(baseActivityId) : []),
    answered: new Set([...progress.attempted, ...progress.awarded]),
    daily: false,
  };
  const out: Activity[] = [];
  for (let guard = 0; guard < count * 3 && out.length < count; guard += 1) {
    const item = pickActivity(category, difficulty, picker);
    if (!item) break;
    const base = baseActivityId(item.id);
    if (picker.used.has(base)) break;
    picker.used.add(base);
    out.push(item);
  }
  return out;
}
