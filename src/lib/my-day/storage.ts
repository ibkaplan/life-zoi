import { isRealISODate } from "@/lib/dates";
import {
  ITEM_IDS,
  SUGGESTED_TIMES,
  type DayRecord,
  type ItemId,
  type ItemState,
  type ItemStatus,
} from "@/lib/my-day/plan";

export const MY_DAY_STORAGE_KEY = "lifezoi.my-day.v1";

const NOTE_LIMIT = 280;
const DAY_LIMIT = 14;

export type MyDayFile = {
  savedTimes: Partial<Record<ItemId, string>>;
  ayurvedaHidden: boolean;
  days: Record<string, DayRecord>;
};

type MemoryStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export function isClockTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function emptyMyDay(): MyDayFile {
  return { savedTimes: {}, ayurvedaHidden: false, days: {} };
}

function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, NOTE_LIMIT);
}

function cleanStatus(value: unknown): ItemStatus {
  return value === "done" || value === "skipped" ? value : "open";
}

function cleanVariant(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 20) return 0;
  return value;
}

function blankItem(id: ItemId, saved: Partial<Record<ItemId, string>>): ItemState {
  return {
    status: "open",
    note: "",
    variant: 0,
    shorter: false,
    time: saved[id] && isClockTime(saved[id]) ? saved[id] : SUGGESTED_TIMES[id],
  };
}

export function freshDay(date: string, saved: Partial<Record<ItemId, string>>): DayRecord {
  const items = {} as Record<ItemId, ItemState>;
  for (const id of ITEM_IDS) items[id] = blankItem(id, saved);
  return { date, items };
}

function cleanItem(id: ItemId, value: unknown, savedTime: string | undefined): ItemState {
  const row = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const time = typeof row.time === "string" && isClockTime(row.time) ? row.time : savedTime && isClockTime(savedTime) ? savedTime : SUGGESTED_TIMES[id];
  return {
    status: cleanStatus(row.status),
    note: cleanText(row.note),
    variant: cleanVariant(row.variant),
    shorter: row.shorter === true,
    time,
  };
}

export function sanitizeMyDay(input: unknown): MyDayFile {
  const file = emptyMyDay();
  const row = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  file.ayurvedaHidden = row.ayurvedaHidden === true;
  const saved = row.savedTimes && typeof row.savedTimes === "object" ? (row.savedTimes as Record<string, unknown>) : {};
  for (const id of ITEM_IDS) {
    const time = saved[id];
    if (typeof time === "string" && isClockTime(time) && time !== SUGGESTED_TIMES[id]) file.savedTimes[id] = time;
  }
  const days = row.days && typeof row.days === "object" ? (row.days as Record<string, unknown>) : {};
  const dates = Object.keys(days).filter(isRealISODate).sort().slice(-DAY_LIMIT);
  for (const date of dates) {
    const day = days[date] && typeof days[date] === "object" ? (days[date] as Record<string, unknown>) : {};
    const rawItems = day.items && typeof day.items === "object" ? (day.items as Record<string, unknown>) : {};
    const items = {} as Record<ItemId, ItemState>;
    for (const id of ITEM_IDS) items[id] = cleanItem(id, rawItems[id], file.savedTimes[id]);
    file.days[date] = { date, items };
  }
  return file;
}

export function loadMyDay(storage: MemoryStorage | null): MyDayFile {
  if (!storage) return emptyMyDay();
  try {
    const raw = storage.getItem(MY_DAY_STORAGE_KEY);
    if (!raw) return emptyMyDay();
    return sanitizeMyDay(JSON.parse(raw) as unknown);
  } catch {
    return emptyMyDay();
  }
}

export function saveMyDay(storage: MemoryStorage | null, file: MyDayFile) {
  storage?.setItem(MY_DAY_STORAGE_KEY, JSON.stringify(sanitizeMyDay(file)));
}

export function ensureToday(file: MyDayFile, today: string): MyDayFile {
  if (!isRealISODate(today)) return file;
  if (file.days[today]) return file;
  const days = { ...file.days, [today]: freshDay(today, file.savedTimes) };
  const dates = Object.keys(days).sort();
  if (dates.length > DAY_LIMIT) {
    for (const date of dates.slice(0, dates.length - DAY_LIMIT)) {
      if (date !== today) delete days[date];
    }
  }
  return { ...file, days };
}

function withItem(file: MyDayFile, date: string, id: ItemId, patch: Partial<ItemState>, savedTimes = file.savedTimes): MyDayFile {
  const day = file.days[date];
  if (!day) return file;
  return {
    ...file,
    savedTimes,
    days: {
      ...file.days,
      [date]: { ...day, items: { ...day.items, [id]: { ...day.items[id], ...patch } } },
    },
  };
}

export function setItemStatus(file: MyDayFile, date: string, id: ItemId, status: ItemStatus): MyDayFile {
  return withItem(file, date, id, { status });
}

export function setItemNote(file: MyDayFile, date: string, id: ItemId, note: string): MyDayFile {
  return withItem(file, date, id, { note: cleanText(note) });
}

export function cycleItem(file: MyDayFile, date: string, id: ItemId): MyDayFile {
  const current = file.days[date]?.items[id];
  if (!current) return file;
  return withItem(file, date, id, { variant: current.variant >= 20 ? 0 : current.variant + 1 });
}

export function toggleShorter(file: MyDayFile, date: string, id: ItemId): MyDayFile {
  const current = file.days[date]?.items[id];
  if (!current) return file;
  return withItem(file, date, id, { shorter: !current.shorter });
}

export function setItemTime(file: MyDayFile, date: string, id: ItemId, time: string): MyDayFile {
  if (!file.days[date]) return file;
  if (!time.trim()) {
    const savedTimes = { ...file.savedTimes };
    delete savedTimes[id];
    return withItem(file, date, id, { time: SUGGESTED_TIMES[id] }, savedTimes);
  }
  if (!isClockTime(time)) return file;
  if (time === SUGGESTED_TIMES[id]) {
    const savedTimes = { ...file.savedTimes };
    delete savedTimes[id];
    return withItem(file, date, id, { time }, savedTimes);
  }
  return withItem(file, date, id, { time }, { ...file.savedTimes, [id]: time });
}

export function setAyurvedaHidden(file: MyDayFile, hidden: boolean): MyDayFile {
  return { ...file, ayurvedaHidden: hidden };
}
