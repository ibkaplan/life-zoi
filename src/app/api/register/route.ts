import { jsonError, readJson } from "@/lib/http";
import { registerFromCareLink } from "@/lib/invitations/service";
import { inviteStoreFromEnv } from "@/lib/invitations/supabase-store";

function clientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Public: registration through a member's Share the Care link.
 * It accepts the link token and one email address, nothing else, and never
 * creates an account directly. Supabase emails an invite link to that address.
 */
export async function POST(request: Request) {
  const body = await readJson(request, 2_000);
  if (!body.ok) return jsonError(body.error, body.status);
  const value = (body.value && typeof body.value === "object" ? body.value : {}) as { token?: unknown; email?: unknown };
  const result = await registerFromCareLink(
    { token: value.token, email: value.email, origin: new URL(request.url).origin, address: clientAddress(request) },
    { store: inviteStoreFromEnv() },
  );
  return Response.json(result.body, { status: result.status, headers: { "Cache-Control": "no-store" } });
}
