import { describe, expect, it } from "vitest";
import {
  acceptInviteUrl,
  createLimiter,
  inviteByAdmin,
  listForAdmin,
  registerFromCareLink,
  revokeForAdmin,
  type CareLink,
  type InviteRecord,
  type InviteStore,
  type SendResult,
} from "@/lib/invitations/service";
import { inviteTokenFromInput } from "@/lib/invitations/link";
import { readInviteArrival } from "@/lib/invitations/accept";

const TOKEN = "CareLinkToken_abcdefghijklmnopqrstuvwxyz012";
const NOW = new Date("2026-11-12T10:00:00Z");
const ADMIN = { id: "00000000-0000-4000-8000-00000000000a", email: "owner@example.org", isAdmin: true };
const MEMBER = { id: "00000000-0000-4000-8000-00000000000b", email: "member@example.org", isAdmin: false };

type Row = InviteRecord & { careToken: string | null };

function memoryStore(options: { link?: Partial<CareLink> | null; send?: SendResult } = {}) {
  const rows: Row[] = [];
  const sent: { email: string; redirectTo: string }[] = [];
  const link: CareLink | null =
    options.link === null ? null : { token: TOKEN, userId: MEMBER.id, revokedAt: null, expiresAt: null, maxRegistrations: 3, ...options.link };
  const store: InviteStore = {
    findCareLink: async (token) => (link && token === link.token ? link : null),
    countLinkInvites: async (token) => rows.filter((row) => row.careToken === token && !row.revokedAt).length,
    hasOpenInvite: async (email, now) =>
      rows.some((row) => row.email === email && !row.usedAt && !row.revokedAt && Date.parse(row.expiresAt) > now.getTime()),
    insertInvite: async (row) => {
      const id = `00000000-0000-4000-8000-${String(rows.length + 1).padStart(12, "0")}`;
      rows.push({ id, email: row.email, source: row.source, careToken: row.careToken, createdAt: NOW.toISOString(), expiresAt: row.expiresAt, usedAt: null, revokedAt: null, joined: false });
      return id;
    },
    deleteInvite: async (id) => {
      const index = rows.findIndex((row) => row.id === id);
      if (index >= 0) rows.splice(index, 1);
    },
    sendInviteEmail: async (email, redirectTo) => {
      sent.push({ email, redirectTo });
      return options.send ?? "sent";
    },
    listInvites: async () => rows,
    revokeInvite: async (id, now) => {
      const row = rows.find((item) => item.id === id && !item.revokedAt);
      if (!row) return false;
      row.revokedAt = now.toISOString();
      return true;
    },
    purgeExpired: async () => undefined,
  };
  return { store, rows, sent };
}

const register = (store: InviteStore | null, email = "friend@example.org", extra: Partial<{ token: string; address: string }> = {}) =>
  registerFromCareLink(
    { token: extra.token ?? TOKEN, email, origin: "https://lifezoi.example", address: extra.address ?? "203.0.113.1" },
    { store, now: NOW, limiter: createLimiter() },
  );

describe("registration through a Share the Care link", () => {
  it("records one invitation for the email and sends the invite to /accept-invite", async () => {
    const { store, rows, sent } = memoryStore();
    const result = await register(store, "  Friend@Example.org ");
    expect(result).toEqual({ status: 200, body: { code: "sent" } });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ email: "friend@example.org", source: "share_care", careToken: TOKEN });
    expect(Date.parse(rows[0].expiresAt) - NOW.getTime()).toBe(48 * 60 * 60 * 1000);
    expect(sent).toEqual([{ email: "friend@example.org", redirectTo: "https://lifezoi.example/accept-invite" }]);
  });

  it("refuses a missing, revoked, expired, or full link", async () => {
    expect((await register(memoryStore({ link: null }).store)).body.code).toBe("inactive");
    expect((await register(memoryStore({ link: { revokedAt: NOW.toISOString() } }).store)).body.code).toBe("inactive");
    expect((await register(memoryStore({ link: { expiresAt: "2026-11-01T00:00:00Z" } }).store)).body.code).toBe("inactive");
    const full = memoryStore({ link: { maxRegistrations: 2 } });
    expect((await register(full.store, "a@example.org")).status).toBe(200);
    expect((await register(full.store, "b@example.org")).status).toBe(200);
    expect(await register(full.store, "c@example.org")).toMatchObject({ status: 410, body: { code: "full" } });
    expect(full.sent).toHaveLength(2);
  });

  it("gives the same answer for an email that already has an account, and keeps no row for it", async () => {
    const { store, rows } = memoryStore({ send: "exists" });
    expect(await register(store)).toEqual({ status: 200, body: { code: "sent" } });
    expect(rows).toHaveLength(0);
  });

  it("checks the input and works only when the server is set up", async () => {
    const { store } = memoryStore();
    expect((await register(store, "not-an-email")).body.code).toBe("email");
    expect((await register(store, "a@example.org", { token: "short" })).body.code).toBe("no-link");
    expect((await register(null)).status).toBe(503);
  });

  it("limits attempts from one address", async () => {
    const { store } = memoryStore({ link: { maxRegistrations: 50 } });
    const limiter = createLimiter();
    const statuses: number[] = [];
    for (let index = 0; index < 6; index += 1) {
      const result = await registerFromCareLink(
        { token: TOKEN, email: `p${index}@example.org`, origin: "https://lifezoi.example", address: "203.0.113.9" },
        { store, now: NOW, limiter },
      );
      statuses.push(result.status);
    }
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
  });
});

describe("administrator invitations", () => {
  it("only the administrator can invite, list, or revoke", async () => {
    const { store, sent } = memoryStore();
    expect((await inviteByAdmin({ actor: MEMBER, email: "x@example.org", origin: "https://lifezoi.example" }, { store })).status).toBe(403);
    expect((await listForAdmin(MEMBER, { store })).status).toBe(403);
    expect((await revokeForAdmin(MEMBER, "00000000-0000-4000-8000-000000000001", { store })).status).toBe(403);
    expect(sent).toHaveLength(0);
  });

  it("sends a 7-day invitation and lists it", async () => {
    const { store, rows } = memoryStore();
    const result = await inviteByAdmin({ actor: ADMIN, email: "New@Example.org", origin: "https://lifezoi.example" }, { store, now: NOW });
    expect(result).toEqual({ status: 200, body: { code: "sent" } });
    expect(rows[0]).toMatchObject({ email: "new@example.org", source: "admin" });
    expect(Date.parse(rows[0].expiresAt) - NOW.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
    const listed = await listForAdmin(ADMIN, { store, now: NOW });
    expect((listed.body.invites as { expired: boolean }[])[0].expired).toBe(false);
    const revoked = await revokeForAdmin(ADMIN, rows[0].id, { store, now: NOW });
    expect(revoked.status).toBe(200);
  });

  it("says when the email already has an account and removes the unused row", async () => {
    const { store, rows } = memoryStore({ send: "exists" });
    const result = await inviteByAdmin({ actor: ADMIN, email: "member@example.org", origin: "https://lifezoi.example" }, { store, now: NOW });
    expect(result.body.code).toBe("exists");
    expect(rows).toHaveLength(0);
  });
});

describe("invitation links", () => {
  it("accepts a pasted Share the Care link or the bare code", () => {
    expect(inviteTokenFromInput(TOKEN)).toBe(TOKEN);
    expect(inviteTokenFromInput(`https://lifezoi.example/welcome?invite=${TOKEN}`)).toBe(TOKEN);
    expect(inviteTokenFromInput(`/welcome?invite=${TOKEN}`)).toBe(TOKEN);
    expect(inviteTokenFromInput("https://lifezoi.example/welcome?invite=short")).toBeNull();
    expect(inviteTokenFromInput("")).toBeNull();
  });

  it("builds the accept page address from http(s) origins only", () => {
    expect(acceptInviteUrl("https://lifezoi.example")).toBe("https://lifezoi.example/accept-invite");
    expect(acceptInviteUrl("javascript:alert(1)")).toBeNull();
  });

  it("reads what an invite email link carries", () => {
    expect(readInviteArrival("?token_hash=abc&type=invite", "")).toEqual({ kind: "token-hash", tokenHash: "abc", type: "invite" });
    expect(readInviteArrival("", "#access_token=aaa&refresh_token=bbb&type=invite")).toEqual({ kind: "session", accessToken: "aaa", refreshToken: "bbb" });
    expect(readInviteArrival("", "#error=access_denied&error_description=expired")).toEqual({ kind: "error" });
    expect(readInviteArrival("?token_hash=abc&type=recovery", "")).toEqual({ kind: "error" });
    expect(readInviteArrival("", "")).toEqual({ kind: "none" });
  });
});
