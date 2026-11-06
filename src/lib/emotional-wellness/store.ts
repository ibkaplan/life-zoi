import {
  clearEmotionalStorage,
  emptyEmotionalStore,
  loadEmotionalStore,
  saveEmotionalStore,
} from "@/lib/emotional-wellness/storage";
import type { EmotionalStore } from "@/lib/emotional-wellness/types";

const serverStore = emptyEmotionalStore();
let clientStore = serverStore;
let started = false;
const listeners = new Set<() => void>();

function ensure() {
  if (started || typeof window === "undefined") return;
  started = true;
  clientStore = loadEmotionalStore(window.localStorage);
}

function publish(next: EmotionalStore) {
  clientStore = next;
  if (typeof window !== "undefined") saveEmotionalStore(window.localStorage, clientStore);
  listeners.forEach((listener) => listener());
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
  if (typeof window !== "undefined") clearEmotionalStorage(window.localStorage);
  clientStore = emptyEmotionalStore();
  started = true;
  listeners.forEach((listener) => listener());
}
