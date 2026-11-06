import { localISODate } from "@/lib/dates";
import { guestStorageKey } from "@/lib/owned-local";
import {
  emptyMyDay,
  ensureToday,
  isEmptyMyDay,
  loadMyDay,
  MY_DAY_STORAGE_KEY,
  saveMyDay,
  type MyDayFile,
} from "@/lib/my-day/storage";

export type MyDaySnapshot = { ready: boolean; today: string; file: MyDayFile };

const serverFile = emptyMyDay();
const serverSnapshot: MyDaySnapshot = { ready: false, today: "", file: serverFile };
let file = serverFile;
let ready = false;
let activeKey = guestStorageKey(MY_DAY_STORAGE_KEY);
let snapshot: MyDaySnapshot = serverSnapshot;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window !== "undefined") saveMyDay(window.localStorage, file, activeKey);
}

function publish() {
  snapshot = { ready, today: typeof window === "undefined" ? "" : localISODate(), file };
}

function ensure() {
  if (ready || typeof window === "undefined") return;
  ready = true;
  const guestKey = guestStorageKey(MY_DAY_STORAGE_KEY);
  const guest = loadMyDay(window.localStorage, guestKey);
  const legacy = loadMyDay(window.localStorage, MY_DAY_STORAGE_KEY);
  if (!isEmptyMyDay(guest)) {
    activeKey = guestKey;
    file = ensureToday(guest, localISODate());
  } else if (!isEmptyMyDay(legacy)) {
    activeKey = MY_DAY_STORAGE_KEY;
    file = ensureToday(legacy, localISODate());
  } else {
    activeKey = guestKey;
    file = ensureToday(emptyMyDay(), localISODate());
  }
  persist();
  publish();
}

export function reloadGuestMyDay() {
  if (typeof window === "undefined") return;
  ready = false;
  ensure();
  emit();
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
