import type { HealthReading, ReadingKind } from "./types";

/**
 * Optional reminders shown on the diary page when a reading is due. They are a
 * preference, not health data, so they stay in this browser (localStorage).
 * The site sends no notifications, e-mails, or texts.
 */
export const REMINDER_KEY = "lifezoi.health-diary.reminders.v1";
export const REMINDER_CHOICES = ["off", "daily", "weekly", "monthly", "quarterly"] as const;
export type ReminderChoice = (typeof REMINDER_CHOICES)[number];
export type ReminderPrefs = Record<ReadingKind, ReminderChoice>;

export const DEFAULT_REMINDERS: ReminderPrefs = { blood_pressure: "off", glucose: "off", cholesterol: "off" };

const DAYS: Record<Exclude<ReminderChoice, "off">, number> = { daily: 1, weekly: 7, monthly: 30, quarterly: 91 };

export function sanitizeReminders(value: unknown): ReminderPrefs {
  const out = { ...DEFAULT_REMINDERS };
  if (!value || typeof value !== "object") return out;
  for (const kind of Object.keys(out) as ReadingKind[]) {
    const choice = (value as Record<string, unknown>)[kind];
    if (REMINDER_CHOICES.includes(choice as ReminderChoice)) out[kind] = choice as ReminderChoice;
  }
  return out;
}

export function reminderKey(userId: string | null): string {
  return `${REMINDER_KEY}:${userId ?? "guest"}`;
}

export function readReminders(storage: Storage | null, userId: string | null): ReminderPrefs {
  try {
    const raw = storage?.getItem(reminderKey(userId));
    return sanitizeReminders(raw ? JSON.parse(raw) : null);
  } catch {
    return { ...DEFAULT_REMINDERS };
  }
}

export function writeReminders(storage: Storage | null, userId: string | null, prefs: ReminderPrefs) {
  try {
    storage?.setItem(reminderKey(userId), JSON.stringify(prefs));
  } catch {
    // Blocked storage only means the reminder is not remembered.
  }
}

/** Kinds whose chosen interval has passed since the last reading (or that have no reading yet). */
export function dueReminders(prefs: ReminderPrefs, readings: readonly HealthReading[], now: Date = new Date()): ReadingKind[] {
  const due: ReadingKind[] = [];
  for (const kind of Object.keys(prefs) as ReadingKind[]) {
    const choice = prefs[kind];
    if (choice === "off") continue;
    const last = readings.filter((reading) => reading.kind === kind).reduce((max, reading) => Math.max(max, Date.parse(reading.measuredAt)), -Infinity);
    if (!Number.isFinite(last)) {
      due.push(kind);
      continue;
    }
    // A daily reminder is due on the next calendar day; longer ones after that many days.
    if (choice === "daily") {
      const lastDay = new Date(last);
      if (lastDay.toDateString() !== now.toDateString() && last < now.getTime()) due.push(kind);
    } else if (now.getTime() - last >= DAYS[choice] * 86_400_000) due.push(kind);
  }
  return due;
}
