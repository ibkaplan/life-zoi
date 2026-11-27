import type { CalorieLog } from "@/lib/calories/types";
import type { CompanionState } from "@/lib/companion/state";
import { addIsoDays, isRealISODate, localISODate, mondayOf } from "@/lib/dates";
import type { AcademyState } from "@/lib/growth-academy/progress";
import type { HealthReading } from "@/lib/health-diary/types";
import { msg } from "@/lib/i18n/translate";

/**
 * Site-wide activity: which local days the person did something in each area
 * of LifeZoi. It only reads records the person already saved (the companion
 * state, the Training Academy, the calorie counter, and the health diary).
 * Nothing is stored here, measured, scored, or sent anywhere.
 */

export const AREA_IDS = ["diary", "movement", "breathing", "quiz", "meals", "learning", "checkin"] as const;
export type AreaId = (typeof AREA_IDS)[number];

export type AreaInfo = { id: AreaId; icon: string; title: string; text: string; href: string; cta: string };

export const AREAS: readonly AreaInfo[] = [
  { id: "diary", icon: "📓", title: msg("Health diary"), text: msg("Days with a blood pressure, sugar, or cholesterol reading in your diary."), href: "/my-health/diary", cta: msg("Open the health diary") },
  { id: "movement", icon: "🚶", title: msg("Movement"), text: msg("Days with a walk, exercise minutes, a movement break, or a guided movement session."), href: "/academy/move", cta: msg("Find a movement") },
  { id: "breathing", icon: "🌬️", title: msg("Breathing and calm"), text: msg("Days with a Breathe for Life session or a guided breathing, relaxation, or meditation session."), href: "/breathe", cta: msg("Breathe for a minute") },
  { id: "quiz", icon: "🧩", title: msg("Quizzes and brain training"), text: msg("Days with the Brain & Habit Quiz, a brain game, or a focus session."), href: "/brain-quiz", cta: msg("Try today's quiz") },
  { id: "meals", icon: "🥗", title: msg("Meals"), text: msg("Days with food noted in the calorie counter."), href: "/academy/meals#calorie-counter", cta: msg("Note a meal") },
  { id: "learning", icon: "📚", title: msg("Learning"), text: msg("Days with a Training Academy lesson or challenge, or a mini-course day."), href: "/training-academy", cta: msg("Continue learning") },
  { id: "checkin", icon: "🌤️", title: msg("Check-ins"), text: msg("Days you noted how you feel, or saved a weekly check-in."), href: "/daily", cta: msg("Check in today") },
];

export type ActivitySources = {
  companion: CompanionState;
  academy: AcademyState;
  calories: CalorieLog;
  /** Readings from the account. Empty when the diary is not available. */
  readings: readonly HealthReading[];
};

/** Area → sorted list of distinct local dates with activity in that area. */
export type ActivityDays = Record<AreaId, string[]>;

const MOVEMENT_GUIDED = new Set(["pilates", "yoga", "stretching", "mobility"]);
const CALM_GUIDED = new Set(["breathing", "relaxation", "meditation"]);

function sorted(set: Set<string>, today: string): string[] {
  // A date after today (a clock that was ahead) is left out rather than shown as a future day.
  return [...set].filter((date) => isRealISODate(date) && date <= today).sort();
}

/** The local calendar day of a stored timestamp, or "" when it cannot be read. */
export function localDayOf(timestamp: string): string {
  const time = Date.parse(timestamp);
  return Number.isFinite(time) ? localISODate(new Date(time)) : "";
}

export function activityDays(sources: ActivitySources, today: string): ActivityDays {
  const { companion, academy, calories, readings } = sources;
  const sets: Record<AreaId, Set<string>> = {
    diary: new Set(),
    movement: new Set(),
    breathing: new Set(),
    quiz: new Set(),
    meals: new Set(),
    learning: new Set(),
    checkin: new Set(),
  };

  for (const reading of readings) sets.diary.add(localDayOf(reading.measuredAt));

  for (const day of Object.values(companion.days)) {
    const moved =
      day.walkingMinutes > 0 ||
      day.exerciseMinutes > 0 ||
      (day.movementBreaks ?? 0) > 0 ||
      Object.entries(day.entries).some(([id, entry]) => id !== "mb-water" && id !== "mb-breathe" && (entry.status === "done" || entry.status === "partial"));
    if (moved) sets.movement.add(day.date);
    const breathTicked = day.entries["mb-breathe"]?.status;
    if (breathTicked === "done" || breathTicked === "partial") sets.breathing.add(day.date);
    if (day.brainGames > 0) sets.quiz.add(day.date);
  }
  for (const session of companion.guided.sessions) {
    if (MOVEMENT_GUIDED.has(session.kind)) sets.movement.add(session.date);
    if (CALM_GUIDED.has(session.kind)) sets.breathing.add(session.date);
  }
  for (const session of companion.breathe.sessions) if (session.seconds > 0 || session.complete) sets.breathing.add(session.date);

  for (const mark of companion.brainQuiz.days) if (mark.plays > 0 || mark.right + mark.wrong > 0) sets.quiz.add(mark.date);
  for (const date of companion.brainQuiz.dailyDone) sets.quiz.add(date);
  for (const game of companion.games) sets.quiz.add(game.date);
  for (const day of companion.focus.days) if (day.sessions > 0) sets.quiz.add(day.date);

  for (const [date, items] of Object.entries(calories.days)) if (items.length > 0) sets.meals.add(date);

  for (const date of academy.days) sets.learning.add(date);
  for (const date of Object.keys(academy.challenges)) sets.learning.add(date);
  for (const course of Object.values(companion.courses.progress)) for (const done of course?.done ?? []) sets.learning.add(done.date);

  for (const date of Object.keys(companion.daily.feelings)) sets.checkin.add(date);
  for (const review of companion.reviews) sets.checkin.add(localDayOf(review.savedAt) || review.weekStart);

  const result = {} as ActivityDays;
  for (const id of AREA_IDS) result[id] = sorted(sets[id], today);
  return result;
}

/** Every day with activity in any area, sorted. */
export function anyActiveDays(days: ActivityDays): string[] {
  return [...new Set(AREA_IDS.flatMap((id) => days[id]))].sort();
}

// ---------- runs of days ----------

/**
 * Days in a row up to today. When today has nothing yet, the run up to
 * yesterday still counts: the day is not over, so nothing is ever shown as lost.
 */
export function currentRun(dates: readonly string[], today: string): number {
  const set = new Set(dates);
  let cursor = set.has(today) ? today : addIsoDays(today, -1);
  let count = 0;
  while (cursor && set.has(cursor)) {
    count += 1;
    cursor = addIsoDays(cursor, -1);
  }
  return count;
}

/** The longest run of consecutive days, and the day it first reached each length. */
export function runHistory(dates: readonly string[]): { longest: number; reachedOn: Map<number, string> } {
  const list = [...new Set(dates)].sort();
  const reachedOn = new Map<number, string>();
  let run = 0;
  let longest = 0;
  let previous = "";
  for (const date of list) {
    run = previous && addIsoDays(previous, 1) === date ? run + 1 : 1;
    if (!reachedOn.has(run)) reachedOn.set(run, date);
    longest = Math.max(longest, run);
    previous = date;
  }
  return { longest, reachedOn };
}

/** How many of the seven days of today's week (Monday to Sunday) had activity. */
export function daysThisWeek(dates: readonly string[], today: string): number {
  const monday = mondayOf(today);
  return dates.filter((date) => date >= monday && date <= today).length;
}

/** The last `weeks` weeks, Monday first, ending with this week. Days after today are `null`. */
export function weekGrid(dates: readonly string[], today: string, weeks = 12): { monday: string; days: ({ date: string; active: boolean } | null)[] }[] {
  const set = new Set(dates);
  const thisMonday = mondayOf(today);
  const rows = [];
  for (let w = weeks - 1; w >= 0; w -= 1) {
    const monday = addIsoDays(thisMonday, -7 * w);
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = addIsoDays(monday, i);
      return date > today ? null : { date, active: set.has(date) };
    });
    rows.push({ monday, days });
  }
  return rows;
}
