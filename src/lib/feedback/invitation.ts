import { INVITE_AFTER_DAYS, INVITE_AFTER_VISIT_DAYS, INVITE_MAX_DISMISSALS, INVITE_SNOOZE_DAYS } from "@/lib/feedback/policy";

/**
 * When to show the review invitation. Saved in this browser only: a few dates
 * and a count, never an answer or anything about health.
 */
export const INVITE_STORAGE_KEY = "lifezoi.feedback-invite.v1";

export type InviteRecord = {
  firstSeen: string;
  visitDays: string[];
  snoozedUntil: string | null;
  dismissals: number;
  sent: boolean;
};

const DAY = 24 * 60 * 60 * 1000;

export function blankInvite(now: Date): InviteRecord {
  return { firstSeen: now.toISOString(), visitDays: [], snoozedUntil: null, dismissals: 0, sent: false };
}

export function parseInvite(raw: string | null, now: Date): InviteRecord {
  if (!raw) return blankInvite(now);
  try {
    const value = JSON.parse(raw) as Partial<InviteRecord>;
    return {
      firstSeen: typeof value.firstSeen === "string" ? value.firstSeen : now.toISOString(),
      visitDays: Array.isArray(value.visitDays) ? value.visitDays.filter((day) => typeof day === "string").slice(-10) : [],
      snoozedUntil: typeof value.snoozedUntil === "string" ? value.snoozedUntil : null,
      dismissals: typeof value.dismissals === "number" ? value.dismissals : 0,
      sent: value.sent === true,
    };
  } catch {
    return blankInvite(now);
  }
}

/** Records today's visit. */
export function noteVisit(record: InviteRecord, now: Date): InviteRecord {
  const day = now.toISOString().slice(0, 10);
  if (record.visitDays.includes(day)) return record;
  return { ...record, visitDays: [...record.visitDays, day].slice(-10) };
}

/**
 * Shown only after the member has used LifeZoi on several days, never again after
 * a review, and at most twice in all, a month apart.
 */
export function shouldInvite(record: InviteRecord, now: Date, hasReview: boolean): boolean {
  if (hasReview || record.sent || record.dismissals >= INVITE_MAX_DISMISSALS) return false;
  if (record.snoozedUntil && Date.parse(record.snoozedUntil) > now.getTime()) return false;
  if (now.getTime() - Date.parse(record.firstSeen) < INVITE_AFTER_DAYS * DAY) return false;
  return record.visitDays.length >= INVITE_AFTER_VISIT_DAYS;
}

export function snooze(record: InviteRecord, now: Date): InviteRecord {
  return { ...record, dismissals: record.dismissals + 1, snoozedUntil: new Date(now.getTime() + INVITE_SNOOZE_DAYS * DAY).toISOString() };
}

export function readInvite(now: Date): InviteRecord {
  try {
    return parseInvite(window.localStorage.getItem(INVITE_STORAGE_KEY), now);
  } catch {
    return blankInvite(now);
  }
}

export function writeInvite(record: InviteRecord) {
  try {
    window.localStorage.setItem(INVITE_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Private windows can refuse storage. The invitation then simply does not repeat its timing.
  }
}

export function markReviewSent() {
  const now = new Date();
  writeInvite({ ...readInvite(now), sent: true });
}
