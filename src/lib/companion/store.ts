"use client";

import { useSyncExternalStore } from "react";
import { guestStorageKey, takeForAccount, userStorageKey } from "@/lib/owned-local";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { emptyCompanion, isEmptyCompanion, sanitizeCompanion, type CompanionState } from "@/lib/companion/state";

export const COMPANION_STORAGE_KEY = "lifezoi.companion.v1";
/** Stay well under the 256 KB check in the companion_state migration. */
const ACCOUNT_BUDGET = 240_000;

/**
 * guest: no account, saved in this browser only.
 * account: saved to the signed-in account (companion_state table).
 * device: signed in, but the companion_state table is not set up or could not be reached, so it stays in this browser.
 * sample: the labeled sample is on; nothing is written.
 */
export type CompanionSaveMode = "loading" | "guest" | "account" | "device" | "sample";

export type CompanionSnapshot = {
  ready: boolean;
  state: CompanionState;
  saveMode: CompanionSaveMode;
};

const serverSnapshot: CompanionSnapshot = { ready: false, state: emptyCompanion(), saveMode: "loading" };
let snapshot: CompanionSnapshot = serverSnapshot;
let activeKey = guestStorageKey(COMPANION_STORAGE_KEY);
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

function readLocal(key: string): CompanionState {
  try {
    const raw = storage()?.getItem(key);
    return raw ? sanitizeCompanion(JSON.parse(raw) as unknown) : emptyCompanion();
  } catch {
    return emptyCompanion();
  }
}

function writeLocal(key: string, state: CompanionState) {
  try {
    storage()?.setItem(key, JSON.stringify(state));
  } catch {
    // Storage can be full or blocked. The page still works for this visit.
  }
}

function publish(next: Partial<CompanionSnapshot>) {
  snapshot = { ...snapshot, ...next };
  emit();
}

/** Called by the session provider whenever the signed-in person changes. */
export function bindCompanionOwner(userId: string | null, options: { sample: boolean }) {
  if (typeof window === "undefined") return;
  readOnly = options.sample;
  const generation = ++bindGeneration;
  window.clearTimeout(timer);
  if (!userId) {
    ownerId = null;
    activeKey = guestStorageKey(COMPANION_STORAGE_KEY);
    publish({ ready: true, state: readLocal(activeKey), saveMode: options.sample ? "sample" : "guest" });
    return;
  }
  ownerId = userId;
  takeForAccount(storage(), COMPANION_STORAGE_KEY, userId, false);
  activeKey = userStorageKey(COMPANION_STORAGE_KEY, userId);
  const local = readLocal(activeKey);
  publish({ ready: true, state: local, saveMode: options.sample ? "sample" : "loading" });
  void loadRemote(userId, local, generation);
}

async function loadRemote(userId: string, local: CompanionState, generation: number) {
  const supabase = getBrowserSupabase();
  if (!supabase) {
    if (generation === bindGeneration) publish({ saveMode: readOnly ? "sample" : "device" });
    return;
  }
  const { data, error } = await supabase
    .from("companion_state")
    .select("state, updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (generation !== bindGeneration) return;
  if (error) {
    publish({ saveMode: readOnly ? "sample" : "device" });
    return;
  }
  const remote = data ? sanitizeCompanion((data as { state: unknown }).state) : null;
  const chosen = chooseNewer(local, remote);
  writeLocal(activeKey, chosen);
  publish({ state: chosen, saveMode: readOnly ? "sample" : "account" });
  if (!readOnly && chosen !== remote && !isEmptyCompanion(chosen)) void pushRemote(userId, chosen, generation);
}

/** The newer copy wins. An empty copy never replaces saved data. */
export function chooseNewer(local: CompanionState, remote: CompanionState | null): CompanionState {
  if (!remote || isEmptyCompanion(remote)) return local;
  if (isEmptyCompanion(local)) return remote;
  return (local.updatedAt || "") > (remote.updatedAt || "") ? local : remote;
}

/** Trim the oldest history before an account save would pass the size check. */
export function fitForAccount(state: CompanionState, budget = ACCOUNT_BUDGET): CompanionState {
  let next = state;
  const size = (value: CompanionState) => new TextEncoder().encode(JSON.stringify(value)).length;
  for (let guard = 0; guard < 400 && size(next) > budget; guard += 1) {
    const dates = Object.keys(next.days).sort();
    if (dates.length > 30) {
      const days = { ...next.days };
      delete days[dates[0] as string];
      next = { ...next, days };
    } else if (next.games.length > 50) {
      next = { ...next, games: next.games.slice(0, next.games.length - 25) };
    } else if (next.reviews.length > 12) {
      next = { ...next, reviews: next.reviews.slice(0, -1) };
    } else {
      break;
    }
  }
  return next;
}

async function pushRemote(userId: string, state: CompanionState, generation: number) {
  const supabase = getBrowserSupabase();
  if (!supabase || generation !== bindGeneration) return;
  const { error } = await supabase
    .from("companion_state")
    .upsert({ user_id: userId, state: fitForAccount(state), updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (generation !== bindGeneration) return;
  publish({ saveMode: error ? "device" : "account" });
}

/** Save a new companion state. Does nothing while the sample is on. */
export function commitCompanion(change: (state: CompanionState) => CompanionState): boolean {
  if (readOnly || !snapshot.ready) return false;
  const next = sanitizeCompanion({ ...change(snapshot.state), updatedAt: new Date().toISOString() });
  writeLocal(activeKey, next);
  publish({ state: next });
  if (ownerId && snapshot.saveMode !== "device") {
    const userId = ownerId;
    const generation = bindGeneration;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => void pushRemote(userId, next, generation), 600);
  }
  return true;
}

/** Remove this person's companion copies from the browser (used on "clear my data"). */
export function clearCompanionLocal() {
  const store = storage();
  if (!store) return;
  store.removeItem(COMPANION_STORAGE_KEY);
  store.removeItem(guestStorageKey(COMPANION_STORAGE_KEY));
  if (ownerId) store.removeItem(userStorageKey(COMPANION_STORAGE_KEY, ownerId));
  publish({ state: emptyCompanion() });
}

/** Clear the account copy as well, when the table exists. */
export async function clearCompanionAccount(): Promise<void> {
  clearCompanionLocal();
  const supabase = getBrowserSupabase();
  if (!supabase || !ownerId) return;
  await supabase.from("companion_state").delete().eq("user_id", ownerId);
}

export function subscribeCompanion(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCompanionSnapshot(): CompanionSnapshot {
  return snapshot;
}

export function getCompanionServerSnapshot(): CompanionSnapshot {
  return serverSnapshot;
}

export function useCompanion(): CompanionSnapshot {
  return useSyncExternalStore(subscribeCompanion, getCompanionSnapshot, getCompanionServerSnapshot);
}

export const SAVE_MODE_TEXT: Record<CompanionSaveMode, string> = {
  loading: "Loading your saved plan…",
  guest: "Saved in this browser on this device. Sign in to keep it in your account.",
  account: "Saved to your account.",
  device:
    "Saved in this browser on this device. Your account is signed in, but the account table for daily progress is not set up yet, so it is not on other devices.",
  sample: "Sample data is on. Nothing you do here is saved.",
};
