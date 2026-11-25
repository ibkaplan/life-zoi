"use client";

import { useSyncExternalStore } from "react";
import { defaultReminders, EMPTY_LOG, sanitizeLog, sanitizeTimedReminders, type ReminderLog, type TimedReminders } from "@/lib/reminders/schedule";

/**
 * Timed reminders and today's done/snoozed list, per account, in this browser's
 * localStorage. A change in one tab reaches the others through the storage event.
 */
const PREFIX = "lifezoi.timed-reminders.v1";
const LOG_PREFIX = "lifezoi.timed-reminders.log.v1";
const listeners = new Set<() => void>();
const cache = new Map<string, TimedReminders>();
const logCache = new Map<string, ReminderLog>();

const keyFor = (userId: string) => `${PREFIX}:${userId}`;
const logKeyFor = (userId: string) => `${LOG_PREFIX}:${userId}`;

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function parse(raw: string | null | undefined): unknown {
  try {
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

export function readTimedReminders(userId: string): TimedReminders {
  const cached = cache.get(userId);
  if (cached) return cached;
  let raw: string | null = null;
  try {
    raw = storage()?.getItem(keyFor(userId)) ?? null;
  } catch {
    raw = null;
  }
  const value = sanitizeTimedReminders(parse(raw));
  cache.set(userId, value);
  return value;
}

export function readReminderLog(userId: string): ReminderLog {
  const cached = logCache.get(userId);
  if (cached) return cached;
  let raw: string | null = null;
  try {
    raw = storage()?.getItem(logKeyFor(userId)) ?? null;
  } catch {
    raw = null;
  }
  const value = sanitizeLog(parse(raw));
  logCache.set(userId, value);
  return value;
}

function notify() {
  for (const listener of listeners) listener();
}

export function saveTimedReminders(userId: string, change: (current: TimedReminders) => TimedReminders) {
  const next = sanitizeTimedReminders(change(readTimedReminders(userId)));
  cache.set(userId, next);
  try {
    storage()?.setItem(keyFor(userId), JSON.stringify(next));
  } catch {
    // Blocked storage: the reminders work until the page closes.
  }
  notify();
}

export function saveReminderLog(userId: string, change: (current: ReminderLog) => ReminderLog) {
  const next = sanitizeLog(change(readReminderLog(userId)));
  logCache.set(userId, next);
  try {
    storage()?.setItem(logKeyFor(userId), JSON.stringify(next));
  } catch {
    // Only means a dismissed reminder can come back after a reload.
  }
  notify();
}

/** Removes this account's reminders from this browser. */
export function clearTimedReminders(userId: string) {
  cache.delete(userId);
  logCache.delete(userId);
  try {
    storage()?.removeItem(keyFor(userId));
    storage()?.removeItem(logKeyFor(userId));
  } catch {
    // Nothing else to do.
  }
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key && !event.key.startsWith(PREFIX) && !event.key.startsWith(LOG_PREFIX)) return;
    cache.clear();
    logCache.clear();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const serverReminders = defaultReminders();

export function useTimedReminders(userId: string | null): TimedReminders {
  return useSyncExternalStore(
    subscribe,
    () => (userId ? readTimedReminders(userId) : serverReminders),
    () => serverReminders,
  );
}

export function useReminderLog(userId: string | null): ReminderLog {
  return useSyncExternalStore(
    subscribe,
    () => (userId ? readReminderLog(userId) : EMPTY_LOG),
    () => EMPTY_LOG,
  );
}
