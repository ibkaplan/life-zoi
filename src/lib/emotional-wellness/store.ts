import { guestStorageKey, takeForAccount, userStorageKey } from "@/lib/owned-local";
import {
  clearEmotionalStorage,
  emptyEmotionalStore,
  EMOTIONAL_STORAGE_KEY,
  isEmptyEmotional,
  loadEmotionalStore,
  saveEmotionalStore,
} from "@/lib/emotional-wellness/storage";
import type { EmotionalStore } from "@/lib/emotional-wellness/types";

const serverStore = emptyEmotionalStore();
let clientStore = serverStore;
let started = false;
let activeKey = EMOTIONAL_STORAGE_KEY;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function ensure() {
  if (started || typeof window === "undefined") return;
  started = true;
  clientStore = emptyEmotionalStore();
}

function publish(next: EmotionalStore) {
  clientStore = next;
  if (typeof window !== "undefined" && activeKey) saveEmotionalStore(window.localStorage, clientStore, activeKey);
  emit();
}

/** Show this account's notes, or a signed-out draft. Notes are not written to the account. */
export function bindEmotionalOwner(userId: string | null, authOff: boolean) {
  if (typeof window === "undefined") return;
  const storage = window.localStorage;
  if (userId) {
    const raw = takeForAccount(storage, EMOTIONAL_STORAGE_KEY, userId, false);
    activeKey = userStorageKey(EMOTIONAL_STORAGE_KEY, userId);
    clientStore = raw ? loadEmotionalStore(storage, activeKey) : emptyEmotionalStore();
  } else {
    const guestKey = guestStorageKey(EMOTIONAL_STORAGE_KEY);
    const guest = loadEmotionalStore(storage, guestKey);
    const legacy = loadEmotionalStore(storage, EMOTIONAL_STORAGE_KEY);
    if (!isEmptyEmotional(guest)) {
      activeKey = guestKey;
      clientStore = guest;
    } else if (authOff && !isEmptyEmotional(legacy)) {
      activeKey = EMOTIONAL_STORAGE_KEY;
      clientStore = legacy;
    } else if (!isEmptyEmotional(legacy)) {
      activeKey = EMOTIONAL_STORAGE_KEY;
      clientStore = legacy;
    } else {
      activeKey = guestKey;
      clientStore = emptyEmotionalStore();
    }
  }
  started = true;
  emit();
}

export function subscribeEmotionalStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getEmotionalStoreSnapshot(): EmotionalStore {
  ensure();
  return clientStore;
}

export function getEmotionalServerSnapshot(): EmotionalStore {
  return serverStore;
}

export function updateEmotionalStore(recipe: (current: EmotionalStore) => EmotionalStore) {
  ensure();
  publish(recipe(clientStore));
}

export function clearEmotionalStore() {
  if (typeof window !== "undefined") {
    clearEmotionalStorage(window.localStorage, activeKey);
    clearEmotionalStorage(window.localStorage, EMOTIONAL_STORAGE_KEY);
    clearEmotionalStorage(window.localStorage, guestStorageKey(EMOTIONAL_STORAGE_KEY));
  }
  clientStore = emptyEmotionalStore();
  started = true;
  emit();
}
