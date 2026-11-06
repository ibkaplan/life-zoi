import { describe, expect, it } from "vitest";
import { clearOwnedCopies, guestStorageKey, takeForAccount, userStorageKey } from "@/lib/owned-local";

function bucket() {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
}

const BASE = "lifezoi.example.v1";
const ALICE = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const BLAKE = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

describe("owned browser storage", () => {
  it("gives an empty account the shared blob once and hides it from the next account", () => {
    const storage = bucket();
    storage.setItem(BASE, "{\"owner\":\"ada\"}");
    expect(takeForAccount(storage, BASE, ALICE, false)).toBe("{\"owner\":\"ada\"}");
    expect(storage.getItem(BASE)).toBeNull();
    expect(storage.getItem(userStorageKey(BASE, ALICE))).toBe("{\"owner\":\"ada\"}");
    expect(takeForAccount(storage, BASE, BLAKE, false)).toBeNull();
    expect(storage.getItem(userStorageKey(BASE, BLAKE))).toBeNull();
  });

  it("does not copy another person's blob over an account that already has data", () => {
    const storage = bucket();
    storage.setItem(BASE, "{\"owner\":\"ada\"}");
    expect(takeForAccount(storage, BASE, BLAKE, true)).toBeNull();
    expect(storage.getItem(BASE)).toBeNull();
    expect(storage.getItem(userStorageKey(BASE, BLAKE))).toBeNull();
  });

  it("keeps a guest draft for the first empty account and then removes it", () => {
    const storage = bucket();
    storage.setItem(guestStorageKey(BASE), "{\"draft\":1}");
    expect(takeForAccount(storage, BASE, ALICE, false)).toBe("{\"draft\":1}");
    expect(storage.getItem(guestStorageKey(BASE))).toBeNull();
    expect(takeForAccount(storage, BASE, BLAKE, false)).toBeNull();
  });

  it("clears the shared key, the guest key, and this account's key", () => {
    const storage = bucket();
    storage.setItem(BASE, "shared");
    storage.setItem(guestStorageKey(BASE), "guest");
    storage.setItem(userStorageKey(BASE, ALICE), "alice");
    storage.setItem(userStorageKey(BASE, BLAKE), "blake");
    clearOwnedCopies(storage, BASE, ALICE);
    expect(storage.getItem(BASE)).toBeNull();
    expect(storage.getItem(guestStorageKey(BASE))).toBeNull();
    expect(storage.getItem(userStorageKey(BASE, ALICE))).toBeNull();
    expect(storage.getItem(userStorageKey(BASE, BLAKE))).toBe("blake");
  });
});
