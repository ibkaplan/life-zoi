import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CARE_INVITE_REGISTERED_KEY,
  CARE_INVITE_SIGNED_OUT_KEY,
  CARE_INVITE_TOKEN_KEY,
  PRODUCTION_SITE_ORIGIN,
  RELATIONSHIP_SUGGESTIONS,
  SHARE_INTRO,
  SHARE_TAGLINE,
  WELCOME_MESSAGE,
  activeInvitation,
  canNavigatorShare,
  createInvitation,
  createInviteToken,
  defaultLongMessage,
  defaultShortMessage,
  encodeInviteToken,
  ensureLink,
  invitationUrl,
  isInviteToken,
  isProductionSite,
  mailtoHref,
  mentionRelationship,
  noteRegistrationIfNeeded,
  regenerateInvitation,
  registrationToNote,
  rememberInviteVisit,
  replaceInvitationLink,
  resolveShareOrigin,
  revokeInvitation,
  sharePayload,
  smsHref,
  summarizeInvitations,
  type CareInvitationGateway,
  type InvitationRecord,
} from "@/lib/share-care";

const USER = "11111111-1111-4111-8111-111111111111";
const EMAIL = "ada@example.com";

function tokenFrom(seed: number): string {
  const bytes = new Uint8Array(32);
  bytes[0] = seed;
  bytes[31] = 255 - seed;
  const token = encodeInviteToken(bytes);
  if (!isInviteToken(token)) throw new Error("fixture token");
  return token;
}

function memoryGateway(userId: string | null) {
  const rows: InvitationRecord[] = [];
  const inserted: { token: string; userId: string }[] = [];
  const gateway: CareInvitationGateway = {
    async userId() {
      return userId;
    },
    async list() {
      return rows.map((row) => ({ ...row }));
    },
    async insert(token, owner) {
      if (!userId || owner !== userId) throw new Error("owner");
      if (rows.some((row) => row.revokedAt === null)) throw new Error("unique");
      inserted.push({ token, userId: owner });
      rows.push({
        token,
        createdAt: "2026-11-06T00:00:00.000Z",
        revokedAt: null,
        opens: 0,
        registrations: 0,
      });
    },
    async revoke(token) {
      const row = rows.find((item) => item.token === token && item.revokedAt === null);
      if (!row) throw new Error("missing");
      row.revokedAt = "2026-11-06T01:00:00.000Z";
    },
    async note(token, event) {
      const row = rows.find((item) => item.token === token && item.revokedAt === null);
      if (!row) return "inactive";
      if (event === "open") row.opens += 1;
      else row.registrations += 1;
      return "noted";
    },
  };
  return { rows, inserted, gateway };
}

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem(key: string) {
      return data[key] ?? null;
    },
    setItem(key: string, value: string) {
      data[key] = value;
    },
    removeItem(key: string) {
      delete data[key];
    },
  };
}

describe("invitation links", () => {
  it("creates an unguessable token and a welcome URL with only that token", () => {
    const seen = new Set<string>();
    for (let index = 0; index < 12; index += 1) {
      const token = createInviteToken();
      expect(isInviteToken(token)).toBe(true);
      expect(token).toHaveLength(43);
      expect(seen.has(token)).toBe(false);
      seen.add(token);
    }

    const token = tokenFrom(7);
    const url = invitationUrl(PRODUCTION_SITE_ORIGIN, token);
    expect(url).toBe(`${PRODUCTION_SITE_ORIGIN}/welcome?invite=${token}`);
    const parsed = new URL(url ?? "");
    expect([...parsed.searchParams.keys()]).toEqual(["invite"]);
    expect(parsed.searchParams.get("invite")).toBe(token);
    expect(url).not.toContain(USER);
    expect(url).not.toContain(EMAIL);
    expect(url).not.toContain("sleep");
    expect(url).not.toContain("health");
    expect(invitationUrl(PRODUCTION_SITE_ORIGIN, "short")).toBeNull();
    expect(invitationUrl("http://localhost:3000/extra", token)).toBeNull();
  });

  it("uses the published origin in production and the browser origin otherwise", () => {
    expect(isProductionSite({ NODE_ENV: "production" })).toBe(true);
    expect(isProductionSite({ NODE_ENV: "production", VERCEL_ENV: "production" })).toBe(true);
    expect(isProductionSite({ NODE_ENV: "production", VERCEL_ENV: "preview" })).toBe(false);
    expect(isProductionSite({ NODE_ENV: "development" })).toBe(false);
    expect(resolveShareOrigin(true, "http://localhost:3000")).toBe(PRODUCTION_SITE_ORIGIN);
    expect(resolveShareOrigin(false, "http://localhost:3000")).toBe("http://localhost:3000");
    expect(invitationUrl(resolveShareOrigin(true, "http://localhost:3000"), tokenFrom(1))).toContain(
      "https://www.lifezoi.com/welcome?invite=",
    );
  });

  it("keeps one active link, revokes the previous one, and counts without personal data", async () => {
    const { rows, inserted, gateway } = memoryGateway(USER);
    const first = tokenFrom(2);
    const second = tokenFrom(3);
    const created = await createInvitation(gateway, first);
    expect(created.ok).toBe(true);
    expect(inserted).toEqual([{ token: first, userId: USER }]);
    expect(await createInvitation(gateway, second)).toEqual({ ok: false, reason: "active" });

    expect(await gateway.note(first, "open")).toBe("noted");
    expect(await gateway.note(first, "register")).toBe("noted");
    const regenerated = await regenerateInvitation(gateway, second);
    expect(regenerated.ok).toBe(true);
    expect(activeInvitation(rows)?.token).toBe(second);
    expect(rows.find((row) => row.token === first)?.revokedAt).toBeTruthy();
    expect(await gateway.note(first, "open")).toBe("inactive");
    expect(await gateway.note(second, "open")).toBe("noted");

    expect(summarizeInvitations(rows)).toEqual({ linksCreated: 2, opens: 2, registrations: 1 });
    const link = invitationUrl(PRODUCTION_SITE_ORIGIN, second);
    expect(link).not.toContain(USER);
    expect(JSON.stringify(rows)).not.toContain(EMAIL);

    const revoked = await revokeInvitation(gateway, second);
    expect(revoked).toEqual({ ok: true, value: null });
    expect(activeInvitation(rows)).toBeNull();
    expect(await createInvitation(gateway, tokenFrom(4))).toMatchObject({ ok: true });
  });

  it("refuses an invitation when nobody is signed in", async () => {
    const { gateway } = memoryGateway(null);
    expect(await createInvitation(gateway, tokenFrom(5))).toEqual({ ok: false, reason: "sign-in" });
  });
});

describe("care messages", () => {
  const link = invitationUrl(PRODUCTION_SITE_ORIGIN, tokenFrom(8)) ?? "";

  it("writes a long message and a short message that include the real link", () => {
    const longMessage = defaultLongMessage(link);
    const shortMessage = defaultShortMessage(link);
    expect(longMessage).toContain(link);
    expect(shortMessage).toContain(link);
    expect(longMessage).toContain("free");
    expect(shortMessage).toContain("free");
    for (const message of [longMessage, shortMessage, SHARE_INTRO, SHARE_TAGLINE, WELCOME_MESSAGE]) {
      expect(message.toLowerCase()).not.toContain("premium");
      expect(message.toLowerCase()).not.toContain("upgrade");
      expect(message.toLowerCase()).not.toContain("paid plan");
    }
    expect(SHARE_TAGLINE).toBe("A Little Care Can Make a Big Difference");
    expect(SHARE_INTRO).toBe(
      "Sometimes the best gift is helping someone take better care of themselves. Invite someone you love to discover LifeZoi.",
    );
    expect(WELCOME_MESSAGE).toBe(
      "Welcome to LifeZoi! Someone thought you might enjoy being part of a healthier, more mindful lifestyle. Explore LifeZoi at your own pace. Your journey is personal, and every small step counts.",
    );
  });

  it("treats relationship suggestions as optional writing help", () => {
    expect([...RELATIONSHIP_SUGGESTIONS]).toEqual([
      "mother or father",
      "husband or wife",
      "children",
      "brother or sister",
      "friends",
      "someone I care about",
    ]);
    const edited = "Please come see this when you have a quiet moment.";
    expect(ensureLink(edited, link)).toBe(`${edited}\n\n${link}`);
    const withNeighbor = mentionRelationship(defaultShortMessage(link), "a neighbor", link);
    expect(withNeighbor.startsWith("I thought of a neighbor.")).toBe(true);
    expect(withNeighbor).toContain(link);
    const replaced = mentionRelationship(withNeighbor, "friends", link);
    expect(replaced.startsWith("I thought of friends.")).toBe(true);
    expect(replaced).not.toContain("a neighbor");
    const next = invitationUrl(PRODUCTION_SITE_ORIGIN, tokenFrom(9)) ?? "";
    expect(replaceInvitationLink(withNeighbor, link, next)).toContain(next);
    expect(replaceInvitationLink(withNeighbor, link, next)).not.toContain(link);
  });

  it("opens the person’s own mail or text app without a recipient", () => {
    const message = defaultShortMessage(link);
    const mail = mailtoHref(message);
    const sms = smsHref(message);
    expect(mail.startsWith("mailto:?")).toBe(true);
    expect(mail.slice(0, mail.indexOf("?"))).not.toContain("@");
    expect(sms.startsWith("sms:?&body=")).toBe(true);
    expect(sms).not.toContain("@");
    expect(decodeURIComponent(mail)).toContain(link);
    expect(sharePayload(message)).toEqual({ title: "Share the Care", text: message });
    expect(canNavigatorShare(undefined)).toBe(false);
    expect(canNavigatorShare(() => Promise.resolve())).toBe(true);
  });
});

describe("invitation visits", () => {
  it("remembers a signed-out visit and counts one later sign-in", async () => {
    const token = tokenFrom(11);
    const storage = memoryStorage();
    rememberInviteVisit(storage, token, "ready");
    expect(storage.data).toEqual({});
    rememberInviteVisit(storage, token, "signed-out");
    expect(registrationToNote(storage, "signed-out")).toBeNull();
    expect(registrationToNote(storage, "ready")).toBe(token);

    let calls = 0;
    await noteRegistrationIfNeeded(storage, "ready", async () => {
      calls += 1;
      return "noted";
    });
    expect(calls).toBe(1);
    expect(storage.getItem(CARE_INVITE_REGISTERED_KEY)).toBe(token);
    expect(storage.getItem(CARE_INVITE_TOKEN_KEY)).toBeNull();
    expect(storage.getItem(CARE_INVITE_SIGNED_OUT_KEY)).toBe(token);
    await noteRegistrationIfNeeded(storage, "ready", async () => {
      calls += 1;
      return "noted";
    });
    expect(calls).toBe(1);
  });

  it("keeps the invitation schema free of contact and health columns", () => {
    const sql = readFileSync("supabase/schema.sql", "utf8");
    const table = sql.slice(
      sql.indexOf("create table if not exists public.care_invitations"),
      sql.indexOf("create index if not exists care_invitations_user_id_idx"),
    );
    expect(table).toContain("token text primary key");
    expect(table).toContain("opened_count");
    expect(table).toContain("registered_count");
    expect(table.toLowerCase()).not.toContain("email");
    expect(table.toLowerCase()).not.toContain("health");
    expect(table.toLowerCase()).not.toContain("display_name");
    expect(sql).toContain("delete from public.care_invitations where user_id = actor");
    expect(sql).toContain("grant execute on function public.note_care_invitation(text, text) to anon, authenticated");
    expect(sql).toContain("grant execute on function public.revoke_care_invitation(text) to authenticated");
    const note = sql.slice(sql.indexOf("function public.note_care_invitation"), sql.indexOf("revoke all on function public.note_care_invitation"));
    expect(note).not.toContain("user_id");
    expect(note).not.toContain("email");
    for (const file of [
      "src/lib/share-care.ts",
      "src/lib/share-care-store.ts",
      "src/components/share-care-view.tsx",
      "src/components/welcome-view.tsx",
      "src/components/care-invite-watcher.tsx",
    ]) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toContain("service_role");
      expect(source).not.toContain("account.email");
    }
    const shell = readFileSync("src/lib/navigation.ts", "utf8");
    expect(shell).toContain('href: "/share-the-care"');
    expect(shell).toContain("Share the Care");
    const welcome = readFileSync("src/components/welcome-view.tsx", "utf8");
    expect(welcome).toContain("WELCOME_HEADING");
    expect(welcome).toContain('href="/sign-in"');
    const page = readFileSync("src/app/(app)/welcome/page.tsx", "utf8");
    expect(page).toContain("WELCOME_HEADING");
    expect(page).toContain("WELCOME_BODY");
  });
});
