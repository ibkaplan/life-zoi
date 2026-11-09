/**
 * Browser keys that are not tied to an account can be read by the next
 * person who uses the same browser. Owned keys are separate.
 * Nothing here sends data to a new service.
 */

export type LocalBucket = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export function guestStorageKey(base: string): string {
  return `${base}.guest`;
}

export function userStorageKey(base: string, userId: string): string {
  return `${base}.u.${userId}`;
}

/**
 * Give this account the unscoped blob once, then delete that shared key.
 * If this account already has its own copy, or already has saved account
 * data, the shared blob is discarded instead of being copied in.
 * A guest blob is copied only when the account slice is still empty.
 */
export function takeForAccount(
  storage: LocalBucket | null,
  base: string,
  userId: string,
  accountHasData: boolean,
): string | null {
  if (!storage || !userId) return null;
  const ownedKey = userStorageKey(base, userId);
  const owned = storage.getItem(ownedKey);
  const legacy = storage.getItem(base);
  if (legacy !== null) storage.removeItem(base);
  if (owned) return owned;
  if (accountHasData) return null;
  const guestKey = guestStorageKey(base);
  const guest = storage.getItem(guestKey);
  const chosen = guest ?? legacy;
  if (!chosen) return null;
  storage.setItem(ownedKey, chosen);
  if (guest !== null) storage.removeItem(guestKey);
  return chosen;
}

export function clearOwnedCopies(storage: LocalBucket | null, base: string, userId: string | null) {
  if (!storage) return;
  storage.removeItem(base);
  storage.removeItem(guestStorageKey(base));
  if (userId) storage.removeItem(userStorageKey(base, userId));
}
