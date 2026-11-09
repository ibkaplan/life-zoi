"use client";

import { useSession } from "@/components/session-provider";
import { LOCAL_NOTE } from "@/lib/habit-transformation/catalog";
import { emptyHabitJourney, type HabitJourney } from "@/lib/habit-transformation/model";
import { useAccount } from "@/lib/account-store";

export function useHabitJourney() {
  const account = useAccount();
  const api = useSession();
  const signedIn = account.phase === "ready";
  const journey = api.sample ? emptyHabitJourney() : api.session.habitJourney;

  return {
    ready: api.ready,
    sample: api.sample,
    signedIn,
    journey,
    save(next: HabitJourney) {
      if (api.sample) return;
      api.saveHabit(next);
    },
    storageNote: !api.ready
      ? "Checking where to save your habit journey…"
      : api.sample
        ? "Sample data is read-only."
        : signedIn
          ? "Saved with this account."
          : LOCAL_NOTE,
  };
}
