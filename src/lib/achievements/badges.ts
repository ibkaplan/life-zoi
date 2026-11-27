import { AREA_IDS, AREAS, anyActiveDays, runHistory, type ActivityDays, type AreaId } from "@/lib/achievements/activity";
import { mondayOf } from "@/lib/dates";
import { msg } from "@/lib/i18n/translate";

/**
 * Site-wide badges: calm milestones read from the days the person was active.
 * Day counts are "on any days you chose", so a pause never takes anything
 * away. A badge keeps the date its rule was first met. Badges are worked out
 * from the saved records each time, so nothing new is stored, and clearing
 * those records with "Clear my data" clears the badges too.
 */

export type BadgeGroup = "area" | "together";

export type Badge = {
  id: string;
  group: BadgeGroup;
  icon: string;
  title: string;
  text: string;
  area?: AreaId;
  /** Progress toward the badge, for a gentle "x of y" line. */
  goal: number;
};

export type BadgeStatus = Badge & { earnedOn: string; progress: number };

type Rule = Badge & { check: (days: ActivityDays) => { progress: number; earnedOn: string } };

/** The date the n-th distinct day in a sorted list was reached. */
function nthDay(dates: readonly string[], n: number): { progress: number; earnedOn: string } {
  return { progress: Math.min(n, dates.length), earnedOn: dates.length >= n ? dates[n - 1] : "" };
}

const AREA_COPY: Record<AreaId, { first: [string, string]; seven: [string, string]; thirty: [string, string] }> = {
  diary: {
    first: [msg("First diary reading"), msg("You noted your first reading in the health diary.")],
    seven: [msg("Diary on seven days"), msg("Readings noted on seven different days.")],
    thirty: [msg("Diary keeper"), msg("Readings noted on thirty different days.")],
  },
  movement: {
    first: [msg("First movement noted"), msg("You noted your first walk, exercise, or movement break.")],
    seven: [msg("Moving on seven days"), msg("Movement noted on seven different days.")],
    thirty: [msg("Movement friend"), msg("Movement noted on thirty different days.")],
  },
  breathing: {
    first: [msg("First calm breath"), msg("You finished your first breathing or relaxation session.")],
    seven: [msg("Calm on seven days"), msg("Breathing or relaxation on seven different days.")],
    thirty: [msg("Breathing companion"), msg("Breathing or relaxation on thirty different days.")],
  },
  quiz: {
    first: [msg("First quiz played"), msg("You played your first quiz, brain game, or focus session.")],
    seven: [msg("Curious on seven days"), msg("Quizzes or brain training on seven different days.")],
    thirty: [msg("Curious mind"), msg("Quizzes or brain training on thirty different days.")],
  },
  meals: {
    first: [msg("First meal noted"), msg("You noted your first meal in the calorie counter.")],
    seven: [msg("Meals on seven days"), msg("Meals noted on seven different days.")],
    thirty: [msg("Mindful eater"), msg("Meals noted on thirty different days.")],
  },
  learning: {
    first: [msg("First learning day"), msg("You completed your first lesson, challenge, or mini-course day.")],
    seven: [msg("Learning on seven days"), msg("Learning on seven different days.")],
    thirty: [msg("Lifelong learner"), msg("Learning on thirty different days.")],
  },
  checkin: {
    first: [msg("First check-in"), msg("You noted how you feel for the first time.")],
    seven: [msg("Checking in on seven days"), msg("Check-ins on seven different days.")],
    thirty: [msg("Kind to yourself"), msg("Check-ins on thirty different days.")],
  },
};

function areaRules(): Rule[] {
  return AREAS.flatMap((area) => {
    const copy = AREA_COPY[area.id];
    const make = (key: "first" | "seven" | "thirty", goal: number): Rule => ({
      id: `${area.id}-${key}`,
      group: "area",
      icon: area.icon,
      area: area.id,
      title: copy[key][0],
      text: copy[key][1],
      goal,
      check: (days) => nthDay(days[area.id], goal),
    });
    return [make("first", 1), make("seven", 7), make("thirty", 30)];
  });
}

function runRule(id: string, goal: number, title: string, text: string): Rule {
  return {
    id,
    group: "together",
    icon: "🔆",
    title,
    text,
    goal,
    check: (days) => {
      const { longest, reachedOn } = runHistory(anyActiveDays(days));
      return { progress: Math.min(goal, longest), earnedOn: reachedOn.get(goal) ?? "" };
    },
  };
}

function totalRule(id: string, goal: number, title: string, text: string): Rule {
  return { id, group: "together", icon: "🌱", title, text, goal, check: (days) => nthDay(anyActiveDays(days), goal) };
}

/** The day the n-th different area was first tried. */
function areasTried(days: ActivityDays, goal: number): { progress: number; earnedOn: string } {
  const firsts = AREA_IDS.map((id) => days[id][0]).filter(Boolean).sort();
  return { progress: Math.min(goal, firsts.length), earnedOn: firsts.length >= goal ? firsts[goal - 1] : "" };
}

/** The first week (Monday to Sunday) with activity on at least `goal` days. */
function fullWeek(days: ActivityDays, goal: number): { progress: number; earnedOn: string } {
  const byWeek = new Map<string, string[]>();
  for (const date of anyActiveDays(days)) {
    const week = mondayOf(date);
    byWeek.set(week, [...(byWeek.get(week) ?? []), date]);
  }
  let best = 0;
  let earnedOn = "";
  for (const dates of byWeek.values()) {
    best = Math.max(best, dates.length);
    if (!earnedOn && dates.length >= goal) earnedOn = dates[goal - 1];
  }
  return { progress: Math.min(goal, best), earnedOn };
}

const TOGETHER: Rule[] = [
  runRule("run-3", 3, msg("Three days in a row"), msg("You did something for yourself three days running.")),
  runRule("run-7", 7, msg("A week in a row"), msg("Seven days in a row with something for your health.")),
  runRule("run-14", 14, msg("Two weeks in a row"), msg("Fourteen days in a row. A habit is taking root.")),
  runRule("run-30", 30, msg("A month in a row"), msg("Thirty days in a row. Lovely, steady care.")),
  totalRule("days-10", 10, msg("Ten active days"), msg("Ten days with something for your health, on any days you chose.")),
  totalRule("days-50", 50, msg("Fifty active days"), msg("Fifty active days, at your own pace.")),
  totalRule("days-100", 100, msg("One hundred active days"), msg("One hundred active days. Every one of them counts.")),
  { id: "explorer", group: "together", icon: "🧭", title: msg("Explorer"), text: msg("You tried four different parts of LifeZoi."), goal: 4, check: (days) => areasTried(days, 4) },
  { id: "all-round", group: "together", icon: "🌈", title: msg("All-round care"), text: msg("You tried every part of LifeZoi counted here."), goal: AREA_IDS.length, check: (days) => areasTried(days, AREA_IDS.length) },
  { id: "full-week", group: "together", icon: "📅", title: msg("A full week"), text: msg("Five active days within one week, Monday to Sunday."), goal: 5, check: (days) => fullWeek(days, 5) },
];

/** Every badge with its earned date ("" when not yet) and progress toward it. */
export function badgeStatuses(days: ActivityDays): BadgeStatus[] {
  return [...TOGETHER, ...areaRules()].map(({ check, ...badge }) => ({ ...badge, ...check(days) }));
}

/** Earned badges, newest first. */
export function recentBadges(statuses: readonly BadgeStatus[], limit = 4): BadgeStatus[] {
  return statuses
    .filter((badge) => badge.earnedOn)
    .sort((a, b) => (a.earnedOn === b.earnedOn ? 0 : a.earnedOn < b.earnedOn ? 1 : -1))
    .slice(0, limit);
}

/** The not-yet-earned badges closest to being earned, as gentle next steps. */
export function nextBadges(statuses: readonly BadgeStatus[], limit = 3): BadgeStatus[] {
  return statuses
    .filter((badge) => !badge.earnedOn && badge.progress > 0)
    .sort((a, b) => b.progress / b.goal - a.progress / a.goal || a.goal - b.goal)
    .slice(0, limit);
}
