/**
 * Plain helpers for password recovery and password changes.
 * The Supabase calls live in `account-store.ts`. These functions do not touch the network.
 */

export const RESET_PATH = "/reset-password";

/** Shown whether or not the address has an account, so the form cannot be used to look people up. */
export const RESET_REQUEST_SENT =
  "If an account uses that email, a reset link is on its way. Open it in this same browser. The link works once and expires.";

export const CONFIRMATION_RESENT =
  "If that email is waiting for confirmation, a new confirmation message is on its way.";

export const PASSWORD_UPDATED = "Your password was changed. Use the new password the next time you sign in.";

export function isEmailAddress(email: string): boolean {
  const normalized = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) && normalized.length <= 320;
}

/** Where the emailed link sends the person. Only http(s) origins are accepted. */
export function resetRedirectUrl(origin: string): string | null {
  try {
    const parsed = new URL(origin);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return `${parsed.origin}${RESET_PATH}`;
  } catch {
    return null;
  }
}

export function validateNewPassword(password: string, confirm: string): string | null {
  if (password.length < 8) return "Use at least 8 characters for the password.";
  if (password.length > 72) return "Use 72 characters or fewer for the password.";
  if (password !== confirm) return "The two passwords do not match.";
  return null;
}

type AuthErrorLike = { code?: string | null; message?: string | null; status?: number | null } | null | undefined;

/** Plain wording for errors from `auth.updateUser({ password })`. Raw provider text is never shown. */
export function passwordChangeMessage(error: AuthErrorLike): string {
  const code = error?.code ?? "";
  const message = error?.message ?? "";
  if (code === "same_password" || /different from the old/i.test(message)) {
    return "Choose a password that is different from the current one.";
  }
  if (code === "weak_password" || /weak|pwned|leaked/i.test(message)) {
    return "That password is too easy to guess or has appeared in a data leak. Choose a longer or less common one.";
  }
  if (code === "reauthentication_needed" || /reauthenticat/i.test(message)) {
    return "For safety, sign out, sign in again, and change the password right after. Or use Forgot password.";
  }
  if (code === "insufficient_aal" || /aal2/i.test(message)) {
    return "Enter the code from your authenticator app first, then set the new password.";
  }
  if (code === "session_not_found" || code === "session_expired" || error?.status === 401) {
    return "This reset session has ended. Request a new reset link.";
  }
  if (code === "over_request_rate_limit" || error?.status === 429) {
    return "Too many attempts. Wait a few minutes and try again.";
  }
  return "The password could not be changed. Try again.";
}

/** Plain wording for errors from `resetPasswordForEmail` and `resend`. Never reveals whether an account exists. */
export function emailRequestMessage(error: AuthErrorLike): string | null {
  if (!error) return null;
  const code = error.code ?? "";
  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit" || error.status === 429) {
    return "Too many emails were requested. Wait a while and try again.";
  }
  if (code === "email_address_invalid" || code === "validation_failed") {
    return "Enter a valid email address.";
  }
  // Other failures, including "user not found", get the same neutral answer as success.
  return null;
}

/**
 * Supabase appends `error`, `error_code`, and `error_description` to the redirect
 * when a link is expired or already used. Read them from the query or the hash.
 */
export function recoveryLinkProblem(search: string, hash: string): string | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const fragment = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const code = params.get("error_code") ?? fragment.get("error_code") ?? "";
  const error = params.get("error") ?? fragment.get("error") ?? "";
  if (!code && !error) return null;
  if (code === "otp_expired") return "This reset link has expired or was already used. Request a new one below.";
  return "This reset link could not be used. Request a new one below.";
}

/** True when the URL carries a PKCE code or an implicit-flow recovery token. */
export function hasRecoveryParams(search: string, hash: string): boolean {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const fragment = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  return params.has("code") || fragment.get("type") === "recovery";
}
