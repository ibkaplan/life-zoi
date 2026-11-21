import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminSupabase } from "@/lib/supabase-admin";
import type { CareLink, InviteRecord, InviteSource, InviteStore, SendResult } from "@/lib/invitations/service";

type InviteRow = {
  id: string;
  email: string;
  source: InviteSource;
  created_at: string;
  expires_at: string;
  used_at: string | null;
  used_by: string | null;
  revoked_at: string | null;
};

/** Invitation storage in public.registration_invites, through the server-only service role. */
export function createSupabaseInviteStore(client: SupabaseClient): InviteStore {
  return {
    async findCareLink(token) {
      const { data, error } = await client
        .from("care_invitations")
        .select("token, user_id, revoked_at, expires_at, max_registrations")
        .eq("token", token)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const row = data as { token: string; user_id: string; revoked_at: string | null; expires_at: string | null; max_registrations: number | null };
      const link: CareLink = {
        token: row.token,
        userId: row.user_id,
        revokedAt: row.revoked_at,
        expiresAt: row.expires_at ?? null,
        maxRegistrations: typeof row.max_registrations === "number" ? row.max_registrations : 3,
      };
      return link;
    },
    async countLinkInvites(token) {
      const { count, error } = await client
        .from("registration_invites")
        .select("id", { count: "exact", head: true })
        .eq("care_token", token)
        .is("revoked_at", null);
      if (error) throw error;
      return count ?? 0;
    },
    async hasOpenInvite(email, now) {
      const { data, error } = await client
        .from("registration_invites")
        .select("id")
        .eq("email", email)
        .is("used_at", null)
        .is("revoked_at", null)
        .gt("expires_at", now.toISOString())
        .limit(1);
      if (error) throw error;
      return (data ?? []).length > 0;
    },
    async insertInvite(row) {
      const { data, error } = await client
        .from("registration_invites")
        .insert({
          email: row.email,
          source: row.source,
          invited_by: row.invitedBy,
          care_token: row.careToken,
          expires_at: row.expiresAt,
        })
        .select("id")
        .single();
      if (error || !data) return null;
      return (data as { id: string }).id;
    },
    async deleteInvite(id) {
      await client.from("registration_invites").delete().eq("id", id).is("used_at", null);
    },
    async sendInviteEmail(email, redirectTo): Promise<SendResult> {
      const { error } = await client.auth.admin.inviteUserByEmail(email, { redirectTo });
      if (!error) return "sent";
      const code = (error as { code?: string }).code ?? "";
      if (code === "email_exists" || code === "user_already_exists" || /already been registered/i.test(error.message)) {
        return "exists";
      }
      return "failed";
    },
    async listInvites(limit) {
      const { data, error } = await client
        .from("registration_invites")
        .select("id, email, source, created_at, expires_at, used_at, used_by, revoked_at")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      const rows = (data ?? []) as InviteRow[];
      const confirmed = new Set<string>();
      if (rows.some((row) => row.used_by)) {
        const listed = await client.auth.admin.listUsers({ page: 1, perPage: 1000 });
        for (const user of listed.data?.users ?? []) {
          if (user.email_confirmed_at || user.last_sign_in_at) confirmed.add(user.id);
        }
      }
      return rows.map(
        (row): InviteRecord => ({
          id: row.id,
          email: row.email,
          source: row.source,
          createdAt: row.created_at,
          expiresAt: row.expires_at,
          usedAt: row.used_at,
          revokedAt: row.revoked_at,
          joined: row.used_by ? confirmed.has(row.used_by) : false,
        }),
      );
    },
    async revokeInvite(id, now) {
      const { data, error } = await client
        .from("registration_invites")
        .select("id, used_by, revoked_at")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      const row = data as { id: string; used_by: string | null; revoked_at: string | null } | null;
      if (!row || row.revoked_at) return false;
      if (row.used_by) {
        // The email was sent and a login was waiting for its password. Cancel it only
        // if the person has not opened the link yet; a joined member is never removed here.
        const found = await client.auth.admin.getUserById(row.used_by);
        const user = found.data?.user;
        if (found.error || !user) return false;
        if (user.email_confirmed_at || user.last_sign_in_at) return false;
        const removed = await client.auth.admin.deleteUser(row.used_by);
        if (removed.error) return false;
      }
      const updated = await client
        .from("registration_invites")
        .update({ revoked_at: now.toISOString() })
        .eq("id", id)
        .is("revoked_at", null)
        .select("id");
      if (updated.error) throw updated.error;
      return (updated.data ?? []).length === 1;
    },
    async purgeExpired(before) {
      await client
        .from("registration_invites")
        .delete()
        .is("used_at", null)
        .lt("expires_at", before.toISOString());
    },
  };
}

export function inviteStoreFromEnv(env: Record<string, string | undefined> = process.env): InviteStore | null {
  const client = getAdminSupabase(env);
  return client ? createSupabaseInviteStore(client) : null;
}
