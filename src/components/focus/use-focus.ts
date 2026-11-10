"use client";

import { commitCompanion, useCompanion } from "@/lib/companion/store";
import { recordBreak, recordFocusSession, withPrefs, type FocusPrefs, type FocusState } from "@/lib/focus/progress";

export function commitFocus(change: (state: FocusState) => FocusState): boolean {
  return commitCompanion((state) => ({ ...state, focus: change(state.focus) }));
}

export function saveFocusSession(date: string, minutes: number): boolean {
  return commitFocus((state) => recordFocusSession(state, date, minutes));
}

export function saveBreak(date: string): boolean {
  return commitFocus((state) => recordBreak(state, date));
}

/** Focus progress and settings, saved the same way as the rest of the daily companion. */
export function useFocus() {
  const companion = useCompanion();
  return {
    ready: companion.ready,
    saveMode: companion.saveMode,
    focus: companion.state.focus,
    setPrefs(change: Partial<FocusPrefs>) {
      return commitFocus((state) => withPrefs(state, change));
    },
  };
}
