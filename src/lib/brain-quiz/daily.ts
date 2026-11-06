import type { Activity } from "@/lib/brain-quiz/activities";
import { activitiesFor, allActivities } from "@/lib/brain-quiz/catalog";
import { isRealISODate } from "@/lib/dates";

const EPOCH = Date.UTC(2026, 0, 1);

export function dayNumber(isoDate: string): number {
  if (!isRealISODate(isoDate)) return 0;
  const [year, month, day] = isoDate.split("-").map(Number);
  return Math.floor((Date.UTC(year ?? 2026, (month ?? 1) - 1, day ?? 1) - EPOCH) / 86400000);
}

function mod(value: number, length: number): number {
  if (length <= 0) return 0;
  return ((value % length) + length) % length;
}

function at<T>(items: readonly T[], index: number): T {
  return items[mod(index, items.length)] as T;
}

const logicPool = allActivities.filter((item) => item.category === "logic");
const memoryPool = activitiesFor("memory");
const rebusPool = allActivities.filter((item) => item.kind === "rebus");
const wordPool = allActivities.filter((item) => item.category === "words" && (item.kind === "choice" || item.kind === "letters" || item.kind === "acrostic"));
const numberPool = allActivities.filter((item) => item.category === "numbers");
const habitPool = allActivities.filter((item) => item.category === "habits");

export type DailyRound = { date: string; items: Activity[] };

export function dailyRound(date: string): DailyRound {
  const n = dayNumber(date);
  const mixed = n % 2 === 0 ? at(wordPool, Math.floor(n / 2) * 3 + 1) : at(numberPool, Math.floor(n / 2) * 3 + 2);
  return {
    date,
    items: [at(logicPool, n), at(memoryPool, n * 3 + 1), at(rebusPool, n * 5 + 2), mixed, at(habitPool, n * 7 + 4)],
  };
}

export function featuredRebus(date: string): Activity {
  return at(rebusPool, dayNumber(date) * 11 + 3);
}

export function dailyPools() {
  return { logicPool, memoryPool, rebusPool, wordPool, numberPool, habitPool };
}
