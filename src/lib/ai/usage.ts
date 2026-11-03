import type { AiPlan } from "@/lib/ai/plans";

export type UsageSnapshot = {
  dailyUsed: number;
  dailyLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
  estimatedCostCents: number;
  monthlyBudgetCents: number;
  spendingAlert: string | null;
};

type SubscriberUsage = {
  day: string;
  month: string;
  daily: number;
  monthly: number;
  minuteStart: number;
  minuteCount: number;
  estimatedCostCents: number;
  lastSeen: number;
};

type Memory = {
  processDay: string;
  processCount: number;
  subscribers: Map<string, SubscriberUsage>;
};

const PROCESS_DAILY_LIMIT = 80;
const SPENDING_ALERT =
  "Estimated development cost is near this plan's planning budget. This is not a charge, and no payment service is connected.";
const SPENDING_BLOCKED =
  "The planning budget for this development session is used up. No charge was made. Paid AI is not connected.";

let memory: Memory = emptyMemory(new Date());

function dayKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function monthKey(now: Date): string {
  return now.toISOString().slice(0, 7);
}

function emptyMemory(now: Date): Memory {
  return { processDay: dayKey(now), processCount: 0, subscribers: new Map() };
}

export function resetAiUsageForTests() {
  memory = emptyMemory(new Date());
}

function subscriberUsage(key: string, now: Date): SubscriberUsage {
  const day = dayKey(now);
  const month = monthKey(now);
  const existing = memory.subscribers.get(key);
  if (!existing || existing.month !== month) {
    const created: SubscriberUsage = {
      day,
      month,
      daily: 0,
      monthly: 0,
      minuteStart: now.getTime(),
      minuteCount: 0,
      estimatedCostCents: 0,
      lastSeen: now.getTime(),
    };
    memory.subscribers.set(key, created);
    return created;
  }
  if (existing.day !== day) {
    existing.day = day;
    existing.daily = 0;
    existing.minuteStart = now.getTime();
    existing.minuteCount = 0;
  }
  return existing;
}

function trimSubscribers() {
  if (memory.subscribers.size <= 500) return;
  const oldest = [...memory.subscribers.entries()].sort((a, b) => a[1].lastSeen - b[1].lastSeen);
  for (const [key] of oldest.slice(0, memory.subscribers.size - 400)) {
    memory.subscribers.delete(key);
  }
}

export function snapshotUsage(usage: SubscriberUsage, plan: AiPlan): UsageSnapshot {
  const ratio = plan.monthlyBudgetCents === 0 ? 1 : usage.estimatedCostCents / plan.monthlyBudgetCents;
  return {
    dailyUsed: usage.daily,
    dailyLimit: plan.dailyRequests,
    monthlyUsed: usage.monthly,
    monthlyLimit: plan.monthlyRequests,
    estimatedCostCents: usage.estimatedCostCents,
    monthlyBudgetCents: plan.monthlyBudgetCents,
    spendingAlert: ratio >= 0.8 && ratio < 1 ? SPENDING_ALERT : null,
  };
}

export function authorizeAiUse(
  subscriberKey: string,
  plan: AiPlan,
  projectedCents: number,
  now = new Date(),
): { ok: true; snapshot: UsageSnapshot } | { ok: false; status: 429; error: string } {
  const day = dayKey(now);
  if (memory.processDay !== day) {
    memory.processDay = day;
    memory.processCount = 0;
  }
  if (memory.processCount >= PROCESS_DAILY_LIMIT) {
    return {
      ok: false,
      status: 429,
      error: "The development server has reached its daily request limit. No paid AI service was contacted.",
    };
  }
  const usage = subscriberUsage(subscriberKey, now);
  const elapsed = now.getTime() - usage.minuteStart;
  if (elapsed >= 60_000) {
    usage.minuteStart = now.getTime();
    usage.minuteCount = 0;
  }
  if (usage.minuteCount >= plan.requestsPerMinute) {
    return {
      ok: false,
      status: 429,
      error: "Too many requests just now. Wait a minute and try again. No paid AI service was contacted.",
    };
  }
  if (usage.daily >= plan.dailyRequests) {
    return {
      ok: false,
      status: 429,
      error: "The daily development limit for this session is reached. No charge was made.",
    };
  }
  if (usage.monthly >= plan.monthlyRequests) {
    return {
      ok: false,
      status: 429,
      error: "The monthly development limit for this session is reached. No charge was made.",
    };
  }
  if (usage.estimatedCostCents + projectedCents > plan.monthlyBudgetCents) {
    return { ok: false, status: 429, error: SPENDING_BLOCKED };
  }
  return { ok: true, snapshot: snapshotUsage(usage, plan) };
}

export function recordAiUse(
  subscriberKey: string,
  plan: AiPlan,
  estimatedCostCents: number,
  now = new Date(),
): UsageSnapshot {
  const day = dayKey(now);
  if (memory.processDay !== day) {
    memory.processDay = day;
    memory.processCount = 0;
  }
  memory.processCount += 1;
  const usage = subscriberUsage(subscriberKey, now);
  usage.daily += 1;
  usage.monthly += 1;
  usage.minuteCount += 1;
  usage.estimatedCostCents = Math.round((usage.estimatedCostCents + estimatedCostCents) * 1000) / 1000;
  usage.lastSeen = now.getTime();
  trimSubscribers();
  const snapshot = snapshotUsage(usage, plan);
  if (usage.estimatedCostCents >= plan.monthlyBudgetCents) snapshot.spendingAlert = SPENDING_BLOCKED;
  return snapshot;
}
