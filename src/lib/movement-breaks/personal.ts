import { MAX_MOVEMENT_BREAKS, withDay, type CompanionState, type DayLog } from "@/lib/companion/state";
import type { Assessment } from "@/lib/types";
import { msg } from "@/lib/i18n/translate";

/**
 * Personal movement-break suggestions from answers the person already gave:
 * work and daily activity, sitting hours, activity days, walking, and water.
 * Nothing is inferred from a blank answer.
 */

export type SittingReason = "office" | "computer" | "long-sitting" | "television" | "driving" | "many-hours" | "low-activity";

export type LifeLine = { id: string; text: string; why?: string };

export type SittingProfile = {
  /** True when the answers point to long sitting or low activity. */
  highlight: boolean;
  reasons: SittingReason[];
  current: LifeLine[];
  next: LifeLine[];
};

/** Hours of sitting a day at or above which the break section is highlighted. */
export const MANY_SITTING_HOURS = 6;

function whole(value: string): number | null {
  if (!value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

type Answers = Pick<Assessment, "dailySetting" | "sedentaryHours" | "activityDays" | "walking" | "strength" | "hydration">;

export function sittingReasons(answers: Answers | null): SittingReason[] {
  if (!answers) return [];
  const reasons: SittingReason[] = [];
  const setting = answers.dailySetting ?? [];
  for (const item of ["office", "computer", "long-sitting", "television", "driving"] as const) {
    if (setting.includes(item)) reasons.push(item);
  }
  const hours = whole(answers.sedentaryHours);
  if (hours !== null && hours >= MANY_SITTING_HOURS) reasons.push("many-hours");
  const days = whole(answers.activityDays);
  if (days !== null && days <= 1) reasons.push("low-activity");
  return reasons;
}

export function sittingProfile(answers: Answers | null): SittingProfile {
  const reasons = sittingReasons(answers);
  const hours = answers ? whole(answers.sedentaryHours) : null;
  const current: LifeLine[] = [];
  if (reasons.includes("office") || reasons.includes("computer")) {
    current.push({
      id: "desk",
      text: hours !== null && hours > 0 ? `I sit at a desk or computer, and sit for about ${hours} hours a day.` : msg("I sit at a desk or computer for much of the day."),
    });
  } else if (hours !== null && hours >= MANY_SITTING_HOURS) {
    current.push({ id: "hours", text: `I sit or recline for about ${hours} hours a day.` });
  }
  if (reasons.includes("long-sitting")) current.push({ id: "long", text: msg("I often sit for many hours at a time and rarely take movement breaks.") });
  if (reasons.includes("television")) current.push({ id: "tv", text: msg("I spend long periods watching television.") });
  if (reasons.includes("driving")) current.push({ id: "driving", text: msg("I drive or travel seated for long periods.") });
  if (answers?.hydration && answers.hydration !== "rarely" && (reasons.includes("low-activity") || answers.walking === "rarely")) {
    current.push({ id: "water-only", text: msg("I drink water, but I have little physical activity.") });
  } else if (reasons.includes("low-activity")) {
    current.push({ id: "low", text: msg("I am physically active on one day a week or less.") });
  }
  if (answers?.strength === "rarely" || answers?.walking === "rarely") current.push({ id: "legs", text: msg("I rarely exercise my legs.") });

  const next: LifeLine[] = [
    {
      id: "interrupt",
      text: "I interrupt prolonged sitting about every 30 minutes.",
      why: "Breaking up sitting wakes up your leg muscles. In short studies it also improved blood sugar after meals.",
    },
    {
      id: "walk",
      text: "I walk for 2 to 3 minutes during work breaks.",
      why: "Walking makes your calf muscles squeeze the leg veins and helps blood return to your heart. It is more useful than standing still.",
    },
    {
      id: "calves",
      text: "I do gentle calf raises, holding something sturdy, or seated heel lifts.",
      why: "Each heel raise tightens the calf muscle pump, the “second heart” of your legs.",
    },
    {
      id: "water",
      text: "I drink water regularly, according to my own needs.",
      why: "Hydration supports normal body functions. More water than you need does not add extra benefit, and some health conditions need a set limit.",
    },
    {
      id: "breathe",
      text: "I practise comfortable breathing every day.",
      why: "The movement of breathing supports normal lung function and helps lymph move.",
    },
    {
      id: "gradual",
      text: "I gradually increase my physical activity.",
      why: "Small, steady steps are easier to keep. Add a little at a time, at a level that feels comfortable.",
    },
  ];
  return { highlight: reasons.length > 0, reasons, current, next };
}

/** The daily tracking items. Each is stored as an entry in the existing day log. */
export const TRACK_ITEMS = [
  { id: "mb-water", label: "Drink water", hint: "As much as suits you, or as your healthcare professional advised." },
  { id: "mb-break", label: "Take a movement break", hint: "Fills in on its own when you finish a guided break." },
  { id: "mb-walk", label: "Walk for a few minutes", hint: "Indoors or outside. Any walk counts." },
  { id: "mb-calves", label: "Do calf raises", hint: "Standing with support, or seated heel lifts." },
  { id: "mb-breathe", label: "Practise breathing", hint: "A few comfortable breaths. Never forced or held." },
  { id: "mb-goal", label: "Complete my daily movement goal", hint: "The goal you set for yourself today." },
] as const;

export type TrackItemId = (typeof TRACK_ITEMS)[number]["id"];

export function isTracked(day: DayLog | null | undefined, id: TrackItemId): boolean {
  const status = day?.entries[id]?.status;
  return status === "done" || status === "partial";
}

/** Adds one completed movement break to the day and ticks the tracker item. */
export function addMovementBreak(state: CompanionState, date: string, minutes = 3): CompanionState {
  return withDay(state, date, (day) => {
    const first = !isTracked(day, "mb-break");
    return {
      ...day,
      movementBreaks: Math.min(MAX_MOVEMENT_BREAKS, (day.movementBreaks ?? 0) + 1),
      exerciseMinutes: day.exerciseMinutes + minutes,
      entries: first ? { ...day.entries, "mb-break": { status: "done", minutes, replacedWith: "" } } : day.entries,
    };
  });
}

/** Breaks per day for the last `count` days ending on `today`, oldest first. */
export function breakHistory(state: CompanionState, today: string, count = 7): { date: string; breaks: number }[] {
  const out: { date: string; breaks: number }[] = [];
  const [y, m, d] = today.split("-").map(Number) as [number, number, number];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(Date.UTC(y, m - 1, d - i)).toISOString().slice(0, 10);
    out.push({ date, breaks: state.days[date]?.movementBreaks ?? 0 });
  }
  return out;
}

// ---------- the optional sitting-break reminder ----------

export const REMINDER_MINUTES = [20, 30, 45, 60] as const;
export type ReminderMinutes = (typeof REMINDER_MINUTES)[number];

export type ReminderSettings = {
  on: boolean;
  minutes: ReminderMinutes;
  /** When the current sitting period started (ms since epoch). */
  since: number;
};

export const REMINDER_DEFAULT: ReminderSettings = { on: false, minutes: 30, since: 0 };

export function cleanReminder(value: unknown): ReminderSettings {
  if (!value || typeof value !== "object") return { ...REMINDER_DEFAULT };
  const row = value as Record<string, unknown>;
  const minutes = REMINDER_MINUTES.find((item) => item === row.minutes) ?? 30;
  const since = typeof row.since === "number" && Number.isFinite(row.since) && row.since > 0 ? row.since : 0;
  return { on: row.on === true, minutes, since };
}

/** True when the reminder is on and the chosen time has passed since the last reset. */
export function reminderDue(settings: ReminderSettings, now: number): boolean {
  return settings.on && settings.since > 0 && now - settings.since >= settings.minutes * 60_000;
}
