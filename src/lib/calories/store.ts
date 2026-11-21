import { guestStorageKey, takeForAccount, userStorageKey } from "@/lib/owned-local";
import {
  CALORIE_STORAGE_KEY,
  emptyCalorieLog,
  loadCalorieLog,
  saveCalorieLog,
} from "@/lib/calories/storage";
import type { CalorieLog } from "@/lib/calories/types";

/**
 * The food diary lives in this browser's localStorage under a key owned by the
 * signed-in member, like the emotional wellness notes. It is not written to the
 * account database yet, and it is never sent to a food database or to the photo service.
 */
const serverLog = emptyCalorieLog();
let log = serverLog;
let activeKey = guestStorageKey(CALORIE_STORAGE_KEY);
let ready = false;
const listeners = new Set<() => void>();

function storage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

function ensure() {
  if (ready || typeof window === "undefined") return;
  ready = true;
  log = loadCalorieLog(storage(), activeKey);
}

export function bindCalorieOwner(userId: string | null) {
  if (typeof window === "undefined") return;
  const bucket = storage();
  if (userId) {
    takeForAccount(bucket, CALORIE_STORAGE_KEY, userId, false);
    activeKey = userStorageKey(CALORIE_STORAGE_KEY, userId);
  } else {
    activeKey = guestStorageKey(CALORIE_STORAGE_KEY);
  }
  log = loadCalorieLog(bucket, activeKey);
  ready = true;
  emit();
}

export function subscribeCalories(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCalorieSnapshot(): CalorieLog {
  ensure();
  return log;
}

export function getCalorieServerSnapshot(): CalorieLog {
  return serverLog;
}

export function updateCalories(recipe: (current: CalorieLog) => CalorieLog) {
  ensure();
  log = recipe(log);
  saveCalorieLog(storage(), log, activeKey);
  emit();
}

export function clearCalorieStore() {
  const bucket = storage();
  bucket?.removeItem(activeKey);
  bucket?.removeItem(CALORIE_STORAGE_KEY);
  bucket?.removeItem(guestStorageKey(CALORIE_STORAGE_KEY));
  log = emptyCalorieLog();
  ready = true;
  emit();
}
