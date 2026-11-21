/** What an invite email link carries when it opens /accept-invite. */
export type InviteArrival =
  | { kind: "token-hash"; tokenHash: string; type: "invite" | "signup" | "magiclink" | "email" }
  | { kind: "session"; accessToken: string; refreshToken: string }
  | { kind: "error" }
  | { kind: "none" };

const OTP_TYPES = new Set(["invite", "signup", "magiclink", "email"]);

/**
 * Reads the link without trusting it; Supabase verifies whatever it carries.
 * `?token_hash=…&type=invite` comes from the recommended email template;
 * `#access_token=…&refresh_token=…` comes from Supabase's default invite template.
 */
export function readInviteArrival(search: string, hash: string): InviteArrival {
  const query = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const fragment = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  if (query.get("error") || query.get("error_description") || fragment.get("error") || fragment.get("error_description")) {
    return { kind: "error" };
  }
  const tokenHash = query.get("token_hash")?.trim() ?? "";
  const type = query.get("type")?.trim() ?? "invite";
  if (tokenHash) {
    if (tokenHash.length > 512 || !OTP_TYPES.has(type)) return { kind: "error" };
    return { kind: "token-hash", tokenHash, type: type as "invite" };
  }
  const accessToken = fragment.get("access_token")?.trim() ?? "";
  const refreshToken = fragment.get("refresh_token")?.trim() ?? "";
  if (accessToken && refreshToken) {
    if (accessToken.length > 8192 || refreshToken.length > 512) return { kind: "error" };
    return { kind: "session", accessToken, refreshToken };
  }
  return { kind: "none" };
}
