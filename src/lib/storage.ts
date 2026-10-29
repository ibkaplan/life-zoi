import { parseStoredUserData, type UserData } from "@/lib/user-data";

export const STORAGE_KEY = "lifezoi.local.v1";
const CHANGE_EVENT = "lifezoi-local-change";

export type LoadResult =
  | { ok: true; data: UserData }
  | { ok: false; reason: "unavailable" | "corrupt"; raw: string | null };

function browserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadUserData(): LoadResult {
  const storage = browserStorage();
  if (!storage) return { ok: false, reason: "unavailable", raw: null };
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { ok: false, reason: "unavailable", raw: null };
  }
  if (raw === null) {
    const parsed = parseStoredUserData({
      version: 1,
      profile: { displayName: "" },
      draft: null,
      assessments: [],
      scenarios: [],
      goals: [],
      checkIns: [],
    });
    if (!parsed.ok) return { ok: false, reason: "corrupt", raw: null };
    return { ok: true, data: parsed.data };
  }
  try {
    const parsed = parseStoredUserData(JSON.parse(raw));
    if (!parsed.ok) return { ok: false, reason: "corrupt", raw };
    return { ok: true, data: parsed.data };
  } catch {
    return { ok: false, reason: "corrupt", raw };
  }
}

export function saveUserData(data: UserData): void {
  const storage = browserStorage();
  if (!storage) throw new Error("Browser storage is unavailable.");
  const parsed = parseStoredUserData(data);
  if (!parsed.ok) throw new Error("Refusing to save notes that do not match the lifeZoi format.");
  storage.setItem(STORAGE_KEY, JSON.stringify(parsed.data));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function clearUserData(): void {
  const storage = browserStorage();
  if (!storage) throw new Error("Browser storage is unavailable.");
  storage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function exportEnvelope(data: UserData, exportedAt: string) {
  return {
    notice:
      "Exported from lifeZoi local development mode. This file contains entries from this browser. It is not a medical record.",
    exportedAt,
    data,
  };
}
