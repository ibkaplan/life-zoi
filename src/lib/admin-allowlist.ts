/** Server-side admin identity. The client cannot grant this role. */
export const ADMIN_EMAILS = ["tatyanaserikovaru@gmail.com"] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (ADMIN_EMAILS as readonly string[]).includes(normalized);
}
