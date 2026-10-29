import { localISODate } from "@/lib/dates";
import {
  loadStoredSample,
  loadStoredSession,
  SAMPLE_STORAGE_KEY,
  SESSION_STORAGE_KEY,
} from "@/lib/session";
import { emptySession, type UserSession } from "@/lib/types";

export type BrowserSnapshot = {
  ready: boolean;
  sample: boolean;
  stored: UserSession;
};

const serverSnapshot: BrowserSnapshot = {
  ready: false,
  sample: false,
  stored: emptySession(),
};

let clientSnapshot: BrowserSnapshot = serverSnapshot;
let started = false;
const listeners = new Set<() => void>();

function ensureClient() {
  if (started || typeof window === "undefined") return;
  started = true;
  clientSnapshot = {
    ready: true,
    sample: loadStoredSample(window.sessionStorage),
    stored: loadStoredSession(window.sessionStorage),
  };
}

export function subscribeBrowserStore(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getBrowserStoreSnapshot(): BrowserSnapshot {
  ensureClient();
  return clientSnapshot;
}

export function getBrowserStoreServerSnapshot(): BrowserSnapshot {
  return serverSnapshot;
}

export function writeBrowserStore(stored: UserSession, sample: boolean) {
  ensureClient();
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stored));
    window.sessionStorage.setItem(SAMPLE_STORAGE_KEY, sample ? "1" : "0");
  }
  clientSnapshot = { ready: true, sample, stored };
  for (const listener of listeners) listener();
}

export function todayDate() {
  return localISODate();
}
