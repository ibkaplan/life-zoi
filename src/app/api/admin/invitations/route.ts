import { requireAdmin } from "@/lib/auth/require-member";
import { jsonError, readJson } from "@/lib/http";
import { inviteByAdmin, listForAdmin, revokeForAdmin } from "@/lib/invitations/service";
import { inviteStoreFromEnv } from "@/lib/invitations/supabase-store";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** Administrator only: list, send, and revoke invitations. */
export async function GET(request: Request) {
  const checked = await requireAdmin(request);
  if (!checked.ok) return checked.response;
  const result = await listForAdmin(checked.member, { store: inviteStoreFromEnv() });
  return Response.json(result.body, { status: result.status, headers: NO_STORE });
}

export async function POST(request: Request) {
  const checked = await requireAdmin(request);
  if (!checked.ok) return checked.response;
  const body = await readJson(request, 2_000);
  if (!body.ok) return jsonError(body.error, body.status);
  const value = (body.value && typeof body.value === "object" ? body.value : {}) as { email?: unknown };
  const result = await inviteByAdmin(
    { actor: checked.member, email: value.email, origin: new URL(request.url).origin },
    { store: inviteStoreFromEnv() },
  );
  return Response.json(result.body, { status: result.status, headers: NO_STORE });
}

export async function DELETE(request: Request) {
  const checked = await requireAdmin(request);
  if (!checked.ok) return checked.response;
  const body = await readJson(request, 1_000);
  if (!body.ok) return jsonError(body.error, body.status);
  const value = (body.value && typeof body.value === "object" ? body.value : {}) as { id?: unknown };
  const result = await revokeForAdmin(checked.member, value.id, { store: inviteStoreFromEnv() });
  return Response.json(result.body, { status: result.status, headers: NO_STORE });
}
