import { daysInMonth, monthLabel, monthPrefix } from "@/lib/dates";
import type { CheckIn, HabitGoal } from "@/lib/user-data";

export type WeekRow = {
  label: string;
  done: number;
  partial: number;
  skipped: number;
};

export type MonthSummary = {
  label: string;
  done: number;
  partial: number;
  skipped: number;
  weeks: WeekRow[];
  hasRecords: boolean;
};

export function summarizeMonth(checkIns: CheckIn[], year: number, monthIndex: number): MonthSummary {
  const prefix = monthPrefix(year, monthIndex);
  const inMonth = checkIns.filter((item) => item.date.startsWith(prefix));
  const dayCount = daysInMonth(year, monthIndex);
  const bucketCount = Math.ceil(dayCount / 7);
  const weeks: WeekRow[] = Array.from({ length: bucketCount }, (_, index) => {
    const start = index * 7 + 1;
    const end = Math.min(dayCount, start + 6);
    return { label: `Days ${start}–${end}`, done: 0, partial: 0, skipped: 0 };
  });
  for (const item of inMonth) {
    const day = Number(item.date.slice(8, 10));
    const bucket = weeks[Math.floor((day - 1) / 7)];
    if (!bucket) continue;
    bucket[item.status] += 1;
  }
  return {
    label: monthLabel(year, monthIndex),
    done: inMonth.filter((item) => item.status === "done").length,
    partial: inMonth.filter((item) => item.status === "partial").length,
    skipped: inMonth.filter((item) => item.status === "skipped").length,
    weeks,
    hasRecords: inMonth.length > 0,
  };
}

export function supportiveNote(summary: MonthSummary): string {
  if (!summary.hasRecords) {
    return `Nothing is recorded for ${summary.label} yet. A single honest check-in is enough to begin.`;
  }
  if (summary.done === 0 && summary.partial === 0) {
    return `You marked days in ${summary.label} as not done. That is useful information, and it is not a verdict on you.`;
  }
  const doneLabel = summary.done === 1 ? "1 done check-in" : `${summary.done} done check-ins`;
  return `${doneLabel} in ${summary.label}. Any record you keep is enough to learn from. Skipped days are not a failure.`;
}

export function activeGoals(goals: HabitGoal[]): HabitGoal[] {
  return goals.filter((goal) => goal.archivedAt === null);
}
