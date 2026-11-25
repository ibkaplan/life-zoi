import { addIsoDays, isRealISODate, mondayOf } from "@/lib/dates";
import { msg } from "@/lib/i18n/translate";

export const CATEGORY_IDS = ["logic", "riddles", "memory", "attention", "numbers", "words", "habits"] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];
export type Difficulty = "easy" | "medium" | "hard";

export const POINT_VALUES = { easy: 10, medium: 20, hard: 30, dailyBonus: 25 } as const;

export const QUIZ_TITLE = msg("LifeZoi Brain & Habit Quiz");
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
/** One calendar day (the person's own local date). `right` and `wrong` count answers given that day. */
export type DayMark = { date: string; points: number; plays: number; right: number; wrong: number };
export type DailyScore = { date: string; score: number; correct: number };
export type DailyPick = { id: string; correct: boolean; note: string; gained: number; picked: number[] };
/** The five activities chosen for one local calendar day. Saved once, so a refresh or another device shows the same five. */
export type DailyRoundMark = { date: string; ids: string[] };

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
  /** Today's chosen five, kept so the set never changes during the day. */
  round: DailyRoundMark | null;
  /** Activity id (without a daily suffix) to the day number it was last shown. Drives rotation. */
  seen: Record<string, number>;
  /** Every answer given, right or wrong. `correct` above counts only answers that scored. */
  right: number;
  wrong: number;
  byCategory: Record<CategoryId, CategoryStats>;
  byDifficulty: Record<Difficulty, DifficultyStats>;
};

/**
 * Limits keep the saved record small enough for the account row while leaving room
 * for a large question bank and more than a year of history.
 */
export const BRAIN_LIMITS = { awarded: 3000, touches: 400, days: 400, daily: 400, seen: 1500 } as const;
const AWARDED_LIMIT = BRAIN_LIMITS.awarded;
const TOUCH_LIMIT = BRAIN_LIMITS.touches;
const DAY_LIMIT = BRAIN_LIMITS.days;
const DAILY_LIMIT = BRAIN_LIMITS.daily;
const SEEN_LIMIT = BRAIN_LIMITS.seen;

/** Daily copies of an activity carry a suffix such as `_d327` (the day number). */
const DAILY_SUFFIX = /_d\d{1,5}$/;

export function baseActivityId(id: string): string {
  return id.replace(DAILY_SUFFIX, "");
}

export function isDailyCopy(id: string): boolean {
  return DAILY_SUFFIX.test(id);
}

/**
 * Newest first, without repeats, at most `limit`. When the list is full, dated daily
 * copies are dropped before plain ids, because a dated copy can never be shown again
 * while a plain id could be scored twice if it were forgotten.
 */
function capIds(ids: string[], limit: number): string[] {
  if (ids.length <= limit) return ids;
  const extra = ids.length - limit;
  let dropped = 0;
  const out: string[] = [];
  for (let index = ids.length - 1; index >= 0; index -= 1) {
    const id = ids[index] as string;
    if (dropped < extra && isDailyCopy(id)) {
      dropped += 1;
      continue;
    }
    out.push(id);
  }
  out.reverse();
  return out.slice(0, limit);
}

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
    round: null,
    seen: {},
    right: 0,
    wrong: 0,
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

const ID_PATTERN = /^[A-Za-z0-9:_-]{2,48}$/;

function cleanIdList(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  const known = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!ID_PATTERN.test(trimmed)) continue;
    if (known.has(trimmed)) continue;
    known.add(trimmed);
    out.push(trimmed);
  }
  return capIds(out, limit);
}

function cleanSeen(value: unknown): Record<string, number> {
  const row = asRecord(value);
  if (!row) return {};
  const entries = Object.entries(row)
    .filter(([id, day]) => ID_PATTERN.test(id) && typeof day === "number" && Number.isInteger(day) && day >= -3650 && day <= 36500)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, SEEN_LIMIT);
  return Object.fromEntries(entries) as Record<string, number>;
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
          return {
            date,
            points: cleanCount(day.points),
            plays: cleanCount(day.plays, 500),
            right: cleanCount(day.right, 500),
            wrong: cleanCount(day.wrong, 500),
          };
        })
        .filter((item): item is DayMark => item !== null)
        .filter(uniqueDate())
        .sort((a, b) => b.date.localeCompare(a.date))
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
        .filter(uniqueDate())
        .sort((a, b) => b.date.localeCompare(a.date))
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
            if (!pick || typeof pick.id !== "string" || !ID_PATTERN.test(pick.id)) return null;
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
  let round: DailyRoundMark | null = null;
  const roundRow = asRecord(row.round);
  const roundDate = cleanDate(roundRow?.date);
  if (roundRow && roundDate) {
    const ids = cleanIdList(roundRow.ids, 5);
    if (ids.length > 0) round = { date: roundDate, ids };
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
    round,
    seen: cleanSeen(row.seen),
    // Records saved before answers were counted start from what they already show.
    right: row.right === undefined ? cleanCount(row.correct, 10000) : cleanCount(row.right),
    wrong: row.wrong === undefined ? Math.max(0, cleanCount(row.games, 10000) - cleanCount(row.correct, 10000)) : cleanCount(row.wrong),
    byCategory,
    byDifficulty,
  };
}

function uniqueDate() {
  const known = new Set<string>();
  return (item: { date: string }) => {
    if (known.has(item.date)) return false;
    known.add(item.date);
    return true;
  };
}

export type OutcomeInput = {
  today: string;
  activityId: string;
  category: CategoryId;
  difficulty: Difficulty;
  correct: boolean;
  lock: boolean;
  /**
   * For a daily copy of a written question (such as `L04_d327`), the original id. The
   * original is then marked as answered too, so the same question does not score again
   * in practice. Generated games (memory, attention) leave this out.
   */
  baseId?: string;
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

function bumpDay(days: DayMark[], today: string, points: number, play: boolean, answer: "right" | "wrong" | null = null): DayMark[] {
  const existing = days.find((day) => day.date === today) ?? { date: today, points: 0, plays: 0, right: 0, wrong: 0 };
  const next: DayMark = {
    date: today,
    points: existing.points + points,
    plays: existing.plays + (play ? 1 : 0),
    right: existing.right + (answer === "right" ? 1 : 0),
    wrong: existing.wrong + (answer === "wrong" ? 1 : 0),
  };
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
    awarded = [input.activityId, ...awarded];
    byCategory[input.category].correct += 1;
    byCategory[input.category].points += gained;
    byDifficulty[input.difficulty].correct += 1;
  }
  let attempted = input.lock && !alreadyAttempted ? [input.activityId, ...progress.attempted] : progress.attempted;
  const base = input.baseId && input.baseId !== input.activityId ? input.baseId : "";
  if (base && input.lock && !attempted.includes(base)) attempted = [base, ...attempted];
  if (base && input.correct && !awarded.includes(base)) awarded = [base, ...awarded];
  awarded = capIds(awarded, AWARDED_LIMIT);
  attempted = capIds(attempted, AWARDED_LIMIT);
  const days = bumpDay(progress.days, input.today, gained, firstTouch, input.correct ? "right" : "wrong");
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
      right: progress.right + (input.correct ? 1 : 0),
      wrong: progress.wrong + (input.correct ? 0 : 1),
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
      awarded: capIds([key, ...progress.awarded], AWARDED_LIMIT),
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
  if (progress.points >= 500) badges.push({ id: "points-500", title: msg("500 points"), detail: msg("Your saved total reached 500 game points.") });
  if (progress.points >= 1000) badges.push({ id: "points-1000", title: msg("1,000 points"), detail: msg("Your saved total reached 1,000 game points.") });
  if (progress.points >= 2500) badges.push({ id: "points-2500", title: msg("2,500 points"), detail: msg("Your saved total reached 2,500 game points.") });
  if (progress.bestStreak >= 14) badges.push({ id: "streak-14", title: msg("14-day streak"), detail: msg("You came back on fourteen days in a row.") });
  if (progress.bestStreak >= 30) badges.push({ id: "streak-30", title: msg("30-day streak"), detail: msg("You came back on thirty days in a row.") });
  if (progress.dailyDone.length >= 5) badges.push({ id: "daily-5", title: msg("Five daily challenges"), detail: msg("You finished five daily challenges.") });
  if (progress.dailyDone.length >= 10) badges.push({ id: "daily-10", title: msg("Ten daily challenges"), detail: msg("You finished ten daily challenges.") });
  if (progress.dailyDone.length >= 30) badges.push({ id: "daily-30", title: msg("Thirty daily challenges"), detail: msg("You finished thirty daily challenges.") });
  if (progress.dailyPerfect.length >= 3) badges.push({ id: "perfect-3", title: msg("Three perfect dailies"), detail: msg("Three daily challenges had every part correct.") });
  if (progress.right + progress.wrong >= 100) badges.push({ id: "answers-100", title: msg("100 answers"), detail: msg("You gave 100 answers across the games.") });
  if (progress.byDifficulty.hard.correct >= 10) badges.push({ id: "hard-10", title: msg("Hard level explorer"), detail: msg("Ten hard activities were finished correctly.") });
  if (bestWeekDays(progress) >= 5) badges.push({ id: "week-5", title: msg("Five-day week"), detail: msg("You played on five days of one week.") });
  return badges;
}

/** The most days played in any one Monday-to-Sunday week. */
export function bestWeekDays(progress: BrainProgress): number {
  const weeks = new Map<string, number>();
  for (const day of progress.days) {
    if (day.plays === 0 && day.points === 0) continue;
    const week = mondayOf(day.date);
    weeks.set(week, (weeks.get(week) ?? 0) + 1);
  }
  return Math.max(0, ...weeks.values());
}

export type Milestone = { id: string; label: string; value: number; target: number };

const MILESTONE_STEPS = {
  points: [100, 300, 500, 1000, 2500, 5000, 10000],
  daily: [1, 5, 10, 30, 100, 365],
  streak: [3, 7, 14, 30, 60, 100, 365],
  answers: [10, 50, 100, 250, 500, 1000, 2500],
} as const;

function nextStep(steps: readonly number[], value: number): number {
  return steps.find((step) => step > value) ?? (steps[steps.length - 1] as number);
}

/** The next goal in each area, for the progress bars on My Brain Journey. */
export function nextMilestones(progress: BrainProgress): Milestone[] {
  const answers = progress.right + progress.wrong;
  return [
    { id: "points", label: msg("Points: {value} of {target}"), value: progress.points, target: nextStep(MILESTONE_STEPS.points, progress.points) },
    { id: "daily", label: msg("Daily challenges: {value} of {target}"), value: progress.dailyDone.length, target: nextStep(MILESTONE_STEPS.daily, progress.dailyDone.length) },
    { id: "streak", label: msg("Best streak: {value} of {target} days"), value: progress.bestStreak, target: nextStep(MILESTONE_STEPS.streak, progress.bestStreak) },
    { id: "answers", label: msg("Answers: {value} of {target}"), value: answers, target: nextStep(MILESTONE_STEPS.answers, answers) },
  ];
}

/** The day still counts as a streak day when the last play was today or yesterday. */
export function liveStreak(progress: BrainProgress, today: string): number {
  if (!progress.lastActive) return 0;
  if (progress.lastActive === today || progress.lastActive === addIsoDays(today, -1)) return progress.streak;
  return 0;
}

export type WeekSummary = { start: string; points: number; activeDays: number; right: number; wrong: number; dailies: number };

/** Monday-to-Sunday weeks, oldest first, ending with the week that holds `today`. */
export function weeklyHistory(progress: BrainProgress, today: string, weeks = 12): WeekSummary[] {
  const current = mondayOf(today);
  if (!current) return [];
  const out: WeekSummary[] = [];
  for (let back = weeks - 1; back >= 0; back -= 1) {
    const start = addIsoDays(current, -7 * back);
    const end = addIsoDays(start, 6);
    const inWeek = (date: string) => date >= start && date <= end;
    const days = progress.days.filter((day) => inWeek(day.date));
    out.push({
      start,
      points: days.reduce((sum, day) => sum + day.points, 0),
      activeDays: days.filter((day) => day.plays > 0 || day.points > 0).length,
      right: days.reduce((sum, day) => sum + day.right, 0),
      wrong: days.reduce((sum, day) => sum + day.wrong, 0),
      dailies: progress.dailyDone.filter(inWeek).length,
    });
  }
  return out;
}

export type CalendarDay = { date: string; plays: number; points: number; daily: boolean };

/** The last `days` calendar days, oldest first, starting on a Monday so it lines up as weeks. */
export function activityCalendar(progress: BrainProgress, today: string, weeks = 12): CalendarDay[] {
  const start = addIsoDays(mondayOf(today), -7 * (weeks - 1));
  if (!start) return [];
  const byDate = new Map(progress.days.map((day) => [day.date, day]));
  const done = new Set(progress.dailyDone);
  const out: CalendarDay[] = [];
  for (let offset = 0; offset < weeks * 7; offset += 1) {
    const date = addIsoDays(start, offset);
    if (date > today) break;
    const day = byDate.get(date);
    out.push({ date, plays: day?.plays ?? 0, points: day?.points ?? 0, daily: done.has(date) });
  }
  return out;
}

/** Remember that these activities were shown on this day, so the next days pick others. */
export function markSeen(progress: BrainProgress, ids: readonly string[], day: number): BrainProgress {
  const seen = { ...progress.seen };
  for (const id of ids) seen[baseActivityId(id)] = day;
  return { ...progress, seen: cleanSeen(seen) };
}

export type Welcome = { title: string; detail: string; values?: Record<string, string | number> };

/** A short, friendly line for the top of the quiz. It never mentions a score as a measure. */
export function welcomeFor(progress: BrainProgress, today: string, dayIndex: number): Welcome {
  const picks = progress.lastDaily?.date === today ? progress.lastDaily.picks.length : 0;
  if (progress.dailyDone.includes(today)) {
    return { title: msg("Today’s challenge is done. Well played!"), detail: msg("Five new questions arrive tomorrow, at midnight your time.") };
  }
  if (picks > 0) {
    return { title: msg("Welcome back! You are part way through today’s challenge."), detail: msg("{count} of 5 parts done. Your answers are saved."), values: { count: picks } };
  }
  if (isEmptyBrain(progress)) {
    return { title: msg("Welcome! Your first brain challenge is ready."), detail: msg("Five short parts, about 5 to 10 minutes. There is no rush.") };
  }
  if (progress.lastActive === addIsoDays(today, -1) && progress.streak > 0) {
    return { title: msg("Welcome back! Your new brain challenge is ready."), detail: msg("Play today to make it {count} days in a row."), values: { count: progress.streak + 1 } };
  }
  const lines = [
    msg("Welcome back! Your new brain challenge is ready."),
    msg("Another day, another opportunity to challenge your mind!"),
    msg("Good to see you. Five fresh questions are waiting."),
  ];
  return { title: lines[((dayIndex % lines.length) + lines.length) % lines.length] as string, detail: msg("Five new parts today, chosen from questions you have not seen lately.") };
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
    marks.push({ date, plays: found?.plays ?? 0, points: found?.points ?? 0, right: found?.right ?? 0, wrong: found?.wrong ?? 0 });
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
