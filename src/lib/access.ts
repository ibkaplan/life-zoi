export type AccessDecision =
  | { allowed: true }
  | { allowed: false; reason: "unauthenticated" | "not-owner" };

/**
 * A record is readable or writable only by the signed-in user who owns it.
 * Account saves call this before writing rows. Row level security still applies.
 */
export function decideAccess(
  actorUserId: string | null | undefined,
  recordUserId: string,
): AccessDecision {
  const actor = actorUserId?.trim() ?? "";
  if (!actor) return { allowed: false, reason: "unauthenticated" };
  if (actor !== recordUserId) return { allowed: false, reason: "not-owner" };
  return { allowed: true };
}
