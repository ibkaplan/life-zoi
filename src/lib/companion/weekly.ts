import { addIsoDays, daysBetween, mondayOf } from "@/lib/dates";
import type { CompanionState, DayLog, PlanSuggestion, WeeklyPlan, WeeklyReview } from "@/lib/companion/state";
import { msg } from "@/lib/i18n/translate";

/**
 * Weekly check-in, comparisons, and next-week suggestions.
 * Everything is user-reported. A short-term change is never presented as proof of better health.
 */

export const NOT_PROOF =
  "These numbers are what you recorded or reported. A change over a week or a month is encouraging, but it is not proof that your health has changed.";

export type Totals = {
  days: number;
  activeDays: number;
  walkingMinutes: number;
  exerciseMinutes: number;
  readingPages: number;
  listeningMinutes: number;
  brainGames: number;
  nutritionHabits: number;
  done: number;
  partial: number;
  skipped: number;
  mood: number | null;
  energy: number | null;
  sleepHours: number | null;
};

function average(values: (number | null)[]): number | null {
  const real = values.filter((value): value is number => typeof value === "number");
  if (real.length === 0) return null;
  return Math.round((real.reduce((sum, value) => sum + value, 0) / real.length) * 10) / 10;
}

export function totalsFor(logs: DayLog[]): Totals {
  const entries = logs.flatMap((log) => Object.values(log.entries));
  return {
    days: logs.length,
    activeDays: logs.filter((log) => Object.values(log.entries).some((entry) => entry.status !== "skipped")).length,
    walkingMinutes: logs.reduce((sum, log) => sum + log.walkingMinutes, 0),
    exerciseMinutes: logs.reduce((sum, log) => sum + log.exerciseMinutes, 0),
    readingPages: logs.reduce((sum, log) => sum + log.readingPages, 0),
    listeningMinutes: logs.reduce((sum, log) => sum + log.listeningMinutes, 0),
    brainGames: logs.reduce((sum, log) => sum + log.brainGames, 0),
    nutritionHabits: logs.reduce((sum, log) => sum + log.nutritionHabits, 0),
    done: entries.filter((entry) => entry.status === "done").length,
    partial: entries.filter((entry) => entry.status === "partial").length,
    skipped: entries.filter((entry) => entry.status === "skipped").length,
    mood: average(logs.map((log) => log.mood)),
    energy: average(logs.map((log) => log.energy)),
    sleepHours: average(logs.map((log) => log.sleepHours)),
  };
}

export function logsBetween(state: CompanionState, start: string, days: number): DayLog[] {
  const logs: DayLog[] = [];
  for (let i = 0; i < days; i += 1) {
    const log = state.days[addIsoDays(start, i)];
    if (log) logs.push(log);
  }
  return logs;
}

export function weekTotals(state: CompanionState, weekStart: string): Totals {
  return totalsFor(logsBetween(state, mondayOf(weekStart), 7));
}

export function monthTotals(state: CompanionState, month: string): Totals {
  return totalsFor(Object.values(state.days).filter((log) => log.date.startsWith(month)));
}

export const COMPARE_ROWS: { key: keyof Totals; label: string; unit: string }[] = [
  { key: "activeDays", label: "Days with an activity", unit: "days" },
  { key: "walkingMinutes", label: "Walking", unit: "min" },
  { key: "exerciseMinutes", label: "Exercise", unit: "min" },
  { key: "readingPages", label: "Pages read", unit: "pages" },
  { key: "listeningMinutes", label: "Listening", unit: "min" },
  { key: "brainGames", label: "Brain games", unit: "games" },
  { key: "nutritionHabits", label: "Meals and food habits", unit: "times" },
  { key: "mood", label: "Average mood (1 to 5)", unit: "" },
  { key: "energy", label: "Average energy (1 to 5)", unit: "" },
  { key: "sleepHours", label: "Average sleep", unit: "h" },
];

export type Comparison = { label: string; unit: string; before: number | null; after: number | null; change: "more" | "less" | "same" | "unknown" };

export function compare(current: Totals, previous: Totals): Comparison[] {
  return COMPARE_ROWS.map(({ key, label, unit }) => {
    const after = current[key];
    const before = previous[key];
    const change = after === null || before === null ? "unknown" : after > before ? "more" : after < before ? "less" : "same";
    return { label, unit, before, after, change };
  });
}

/** Activities skipped at least twice in the week: worth replacing, never a reason for blame. */
export function oftenSkipped(logs: DayLog[]): string[] {
  const counts = new Map<string, number>();
  for (const log of logs) {
    for (const [id, entry] of Object.entries(log.entries)) if (entry.status === "skipped") counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count >= 2).map(([id]) => id);
}

export function checkInDue(state: CompanionState, today: string): boolean {
  const last = state.reviews[0];
  if (!last) return Object.keys(state.days).length > 0;
  const gap = daysBetween(last.savedAt.slice(0, 10), today);
  return gap === null || gap >= 7;
}

/** Progress worth naming, in plain words. */
export function progressNotes(current: Totals, previous: Totals): string[] {
  const notes: string[] = [];
  for (const row of compare(current, previous)) {
    if (row.change !== "more" || row.label.startsWith("Average")) continue;
    notes.push(`More ${row.label.toLowerCase()} than the week before.`);
  }
  if (current.done + current.partial > 0 && notes.length === 0) notes.push(msg("You kept going this week. Every completed or partly completed activity counts."));
  return notes;
}

function suggestion(id: string, area: string, text: string, reason: string): PlanSuggestion {
  return { id, area, text, reason, status: "proposed", edited: "" };
}

/** Next 7-day suggestions. The person accepts, changes, or rejects each one. */
export function nextWeekSuggestions(review: WeeklyReview, current: Totals, skipped: string[]): PlanSuggestion[] {
  const list: PlanSuggestion[] = [];
  const exerciseDays = review.exerciseDays ?? current.activeDays;
  if (exerciseDays <= 2) {
    list.push(suggestion("move-small", msg("Movement & Fitness"), msg("Two 10-minute sessions this week, on days that suit you."), msg("Small sessions are easier to fit in.")));
  } else {
    list.push(suggestion("move-keep", msg("Movement & Fitness"), `Keep about ${Math.min(exerciseDays, 5)} active days, and try one new activity.`, msg("You were active on several days.")));
  }
  if (skipped.length > 0) {
    list.push(suggestion("replace-skipped", msg("My Day"), msg("Swap the activities you skipped most for something you enjoy more."), msg("Skipping tells LifeZoi what to change. It is not a failure.")));
  }
  if (review.disliked.length > 0) {
    list.push(suggestion("drop-disliked", msg("Movement & Fitness"), `Leave out ${review.disliked.join(", ")} next week.`, msg("You said you did not enjoy them.")));
  }
  if ((review.energy ?? 3) <= 2 || (current.sleepHours !== null && current.sleepHours < 7)) {
    list.push(suggestion("sleep", msg("Sleep & Recovery"), msg("A wind-down routine on four evenings."), msg("You reported low energy or short sleep.")));
  }
  if ((review.pagesRead ?? current.readingPages) < 5) {
    list.push(suggestion("read", msg("Books & Audiobooks"), msg("Read or listen for 10 minutes on three days."), msg("A few pages is enough to start.")));
  }
  if ((review.brainGames ?? current.brainGames) < 2) {
    list.push(suggestion("brain", msg("Brain & Memory"), msg("Play one brain game on two days."), msg("Just for enjoyment.")));
  }
  if (review.nutrition === "rarely" || review.nutrition === "not-tried") {
    list.push(suggestion("food", msg("Healthy Eating"), msg("Try one new meal idea from Today's meals on two days."), msg("One small change at a time.")));
  }
  if ((review.feeling ?? 3) <= 2) {
    list.push(suggestion("emotional", msg("Emotional Wellness"), msg("Reach out to one person, and take a calm moment on three days."), msg("You said this week felt hard.")));
  }
  if (review.improveNext.trim()) {
    list.push(suggestion("own-words", msg("Personal Goals"), review.improveNext.trim(), msg("In your own words.")));
  }
  if (review.difficult.trim()) {
    list.push(suggestion("make-easier", msg("Personal Goals"), `Make this easier: ${review.difficult.trim()}`, msg("Shorter or simpler is fine.")));
  }
  return list.slice(0, 8);
}

export function planFor(review: WeeklyReview, current: Totals, skipped: string[], today: string): WeeklyPlan {
  return {
    weekStart: addIsoDays(mondayOf(review.weekStart), 7),
    createdOn: today,
    basedOn: review.id,
    suggestions: nextWeekSuggestions(review, current, skipped),
  };
}

/** The last `count` weeks, oldest first, for the weekly chart. */
export function recentWeeks(state: CompanionState, today: string, count = 8): { weekStart: string; totals: Totals }[] {
  const thisWeek = mondayOf(today);
  return [...Array(count).keys()].reverse().map((back) => {
    const weekStart = addIsoDays(thisWeek, -7 * back);
    return { weekStart, totals: weekTotals(state, weekStart) };
  });
}
