import { isLocale, type Locale } from "@/lib/i18n/config";
import { msg } from "@/lib/i18n/translate";
import { CHALLENGE_LENGTH } from "./content";
import { confirmEmail, dayEmail } from "./email";
import type { Mailer } from "./mailer";
import type { ChallengeRepository } from "./repository";
import { localDate, nextDueDay, safeTimeZone } from "./schedule";
import { CONSENT_VERSION, type Signup } from "./types";

export type Result = { status: number; body: Record<string, unknown> };

const EMAIL = /^[^\s@<>()[\],;:"]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const TOKEN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Unconfirmed addresses are deleted after this long. */
export const PENDING_DAYS = 14;

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && EMAIL.test(email) ? email : null;
}

export function isToken(value: unknown): value is string {
  return typeof value === "string" && TOKEN.test(value);
}

/** The same answer whether or not the address was already signed up, so the form cannot tell who has joined. */
const CHECK_INBOX = { ok: true, state: "check-inbox" } as const;

export type JoinInput = {
  body: Record<string, unknown>;
  /** The signed-in member, when there is one. Their account address is used and needs no confirmation. */
  member: { id: string; email: string } | null;
  now: Date;
  newId: () => string;
};

export async function joinChallenge(input: JoinInput, repo: ChallengeRepository): Promise<Result> {
  const { body, member, now } = input;
  // A hidden field that people never see. A bot that fills it gets the normal answer and nothing is saved.
  if (typeof body.website === "string" && body.website.trim() !== "") return { status: 200, body: { ...CHECK_INBOX } };
  if (body.consent !== true) {
    return { status: 400, body: { error: msg("Tick the box to agree to the emails first."), field: "consent" } };
  }
  const email = member ? normalizeEmail(member.email) : normalizeEmail(body.email);
  if (!email) return { status: 400, body: { error: msg("Enter a valid email address."), field: "email" } };
  const locale: Locale = isLocale(body.locale) ? body.locale : "en";
  const timeZone = safeTimeZone(body.timeZone);

  const existing = member ? await repo.findByUser(member.id) : null;
  if (existing) return { status: 200, body: { ok: true, state: existing.status === "active" ? "joined" : "check-inbox" } };
  if (member) {
    // An earlier visitor sign-up with the same address is replaced by the member's own.
    const byEmail = await repo.findByEmail(email);
    if (byEmail) await repo.remove(byEmail.id);
  }

  const nowIso = now.toISOString();
  const signup: Signup = {
    id: input.newId(),
    email,
    userId: member?.id ?? null,
    locale,
    timeZone,
    consentVersion: CONSENT_VERSION,
    consentedAt: nowIso,
    status: member ? "active" : "pending",
    confirmToken: input.newId(),
    confirmSentAt: null,
    confirmedAt: member ? nowIso : null,
    unsubscribeToken: input.newId(),
    lastSentDay: 0,
    lastSentOn: null,
    createdAt: nowIso,
  };
  const inserted = await repo.insert(signup);
  if (member) return { status: 200, body: { ok: true, state: "joined" } };
  return { status: 200, body: { ...CHECK_INBOX, saved: inserted === "inserted" } };
}

export async function memberStatus(member: { id: string } | null, repo: ChallengeRepository): Promise<{ joined: boolean; daysSent: number } | null> {
  if (!member) return null;
  const row = await repo.findByUser(member.id);
  return row && row.status === "active" ? { joined: true, daysSent: row.lastSentDay } : { joined: false, daysSent: 0 };
}

/** A signed-in member leaves the challenge. The row is deleted. */
export async function memberLeave(member: { id: string }, repo: ChallengeRepository): Promise<Result> {
  const row = await repo.findByUser(member.id);
  if (row) await repo.remove(row.id);
  return { status: 200, body: { ok: true, state: "stopped" } };
}

export async function confirmByToken(token: unknown, repo: ChallengeRepository, now: Date): Promise<Result> {
  if (!isToken(token)) return { status: 400, body: { error: msg("This link is not complete. Open it again from the email.") } };
  const row = await repo.findByConfirmToken(token);
  if (!row) return { status: 404, body: { error: msg("This link has expired or was already used to stop the emails.") } };
  if (row.status !== "active") await repo.update(row.id, { status: "active", confirmedAt: now.toISOString() });
  return { status: 200, body: { ok: true, state: "joined" } };
}

/** Stops the emails and deletes the address. Answers the same for an unknown token, so links cannot be probed. */
export async function unsubscribeByToken(token: unknown, repo: ChallengeRepository): Promise<Result> {
  if (!isToken(token)) return { status: 400, body: { error: msg("This link is not complete. Open it again from the email.") } };
  const row = await repo.findByUnsubscribeToken(token);
  if (row) await repo.remove(row.id);
  return { status: 200, body: { ok: true, state: "stopped" } };
}

export type RunReport = {
  mode: "off" | "resend";
  confirmations: { due: number; sent: number; failed: number };
  days: { due: number; sent: number; failed: number };
  finished: number;
  expired: number;
};

/** The most rows one run looks at, so a run stays short. The next run picks up the rest. */
export const RUN_LIMIT = 200;

/**
 * One sending run, meant to be started on a schedule. When the mailer is off it
 * only counts what would be due and changes nothing. When it is on it claims
 * each row before sending (so two runs at once cannot double-send) and puts the
 * row back if the provider refuses the email.
 */
export async function runDailySend(repo: ChallengeRepository, mailer: Mailer, now: Date, origin?: string): Promise<RunReport> {
  const report: RunReport = {
    mode: mailer.mode,
    confirmations: { due: 0, sent: 0, failed: 0 },
    days: { due: 0, sent: 0, failed: 0 },
    finished: 0,
    expired: 0,
  };
  const live = mailer.mode !== "off";

  if (live) report.expired = await repo.removePendingBefore(new Date(now.getTime() - PENDING_DAYS * 86_400_000).toISOString());

  for (const row of await repo.listPending(RUN_LIMIT)) {
    report.confirmations.due += 1;
    if (!live) continue;
    const sentAt = now.toISOString();
    if (!(await repo.claim(row.id, { lastSentDay: row.lastSentDay, confirmSentAt: null }, { confirmSentAt: sentAt }))) continue;
    const result = await mailer.send(confirmEmail(row, origin));
    if (result.status === "sent") report.confirmations.sent += 1;
    else {
      report.confirmations.failed += 1;
      await repo.update(row.id, { confirmSentAt: null });
    }
  }

  for (const row of await repo.listActive(RUN_LIMIT)) {
    const today = localDate(now, row.timeZone);
    const day = nextDueDay({ lastSentDay: row.lastSentDay, lastSentOn: row.lastSentOn, today, length: CHALLENGE_LENGTH });
    if (day === null) continue;
    report.days.due += 1;
    if (!live) continue;
    const email = dayEmail(row, day, origin);
    if (!email) continue;
    const claimed = await repo.claim(row.id, { lastSentDay: row.lastSentDay, confirmSentAt: row.confirmSentAt }, { lastSentDay: day, lastSentOn: today });
    if (!claimed) continue;
    const result = await mailer.send(email);
    if (result.status !== "sent") {
      report.days.failed += 1;
      await repo.update(row.id, { lastSentDay: row.lastSentDay, lastSentOn: row.lastSentOn });
      continue;
    }
    report.days.sent += 1;
    if (day === CHALLENGE_LENGTH) {
      // The last day is out: nothing more will be sent, so the address is not kept.
      await repo.remove(row.id);
      report.finished += 1;
    }
  }
  return report;
}
