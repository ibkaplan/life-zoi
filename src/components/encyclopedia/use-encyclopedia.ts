"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { visibleArticles, type EditorialRecord } from "@/lib/encyclopedia/catalog";
import type { Article } from "@/lib/encyclopedia/types";
import { useAccount } from "@/lib/account-store";
import { guestStorageKey, userStorageKey } from "@/lib/owned-local";

/* ---------- Articles: built-in, plus an editor's published versions from the server ---------- */

type Store = { records: EditorialRecord[]; loaded: boolean };
let store: Store = { records: [], loaded: false };
let started = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

function load() {
  if (started) return;
  started = true;
  void fetch("/api/encyclopedia", { cache: "no-store" })
    .then(async (response) => {
      const body = (await response.json().catch(() => ({}))) as { records?: EditorialRecord[] };
      store = { records: Array.isArray(body.records) ? body.records : [], loaded: true };
    })
    .catch(() => {
      store = { records: [], loaded: true };
    })
    .finally(emit);
}

const BUILT_IN = visibleArticles([]);
let cachedFor: EditorialRecord[] | null = null;
let cachedArticles: Article[] = BUILT_IN;

function articlesSnapshot(): Article[] {
  if (cachedFor !== store.records) {
    cachedFor = store.records;
    cachedArticles = store.records.length > 0 ? visibleArticles(store.records) : BUILT_IN;
  }
  return cachedArticles;
}

/** Every article a member can read. Built-in articles show at once; edits arrive after one request. */
export function useArticles(): Article[] {
  useEffect(load, []);
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    articlesSnapshot,
    () => BUILT_IN,
  );
}

/* ---------- Small per-browser preferences and reading history ---------- */

/**
 * Reading mode and text size hold no health information. Recently viewed articles
 * can hint at what someone is reading about, so they are kept per account on this
 * device, never sent anywhere, and can be cleared from My Library.
 */
const PREFS_KEY = "lifezoi.encyclopedia.prefs.v1";
const RECENT_KEY = "lifezoi.encyclopedia.recent.v1";

export type ReadingMode = "easy" | "standard";
export type ReadingPrefs = { mode: ReadingMode; size: number };
export const TEXT_SIZES = [1, 1.15, 1.3, 1.5] as const;
const DEFAULT_PREFS: ReadingPrefs = { mode: "standard", size: 1 };

const localListeners = new Set<() => void>();
function notifyLocal() {
  localListeners.forEach((listener) => listener());
}
function subscribeLocal(listener: () => void) {
  localListeners.add(listener);
  const onStorage = () => listener();
  window.addEventListener("storage", onStorage);
  return () => {
    localListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeRaw(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Private windows can refuse storage; the page still works.
  }
  notifyLocal();
}

let prefsRaw: string | null | undefined;
let prefsValue: ReadingPrefs = DEFAULT_PREFS;
function prefsSnapshot(): ReadingPrefs {
  const raw = readRaw(PREFS_KEY);
  if (raw === prefsRaw) return prefsValue;
  prefsRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as Partial<ReadingPrefs>) : {};
    prefsValue = {
      mode: parsed.mode === "easy" ? "easy" : "standard",
      size: (TEXT_SIZES as readonly number[]).includes(Number(parsed.size)) ? Number(parsed.size) : 1,
    };
  } catch {
    prefsValue = DEFAULT_PREFS;
  }
  return prefsValue;
}

export function useReadingPrefs(): [ReadingPrefs, (change: Partial<ReadingPrefs>) => void] {
  const prefs = useSyncExternalStore(subscribeLocal, prefsSnapshot, () => DEFAULT_PREFS);
  const save = useCallback((change: Partial<ReadingPrefs>) => writeRaw(PREFS_KEY, JSON.stringify({ ...prefsSnapshot(), ...change })), []);
  return [prefs, save];
}

const recentCache = new Map<string, { raw: string | null; value: string[] }>();
function recentSnapshotFor(key: string): string[] {
  const raw = readRaw(key);
  const cached = recentCache.get(key);
  if (cached && cached.raw === raw) return cached.value;
  let value: string[] = [];
  try {
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    value = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string" && /^[a-z0-9-]{1,80}$/.test(item)).slice(0, 12) : [];
  } catch {
    value = [];
  }
  recentCache.set(key, { raw, value });
  return value;
}

const EMPTY: string[] = [];

/** Slugs of recently opened articles, newest first, for this account on this device. */
export function useRecentArticles(): { slugs: string[]; add: (slug: string) => void; clear: () => void } {
  const account = useAccount();
  const key = account.userId ? userStorageKey(RECENT_KEY, account.userId) : guestStorageKey(RECENT_KEY);
  const slugs = useSyncExternalStore(subscribeLocal, () => recentSnapshotFor(key), () => EMPTY);
  const add = useCallback(
    (slug: string) => writeRaw(key, JSON.stringify([slug, ...recentSnapshotFor(key).filter((item) => item !== slug)].slice(0, 12))),
    [key],
  );
  const clear = useCallback(() => writeRaw(key, null), [key]);
  return { slugs, add, clear };
}
