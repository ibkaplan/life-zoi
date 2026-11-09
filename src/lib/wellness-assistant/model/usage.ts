export const WELLNESS_LIMITS = {
  requestsPerMinute: 4,
  sessionDaily: 12,
  processDaily: 40,
} as const;

type SessionBucket = {
  day: string;
  daily: number;
  minuteStart: number;
  minuteCount: number;
};

type Memory = {
  processDay: string;
  processCount: number;
  sessions: Map<string, SessionBucket>;
};

let memory: Memory = emptyMemory(new Date());

function dayKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function emptyMemory(now: Date): Memory {
  return { processDay: dayKey(now), processCount: 0, sessions: new Map() };
}

export function resetWellnessUsageForTests() {
  memory = emptyMemory(new Date());
}

function sessionBucket(key: string, now: Date): SessionBucket {
  const day = dayKey(now);
  const existing = memory.sessions.get(key);
  if (!existing || existing.day !== day) {
    const created: SessionBucket = { day, daily: 0, minuteStart: now.getTime(), minuteCount: 0 };
    memory.sessions.set(key, created);
    return created;
  }
  return existing;
}

function trimSessions() {
  if (memory.sessions.size <= 500) return;
  const keys = [...memory.sessions.keys()];
  for (const key of keys.slice(0, memory.sessions.size - 400)) memory.sessions.delete(key);
}

export function authorizeWellnessUse(
  meterKey: string,
  now = new Date(),
): { ok: true } | { ok: false; message: string } {
  const day = dayKey(now);
  if (memory.processDay !== day) {
    memory.processDay = day;
    memory.processCount = 0;
  }
  if (memory.processCount >= WELLNESS_LIMITS.processDaily) {
    return {
      ok: false,
      message: "The free wellness model has reached its limit for now. Here is a prepared answer instead.",
    };
  }
  const usage = sessionBucket(meterKey, now);
  if (now.getTime() - usage.minuteStart >= 60_000) {
    usage.minuteStart = now.getTime();
    usage.minuteCount = 0;
  }
  if (usage.minuteCount >= WELLNESS_LIMITS.requestsPerMinute || usage.daily >= WELLNESS_LIMITS.sessionDaily) {
    return {
      ok: false,
      message: "The free wellness model has reached its limit for now. Here is a prepared answer instead.",
    };
  }
  return { ok: true };
}

export function recordWellnessUse(meterKey: string, now = new Date()) {
  const day = dayKey(now);
  if (memory.processDay !== day) {
    memory.processDay = day;
    memory.processCount = 0;
  }
  memory.processCount += 1;
  const usage = sessionBucket(meterKey, now);
  usage.daily += 1;
  usage.minuteCount += 1;
  trimSessions();
  return {
    sessionUsed: usage.daily,
    sessionDailyLimit: WELLNESS_LIMITS.sessionDaily,
    processUsed: memory.processCount,
    processDailyLimit: WELLNESS_LIMITS.processDaily,
  };
}
