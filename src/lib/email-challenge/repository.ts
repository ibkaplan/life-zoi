import type { SupabaseClient } from "@supabase/supabase-js";
import { isLocale } from "@/lib/i18n/config";
import { CHALLENGE_LENGTH } from "./content";
import type { Signup } from "./types";

/**
 * Storage for challenge signups. The Supabase table `challenge_signups`
 * (supabase/migrations/20261127180000_email_challenge.sql) has no browser
 * grants: only this server module reads or writes it, with the service role.
 */
export const CHALLENGE_TABLE = "challenge_signups";

export type ClaimPatch = Partial<Pick<Signup, "status" | "confirmSentAt" | "confirmedAt" | "lastSentDay" | "lastSentOn">>;

export interface ChallengeRepository {
  findByEmail(email: string): Promise<Signup | null>;
  findByUser(userId: string): Promise<Signup | null>;
  findByConfirmToken(token: string): Promise<Signup | null>;
  findByUnsubscribeToken(token: string): Promise<Signup | null>;
  insert(signup: Signup): Promise<"inserted" | "exists">;
  /**
   * Applies `patch` only while the row still has `expected.lastSentDay` and
   * `expected.confirmSentAt`, so two runs at once cannot both send the same email.
   */
  claim(id: string, expected: Pick<Signup, "lastSentDay" | "confirmSentAt">, patch: ClaimPatch): Promise<boolean>;
  update(id: string, patch: ClaimPatch): Promise<void>;
  remove(id: string): Promise<void>;
  listPending(limit: number): Promise<Signup[]>;
  listActive(limit: number): Promise<Signup[]>;
  removePendingBefore(iso: string): Promise<number>;
}

export function createMemoryChallengeRepository(): ChallengeRepository & { rows: Map<string, Signup> } {
  const rows = new Map<string, Signup>();
  const find = (match: (row: Signup) => boolean) => [...rows.values()].find(match) ?? null;
  return {
    rows,
    async findByEmail(email) {
      return find((row) => row.email === email);
    },
    async findByUser(userId) {
      return find((row) => row.userId === userId);
    },
    async findByConfirmToken(token) {
      return find((row) => row.confirmToken === token);
    },
    async findByUnsubscribeToken(token) {
      return find((row) => row.unsubscribeToken === token);
    },
    async insert(signup) {
      if (find((row) => row.email === signup.email || (signup.userId !== null && row.userId === signup.userId))) return "exists";
      rows.set(signup.id, { ...signup });
      return "inserted";
    },
    async claim(id, expected, patch) {
      const row = rows.get(id);
      if (!row || row.lastSentDay !== expected.lastSentDay || row.confirmSentAt !== expected.confirmSentAt) return false;
      rows.set(id, { ...row, ...patch });
      return true;
    },
    async update(id, patch) {
      const row = rows.get(id);
      if (row) rows.set(id, { ...row, ...patch });
    },
    async remove(id) {
      rows.delete(id);
    },
    async listPending(limit) {
      return [...rows.values()].filter((row) => row.status === "pending" && row.confirmSentAt === null).slice(0, limit);
    },
    async listActive(limit) {
      return [...rows.values()].filter((row) => row.status === "active").slice(0, limit);
    },
    async removePendingBefore(iso) {
      let count = 0;
      for (const row of [...rows.values()]) {
        if (row.status === "pending" && row.createdAt < iso) {
          rows.delete(row.id);
          count += 1;
        }
      }
      return count;
    },
  };
}

type Row = Record<string, unknown>;
const text = (value: unknown) => (typeof value === "string" ? value : "");
const maybe = (value: unknown) => (typeof value === "string" && value ? value : null);

export function rowToSignup(row: Row): Signup | null {
  const status = row.status === "pending" || row.status === "active" ? row.status : null;
  const day = Number(row.last_sent_day);
  if (!status || !text(row.id) || !text(row.email) || !text(row.unsubscribe_token) || !text(row.confirm_token)) return null;
  if (!Number.isInteger(day) || day < 0 || day > CHALLENGE_LENGTH) return null;
  return {
    id: text(row.id),
    email: text(row.email),
    userId: maybe(row.user_id),
    locale: isLocale(row.locale) ? row.locale : "en",
    timeZone: text(row.time_zone) || "UTC",
    consentVersion: text(row.consent_version),
    consentedAt: text(row.consented_at),
    status,
    confirmToken: text(row.confirm_token),
    confirmSentAt: maybe(row.confirm_sent_at),
    confirmedAt: maybe(row.confirmed_at),
    unsubscribeToken: text(row.unsubscribe_token),
    lastSentDay: day,
    lastSentOn: maybe(row.last_sent_on),
    createdAt: text(row.created_at),
  };
}

function toRow(signup: Signup): Row {
  return {
    id: signup.id,
    email: signup.email,
    user_id: signup.userId,
    locale: signup.locale,
    time_zone: signup.timeZone,
    consent_version: signup.consentVersion,
    consented_at: signup.consentedAt,
    status: signup.status,
    confirm_token: signup.confirmToken,
    confirm_sent_at: signup.confirmSentAt,
    confirmed_at: signup.confirmedAt,
    unsubscribe_token: signup.unsubscribeToken,
    last_sent_day: signup.lastSentDay,
    last_sent_on: signup.lastSentOn,
    created_at: signup.createdAt,
  };
}

function patchRow(patch: ClaimPatch): Row {
  const out: Row = {};
  if (patch.status !== undefined) out.status = patch.status;
  if (patch.confirmSentAt !== undefined) out.confirm_sent_at = patch.confirmSentAt;
  if (patch.confirmedAt !== undefined) out.confirmed_at = patch.confirmedAt;
  if (patch.lastSentDay !== undefined) out.last_sent_day = patch.lastSentDay;
  if (patch.lastSentOn !== undefined) out.last_sent_on = patch.lastSentOn;
  return out;
}

const COLUMNS =
  "id, email, user_id, locale, time_zone, consent_version, consented_at, status, confirm_token, confirm_sent_at, confirmed_at, unsubscribe_token, last_sent_day, last_sent_on, created_at";

export function createSupabaseChallengeRepository(client: SupabaseClient): ChallengeRepository {
  const one = async (column: string, value: string) => {
    const { data, error } = await client.from(CHALLENGE_TABLE).select(COLUMNS).eq(column, value).maybeSingle();
    if (error) throw new Error("challenge read failed");
    return data ? rowToSignup(data as Row) : null;
  };
  const many = (rows: unknown) => (Array.isArray(rows) ? rows.map((row) => rowToSignup(row as Row)).filter((row): row is Signup => row !== null) : []);
  return {
    findByEmail: (email) => one("email", email),
    findByUser: (userId) => one("user_id", userId),
    findByConfirmToken: (token) => one("confirm_token", token),
    findByUnsubscribeToken: (token) => one("unsubscribe_token", token),
    async insert(signup) {
      const { error } = await client.from(CHALLENGE_TABLE).insert(toRow(signup));
      if (!error) return "inserted";
      if (error.code === "23505") return "exists";
      throw new Error("challenge insert failed");
    },
    async claim(id, expected, patch) {
      let query = client.from(CHALLENGE_TABLE).update(patchRow(patch)).eq("id", id).eq("last_sent_day", expected.lastSentDay);
      query = expected.confirmSentAt === null ? query.is("confirm_sent_at", null) : query.eq("confirm_sent_at", expected.confirmSentAt);
      const { data, error } = await query.select("id");
      if (error) throw new Error("challenge update failed");
      return Array.isArray(data) && data.length === 1;
    },
    async update(id, patch) {
      const { error } = await client.from(CHALLENGE_TABLE).update(patchRow(patch)).eq("id", id);
      if (error) throw new Error("challenge update failed");
    },
    async remove(id) {
      const { error } = await client.from(CHALLENGE_TABLE).delete().eq("id", id);
      if (error) throw new Error("challenge delete failed");
    },
    async listPending(limit) {
      const { data, error } = await client.from(CHALLENGE_TABLE).select(COLUMNS).eq("status", "pending").is("confirm_sent_at", null).limit(limit);
      if (error) throw new Error("challenge read failed");
      return many(data);
    },
    async listActive(limit) {
      const { data, error } = await client.from(CHALLENGE_TABLE).select(COLUMNS).eq("status", "active").lt("last_sent_day", CHALLENGE_LENGTH).limit(limit);
      if (error) throw new Error("challenge read failed");
      return many(data);
    },
    async removePendingBefore(iso) {
      const { data, error } = await client.from(CHALLENGE_TABLE).delete().eq("status", "pending").lt("created_at", iso).select("id");
      if (error) throw new Error("challenge delete failed");
      return Array.isArray(data) ? data.length : 0;
    },
  };
}
