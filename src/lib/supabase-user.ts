import { bearerToken, verifyAccessToken, type Member } from "@/lib/auth/session";

export type VerifiedAccount = Member;

/**
 * Confirms the caller's Supabase session with the anon key. Does not use the service role.
 * An account with a confirmed authenticator app counts only after the 6-digit step.
 */
export async function readVerifiedAccount(authorization: string | null): Promise<VerifiedAccount | null> {
  const token = bearerToken(authorization);
  if (!token) return null;
  const state = await verifyAccessToken(token);
  return state.status === "member" ? state.member : null;
}
