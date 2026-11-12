import type { Member } from "@/lib/auth/session";
import { isEmailAddress } from "@/lib/password-recovery";
import { isInviteToken } from "@/lib/share-care";

/**
 * Invitation-only registration. Nobody can create an account from the browser.
 * The server records an invitation for one email address and asks Supabase to
 * send that address an invite link. The database refuses any new login whose
 * email has no valid, unused invitation (see supabase/schema.sql).
 */

export const INVITE_RULES = {
  /** An administrator's invitation must be used within this many days. */
  adminDays: 7,
  /** An email entered on a Share the Care link must be used within this many hours. */
  shareCareHours: 48,
  /** Registrations allowed per Share the Care link unless the row says otherwise. */
  perLinkDefault: 3,
  /** Unused, expired invitations are deleted after this many days. */
  purgeAfterDays: 30,
  /** Registration attempts per network address per hour. */
  perAddressPerHour: 5,
  /** Registration attempts per Share the Care link per hour. */
  perLinkPerHour: 6,
} as const;

export type InviteSource = "admin" | "share_care";

export type InviteRecord = {
  id: string;
  email: string;
  source: InviteSource;
  createdAt: string;
  expiresAt: string;
  /** Set when the login was created, which happens when the invite email is sent. */
  usedAt: string | null;
  revokedAt: string | null;
  /** True once the person opened the link and their email is confirmed. */
  joined: boolean;
};

export type CareLink = {
  token: string;
  userId: string;
  revokedAt: string | null;
  expiresAt: string | null;
  maxRegistrations: number;
};

export type SendResult = "sent" | "exists" | "failed";

export type InviteStore = {
  findCareLink: (token: string) => Promise<CareLink | null>;
  /** Invitations recorded for this link that were not revoked. */
  countLinkInvites: (token: string) => Promise<number>;
  hasOpenInvite: (email: string, now: Date) => Promise<boolean>;
  insertInvite: (row: {
    email: string;
    source: InviteSource;
    invitedBy: string | null;
    careToken: string | null;
    expiresAt: string;
  }) => Promise<string | null>;
  deleteInvite: (id: string) => Promise<void>;
  sendInviteEmail: (email: string, redirectTo: string) => Promise<SendResult>;
  listInvites: (limit: number) => Promise<InviteRecord[]>;
  revokeInvite: (id: string, now: Date) => Promise<boolean>;
  purgeExpired: (before: Date) => Promise<void>;
};

export type InviteDeps = {
  store: InviteStore | null;
  now?: Date;
  limiter?: Limiter;
};

export type HandlerResult = { status: number; body: Record<string, unknown> };

export type Limiter = { take: (key: string, perHour: number, now: Date) => boolean };

/** A small per-instance limiter. A host with several instances gets one per instance. */
export function createLimiter(): Limiter {
  const hits = new Map<string, number[]>();
  return {
    take(key, perHour, now) {
      const since = now.getTime() - 60 * 60 * 1000;
      const recent = (hits.get(key) ?? []).filter((time) => time > since);
      if (recent.length >= perHour) {
        hits.set(key, recent);
        return false;
      }
      recent.push(now.getTime());
      hits.set(key, recent);
      if (hits.size > 2000) {
        for (const stale of [...hits.keys()].slice(0, 500)) hits.delete(stale);
      }
      return true;
    },
  };
}

const defaultLimiter = createLimiter();

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return isEmailAddress(email) ? email : null;
}

/** The page the invite email opens. Supabase only follows it if the site is in its redirect list. */
export function acceptInviteUrl(origin: string): string | null {
  try {
    const parsed = new URL(origin);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return `${parsed.origin}/accept-invite`;
  } catch {
    return null;
  }
}

const NOT_SET_UP: HandlerResult = {
  status: 503,
  body: { code: "not-set-up", error: "Invitations are not set up on this server yet." },
};

function addHours(now: Date, hours: number): string {
  return new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
}

/**
 * Someone opened a member's Share the Care link and typed their email.
 * The answer is the same whether or not that email already has an account.
 */
export async function registerFromCareLink(
  input: { token: unknown; email: unknown; origin: string; address: string },
  deps: InviteDeps,
): Promise<HandlerResult> {
  const now = deps.now ?? new Date();
  const limiter = deps.limiter ?? defaultLimiter;
  const token = typeof input.token === "string" ? input.token.trim() : "";
  if (!isInviteToken(token)) return { status: 400, body: { code: "no-link", error: "This page needs a valid invitation link." } };
  const email = normalizeEmail(input.email);
  if (!email) return { status: 400, body: { code: "email", error: "Enter a valid email address." } };
  const redirectTo = acceptInviteUrl(input.origin);
  if (!redirectTo) return { status: 400, body: { code: "failed", error: "The invitation could not be prepared." } };
  if (!deps.store) return NOT_SET_UP;
  if (
    !limiter.take(`address:${input.address}`, INVITE_RULES.perAddressPerHour, now) ||
    !limiter.take(`link:${token}`, INVITE_RULES.perLinkPerHour, now)
  ) {
    return { status: 429, body: { code: "busy", error: "Too many attempts. Try again in an hour." } };
  }
  const store = deps.store;
  try {
    await store.purgeExpired(new Date(now.getTime() - INVITE_RULES.purgeAfterDays * 24 * 60 * 60 * 1000));
    const link = await store.findCareLink(token);
    const linkExpired = link?.expiresAt ? Date.parse(link.expiresAt) <= now.getTime() : false;
    if (!link || link.revokedAt || linkExpired) {
      return { status: 410, body: { code: "inactive", error: "This invitation link is no longer active." } };
    }
    if ((await store.countLinkInvites(token)) >= link.maxRegistrations) {
      return { status: 410, body: { code: "full", error: "This invitation link has reached its limit." } };
    }
    const sent = { status: 200, body: { code: "sent" } };
    if (await store.hasOpenInvite(email, now)) return sent;
    const id = await store.insertInvite({
      email,
      source: "share_care",
      invitedBy: link.userId,
      careToken: token,
      expiresAt: addHours(now, INVITE_RULES.shareCareHours),
    });
    if (!id) return { status: 502, body: { code: "failed", error: "The invitation email could not be sent." } };
    const result = await store.sendInviteEmail(email, redirectTo);
    if (result === "sent") return sent;
    await store.deleteInvite(id);
    // An existing account gets the same answer, so the form cannot reveal who is a member.
    if (result === "exists") return sent;
    return { status: 502, body: { code: "failed", error: "The invitation email could not be sent." } };
  } catch {
    return { status: 502, body: { code: "failed", error: "The invitation email could not be sent." } };
  }
}

/** The administrator invites one email address. */
export async function inviteByAdmin(
  input: { actor: Member; email: unknown; origin: string },
  deps: InviteDeps,
): Promise<HandlerResult> {
  const now = deps.now ?? new Date();
  if (!input.actor.isAdmin) return { status: 403, body: { code: "admin-only", error: "This is available to the administrator only." } };
  const email = normalizeEmail(input.email);
  if (!email) return { status: 400, body: { code: "email", error: "Enter a valid email address." } };
  const redirectTo = acceptInviteUrl(input.origin);
  if (!redirectTo) return { status: 400, body: { code: "failed", error: "The invitation could not be prepared." } };
  if (!deps.store) return NOT_SET_UP;
  const store = deps.store;
  try {
    if (await store.hasOpenInvite(email, now)) {
      // Send the email again for the invitation that is already open.
      const again = await store.sendInviteEmail(email, redirectTo);
      if (again === "sent") return { status: 200, body: { code: "sent" } };
      if (again === "exists") return { status: 409, body: { code: "exists", error: "That email already has an account." } };
      return { status: 502, body: { code: "failed", error: "The invitation could not be sent." } };
    }
    const id = await store.insertInvite({
      email,
      source: "admin",
      invitedBy: input.actor.id,
      careToken: null,
      expiresAt: addHours(now, INVITE_RULES.adminDays * 24),
    });
    if (!id) return { status: 502, body: { code: "failed", error: "The invitation could not be sent." } };
    const result = await store.sendInviteEmail(email, redirectTo);
    if (result === "sent") return { status: 200, body: { code: "sent" } };
    await store.deleteInvite(id);
    if (result === "exists") return { status: 409, body: { code: "exists", error: "That email already has an account." } };
    return { status: 502, body: { code: "failed", error: "The invitation could not be sent." } };
  } catch {
    return { status: 502, body: { code: "failed", error: "The invitation could not be sent." } };
  }
}

export async function listForAdmin(actor: Member, deps: InviteDeps): Promise<HandlerResult> {
  if (!actor.isAdmin) return { status: 403, body: { code: "admin-only", error: "This is available to the administrator only." } };
  if (!deps.store) return NOT_SET_UP;
  const now = deps.now ?? new Date();
  try {
    await deps.store.purgeExpired(new Date(now.getTime() - INVITE_RULES.purgeAfterDays * 24 * 60 * 60 * 1000));
    const invites = (await deps.store.listInvites(100)).map((invite) => ({
      ...invite,
      expired: Date.parse(invite.expiresAt) <= now.getTime(),
    }));
    return { status: 200, body: { invites } };
  } catch {
    return { status: 502, body: { code: "failed", error: "Invitations could not be loaded." } };
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function revokeForAdmin(actor: Member, id: unknown, deps: InviteDeps): Promise<HandlerResult> {
  if (!actor.isAdmin) return { status: 403, body: { code: "admin-only", error: "This is available to the administrator only." } };
  if (typeof id !== "string" || !UUID.test(id)) return { status: 400, body: { code: "failed", error: "That invitation is not available." } };
  if (!deps.store) return NOT_SET_UP;
  try {
    const revoked = await deps.store.revokeInvite(id, deps.now ?? new Date());
    return revoked
      ? { status: 200, body: { code: "revoked" } }
      : { status: 404, body: { code: "failed", error: "That invitation is not available." } };
  } catch {
    return { status: 502, body: { code: "failed", error: "The invitation could not be revoked." } };
  }
}
