import {
  emptyWellnessLog,
  loadWellness,
  sanitizeWellness,
  saveWellness,
  WELLNESS_STORAGE_KEY,
} from "@/lib/wellness/storage";
import type { WellnessLog } from "@/lib/wellness/types";

const serverLog = emptyWellnessLog();
let log = serverLog;
let ready = false;
const listeners = new Set<() => void>();

function ensure() {
  if (ready || typeof window === "undefined") return;
  ready = true;
  log = loadWellness(window.sessionStorage);
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
  if (typeof window !== "undefined") saveWellness(window.sessionStorage, log);
  emit();
}

export function resetWellnessClient() {
  log = emptyWellnessLog();
  ready = true;
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(WELLNESS_STORAGE_KEY);
  }
  emit();
}
