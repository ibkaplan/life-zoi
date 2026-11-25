"use client";

import { emptyChallenge, fromRow, parseSummary, sanitizeChallenge, toRow, type CircleSummary, type FriendChallenge } from "@/lib/friends/challenge";
import { userStorageKey } from "@/lib/owned-local";
import { getBrowserSupabase } from "@/lib/supabase-browser";

/**
 * Saves the Together challenge to the person's own friend_challenge row
 * (supabase/migrations/20261125120000_friend_challenge.sql) and keeps a copy
 * in this browser. Until the table exists, the copy in this browser is used
 * and the page says so. Nothing here is sent anywhere else.
 */
export const FRIEND_CHALLENGE_KEY = "lifezoi.friendChallenge.v1";

export type ChallengeSaveMode = "account" | "device";

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function readLocal(userId: string): FriendChallenge {
  try {
    const raw = storage()?.getItem(userStorageKey(FRIEND_CHALLENGE_KEY, userId));
    return raw ? sanitizeChallenge(JSON.parse(raw) as unknown) : emptyChallenge();
  } catch {
    return emptyChallenge();
  }
}

function writeLocal(userId: string, state: FriendChallenge) {
  try {
    storage()?.setItem(userStorageKey(FRIEND_CHALLENGE_KEY, userId), JSON.stringify(state));
  } catch {
    // Storage can be full or blocked. The page still works for this visit.
  }
}

export async function loadChallenge(userId: string): Promise<{ state: FriendChallenge; mode: ChallengeSaveMode }> {
  const local = readLocal(userId);
  const supabase = getBrowserSupabase();
  if (!supabase) return { state: local, mode: "device" };
  const { data, error } = await supabase
    .from("friend_challenge")
    .select("started_on, done_days, share_with_friends")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return { state: local, mode: "device" };
  if (!data) {
    // A challenge started before the table existed moves into the account.
    if (local.startedOn) {
      const saved = await saveChallenge(userId, local);
      return { state: local, mode: saved };
    }
    return { state: local, mode: "account" };
  }
  const remote = fromRow(data);
  writeLocal(userId, remote);
  return { state: remote, mode: "account" };
}

export async function saveChallenge(userId: string, state: FriendChallenge): Promise<ChallengeSaveMode> {
  writeLocal(userId, state);
  const supabase = getBrowserSupabase();
  if (!supabase || !state.startedOn) return supabase ? "account" : "device";
  const { error } = await supabase.from("friend_challenge").upsert(toRow(state, userId), { onConflict: "user_id" });
  return error ? "device" : "account";
}

/** Only counts come back. Null when the function is not in the database yet. */
export async function loadCircleSummary(): Promise<CircleSummary | null> {
  const supabase = getBrowserSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("friend_circle_summary");
  if (error) return null;
  return parseSummary(data);
}
