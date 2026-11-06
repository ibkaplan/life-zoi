/** Shared moderation policy. These limits are local. Provider rate limits are documented in provider.ts. */

export const MODERATION_RETENTION_DAYS = 30;
export const REPEAT_WINDOW_DAYS = 7;
export const REPEAT_LIMIT = 3;
export const RESTRICTION_HOURS = 72;
export const MEMBER_PROVIDER_CALLS_PER_HOUR = 8;
export const MEMBER_SUBMITS_PER_HOUR = 20;
export const DUPLICATE_WINDOW_MINUTES = 15;
export const PROVIDER_TIMEOUT_MS = 8_000;
export const MAX_BODY_LENGTH = 1_000;
export const MIN_QUOTATION_CONTEXT_WORDS = 6;

/** Confirmed abuse can lead to a temporary limit after repeats. One uncertain result cannot. */
export const REPEAT_CATEGORIES = new Set([
  "profanity",
  "insult",
  "harassment",
  "hate",
  "threat",
  "violence",
  "sexual",
  "illicit",
  "spam",
]);

export const REPORT_REASONS = ["harassment", "hate", "spam", "other"] as const;

export function retentionCutoff(now: number): number {
  return now - MODERATION_RETENTION_DAYS * 24 * 60 * 60 * 1000;
}
