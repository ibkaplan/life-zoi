import { guestStorageKey, takeForAccount, userStorageKey } from "@/lib/owned-local";
import {
  emptyWellnessLog,
  isEmptyWellnessLog,
  loadWellness,
  sanitizeWellness,
  saveWellness,
  WELLNESS_STORAGE_KEY,
} from "@/lib/wellness/storage";
import type { WellnessLog } from "@/lib/wellness/types";

const serverLog = emptyWellnessLog();
let log = serverLog;
let ready = false;
let activeKey = WELLNESS_STORAGE_KEY;
const listeners = new Set<() => void>();

function ensure() {
  if (ready || typeof window === "undefined") return;
  ready = true;
  log = emptyWellnessLog();
}

export function bindWellnessOwner(userId: string | null) {
  if (typeof window === "undefined") return;
  const storage = window.sessionStorage;
  if (userId) {
    const raw = takeForAccount(storage, WELLNESS_STORAGE_KEY, userId, false);
    activeKey = userStorageKey(WELLNESS_STORAGE_KEY, userId);
    log = raw ? loadWellness(storage, activeKey) : emptyWellnessLog();
  } else {
    activeKey = guestStorageKey(WELLNESS_STORAGE_KEY);
    const guest = loadWellness(storage, activeKey);
    const legacy = loadWellness(storage, WELLNESS_STORAGE_KEY);
    if (!isEmptyWellnessLog(guest)) log = guest;
    else if (!isEmptyWellnessLog(legacy)) {
      activeKey = WELLNESS_STORAGE_KEY;
      log = legacy;
    } else log = emptyWellnessLog();
  }
  ready = true;
  emit();
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeWellness(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getWellnessSnapshot(): WellnessLog {
  ensure();
  return log;
}

export function getWellnessServerSnapshot(): WellnessLog {
  return serverLog;
}

export function commitWellness(next: WellnessLog) {
  ensure();
  log = sanitizeWellness(next);
  if (typeof window !== "undefined") saveWellness(window.sessionStorage, log, activeKey);
  emit();
}

export function resetWellnessClient() {
  log = emptyWellnessLog();
  ready = true;
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(activeKey);
    window.sessionStorage.removeItem(WELLNESS_STORAGE_KEY);
    window.sessionStorage.removeItem(guestStorageKey(WELLNESS_STORAGE_KEY));
  }
  emit();
}
