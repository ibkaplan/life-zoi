"use client";

import { useSyncExternalStore } from "react";
import { GROWTH_COURSES } from "@/lib/growth-academy/catalog";
import { awardAchievements } from "@/lib/growth-academy/achievements";
import { emptyAcademy, isEmptyAcademy, sanitizeAcademy, type AcademyState } from "@/lib/growth-academy/progress";
import { localISODate } from "@/lib/dates";
import { msg } from "@/lib/i18n/translate";
import { guestStorageKey, takeForAccount, userStorageKey } from "@/lib/owned-local";
import { getBrowserSupabase } from "@/lib/supabase-browser";

/**
 * Training Academy progress store. Same pattern as the companion store:
 * a signed-in account saves to its own `academy_state` row (row level
 * security, supabase/migrations/20261124200000_academy_state.sql) and keeps a
 * copy in this browser; without the table it stays in this browser and says so.
 */
export const ACADEMY_STORAGE_KEY = "lifezoi.academy.v1";
/** Stay under the 1 MB check in the academy_state migration. */
export const ACADEMY_BUDGET = 900_000;

export type AcademySaveMode = "loading" | "guest" | "account" | "device" | "sample";

export type AcademySnapshot = { ready: boolean; state: AcademyState; saveMode: AcademySaveMode };

const serverSnapshot: AcademySnapshot = { ready: false, state: emptyAcademy(), saveMode: "loading" };
let snapshot: AcademySnapshot = serverSnapshot;
let activeKey = guestStorageKey(ACADEMY_STORAGE_KEY);
let ownerId: string | null = null;
let readOnly = false;
let bindGeneration = 0;
let timer: number | undefined;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function readLocal(key: string): AcademyState {
  try {
    const raw = storage()?.getItem(key);
    return raw ? sanitizeAcademy(JSON.parse(raw) as unknown) : emptyAcademy();
  } catch {
    return emptyAcademy();
  }
}

function writeLocal(key: string, state: AcademyState) {
  try {
    storage()?.setItem(key, JSON.stringify(state));
  } catch {
    // Storage can be full or blocked. The page still works for this visit.
  }
}

function publish(next: Partial<AcademySnapshot>) {
  snapshot = { ...snapshot, ...next };
  emit();
}

/** Called by the session provider whenever the signed-in person changes. */
export function bindAcademyOwner(userId: string | null, options: { sample: boolean }) {
  if (typeof window === "undefined") return;
  readOnly = options.sample;
  const generation = ++bindGeneration;
  window.clearTimeout(timer);
  if (!userId) {
    ownerId = null;
    activeKey = guestStorageKey(ACADEMY_STORAGE_KEY);
    publish({ ready: true, state: readLocal(activeKey), saveMode: options.sample ? "sample" : "guest" });
    return;
  }
  ownerId = userId;
  takeForAccount(storage(), ACADEMY_STORAGE_KEY, userId, false);
  activeKey = userStorageKey(ACADEMY_STORAGE_KEY, userId);
  const local = readLocal(activeKey);
  publish({ ready: true, state: local, saveMode: options.sample ? "sample" : "loading" });
  void loadRemote(userId, local, generation);
}

async function loadRemote(userId: string, local: AcademyState, generation: number) {
  const supabase = getBrowserSupabase();
  if (!supabase) {
    if (generation === bindGeneration) publish({ saveMode: readOnly ? "sample" : "device" });
    return;
  }
  const { data, error } = await supabase.from("academy_state").select("state, updated_at").eq("user_id", userId).maybeSingle();
  if (generation !== bindGeneration) return;
  if (error) {
    publish({ saveMode: readOnly ? "sample" : "device" });
    return;
  }
  const remote = data ? sanitizeAcademy((data as { state: unknown }).state) : null;
  const chosen = mergeAcademy(local, remote);
  writeLocal(activeKey, chosen);
  publish({ state: chosen, saveMode: readOnly ? "sample" : "account" });
  if (!readOnly && chosen !== remote && !isEmptyAcademy(chosen)) void pushRemote(userId, chosen, generation);
}

/**
 * Joins the browser copy and the account copy so progress made on another
 * device is never lost: a completed lesson stays completed, the earliest start
 * date and the latest activity win, and saved text comes from the copy saved last.
 */
export function mergeAcademy(local: AcademyState, remote: AcademyState | null): AcademyState {
  if (!remote || isEmptyAcademy(remote)) return local;
  if (isEmptyAcademy(local)) return remote;
  const newer = (local.updatedAt || "") > (remote.updatedAt || "") ? local : remote;
  const older = newer === local ? remote : local;
  const lessons = { ...older.lessons };
  for (const [id, record] of Object.entries(newer.lessons)) {
    const other = lessons[id];
    if (!other) {
      lessons[id] = record;
      continue;
    }
    const completed = record.status === "completed" || other.status === "completed";
    const completedOn = [record.completedOn, other.completedOn].filter(Boolean).sort()[0] ?? "";
    lessons[id] = {
      ...record,
      status: completed ? "completed" : "in-progress",
      completedOn: completed ? completedOn || record.lastOn : "",
      startedOn: [record.startedOn, other.startedOn].sort()[0] as string,
      lastOn: [record.lastOn, other.lastOn].sort().at(-1) as string,
      exerciseDone: record.exerciseDone || other.exerciseDone,
      practiceTries: Math.max(record.practiceTries, other.practiceTries),
      seconds: Math.max(record.seconds, other.seconds),
    };
  }
  const courses = { ...older.courses };
  for (const [id, record] of Object.entries(newer.courses)) {
    const other = courses[id];
    courses[id] = other
      ? {
          ...record,
          startedOn: [record.startedOn, other.startedOn].sort()[0] as string,
          lastOn: [record.lastOn, other.lastOn].sort().at(-1) as string,
          completedOn: [record.completedOn, other.completedOn].filter(Boolean).sort()[0] ?? "",
        }
      : record;
  }
  const achievements = { ...newer.achievements };
  for (const [id, day] of Object.entries(older.achievements)) if (!achievements[id] || day < achievements[id]) achievements[id] = day;
  const merged: AcademyState = {
    ...newer,
    lessons,
    courses,
    achievements,
    challenges: { ...older.challenges, ...newer.challenges },
    days: [...new Set([...older.days, ...newer.days])].sort().slice(-400),
    history: newer.history,
  };
  return sanitizeAcademy(awardAchievements(merged, GROWTH_COURSES, localISODate()).state);
}

/** Drop the oldest history, then the oldest saved text, before a save would pass the size check. */
export function fitAcademy(state: AcademyState, budget = ACADEMY_BUDGET): AcademyState {
  const size = (value: AcademyState) => new TextEncoder().encode(JSON.stringify(value)).length;
  let next = state;
  for (let guard = 0; guard < 500 && size(next) > budget; guard += 1) {
    if (next.history.length > 50) {
      next = { ...next, history: next.history.slice(0, next.history.length - 25) };
      continue;
    }
    const oldest = Object.entries(next.lessons)
      .filter(([, record]) => record.practice.length > 1)
      .sort((a, b) => a[1].savedOn.localeCompare(b[1].savedOn))[0];
    if (!oldest) break;
    next = { ...next, lessons: { ...next.lessons, [oldest[0]]: { ...oldest[1], practice: oldest[1].practice.slice(0, 1) } } };
  }
  return next;
}

async function pushRemote(userId: string, state: AcademyState, generation: number) {
  const supabase = getBrowserSupabase();
  if (!supabase || generation !== bindGeneration) return;
  const { error } = await supabase
    .from("academy_state")
    .upsert({ user_id: userId, state: fitAcademy(state), updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (generation !== bindGeneration) return;
  publish({ saveMode: error ? "device" : "account" });
}

/**
 * Save a change. Achievements are checked after every change and added once.
 * Returns the ids of achievements earned by this change, or null when nothing
 * could be saved (the sample is on, or the store is not ready).
 */
export function commitAcademy(change: (state: AcademyState) => AcademyState, today = localISODate()): string[] | null {
  if (readOnly || !snapshot.ready) return null;
  const awarded = awardAchievements(change(snapshot.state), GROWTH_COURSES, today);
  const next = sanitizeAcademy({ ...awarded.state, updatedAt: new Date().toISOString() });
  writeLocal(activeKey, next);
  publish({ state: next });
  if (ownerId && snapshot.saveMode !== "device") {
    const userId = ownerId;
    const generation = bindGeneration;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => void pushRemote(userId, next, generation), 600);
  }
  return awarded.earned;
}

export function clearAcademyLocal() {
  const store = storage();
  if (!store) return;
  store.removeItem(guestStorageKey(ACADEMY_STORAGE_KEY));
  if (ownerId) store.removeItem(userStorageKey(ACADEMY_STORAGE_KEY, ownerId));
  publish({ state: emptyAcademy() });
}

export async function clearAcademyAccount(): Promise<void> {
  clearAcademyLocal();
  const supabase = getBrowserSupabase();
  if (!supabase || !ownerId) return;
  await supabase.from("academy_state").delete().eq("user_id", ownerId);
}

export function subscribeAcademy(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAcademy(): AcademySnapshot {
  return useSyncExternalStore(subscribeAcademy, () => snapshot, () => serverSnapshot);
}

export const ACADEMY_SAVE_TEXT: Record<AcademySaveMode, string> = {
  loading: msg("Loading your learning record…"),
  guest: msg("Saved in this browser on this device."),
  account: msg("Your progress is saved to your account and available when you sign in on another device."),
  device: msg("Saved in this browser on this device. Your account is signed in, but the Academy table is not set up yet, so it is not on other devices yet."),
  sample: msg("Sample data is on. Nothing you do here is saved."),
};
