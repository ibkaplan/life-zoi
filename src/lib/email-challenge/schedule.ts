/** Dates for the challenge, always in the person's own time zone. */

const FALLBACK_ZONE = "UTC";

/** A time zone name the server understands, or UTC. */
export function safeTimeZone(value: unknown): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 64 || !/^[A-Za-z0-9_+\-/]+$/.test(value)) return FALLBACK_ZONE;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return value;
  } catch {
    return FALLBACK_ZONE;
  }
}

/** "2026-11-25" for `now` in that time zone. */
export function localDate(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: safeTimeZone(timeZone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Whole days from `from` to `to`, both "YYYY-MM-DD". */
export function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86_400_000);
}

/**
 * The next email for an active signup, or null when nothing is due.
 * One email per local calendar day, in order: a missed run never skips a day
 * and never sends two on the same day.
 */
export function nextDueDay(input: { lastSentDay: number; lastSentOn: string | null; today: string; length: number }): number | null {
  const next = input.lastSentDay + 1;
  if (next > input.length) return null;
  if (input.lastSentOn && input.lastSentOn >= input.today) return null;
  return next;
}
