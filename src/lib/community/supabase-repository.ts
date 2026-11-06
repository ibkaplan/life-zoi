import { createClient } from "@supabase/supabase-js";
import { createMutex, type CommunityProfile, type CommunityRepository, type StoredMessage, type StoredRelation, type StoredReport } from "@/lib/community/repository";
import { readPublicSupabaseConfig } from "@/lib/supabase-config";
import type { ModerationStatus, ReportReason } from "@/lib/community/types";

/** Browser roles have no grant on these tables. The service role is used only here. */
export const COMMUNITY_TABLES = [
  "community_profiles",
  "community_messages",
  "community_reports",
  "community_blocks",
  "community_mutes",
] as const;

type Row = Record<string, unknown>;

type TableQuery = {
  select(columns: string): TableQuery;
  insert(row: Row): TableQuery;
  update(row: Row): TableQuery;
  upsert(row: Row, options?: { onConflict?: string }): TableQuery;
  delete(): TableQuery;
  eq(column: string, value: unknown): TableQuery;
  order(column: string, options: { ascending: boolean }): TableQuery;
  limit(count: number): TableQuery;
  maybeSingle(): Promise<{ data: Row | null; error: { message?: string } | null }>;
  then<T>(onfulfilled: (value: { data: Row[] | null; error: { message?: string } | null }) => T): Promise<T>;
};

export type CommunityDbClient = {
  from(table: string): TableQuery;
};

const ALLOWED = new Set<string>(COMMUNITY_TABLES);

export function guardCommunityClient(client: CommunityDbClient): CommunityDbClient {
  return {
    from(table: string) {
      if (!ALLOWED.has(table)) throw new Error("Community storage cannot use that table");
      return client.from(table);
    },
  };
}

function asStatus(value: unknown): ModerationStatus | null {
  if (value === "approved" || value === "pending" || value === "rejected") return value;
  return null;
}

function asReason(value: unknown): ReportReason | null {
  if (value === "harassment" || value === "hate" || value === "spam" || value === "other") return value;
  return null;
}

function text(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function toMessage(row: Row): StoredMessage | null {
  const status = asStatus(row.status);
  const id = text(row.id);
  const authorId = text(row.author_id);
  const authorName = text(row.author_name);
  const createdAt = text(row.created_at);
  const decidedAt = text(row.decided_at);
  if (!status || !id || !authorId || !authorName || !createdAt || !decidedAt) return null;
  return {
    id,
    authorId,
    authorName,
    parentId: text(row.parent_id),
    body: text(row.body) ?? "",
    redacted: row.redacted === true,
    status,
    category: text(row.category) ?? "none",
    source: text(row.source) ?? "error",
    contentHash: text(row.content_hash) ?? "",
    clientRequestId: text(row.client_request_id),
    createdAt,
    decidedAt,
    removedAt: text(row.removed_at),
    appealUsed: row.appeal_used === true,
    violationCounted: row.violation_counted === true,
  };
}

function messageRow(message: StoredMessage): Row {
  return {
    id: message.id,
    author_id: message.authorId,
    author_name: message.authorName,
    parent_id: message.parentId,
    body: message.body,
    redacted: message.redacted,
    status: message.status,
    category: message.category,
    source: message.source,
    content_hash: message.contentHash,
    client_request_id: message.clientRequestId,
    created_at: message.createdAt,
    decided_at: message.decidedAt,
    removed_at: message.removedAt,
    appeal_used: message.appealUsed,
    violation_counted: message.violationCounted,
  };
}

function toProfile(row: Row): CommunityProfile | null {
  const userId = text(row.user_id);
  const displayName = text(row.display_name);
  if (!userId || !displayName) return null;
  const violations = Array.isArray(row.violations) ? row.violations : [];
  const providerCalls = Array.isArray(row.provider_calls) ? row.provider_calls : [];
  return {
    userId,
    displayName,
    restrictedUntil: text(row.restricted_until),
    violations: violations.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const record = item as Row;
      const at = text(record.at);
      const category = text(record.category);
      const messageId = text(record.messageId);
      if (!at || !category || !messageId) return [];
      return [{ at, category, messageId }];
    }),
    providerCalls: providerCalls.filter((item): item is string => typeof item === "string"),
  };
}

function profileRow(profile: CommunityProfile): Row {
  return {
    user_id: profile.userId,
    display_name: profile.displayName,
    restricted_until: profile.restrictedUntil,
    violations: profile.violations,
    provider_calls: profile.providerCalls,
    updated_at: new Date().toISOString(),
  };
}

function toReport(row: Row): StoredReport | null {
  const id = text(row.id);
  const messageId = text(row.message_id);
  const reporterId = text(row.reporter_id);
  const reason = asReason(row.reason);
  const createdAt = text(row.created_at);
  const status = row.status === "dismissed" ? "dismissed" : row.status === "open" ? "open" : null;
  if (!id || !messageId || !reporterId || !reason || !createdAt || !status) return null;
  return { id, messageId, reporterId, reason, createdAt, status, resolvedAt: text(row.resolved_at) };
}

function reportRow(report: StoredReport): Row {
  return {
    id: report.id,
    message_id: report.messageId,
    reporter_id: report.reporterId,
    reason: report.reason,
    created_at: report.createdAt,
    status: report.status,
    resolved_at: report.resolvedAt,
  };
}

function toRelation(row: Row, ownerKey: string, otherKey: string): StoredRelation | null {
  const ownerId = text(row[ownerKey]);
  const otherId = text(row[otherKey]);
  const createdAt = text(row.created_at);
  if (!ownerId || !otherId || !createdAt) return null;
  return { ownerId, otherId, createdAt };
}

async function rowsOf(query: TableQuery): Promise<Row[]> {
  const result = await query;
  if (result.error) throw new Error("Community storage failed");
  return result.data ?? [];
}

export function createSupabaseCommunityRepository(client: CommunityDbClient): CommunityRepository {
  const db = guardCommunityClient(client);
  const runExclusive = createMutex();

  return {
    runExclusive,
    async getProfile(userId) {
      const result = await db.from("community_profiles").select("*").eq("user_id", userId).maybeSingle();
      if (result.error) throw new Error("Community storage failed");
      return result.data ? toProfile(result.data) : null;
    },
    async saveProfile(profile) {
      const result = await db.from("community_profiles").upsert(profileRow(profile), { onConflict: "user_id" });
      if (result.error) throw new Error("Community storage failed");
    },
    async listProfiles() {
      const rows = await rowsOf(db.from("community_profiles").select("*").limit(5000));
      return rows.flatMap((row) => {
        const profile = toProfile(row);
        return profile ? [profile] : [];
      });
    },
    async getMessage(id) {
      const result = await db.from("community_messages").select("*").eq("id", id).maybeSingle();
      if (result.error) throw new Error("Community storage failed");
      return result.data ? toMessage(result.data) : null;
    },
    async listMessages() {
      const rows = await rowsOf(db.from("community_messages").select("*").order("created_at", { ascending: false }).limit(500));
      return rows.flatMap((row) => {
        const message = toMessage(row);
        return message ? [message] : [];
      });
    },
    async insertMessage(message) {
      const result = await db.from("community_messages").insert(messageRow(message));
      if (result.error) throw new Error("Community storage failed");
    },
    async updateMessage(message) {
      const result = await db.from("community_messages").update(messageRow(message)).eq("id", message.id);
      if (result.error) throw new Error("Community storage failed");
    },
    async deleteMessage(id) {
      const result = await db.from("community_messages").delete().eq("id", id);
      if (result.error) throw new Error("Community storage failed");
    },
    async listReports() {
      const rows = await rowsOf(db.from("community_reports").select("*").limit(1000));
      return rows.flatMap((row) => {
        const report = toReport(row);
        return report ? [report] : [];
      });
    },
    async insertReport(report) {
      const result = await db.from("community_reports").insert(reportRow(report));
      if (result.error) throw new Error("Community storage failed");
    },
    async updateReport(report) {
      const result = await db.from("community_reports").update(reportRow(report)).eq("id", report.id);
      if (result.error) throw new Error("Community storage failed");
    },
    async deleteReport(id) {
      const result = await db.from("community_reports").delete().eq("id", id);
      if (result.error) throw new Error("Community storage failed");
    },
    async listBlocks() {
      const rows = await rowsOf(db.from("community_blocks").select("*").limit(5000));
      return rows.flatMap((row) => {
        const relation = toRelation(row, "blocker_id", "blocked_id");
        return relation ? [relation] : [];
      });
    },
    async addBlock(relation) {
      const result = await db.from("community_blocks").upsert(
        { blocker_id: relation.ownerId, blocked_id: relation.otherId, created_at: relation.createdAt },
        { onConflict: "blocker_id,blocked_id" },
      );
      if (result.error) throw new Error("Community storage failed");
    },
    async listMutes() {
      const rows = await rowsOf(db.from("community_mutes").select("*").limit(5000));
      return rows.flatMap((row) => {
        const relation = toRelation(row, "muter_id", "muted_id");
        return relation ? [relation] : [];
      });
    },
    async addMute(relation) {
      const result = await db.from("community_mutes").upsert(
        { muter_id: relation.ownerId, muted_id: relation.otherId, created_at: relation.createdAt },
        { onConflict: "muter_id,muted_id" },
      );
      if (result.error) throw new Error("Community storage failed");
    },
  };
}

export function connectCommunityDatabase(url: string, serviceKey: string): CommunityDbClient {
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }) as unknown as CommunityDbClient;
}

export function communityRepositoryFromEnv(
  env: Record<string, string | undefined>,
  connect: (url: string, serviceKey: string) => CommunityDbClient,
): CommunityRepository | null {
  const config = readPublicSupabaseConfig(env);
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!config || serviceKey.length < 20) return null;
  return createSupabaseCommunityRepository(connect(config.url, serviceKey));
}
