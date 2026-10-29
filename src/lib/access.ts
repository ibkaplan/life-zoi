export type AccessDecision =
  | { allowed: true }
  | { allowed: false; reason: "unauthenticated" | "not-owner" };

/**
 * Rule for a future authenticated store: a record is readable or writable
 * only by the signed-in user who owns it. Development mode has no accounts
 * and does not store records on the server, so this rule is not a live login.
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
