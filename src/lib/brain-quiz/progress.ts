import { addIsoDays, isRealISODate } from "@/lib/dates";
import { msg } from "@/lib/i18n/translate";

export const CATEGORY_IDS = ["logic", "riddles", "memory", "attention", "numbers", "words", "habits"] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];
export type Difficulty = "easy" | "medium" | "hard";

export const POINT_VALUES = { easy: 10, medium: 20, hard: 30, dailyBonus: 25 } as const;

export const QUIZ_TITLE = msg("LIFEZOI BRAIN & HABIT QUIZ");
export const QUIZ_TAGLINE = msg("Challenge Your Mind. Discover Your Habits. Keep Learning.");
export const QUIZ_NOTICE = msg(
  "LifeZoi Brain & Habit Quiz is designed for educational entertainment and everyday learning. Game scores do not measure intelligence, diagnose cognitive conditions, or replace professional medical assessment.",
);
export const JOURNEY_NOTE = msg("Game scores are not a measure of cognitive health.");
export const LOCAL_NOTE = msg("Marks stay in this browser.");
export const BRAIN_STORAGE_KEY = "lifezoi.brain-quiz.v1";

export function pointsFor(difficulty: Difficulty): number {
  return POINT_VALUES[difficulty];
}

export type CategoryStats = { played: number; correct: number; points: number };
export type DifficultyStats = { played: number; correct: number };
export type DayMark = { date: string; points: number; plays: number };
export type DailyScore = { date: string; score: number; correct: number };
export type DailyPick = { id: string; correct: boolean; note: string; gained: number; picked: number[] };

export type BrainProgress = {
  awarded: string[];
  attempted: string[];
  touches: string[];
  points: number;
  correct: number;
  games: number;
  streak: number;
  bestStreak: number;
  lastActive: string;
  bestDay: number;
  bestDaily: number;
  days: DayMark[];
  dailyDone: string[];
  dailyPerfect: string[];
  dailyScores: DailyScore[];
  lastDaily: { date: string; picks: DailyPick[] } | null;
  byCategory: Record<CategoryId, CategoryStats>;
  byDifficulty: Record<Difficulty, DifficultyStats>;
};

const AWARDED_LIMIT = 240;
const TOUCH_LIMIT = 160;
const DAY_LIMIT = 42;
const DAILY_LIMIT = 30;

function emptyCategory(): CategoryStats {
  return { played: 0, correct: 0, points: 0 };
}

export function emptyBrainProgress(): BrainProgress {
  return {
    awarded: [],
    attempted: [],
    touches: [],
    points: 0,
    correct: 0,
    games: 0,
    streak: 0,
    bestStreak: 0,
    lastActive: "",
    bestDay: 0,
    bestDaily: 0,
    days: [],
    dailyDone: [],
    dailyPerfect: [],
    dailyScores: [],
    lastDaily: null,
    byCategory: {
      logic: emptyCategory(),
      riddles: emptyCategory(),
      memory: emptyCategory(),
      attention: emptyCategory(),
      numbers: emptyCategory(),
      words: emptyCategory(),
      habits: emptyCategory(),
    },
    byDifficulty: {
      easy: { played: 0, correct: 0 },
      medium: { played: 0, correct: 0 },
      hard: { played: 0, correct: 0 },
    },
  };
}

export function isEmptyBrain(progress: BrainProgress | undefined): boolean {
  if (!progress) return true;
  return (
    progress.points === 0 &&
    progress.games === 0 &&
    progress.awarded.length === 0 &&
    progress.attempted.length === 0 &&
    progress.dailyDone.length === 0
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function cleanIdList(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!/^[A-Za-z0-9:_-]{2,48}$/.test(trimmed)) continue;
    if (out.includes(trimmed)) continue;
    out.push(trimmed);
    if (out.length >= limit) break;
  }
  return out;
}

function cleanCount(value: unknown, max = 100000): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > max) return 0;
  return value;
}

function cleanDate(value: unknown): string {
  return typeof value === "string" && isRealISODate(value) ? value : "";
}

function cleanNote(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 140);
}

export function sanitizeBrain(input: unknown): BrainProgress {
  const row = asRecord(input);
  const base = emptyBrainProgress();
  if (!row) return base;
  const byCategory = { ...base.byCategory };
  const catRow = asRecord(row.byCategory);
  for (const id of CATEGORY_IDS) {
    const stats = asRecord(catRow?.[id]);
    const played = cleanCount(stats?.played, 10000);
    byCategory[id] = {
      played,
      correct: Math.min(played, cleanCount(stats?.correct, 10000)),
      points: cleanCount(stats?.points),
    };
  }
  const byDifficulty = { ...base.byDifficulty };
  const diffRow = asRecord(row.byDifficulty);
  for (const id of ["easy", "medium", "hard"] as const) {
    const stats = asRecord(diffRow?.[id]);
    const played = cleanCount(stats?.played, 10000);
    byDifficulty[id] = { played, correct: Math.min(played, cleanCount(stats?.correct, 10000)) };
  }
  const days = Array.isArray(row.days)
    ? row.days
        .map((item): DayMark | null => {
          const day = asRecord(item);
          const date = cleanDate(day?.date);
          if (!day || !date) return null;
          return { date, points: cleanCount(day.points), plays: cleanCount(day.plays, 200) };
        })
        .filter((item): item is DayMark => item !== null)
        .filter((item, index, all) => all.findIndex((other) => other.date === item.date) === index)
        .slice(0, DAY_LIMIT)
    : [];
  const dailyScores = Array.isArray(row.dailyScores)
    ? row.dailyScores
        .map((item): DailyScore | null => {
          const day = asRecord(item);
          const date = cleanDate(day?.date);
          if (!day || !date) return null;
          return { date, score: cleanCount(day.score), correct: cleanCount(day.correct, 5) };
        })
        .filter((item): item is DailyScore => item !== null)
        .filter((item, index, all) => all.findIndex((other) => other.date === item.date) === index)
        .slice(0, DAILY_LIMIT)
    : [];
  let lastDaily: BrainProgress["lastDaily"] = null;
  const last = asRecord(row.lastDaily);
  const lastDate = cleanDate(last?.date);
  if (last && lastDate) {
    const picks = Array.isArray(last.picks)
      ? last.picks
          .map((item): DailyPick | null => {
            const pick = asRecord(item);
            if (!pick || typeof pick.id !== "string" || !/^[A-Za-z0-9:_-]{2,40}$/.test(pick.id)) return null;
            if (typeof pick.correct !== "boolean") return null;
            const picked = Array.isArray(pick.picked)
              ? pick.picked.filter((n): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0 && n < 8).slice(0, 4)
              : [];
            return { id: pick.id, correct: pick.correct, note: cleanNote(pick.note), gained: cleanCount(pick.gained, 30), picked };
          })
          .filter((item): item is DailyPick => item !== null)
          .slice(0, 5)
      : [];
    lastDaily = { date: lastDate, picks };
  }
  return {
    awarded: cleanIdList(row.awarded, AWARDED_LIMIT),
    attempted: cleanIdList(row.attempted, AWARDED_LIMIT),
    touches: cleanIdList(row.touches, TOUCH_LIMIT),
    points: cleanCount(row.points),
    correct: cleanCount(row.correct, 10000),
    games: cleanCount(row.games, 10000),
    streak: cleanCount(row.streak, 3650),
    bestStreak: cleanCount(row.bestStreak, 3650),
    lastActive: cleanDate(row.lastActive),
    bestDay: cleanCount(row.bestDay),
    bestDaily: cleanCount(row.bestDaily),
    days,
    dailyDone: cleanIdList(row.dailyDone, DAILY_LIMIT).filter((item) => isRealISODate(item)),
    dailyPerfect: cleanIdList(row.dailyPerfect, DAILY_LIMIT).filter((item) => isRealISODate(item)),
    dailyScores,
    lastDaily,
    byCategory,
    byDifficulty,
  };
}

export type OutcomeInput = {
  today: string;
  activityId: string;
  category: CategoryId;
  difficulty: Difficulty;
  correct: boolean;
  lock: boolean;
};

export type OutcomeResult = { progress: BrainProgress; gained: number; already: boolean };

function bumpStreak(progress: BrainProgress, today: string) {
  if (progress.lastActive === today) {
    const streak = Math.max(progress.streak, 1);
    return { streak, bestStreak: Math.max(progress.bestStreak, streak), lastActive: today };
  }
  const streak = progress.lastActive === addIsoDays(today, -1) ? progress.streak + 1 : 1;
  return { streak, bestStreak: Math.max(progress.bestStreak, streak), lastActive: today };
}

function bumpDay(days: DayMark[], today: string, points: number, play: boolean): DayMark[] {
  const existing = days.find((day) => day.date === today);
  const next: DayMark = existing
    ? { date: today, points: existing.points + points, plays: existing.plays + (play ? 1 : 0) }
    : { date: today, points, plays: play ? 1 : 0 };
  return [next, ...days.filter((day) => day.date !== today)].sort((a, b) => b.date.localeCompare(a.date)).slice(0, DAY_LIMIT);
}

export function recordOutcome(progress: BrainProgress, input: OutcomeInput): OutcomeResult {
  if (!isRealISODate(input.today)) return { progress, gained: 0, already: false };
  const alreadyAwarded = progress.awarded.includes(input.activityId);
  const alreadyAttempted = progress.attempted.includes(input.activityId);
  if ((input.lock && alreadyAttempted) || (!input.lock && input.correct && alreadyAwarded)) {
    return { progress: { ...progress, ...bumpStreak(progress, input.today) }, gained: 0, already: true };
  }
  const touch = `${input.today}:${input.activityId}`;
  const firstTouch = !progress.touches.includes(touch);
  const streak = bumpStreak(progress, input.today);
  const byCategory = { ...progress.byCategory, [input.category]: { ...progress.byCategory[input.category] } };
  const byDifficulty = { ...progress.byDifficulty, [input.difficulty]: { ...progress.byDifficulty[input.difficulty] } };
  let gained = 0;
  let awarded = progress.awarded;
  let correct = progress.correct;
  if (firstTouch) {
    byCategory[input.category].played += 1;
    byDifficulty[input.difficulty].played += 1;
  }
  if (input.correct && !alreadyAwarded) {
    gained = pointsFor(input.difficulty);
    correct += 1;
    awarded = [input.activityId, ...awarded].slice(0, AWARDED_LIMIT);
    byCategory[input.category].correct += 1;
    byCategory[input.category].points += gained;
    byDifficulty[input.difficulty].correct += 1;
  }
  const attempted = input.lock && !alreadyAttempted ? [input.activityId, ...progress.attempted].slice(0, AWARDED_LIMIT) : progress.attempted;
  const days = bumpDay(progress.days, input.today, gained, firstTouch);
  const todayPoints = days.find((day) => day.date === input.today)?.points ?? 0;
  return {
    gained,
    already: false,
    progress: {
      ...progress,
      ...streak,
      awarded,
      attempted,
      touches: firstTouch ? [touch, ...progress.touches].slice(0, TOUCH_LIMIT) : progress.touches,
      points: progress.points + gained,
      correct,
      games: progress.games + (firstTouch ? 1 : 0),
      bestDay: Math.max(progress.bestDay, todayPoints),
      days,
      byCategory,
      byDifficulty,
    },
  };
}

export function saveDailyPick(progress: BrainProgress, today: string, pick: DailyPick): BrainProgress {
  const prior = progress.lastDaily?.date === today ? progress.lastDaily.picks.filter((item) => item.id !== pick.id) : [];
  return { ...progress, lastDaily: { date: today, picks: [...prior, pick].slice(0, 5) } };
}

export function completeDaily(
  progress: BrainProgress,
  today: string,
  expected: number,
): OutcomeResult {
  const key = `bonus:${today}`;
  const picks = progress.lastDaily?.date === today ? progress.lastDaily.picks : [];
  if (progress.awarded.includes(key) || progress.dailyDone.includes(today)) {
    return { progress, gained: 0, already: true };
  }
  if (!isRealISODate(today) || picks.length < expected) return { progress, gained: 0, already: false };
  const gained = POINT_VALUES.dailyBonus;
  const itemPoints = picks.reduce((sum, pick) => sum + pick.gained, 0);
  const score = itemPoints + gained;
  const correctCount = picks.filter((pick) => pick.correct).length;
  const days = bumpDay(progress.days, today, gained, false);
  const perfect = correctCount === expected ? [today, ...progress.dailyPerfect].slice(0, DAILY_LIMIT) : progress.dailyPerfect;
  return {
    gained,
    already: false,
    progress: {
      ...progress,
      ...bumpStreak(progress, today),
      awarded: [key, ...progress.awarded].slice(0, AWARDED_LIMIT),
      points: progress.points + gained,
      bestDay: Math.max(progress.bestDay, days.find((day) => day.date === today)?.points ?? 0),
      bestDaily: Math.max(progress.bestDaily, score),
      days,
      dailyDone: [today, ...progress.dailyDone].slice(0, DAILY_LIMIT),
      dailyPerfect: perfect,
      dailyScores: [{ date: today, score, correct: correctCount }, ...progress.dailyScores.filter((item) => item.date !== today)].slice(0, DAILY_LIMIT),
    },
  };
}

export type Badge = { id: string; title: string; detail: string };

export function badgesFor(progress: BrainProgress): Badge[] {
  const badges: Badge[] = [];
  if (progress.games >= 1) badges.push({ id: "first-game", title: msg("First game"), detail: msg("You finished a first question or game.") });
  if (progress.points >= 100) badges.push({ id: "points-100", title: msg("100 points"), detail: msg("Your saved total reached 100 game points.") });
  if (progress.points >= 300) badges.push({ id: "points-300", title: msg("300 points"), detail: msg("Your saved total reached 300 game points.") });
  if (progress.bestStreak >= 3) badges.push({ id: "streak-3", title: msg("3-day streak"), detail: msg("You came back on three days in a row.") });
  if (progress.bestStreak >= 7) badges.push({ id: "streak-7", title: msg("7-day streak"), detail: msg("You came back on seven days in a row.") });
  if (progress.dailyDone.length >= 1) badges.push({ id: "daily", title: msg("Daily challenge"), detail: msg("You finished a five-part daily challenge.") });
  if (progress.dailyPerfect.length >= 1) badges.push({ id: "perfect-daily", title: msg("Perfect daily"), detail: msg("Every part of a daily challenge was correct.") });
  if (CATEGORY_IDS.every((id) => progress.byCategory[id].played > 0)) {
    badges.push({ id: "explorer", title: msg("Every category"), detail: msg("You tried all seven categories.") });
  }
  if (progress.byCategory.habits.correct >= 10) {
    badges.push({ id: "habit-10", title: msg("Habit learner"), detail: msg("Ten habit questions were answered correctly.") });
  }
  return badges;
}

export function favoriteCategory(progress: BrainProgress): CategoryId | null {
  let best: CategoryId | null = null;
  for (const id of CATEGORY_IDS) {
    const played = progress.byCategory[id].played;
    if (played === 0) continue;
    if (!best || played > progress.byCategory[best].played) best = id;
  }
  return best;
}

export function weekActivity(progress: BrainProgress, today: string): DayMark[] {
  const marks: DayMark[] = [];
  for (let back = 6; back >= 0; back -= 1) {
    const date = addIsoDays(today, -back);
    const found = progress.days.find((day) => day.date === date);
    marks.push({ date, plays: found?.plays ?? 0, points: found?.points ?? 0 });
  }
  return marks;
}

export function encouragement(correct: number, total: number): string {
  if (total > 0 && correct === total) {
    return msg("You finished every part. This score is about the game, not intelligence or health.");
  }
  if (correct * 2 >= total) return msg("Nice work. The notes are there if you want to look again.");
  return msg("Thanks for playing. Use the notes to learn, and remember the score is only a game score.");
}

export function readBrainLocal(storage: Pick<Storage, "getItem"> | null, key = BRAIN_STORAGE_KEY): BrainProgress | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    return sanitizeBrain(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function writeBrainLocal(storage: Pick<Storage, "setItem"> | null, progress: BrainProgress, key = BRAIN_STORAGE_KEY) {
  if (!storage) return;
  storage.setItem(key, JSON.stringify(sanitizeBrain(progress)));
}

export function clearBrainLocal(storage: Pick<Storage, "removeItem"> | null, key = BRAIN_STORAGE_KEY) {
  storage?.removeItem(key);
}
