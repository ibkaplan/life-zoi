"use client";

import { useSession } from "@/components/session-provider";
import { useAccount } from "@/lib/account-store";
import { emptyBrainProgress, LOCAL_NOTE, type BrainProgress } from "@/lib/brain-quiz/progress";
import { msg } from "@/lib/i18n/translate";

export function useBrainProgress() {
  const account = useAccount();
  const api = useSession();
  const signedIn = account.phase === "ready";
  const progress = api.sample ? emptyBrainProgress() : api.session.brainQuiz;

  return {
    ready: api.ready,
    sample: api.sample,
    signedIn,
    progress,
    save(next: BrainProgress) {
      if (api.sample) return;
      api.saveBrain(next);
    },
    storageNote: !api.ready
      ? msg("Checking where to save marks…")
      : api.sample
        ? msg("Sample data is read-only.")
        : signedIn
          ? msg("Saved with this account.")
          : LOCAL_NOTE,
  };
}
