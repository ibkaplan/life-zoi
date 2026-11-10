"use client";

import { useSyncExternalStore } from "react";
import { cleanReminder, REMINDER_DEFAULT, type ReminderSettings } from "@/lib/movement-breaks/personal";

/**
 * The optional sitting-break reminder. It is a per-device convenience, so it lives
 * in this browser's localStorage. It only works while a LifeZoi page is open:
 * there is no server, push service, or paid notification provider.
 */
const KEY = "lifezoi.sitting-reminder.v1";
const listeners = new Set<() => void>();
let cached: ReminderSettings | null = null;

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function read(): ReminderSettings {
  if (cached) return cached;
  try {
    const raw = storage()?.getItem(KEY);
    cached = raw ? cleanReminder(JSON.parse(raw) as unknown) : { ...REMINDER_DEFAULT };
  } catch {
    cached = { ...REMINDER_DEFAULT };
  }
  return cached;
}

export function saveReminder(change: (current: ReminderSettings) => ReminderSettings) {
  cached = cleanReminder(change(read()));
  try {
    storage()?.setItem(KEY, JSON.stringify(cached));
  } catch {
    // Storage can be blocked. The reminder still works until the page closes.
  }
  for (const listener of listeners) listener();
}

/** Start a new sitting period now, for example after a break. */
export function resetSitting() {
  if (!read().on) return;
  saveReminder((current) => ({ ...current, since: Date.now() }));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return;
    cached = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const serverSnapshot: ReminderSettings = { ...REMINDER_DEFAULT };

export function useReminder(): ReminderSettings {
  return useSyncExternalStore(subscribe, read, () => serverSnapshot);
}
