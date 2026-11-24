"use client";

import { useEffect } from "react";
import { useSession } from "@/components/session-provider";
import { useAccount } from "@/lib/account-store";
import { emptyBrainProgress, isEmptyBrain, LOCAL_NOTE, sanitizeBrain, type BrainProgress } from "@/lib/brain-quiz/progress";
import { commitCompanion, getCompanionSnapshot, SAVE_MODE_TEXT, useCompanion } from "@/lib/companion/store";
import { msg } from "@/lib/i18n/translate";

/**
 * Brain & Habit Quiz progress. It is saved with the daily companion record: in this
 * browser, and in the account's companion_state row when signed in, which has room for
 * months of history. Marks saved earlier in the profile row are copied over once.
 */
export function useBrainProgress() {
  const account = useAccount();
  const api = useSession();
  const companion = useCompanion();
  const signedIn = account.phase === "ready";
  const sample = api.sample || companion.saveMode === "sample";
  const ready = api.ready && companion.ready && companion.saveMode !== "loading";
  const legacy = api.sample ? null : api.session.brainQuiz;
  const stored = companion.state.brainQuiz;
  const progress: BrainProgress = sample
    ? emptyBrainProgress()
    : isEmptyBrain(stored) && legacy && !isEmptyBrain(legacy)
      ? legacy
      : stored;

  useEffect(() => {
    if (!ready || sample || !legacy || isEmptyBrain(legacy)) return;
    if (!isEmptyBrain(getCompanionSnapshot().state.brainQuiz)) return;
    commitCompanion((state) => (isEmptyBrain(state.brainQuiz) ? { ...state, brainQuiz: sanitizeBrain(legacy) } : state));
  }, [legacy, ready, sample]);

  return {
    ready,
    sample,
    signedIn,
    progress,
    save(next: BrainProgress) {
      if (sample) return;
      commitCompanion((state) => ({ ...state, brainQuiz: next }));
    },
    storageNote: !ready
      ? msg("Checking where to save marks…")
      : sample
        ? msg("Sample data is read-only.")
        : companion.saveMode === "account"
          ? msg("Saved with this account.")
          : companion.saveMode === "device"
            ? SAVE_MODE_TEXT.device
            : LOCAL_NOTE,
  };
}
