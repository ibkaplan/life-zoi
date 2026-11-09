"use client";

import { useSession } from "@/components/session-provider";
import { useCompanion } from "@/lib/companion/store";
import { moverProfile } from "@/lib/wellness-library/discover";
import type { Assessment } from "@/lib/types";

/** The person's latest saved assessment, or the draft they are filling in. Never invented. */
export function useProfile() {
  const { ready, sample, session } = useSession();
  const companion = useCompanion();
  const saved = session.history[0]?.answers ?? null;
  const answers: Assessment | null = saved ?? (session.draft.displayName || session.draft.sleepHours ? session.draft : null);
  const mover = moverProfile(answers, companion.state.movement);
  return {
    ready: ready && companion.ready,
    sample,
    session,
    answers,
    hasAssessment: saved !== null,
    companion: companion.state,
    saveMode: companion.saveMode,
    mover,
  };
}
