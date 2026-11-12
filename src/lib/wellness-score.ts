import { validateComplete } from "@/lib/validation";
import type { CompletedAssessment, NormalizedAssessment } from "@/lib/types";

/**
 * "My Wellness Score" on the dashboard: how many of the habit areas the person
 * reported are in line with the public guidance the suggestions already use
 * (`buildRecommendations`). It is a count of the person's own answers, never a
 * health measurement, risk, or prediction. With no saved assessment there is no
 * score at all.
 */

export type HabitAreaId = "sleep" | "movement" | "food" | "tobacco" | "alcohol" | "stress" | "connection";

export type HabitArea = {
  id: HabitAreaId;
  label: string;
  /** Shown when the area needs attention. */
  next: string;
  href: string;
};

export const HABIT_AREAS: readonly HabitArea[] = [
  { id: "sleep", label: "Sleep", next: "Aim for a steady bedtime and 7 to 9 hours of sleep.", href: "/library/guides/better-sleep" },
  { id: "movement", label: "Movement", next: "Add short walks until you reach about 150 minutes a week.", href: "/academy/move/resources" },
  { id: "food", label: "Vegetables and water", next: "Add one vegetable or fruit to a meal, and keep water in sight.", href: "/academy/meals" },
  { id: "tobacco", label: "Tobacco", next: "Free support to stop smoking is on Smokefree.gov, and your doctor can help.", href: "/choices" },
  { id: "alcohol", label: "Alcohol", next: "Choose some alcohol-free days each week.", href: "/choices" },
  { id: "stress", label: "Stress and mood", next: "Try a few minutes of slow breathing or a walk each day.", href: "/library/guides/stress-relief" },
  { id: "connection", label: "People around you", next: "Plan one small, regular contact with a friend or group.", href: "/community" },
];

export const SCORE_BANDS = [
  { id: "start", label: "Getting started", min: 0 },
  { id: "way", label: "On the way", min: 0.4 },
  { id: "strong", label: "Strong habits", min: 0.75 },
] as const;

export type ScoreBand = (typeof SCORE_BANDS)[number];

export type ScoreSnapshot = {
  id: string;
  completedAt: string;
  /** Areas in line with guidance. */
  met: HabitAreaId[];
  /** Areas that need attention. */
  attention: HabitAreaId[];
  /** Areas counted. "Prefer not to say" leaves an area out. */
  counted: number;
};

/** Whether each area is in line with guidance, or null when the person chose not to answer. */
export function habitAreaStatus(a: NormalizedAssessment): Record<HabitAreaId, boolean | null> {
  const weekly = a.activityDays * a.activityMinutes;
  return {
    sleep: a.sleepHours >= 7 && a.sleepHours <= 9 && (a.sleepQuality === "good" || a.sleepQuality === "very-good"),
    movement: weekly >= 150,
    food: (a.vegetables === "most-days" || a.vegetables === "daily") && a.hydration === "most-days",
    tobacco: a.smoking === null || a.smoking === "prefer-not" ? null : a.smoking === "never" || a.smoking === "former",
    alcohol: a.alcohol === null || a.alcohol === "prefer-not" ? null : a.alcohol !== "most-weeks",
    stress: a.stress === "low" && a.mood !== "low",
    connection: a.social === "connected",
  };
}

export function snapshotOf(record: CompletedAssessment): ScoreSnapshot | null {
  const parsed = validateComplete(record.answers);
  if (!parsed.ok) return null;
  const status = habitAreaStatus(parsed.value);
  const met: HabitAreaId[] = [];
  const attention: HabitAreaId[] = [];
  for (const area of HABIT_AREAS) {
    const value = status[area.id];
    if (value === true) met.push(area.id);
    else if (value === false) attention.push(area.id);
  }
  return { id: record.id, completedAt: record.completedAt, met, attention, counted: met.length + attention.length };
}

export function bandOf(snapshot: ScoreSnapshot): ScoreBand {
  const share = snapshot.counted === 0 ? 0 : snapshot.met.length / snapshot.counted;
  let band: ScoreBand = SCORE_BANDS[0];
  for (const item of SCORE_BANDS) if (share >= item.min) band = item;
  return band;
}

export type WellnessScoreView = {
  current: ScoreSnapshot;
  previous: ScoreSnapshot | null;
  /** Oldest first, at most `limit` saved assessments. */
  history: ScoreSnapshot[];
  improved: HabitAreaId[];
  slipped: HabitAreaId[];
};

/** Built only from saved assessments, newest first as the session stores them. */
export function wellnessScore(history: readonly CompletedAssessment[], limit = 6): WellnessScoreView | null {
  const snapshots = history.flatMap((record) => {
    const snapshot = snapshotOf(record);
    return snapshot ? [snapshot] : [];
  });
  const [current, previous = null] = snapshots;
  if (!current) return null;
  const improved = previous ? current.met.filter((id) => previous.attention.includes(id)) : [];
  const slipped = previous ? current.attention.filter((id) => previous.met.includes(id)) : [];
  return { current, previous, history: snapshots.slice(0, limit).reverse(), improved, slipped };
}

export function areaById(id: HabitAreaId): HabitArea {
  return HABIT_AREAS.find((area) => area.id === id) ?? HABIT_AREAS[0];
}
