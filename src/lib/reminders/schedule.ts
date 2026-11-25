/**
 * Reminders at a time of day the person chooses: blood pressure, blood sugar,
 * and two daily habits. They are a preference, not health data, so they stay
 * in this browser (localStorage), one set per signed-in account.
 *
 * Nothing is sent to a server. There is no push service, e-mail, or text
 * message: a reminder can only appear while a LifeZoi page is open in a tab.
 * Reminder text names the activity only. It never gives medical advice.
 */
import { msg } from "@/lib/i18n/translate";

export const TIMED_REMINDER_IDS = ["blood_pressure", "glucose", "daily_checkin", "my_day"] as const;
export type TimedReminderId = (typeof TIMED_REMINDER_IDS)[number];

export interface TimedReminder {
  on: boolean;
  /** Local times of day, "HH:MM", sorted, no duplicates. */
  times: string[];
  /** Days of the week it applies to, 0 = Sunday … 6 = Saturday. */
  days: number[];
  /** When it was last turned on or changed (ms). Earlier time slots are not shown. */
  since: number;
}

export type TimedReminders = Record<TimedReminderId, TimedReminder>;

export const MAX_TIMES = 4;
export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6] as const;
export const SNOOZE_MINUTES = 15;

export interface ReminderInfo {
  title: string;
  prompt: string;
  href: string;
  action: string;
  defaultTimes: string[];
}

export const REMINDER_INFO: Record<TimedReminderId, ReminderInfo> = {
  blood_pressure: {
    title: msg("Measure blood pressure"),
    prompt: msg("Time to measure your blood pressure."),
    href: "/my-health/diary",
    action: msg("Open the health diary"),
    defaultTimes: ["08:00", "20:00"],
  },
  glucose: {
    title: msg("Check blood sugar"),
    prompt: msg("Time to check your blood sugar."),
    href: "/my-health/diary",
    action: msg("Open the health diary"),
    defaultTimes: ["07:30"],
  },
  daily_checkin: {
    title: msg("LifeZoi Daily check-in"),
    prompt: msg("Time for your LifeZoi Daily check-in."),
    href: "/daily",
    action: msg("Open LifeZoi Daily"),
    defaultTimes: ["19:00"],
  },
  my_day: {
    title: msg("Today's habits plan"),
    prompt: msg("Time to look at today's habits in My Day."),
    href: "/my-day",
    action: msg("Open My Day"),
    defaultTimes: ["09:00"],
  },
};

export function defaultReminders(): TimedReminders {
  const out = {} as TimedReminders;
  for (const id of TIMED_REMINDER_IDS) out[id] = { on: false, times: [...REMINDER_INFO[id].defaultTimes], days: [...ALL_DAYS], since: 0 };
  return out;
}

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function cleanTimes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const times = value.filter((item): item is string => typeof item === "string" && TIME.test(item));
  return [...new Set(times)].sort().slice(0, MAX_TIMES);
}

export function cleanDays(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is number => Number.isInteger(item) && item >= 0 && item <= 6))].sort();
}

export function sanitizeTimedReminders(value: unknown): TimedReminders {
  const out = defaultReminders();
  if (!value || typeof value !== "object") return out;
  for (const id of TIMED_REMINDER_IDS) {
    const item = (value as Record<string, unknown>)[id];
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;
    const times = cleanTimes(raw.times);
    const days = cleanDays(raw.days);
    const since = typeof raw.since === "number" && Number.isFinite(raw.since) && raw.since >= 0 ? raw.since : 0;
    out[id] = { on: raw.on === true && times.length > 0 && days.length > 0, times: Array.isArray(raw.times) ? times : out[id].times, days: Array.isArray(raw.days) ? days : out[id].days, since };
  }
  return out;
}

/** Local calendar day, "YYYY-MM-DD". */
export function dayKey(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function slotKey(id: TimedReminderId, date: Date, time: string): string {
  return `${id}|${dayKey(date)}|${time}`;
}

function slotTime(date: Date, time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  const at = new Date(date);
  at.setHours(hours, minutes, 0, 0);
  return at.getTime();
}

export interface DueSlot {
  id: TimedReminderId;
  time: string;
  key: string;
  at: number;
}

export interface ReminderLog {
  /** Slot keys marked done or dismissed. Only today's are kept. */
  handled: string[];
  /** Slot key → time (ms) until which it is snoozed. */
  snoozed: Record<string, number>;
}

export const EMPTY_LOG: ReminderLog = { handled: [], snoozed: {} };

export function sanitizeLog(value: unknown, now: Date = new Date()): ReminderLog {
  if (!value || typeof value !== "object") return { handled: [], snoozed: {} };
  const today = `|${dayKey(now)}|`;
  const raw = value as Record<string, unknown>;
  const handled = Array.isArray(raw.handled) ? raw.handled.filter((key): key is string => typeof key === "string" && key.includes(today)) : [];
  const snoozed: Record<string, number> = {};
  if (raw.snoozed && typeof raw.snoozed === "object")
    for (const [key, until] of Object.entries(raw.snoozed as Record<string, unknown>))
      if (key.includes(today) && typeof until === "number" && Number.isFinite(until)) snoozed[key] = until;
  return { handled: [...new Set(handled)], snoozed };
}

/**
 * The reminders to show now: for each one that is on and applies today, the
 * latest time slot that has passed today, unless it was handled, is snoozed,
 * or was set before the reminder was turned on. Yesterday's slots are not shown.
 */
export function dueSlots(reminders: TimedReminders, log: ReminderLog, now: Date = new Date()): DueSlot[] {
  const due: DueSlot[] = [];
  const nowMs = now.getTime();
  for (const id of TIMED_REMINDER_IDS) {
    const reminder = reminders[id];
    if (!reminder.on || !reminder.days.includes(now.getDay())) continue;
    const passed = reminder.times.filter((time) => slotTime(now, time) <= nowMs);
    const time = passed[passed.length - 1];
    if (!time) continue;
    const at = slotTime(now, time);
    if (at < reminder.since) continue;
    const key = slotKey(id, now, time);
    if (log.handled.includes(key)) continue;
    if ((log.snoozed[key] ?? 0) > nowMs) continue;
    due.push({ id, time, key, at });
  }
  return due;
}

/** The next time any reminder that is on will come up, within the next 7 days. */
export function nextSlot(reminders: TimedReminders, now: Date = new Date()): { id: TimedReminderId; at: number } | null {
  let best: { id: TimedReminderId; at: number } | null = null;
  for (let offset = 0; offset < 8; offset++) {
    const day = new Date(now);
    day.setDate(now.getDate() + offset);
    for (const id of TIMED_REMINDER_IDS) {
      const reminder = reminders[id];
      if (!reminder.on || !reminder.days.includes(day.getDay())) continue;
      for (const time of reminder.times) {
        const at = slotTime(day, time);
        if (at > now.getTime() && (!best || at < best.at)) best = { id, at };
      }
    }
    if (best) return best;
  }
  return best;
}

export function markHandled(log: ReminderLog, key: string): ReminderLog {
  const snoozed = { ...log.snoozed };
  delete snoozed[key];
  return { handled: [...new Set([...log.handled, key])], snoozed };
}

export function snooze(log: ReminderLog, key: string, now: number = Date.now()): ReminderLog {
  return { ...log, snoozed: { ...log.snoozed, [key]: now + SNOOZE_MINUTES * 60_000 } };
}
