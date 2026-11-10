import { makeTranslate, type Translate } from "@/lib/i18n/translate";

const english = makeTranslate(null);

/** Published LifeZoi site. Invitation links use this origin in production. */
export const PRODUCTION_SITE_ORIGIN = "https://life-zoi.vercel.app";

export const SHARE_HEADING = "Share the Care";
export const SHARE_TAGLINE = "A Little Care Can Make a Big Difference";
export const SHARE_INTRO =
  "Sometimes the best gift is helping someone take better care of themselves. Invite someone you love to discover LifeZoi.";

export const WELCOME_HEADING = "Welcome to LifeZoi!";
export const WELCOME_BODY =
  "Someone thought you might enjoy being part of a healthier, more mindful lifestyle. Explore LifeZoi at your own pace. Your journey is personal, and every small step counts.";
export const WELCOME_MESSAGE = `${WELCOME_HEADING} ${WELCOME_BODY}`;

/** Suggestions for who someone might invite. They are not a closed list. */
export const RELATIONSHIP_SUGGESTIONS = [
  "mother or father",
  "husband or wife",
  "children",
  "brother or sister",
  "friends",
  "someone I care about",
] as const;

const INVITE_TOKEN = /^[A-Za-z0-9_-]{43}$/;

export const CARE_INVITE_TOKEN_KEY = "lifezoi.careInvite.token";
export const CARE_INVITE_SIGNED_OUT_KEY = "lifezoi.careInvite.sawSignedOut";
export const CARE_INVITE_REGISTERED_KEY = "lifezoi.careInvite.registered";

export type InvitationRecord = {
  token: string;
  createdAt: string;
  revokedAt: string | null;
  opens: number;
  registrations: number;
};

export type InvitationStats = {
  linksCreated: number;
  opens: number;
  registrations: number;
};

export type NoteResult = "noted" | "inactive" | "unavailable";

export type CareReason = "sign-in" | "active" | "unavailable" | "rejected";

export type CareResult<T> = { ok: true; value: T } | { ok: false; reason: CareReason };

export type CareInvitationGateway = {
  userId: () => Promise<string | null>;
  list: () => Promise<InvitationRecord[]>;
  insert: (token: string, userId: string) => Promise<void>;
  revoke: (token: string) => Promise<void>;
  note: (token: string, event: "open" | "register") => Promise<NoteResult>;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type VisitPhase = "loading" | "off" | "signed-out" | "needs-mfa" | "ready" | "error";

export function isProductionSite(env: { NODE_ENV?: string; VERCEL_ENV?: string }): boolean {
  if (env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "development") return false;
  return env.NODE_ENV === "production" || env.VERCEL_ENV === "production";
}

export function resolveShareOrigin(productionSite: boolean, browserOrigin?: string): string {
  if (productionSite) return PRODUCTION_SITE_ORIGIN;
  if (browserOrigin) {
    try {
      const url = new URL(browserOrigin);
      if ((url.protocol === "http:" || url.protocol === "https:") && url.origin === browserOrigin) return url.origin;
    } catch {
      /* Fall through to the published origin. */
    }
  }
  return PRODUCTION_SITE_ORIGIN;
}

export function isInviteToken(value: string): boolean {
  return INVITE_TOKEN.test(value);
}

export function encodeInviteToken(bytes: Uint8Array): string {
  if (bytes.byteLength !== 32) return "";
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function createInviteToken(fill: (bytes: Uint8Array) => void = (bytes) => crypto.getRandomValues(bytes)): string {
  const bytes = new Uint8Array(32);
  fill(bytes);
  const token = encodeInviteToken(bytes);
  if (!isInviteToken(token)) throw new Error("invitation token was not created");
  return token;
}

/** A welcome URL whose only query value is the invitation token. */
export function invitationUrl(origin: string, token: string): string | null {
  if (!isInviteToken(token)) return null;
  let base: URL;
  try {
    base = new URL(origin);
  } catch {
    return null;
  }
  if (base.protocol !== "https:" && base.protocol !== "http:") return null;
  if (base.origin !== origin) return null;
  const url = new URL("/welcome", base.origin);
  url.searchParams.set("invite", token);
  if (url.searchParams.get("invite") !== token) return null;
  if ([...url.searchParams.keys()].some((key) => key !== "invite")) return null;
  return url.toString();
}

export function defaultLongMessage(link: string, t: Translate = english): string {
  return [
    t("Sometimes the best gift is helping someone take better care of themselves."),
    "",
    t("I would love for you to discover LifeZoi. It is free, and you can explore it at your own pace. Your journey is personal, and every small step counts."),
    "",
    link,
  ].join("\n");
}

export function defaultShortMessage(link: string, t: Translate = english): string {
  return `${t("I thought you might enjoy LifeZoi. It is free, and you can explore it in your own time.")}\n${link}`;
}

export function ensureLink(message: string, link: string): string {
  if (!link) return message;
  if (message.includes(link)) return message;
  const trimmed = message.trim();
  return trimmed ? `${trimmed}\n\n${link}` : link;
}

export function replaceInvitationLink(message: string, previousLink: string, nextLink: string): string {
  if (previousLink && previousLink !== nextLink && message.includes(previousLink)) {
    return ensureLink(message.split(previousLink).join(nextLink), nextLink);
  }
  return ensureLink(message, nextLink);
}

/**
 * Optional writing aid. Any short phrase is accepted, including phrases outside the suggestions.
 * The line stays in the message the person chooses to send. It is not stored with the invitation.
 */
export function mentionRelationship(message: string, relationship: string, link: string, t: Translate = english): string {
  const clean = relationship.trim().replace(/\s+/g, " ");
  if (!clean || clean.length > 80) return ensureLink(message, link);
  const template = t("I thought of {who}.");
  const line = template.replace("{who}", clean);
  const body = message.replace(mentionLinePattern(template), "").replace(mentionLinePattern("I thought of {who}."), "");
  return ensureLink(`${line}\n\n${body.trim()}`, link);
}

/** Matches an earlier mention line at the start of a message, in the wording of `template`. */
function mentionLinePattern(template: string): RegExp {
  const [before, after = ""] = template.split("{who}");
  const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escape(before)}[^.\\n]{1,80}${escape(after)}\\n+`);
}

export function mailtoHref(message: string, t: Translate = english): string {
  return `mailto:?subject=${encodeURIComponent(t("A little care"))}&body=${encodeURIComponent(message)}`;
}

export function smsHref(message: string): string {
  return `sms:?&body=${encodeURIComponent(message)}`;
}

export type CareSharePayload = { title: string; text: string };

export function sharePayload(message: string, t: Translate = english): CareSharePayload {
  return { title: t(SHARE_HEADING), text: message };
}

export function canNavigatorShare(share: unknown): share is (data: CareSharePayload) => Promise<void> {
  return typeof share === "function";
}

export function activeInvitation(rows: readonly InvitationRecord[]): InvitationRecord | null {
  const active = rows.filter((row) => row.revokedAt === null);
  if (active.length === 0) return null;
  return [...active].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0] ?? null;
}

export function summarizeInvitations(rows: readonly InvitationRecord[]): InvitationStats {
  return {
    linksCreated: rows.length,
    opens: rows.reduce((sum, row) => sum + row.opens, 0),
    registrations: rows.reduce((sum, row) => sum + row.registrations, 0),
  };
}

export async function loadInvitationState(
  gateway: CareInvitationGateway,
): Promise<CareResult<{ stats: InvitationStats; active: InvitationRecord | null }>> {
  try {
    const rows = await gateway.list();
    return { ok: true, value: { stats: summarizeInvitations(rows), active: activeInvitation(rows) } };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

export async function createInvitation(gateway: CareInvitationGateway, token: string): Promise<CareResult<InvitationRecord>> {
  if (!isInviteToken(token)) return { ok: false, reason: "rejected" };
  let userId: string | null;
  try {
    userId = await gateway.userId();
  } catch {
    return { ok: false, reason: "unavailable" };
  }
  if (!userId) return { ok: false, reason: "sign-in" };
  let rows: InvitationRecord[];
  try {
    rows = await gateway.list();
  } catch {
    return { ok: false, reason: "unavailable" };
  }
  if (activeInvitation(rows)) return { ok: false, reason: "active" };
  try {
    await gateway.insert(token, userId);
  } catch {
    return { ok: false, reason: "rejected" };
  }
  return {
    ok: true,
    value: { token, createdAt: new Date().toISOString(), revokedAt: null, opens: 0, registrations: 0 },
  };
}

export async function revokeInvitation(gateway: CareInvitationGateway, token: string): Promise<CareResult<null>> {
  if (!isInviteToken(token)) return { ok: false, reason: "rejected" };
  try {
    await gateway.revoke(token);
  } catch {
    return { ok: false, reason: "rejected" };
  }
  return { ok: true, value: null };
}

export async function regenerateInvitation(gateway: CareInvitationGateway, token: string): Promise<CareResult<InvitationRecord>> {
  let rows: InvitationRecord[];
  try {
    rows = await gateway.list();
  } catch {
    return { ok: false, reason: "unavailable" };
  }
  const active = activeInvitation(rows);
  if (active) {
    const revoked = await revokeInvitation(gateway, active.token);
    if (!revoked.ok) return revoked;
  }
  return createInvitation(gateway, token);
}

export function careOpenStorageKey(token: string): string {
  return `lifezoi.careInvite.open.${token}`;
}

export function shouldNoteOpen(storage: Pick<Storage, "getItem">, token: string): boolean {
  if (!isInviteToken(token)) return false;
  return storage.getItem(careOpenStorageKey(token)) !== "1";
}

export function markOpenNoted(storage: Pick<Storage, "setItem">, token: string): void {
  if (!isInviteToken(token)) return;
  storage.setItem(careOpenStorageKey(token), "1");
}

export function rememberInviteVisit(storage: Pick<Storage, "setItem">, token: string, phase: VisitPhase): void {
  if (!isInviteToken(token)) return;
  if (phase === "loading" || phase === "ready" || phase === "needs-mfa") return;
  storage.setItem(CARE_INVITE_TOKEN_KEY, token);
  storage.setItem(CARE_INVITE_SIGNED_OUT_KEY, token);
}

export function registrationToNote(storage: Pick<Storage, "getItem">, phase: VisitPhase): string | null {
  if (phase !== "ready") return null;
  const token = storage.getItem(CARE_INVITE_TOKEN_KEY) ?? "";
  if (!isInviteToken(token)) return null;
  if (storage.getItem(CARE_INVITE_SIGNED_OUT_KEY) !== token) return null;
  if (storage.getItem(CARE_INVITE_REGISTERED_KEY) === token) return null;
  return token;
}

const registrationAttempts = new Set<string>();

export async function noteRegistrationIfNeeded(
  storage: StorageLike,
  phase: VisitPhase,
  note: (token: string) => Promise<NoteResult>,
): Promise<void> {
  const token = registrationToNote(storage, phase);
  if (!token || registrationAttempts.has(token)) return;
  registrationAttempts.add(token);
  const result = await note(token);
  if (result === "unavailable") {
    registrationAttempts.delete(token);
    return;
  }
  storage.setItem(CARE_INVITE_REGISTERED_KEY, token);
  storage.removeItem(CARE_INVITE_TOKEN_KEY);
}
