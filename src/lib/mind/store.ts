import { userStorageKey } from "@/lib/owned-local";
import { emptyProgress, MIND_CONSENT_KEY, MIND_PROGRESS_KEY, parseProgress, type MindProgress } from "@/lib/mind/progress";

/**
 * Browser store for LifeZoi Mind progress. Saving is off until the person turns it on.
 * Off: sessionStorage (this tab only). On: localStorage under the account's own key.
 */

type Snapshot = { consent: boolean; progress: MindProgress; owner: string | null };

const SERVER: Snapshot = { consent: false, progress: emptyProgress(), owner: null };
let snapshot: Snapshot = SERVER;
let started = false;
const listeners = new Set<() => void>();

function keyFor(owner: string | null) {
  return owner ? userStorageKey(MIND_PROGRESS_KEY, owner) : `${MIND_PROGRESS_KEY}.guest`;
}

function consentKey(owner: string | null) {
  return owner ? userStorageKey(MIND_CONSENT_KEY, owner) : `${MIND_CONSENT_KEY}.guest`;
}

function safe<T>(read: () => T, fallback: T): T {
  try {
    return read();
  } catch {
    return fallback;
  }
}

function load(owner: string | null): Snapshot {
  if (typeof window === "undefined") return SERVER;
  const consent = safe(() => window.localStorage.getItem(consentKey(owner)) === "yes", false);
  const storage = consent ? window.localStorage : window.sessionStorage;
  const progress = safe(() => parseProgress(storage.getItem(keyFor(owner))), emptyProgress());
  return { consent, progress, owner };
}

function emit() {
  listeners.forEach((listener) => listener());
}

function persist() {
  if (typeof window === "undefined") return;
  const storage = snapshot.consent ? window.localStorage : window.sessionStorage;
  safe(() => storage.setItem(keyFor(snapshot.owner), JSON.stringify(snapshot.progress)), undefined);
}

export function bindMindOwner(owner: string | null) {
  if (typeof window === "undefined") return;
  if (started && snapshot.owner === owner) return;
  started = true;
  snapshot = load(owner);
  emit();
}

export function subscribeMind(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMindSnapshot(): Snapshot {
  if (!started && typeof window !== "undefined") {
    started = true;
    snapshot = load(null);
  }
  return snapshot;
}

export function getMindServerSnapshot(): Snapshot {
  return SERVER;
}

export function updateMindProgress(recipe: (current: MindProgress) => MindProgress) {
  snapshot = { ...snapshot, progress: recipe(snapshot.progress) };
  persist();
  emit();
}

/** Turning saving on moves this tab's data to local storage; turning it off deletes the saved copy. */
export function setMindConsent(on: boolean) {
  if (typeof window === "undefined") return;
  const key = keyFor(snapshot.owner);
  if (on) {
    safe(() => window.localStorage.setItem(consentKey(snapshot.owner), "yes"), undefined);
    safe(() => window.sessionStorage.removeItem(key), undefined);
  } else {
    safe(() => window.localStorage.removeItem(consentKey(snapshot.owner)), undefined);
    safe(() => window.localStorage.removeItem(key), undefined);
  }
  snapshot = { ...snapshot, consent: on };
  persist();
  emit();
}

/** Deletes every LifeZoi Mind progress copy in this browser for this person, saved or not. */
export function deleteAllMindData() {
  if (typeof window !== "undefined") {
    const key = keyFor(snapshot.owner);
    safe(() => window.localStorage.removeItem(key), undefined);
    safe(() => window.sessionStorage.removeItem(key), undefined);
    safe(() => window.sessionStorage.removeItem(MIND_CONVERSATION_KEY), undefined);
  }
  snapshot = { ...snapshot, progress: emptyProgress() };
  emit();
}

/** The conversation lives only in this tab, so it survives opening an article but not closing the tab. */
export const MIND_CONVERSATION_KEY = "lifezoi.mind.conversation.v1";
