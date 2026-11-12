import { isInviteToken } from "@/lib/share-care";

/** Accepts a pasted Share the Care link or the bare invitation code. Returns the code or null. */
export function inviteTokenFromInput(raw: string): string | null {
  const value = raw.trim();
  if (!value || value.length > 2048) return null;
  if (isInviteToken(value)) return value;
  try {
    const parsed = new URL(value, "https://lifezoi.invalid");
    const token = parsed.searchParams.get("invite")?.trim() ?? "";
    return isInviteToken(token) ? token : null;
  } catch {
    return null;
  }
}
