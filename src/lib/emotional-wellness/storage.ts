import type {
  ContextId,
  CountryChoice,
  EmotionalStore,
  NoteBucket,
  PrivateNote,
} from "@/lib/emotional-wellness/types";
import { CONTEXT_IDS, COUNTRY_CHOICES } from "@/lib/emotional-wellness/types";

export const EMOTIONAL_STORAGE_KEY = "lifezoi.emotional-wellness.v1";

const TEXT_LIMIT = 1000;
const COUNTRY_NOTE_LIMIT = 80;
const LIST_LIMIT = 100;

export function emptyEmotionalStore(): EmotionalStore {
  return {
    version: 1,
    country: "unset",
    countryNote: "",
    context: "general",
    journal: [],
    joys: [],
    caregiverNotes: [],
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function cleanText(value: unknown, limit: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, limit);
}

function cleanId(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return /^ew[a-z0-9]{4,40}$/.test(trimmed) ? trimmed : "";
}

function cleanStamp(value: unknown): string {
  if (typeof value !== "string") return "";
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value) ? value.slice(0, 40) : "";
}

function cleanCountry(value: unknown): CountryChoice {
  return COUNTRY_CHOICES.includes(value as CountryChoice) ? (value as CountryChoice) : "unset";
}

function cleanContext(value: unknown): ContextId {
  return CONTEXT_IDS.includes(value as ContextId) ? (value as ContextId) : "general";
}

function cleanNotes(value: unknown): PrivateNote[] {
  if (!Array.isArray(value)) return [];
  const notes: PrivateNote[] = [];
  for (const item of value) {
    const record = asRecord(item);
    if (!record) continue;
    const id = cleanId(record.id);
    const createdAt = cleanStamp(record.createdAt);
    const text = cleanText(record.text, TEXT_LIMIT);
    if (!id || !createdAt || !text) continue;
    notes.push({ id, createdAt, text });
    if (notes.length >= LIST_LIMIT) break;
  }
  return notes;
}

export function sanitizeEmotionalStore(value: unknown): EmotionalStore {
  const record = asRecord(value);
  if (!record) return emptyEmotionalStore();
  return {
    version: 1,
    country: cleanCountry(record.country),
    countryNote: cleanText(record.countryNote, COUNTRY_NOTE_LIMIT),
    context: cleanContext(record.context),
    journal: cleanNotes(record.journal),
    joys: cleanNotes(record.joys),
    caregiverNotes: cleanNotes(record.caregiverNotes),
  };
}

export function createNoteId(now = Date.now(), rand = Math.random()): string {
  const raw = `ew${now.toString(36)}${Math.floor(rand * 1e8).toString(36)}`;
  return raw.replace(/[^a-z0-9]/g, "").slice(0, 42);
}

export function addPrivateNote(
  store: EmotionalStore,
  bucket: NoteBucket,
  text: string,
  now: string,
  id: string,
): EmotionalStore {
  const clean = cleanText(text, TEXT_LIMIT);
  const stamp = cleanStamp(now);
  const noteId = cleanId(id);
  if (!clean || !stamp || !noteId) return store;
  const entry: PrivateNote = { id: noteId, createdAt: stamp, text: clean };
  return {
    ...store,
    [bucket]: [entry, ...store[bucket].filter((item) => item.id !== noteId)].slice(0, LIST_LIMIT),
  };
}

export function removePrivateNote(store: EmotionalStore, bucket: NoteBucket, id: string): EmotionalStore {
  return { ...store, [bucket]: store[bucket].filter((item) => item.id !== id) };
}

export function clearNoteBucket(store: EmotionalStore, bucket: NoteBucket): EmotionalStore {
  return { ...store, [bucket]: [] };
}

export function isEmptyEmotional(store: EmotionalStore): boolean {
  return (
    store.country === "unset" &&
    store.countryNote === "" &&
    store.context === "general" &&
    store.journal.length === 0 &&
    store.joys.length === 0 &&
    store.caregiverNotes.length === 0
  );
}

export function loadEmotionalStore(storage: Pick<Storage, "getItem"> | null, key = EMOTIONAL_STORAGE_KEY): EmotionalStore {
  if (!storage) return emptyEmotionalStore();
  try {
    return sanitizeEmotionalStore(JSON.parse(storage.getItem(key) ?? "null"));
  } catch {
    return emptyEmotionalStore();
  }
}

export function saveEmotionalStore(storage: Pick<Storage, "setItem"> | null, store: EmotionalStore, key = EMOTIONAL_STORAGE_KEY) {
  if (!storage) return;
  storage.setItem(key, JSON.stringify(sanitizeEmotionalStore(store)));
}

export function clearEmotionalStorage(storage: Pick<Storage, "removeItem"> | null, key = EMOTIONAL_STORAGE_KEY) {
  storage?.removeItem(key);
}
