import { monthKey } from "@/lib/dates";
import type { LifeHabit, UrgeEntry, WellnessLog } from "@/lib/wellness/types";

export type HabitCatalogItem = {
  slug: string;
  title: string;
  detail: string;
};

export const LIFE_HABITS: HabitCatalogItem[] = [
  {
    slug: "water",
    title: "Water when thirsty",
    detail:
      "If you are thirsty and a clinician has not limited your fluids, drink some water. Water is not a meal. There is no amount you must finish.",
  },
  {
    slug: "walk",
    title: "A short walk or chair move",
    detail: "A few minutes of walking, or a seated movement if walking is not available today.",
  },
  {
    slug: "evening-sweets",
    title: "Evening sweets, on purpose",
    detail: "If you want something sweet, use a plate. If you are hungry, eat. A sweet can still be part of the evening.",
  },
  {
    slug: "vegetables",
    title: "A vegetable you like",
    detail: "Add one vegetable you already tolerate. Fresh, frozen, and canned all count.",
  },
  {
    slug: "sleep",
    title: "A sleep cue",
    detail: "Keep one small cue before bed, such as a quieter room or a steady wake time you can manage.",
  },
  {
    slug: "fiber",
    title: "A little more fiber",
    detail: "Add fiber slowly and drink the fluids you are allowed. A fluid restriction comes first.",
  },
  {
    slug: "strength",
    title: "One strength move",
    detail: "A slow chair stand or a palm press, only if it feels safe. Stop if it hurts.",
  },
  {
    slug: "balance",
    title: "One balance step",
    detail: "Hold a counter, or stay seated and circle your ankles.",
  },
  {
    slug: "smoking",
    title: "One smoking urge, handled kindly",
    detail: "For one urge, delay if it is safe, change the cue, or open a free public quit page. No shame if you smoke.",
  },
  {
    slug: "alcohol",
    title: "One alcohol choice",
    detail: "For one occasion, choose a smaller amount, a nonalcoholic drink, or skip it. This is not a prescription.",
  },
  {
    slug: "sitting",
    title: "A break from sitting",
    detail: "Stand, stretch, or shift position once. A seated break counts if standing is hard.",
  },
  {
    slug: "relaxation",
    title: "A few quiet minutes",
    detail: "Breathing, rest, or a calm activity. Stop if it feels upsetting. This is not mental health treatment.",
  },
];

export const MANAGEABLE_HABIT_COUNT = 3;

export function weekDates(iso: string): string[] {
  const [year, month, day] = iso.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  const weekday = utc.getUTCDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const monday = new Date(utc);
  monday.setUTCDate(utc.getUTCDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

export function marksFor(log: WellnessLog, slug: string, dates: readonly string[]) {
  return log.habitMarks.filter((mark) => mark.slug === slug && dates.includes(mark.date));
}

export type HabitSnapshot = {
  habit: LifeHabit;
  count: number;
  met: boolean;
};

export function habitSnapshots(log: WellnessLog, today: string): HabitSnapshot[] {
  const week = weekDates(today);
  return log.habits.map((habit) => {
    const dates = habit.cadence === "daily" ? [today] : week;
    const count = marksFor(log, habit.slug, dates).length;
    return { habit, count, met: count >= habit.target };
  });
}

export function combinedProgress(log: WellnessLog, today: string) {
  const active = habitSnapshots(log, today).filter((item) => !item.habit.paused);
  const met = active.filter((item) => item.met).length;
  return { active: active.length, met, paused: log.habits.length - active.length };
}

export function periodCounts(log: WellnessLog, today: string) {
  const week = new Set(weekDates(today));
  const month = monthKey(today);
  const weekMarks = log.habitMarks.filter((mark) => week.has(mark.date)).length;
  const monthMarks = log.habitMarks.filter((mark) => mark.date.startsWith(month)).length;
  const weekDays = weekDates(today).map((date) => ({
    date,
    count: log.habitMarks.filter((mark) => mark.date === date).length,
  }));
  return { weekMarks, monthMarks, weekDays };
}

export function urgePattern(entries: UrgeEntry[]) {
  const byFactor = new Map<string, number>();
  const byChoice = new Map<string, number>();
  let intensity = 0;
  for (const entry of entries) {
    intensity += entry.intensity;
    for (const factor of entry.factors) byFactor.set(factor, (byFactor.get(factor) ?? 0) + 1);
    if (entry.choice) byChoice.set(entry.choice, (byChoice.get(entry.choice) ?? 0) + 1);
  }
  return {
    total: entries.length,
    meanIntensity: entries.length === 0 ? 0 : Math.round((intensity / entries.length) * 10) / 10,
    byFactor: [...byFactor.entries()].map(([label, value]) => ({ label, value })),
    byChoice: [...byChoice.entries()].map(([label, value]) => ({ label, value })),
  };
}

export function removeHabitKeepHistory(log: WellnessLog, id: string): WellnessLog {
  return { ...log, habits: log.habits.filter((habit) => habit.id !== id) };
}
