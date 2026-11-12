import { msg } from "@/lib/i18n/translate";
import { memberFromRequest, type Member, type MemberState } from "@/lib/auth/session";

export const SIGN_IN_REQUIRED = msg("Sign in to use lifeZoi.");
export const FINISH_SIGN_IN = msg("Finish signing in with your authenticator code first.");
export const SIGN_IN_NOT_CONFIGURED = msg("Account sign-in is not configured in this environment.");

const NO_STORE = { "Cache-Control": "private, no-store" };

export function deniedResponse(state: Exclude<MemberState, { status: "member" }>): Response {
  if (state.status === "not-configured") {
    return Response.json({ error: SIGN_IN_NOT_CONFIGURED, signIn: "not-configured" }, { status: 503, headers: NO_STORE });
  }
  const error = state.status === "needs-mfa" ? FINISH_SIGN_IN : SIGN_IN_REQUIRED;
  return Response.json({ error, signIn: state.status }, { status: 401, headers: NO_STORE });
}

export type MemberCheck = { ok: true; member: Member } | { ok: false; response: Response };

/**
 * Every members' API route calls this before doing any work.
 * The proxy also refuses a request without a session, but this is the check
 * that verifies the session with Supabase.
 */
export async function requireMember(
  request: Request,
  read: (request: Request) => Promise<MemberState> = memberFromRequest,
): Promise<MemberCheck> {
  const state = await read(request);
  if (state.status === "member") return { ok: true, member: state.member };
  return { ok: false, response: deniedResponse(state) };
}

export async function requireAdmin(
  request: Request,
  read: (request: Request) => Promise<MemberState> = memberFromRequest,
): Promise<MemberCheck> {
  const checked = await requireMember(request, read);
  if (!checked.ok) return checked;
  if (!checked.member.isAdmin) {
    return {
      ok: false,
      response: Response.json(
        { error: msg("This is available to the administrator only.") },
        { status: 403, headers: NO_STORE },
      ),
    };
  }
  return checked;
}
