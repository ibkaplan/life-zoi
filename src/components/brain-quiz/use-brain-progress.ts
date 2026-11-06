"use client";

import { useEffect } from "react";
import { useSession } from "@/components/session-provider";
import { useAccount } from "@/lib/account-store";
import {
  emptyBrainProgress,
  isEmptyBrain,
  LOCAL_NOTE,
  readBrainLocal,
  type BrainProgress,
} from "@/lib/brain-quiz/progress";

export function useBrainProgress() {
  const account = useAccount();
  const api = useSession();
  const signedIn = account.phase === "ready";
  const progress = api.sample ? emptyBrainProgress() : api.session.brainQuiz;

  useEffect(() => {
    if (!api.ready || api.sample) return;
    if (!isEmptyBrain(api.session.brainQuiz)) return;
    const local = readBrainLocal(window.localStorage);
    if (!local || isEmptyBrain(local)) return;
    api.saveBrain(local);
  }, [api, api.ready, api.sample, api.session.brainQuiz]);

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
      ? "Checking where to save marks…"
      : api.sample
        ? "Sample data is read-only."
        : signedIn
          ? "Saved with this account."
          : LOCAL_NOTE,
  };
}
