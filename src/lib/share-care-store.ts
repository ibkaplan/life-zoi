import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isInviteToken,
  type CareInvitationGateway,
  type InvitationRecord,
  type NoteResult,
} from "@/lib/share-care";

type InvitationRow = {
  token: string;
  created_at: string;
  revoked_at: string | null;
  opened_count: number;
  registered_count: number;
};

function mapRow(row: InvitationRow): InvitationRecord | null {
  if (!isInviteToken(row.token)) return null;
  return {
    token: row.token,
    createdAt: row.created_at,
    revokedAt: row.revoked_at,
    opens: row.opened_count,
    registrations: row.registered_count,
  };
}

/** Browser gateway. Uses the anon key and the signed-in session. Counts stay numeric. */
export function supabaseGateway(client: SupabaseClient): CareInvitationGateway {
  return {
    async userId() {
      const { data, error } = await client.auth.getUser();
      if (error || !data.user) return null;
      return data.user.id;
    },
    async list() {
      const { data, error } = await client
        .from("care_invitations")
        .select("token, created_at, revoked_at, opened_count, registered_count")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).flatMap((row) => {
        const mapped = mapRow(row as InvitationRow);
        return mapped ? [mapped] : [];
      });
    },
    async insert(token, userId) {
      const { error } = await client.from("care_invitations").insert({
        token,
        user_id: userId,
        opened_count: 0,
        registered_count: 0,
      });
      if (error) throw error;
    },
    async revoke(token) {
      const { data, error } = await client.rpc("revoke_care_invitation", { invite_token: token });
      if (error || data !== true) throw error ?? new Error("revoke");
    },
    async note(token, event): Promise<NoteResult> {
      const { data, error } = await client.rpc("note_care_invitation", {
        invite_token: token,
        event_kind: event,
      });
      if (error) return "unavailable";
      return data === true ? "noted" : "inactive";
    },
  };
}
