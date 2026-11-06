import { localISODate } from "@/lib/dates";
import {
  emptyMyDay,
  ensureToday,
  loadMyDay,
  saveMyDay,
  type MyDayFile,
} from "@/lib/my-day/storage";

export type MyDaySnapshot = { ready: boolean; today: string; file: MyDayFile };

const serverFile = emptyMyDay();
const serverSnapshot: MyDaySnapshot = { ready: false, today: "", file: serverFile };
let file = serverFile;
let ready = false;
let snapshot: MyDaySnapshot = serverSnapshot;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window !== "undefined") saveMyDay(window.localStorage, file);
}

function publish() {
  snapshot = { ready, today: typeof window === "undefined" ? "" : localISODate(), file };
}

function ensure() {
  if (ready || typeof window === "undefined") return;
  ready = true;
  file = ensureToday(loadMyDay(window.localStorage), localISODate());
  persist();
  publish();
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeMyDay(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMyDaySnapshot(): MyDaySnapshot {
  ensure();
  return snapshot;
}

export function getMyDayServerSnapshot(): MyDaySnapshot {
  return serverSnapshot;
}

export function commitMyDay(next: MyDayFile) {
  ensure();
  file = next;
  persist();
  publish();
  emit();
}
