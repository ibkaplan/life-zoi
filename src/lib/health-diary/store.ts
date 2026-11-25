"use client";

import { useCallback, useEffect, useState } from "react";
import { getAccountSnapshot } from "@/lib/account-store";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { insertReading, loadReadings, removeAllReadings, removeReading } from "./repository";
import { sampleReadings } from "./sample";
import type { HealthReading, NewReading } from "./types";

/**
 * loading: reading the account. account: saved in the person's account.
 * not-ready: the account is signed in but the diary table is not set up yet.
 * offline: the account could not be reached. sample: the labeled sample.
 * signed-out: nobody is signed in (members' pages normally prevent this).
 */
export type DiaryStatus = "loading" | "account" | "not-ready" | "offline" | "sample" | "signed-out";

export type DiaryApi = {
  status: DiaryStatus;
  readings: HealthReading[];
  add: (reading: NewReading) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  removeAll: () => Promise<boolean>;
  retry: () => void;
};

/**
 * The diary lives only in the account. Unlike other LifeZoi pages it keeps no
 * copy in this browser, so readings are not left behind on a shared computer.
 */
export function useHealthDiary(userId: string | null, sample: boolean): DiaryApi {
  const [status, setStatus] = useState<DiaryStatus>("loading");
  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    const settle = (next: DiaryStatus, rows: HealthReading[]) => {
      if (!live) return;
      setStatus(next);
      setReadings(rows);
    };
    if (sample) {
      queueMicrotask(() => settle("sample", sampleReadings()));
      return () => {
        live = false;
      };
    }
    const supabase = getBrowserSupabase();
    if (!userId || !supabase) {
      queueMicrotask(() => settle("signed-out", []));
      return () => {
        live = false;
      };
    }
    queueMicrotask(() => live && setStatus("loading"));
    void loadReadings(supabase, userId).then((result) => {
      if (result.ok) settle("account", result.value);
      else settle(result.missingTable ? "not-ready" : "offline", []);
    });
    return () => {
      live = false;
    };
  }, [userId, sample, attempt]);

  const add = useCallback(
    async (reading: NewReading) => {
      const supabase = getBrowserSupabase();
      if (status !== "account" || !supabase || !userId) return false;
      const result = await insertReading(supabase, userId, reading);
      if (!result.ok) {
        if (result.missingTable) setStatus("not-ready");
        return false;
      }
      setReadings((current) => [result.value, ...current].sort((a, b) => b.measuredAt.localeCompare(a.measuredAt)));
      return true;
    },
    [status, userId],
  );

  const remove = useCallback(
    async (id: string) => {
      const supabase = getBrowserSupabase();
      if (status !== "account" || !supabase || !userId) return false;
      const ok = await removeReading(supabase, userId, id);
      if (ok) setReadings((current) => current.filter((reading) => reading.id !== id));
      return ok;
    },
    [status, userId],
  );

  const removeAll = useCallback(async () => {
    const supabase = getBrowserSupabase();
    if (status !== "account" || !supabase || !userId) return false;
    const ok = await removeAllReadings(supabase, userId);
    if (ok) setReadings([]);
    return ok;
  }, [status, userId]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { status, readings, add, remove, removeAll, retry };
}

/** "Clear my data" in Settings: deletes every diary reading in the signed-in account. */
export async function clearHealthDiaryAccount(): Promise<void> {
  const supabase = getBrowserSupabase();
  const userId = getAccountSnapshot().userId;
  if (!supabase || !userId) return;
  await removeAllReadings(supabase, userId);
}
