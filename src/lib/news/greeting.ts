/** The first word of a saved display name, for "Good morning, Anna!". Empty or odd input gives undefined. */
export function firstNameOf(displayName: string | undefined | null): string | undefined {
  if (typeof displayName !== "string") return undefined;
  const first = displayName.trim().split(/\s+/)[0] ?? "";
  if (!first || first.length > 40 || !/\p{L}/u.test(first)) return undefined;
  return first;
}
