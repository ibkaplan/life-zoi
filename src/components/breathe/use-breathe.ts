"use client";

import { useProfile } from "@/components/companion/use-profile";
import { commitCompanion } from "@/lib/companion/store";
import { recordEntry } from "@/lib/companion/state";
import { addSession, type BreatheSession, type BreatheState } from "@/lib/breathe/state";
import { safetyFlags } from "@/lib/health-profile";

/** The activity id a breathing session is recorded under in My Day and the weekly totals. */
export const BREATHE_ENTRY_ID = "breathe-session";

export function commitBreathe(change: (state: BreatheState) => BreatheState): boolean {
  return commitCompanion((state) => ({ ...state, breathe: change(state.breathe) }));
}

/** Save a finished or stopped session, and mark it in today's companion log. */
export function saveBreatheSession(session: BreatheSession): boolean {
  return commitCompanion((state) =>
    recordEntry(
      { ...state, breathe: addSession(state.breathe, session) },
      session.date,
      BREATHE_ENTRY_ID,
      { status: session.complete ? "done" : "partial", minutes: Math.max(1, Math.round(session.seconds / 60)), replacedWith: "" },
    ),
  );
}

export function useBreathe() {
  const profile = useProfile();
  const flags = profile.answers ? safetyFlags(profile.answers) : null;
  const breathless = Boolean(profile.answers?.mobilityLimits?.includes("breathlessness")) || Boolean(flags?.injuryNote);
  return { ...profile, breathe: profile.companion.breathe, breathless };
}
