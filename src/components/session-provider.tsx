"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import {
  getBrowserStoreServerSnapshot,
  getBrowserStoreSnapshot,
  subscribeBrowserStore,
  todayDate,
  writeBrowserStore,
} from "@/lib/browser-store";
import { createSampleSession } from "@/lib/sample";
import {
  completeDraft,
  removeCheckIn,
  removeGoal,
  removeScenario,
  saveScenario,
  upsertCheckIn,
  upsertGoal,
} from "@/lib/session";
import {
  emptySession,
  type Assessment,
  type HabitId,
  type TrackableHabitId,
  type UserSession,
} from "@/lib/types";
import { validateCheckInDate, validateDaysPerWeek } from "@/lib/validation";

type CompleteResult = { ok: true } | { ok: false; fields: Record<string, string> };

type SessionApi = {
  ready: boolean;
  sample: boolean;
  session: UserSession;
  setDraft: (draft: Assessment) => void;
  setDraftStep: (step: number) => void;
  completeAssessment: () => CompleteResult;
  saveScenario: (habitId: HabitId, note: string) => string | null;
  removeScenario: (id: string) => void;
  setGoal: (habitId: TrackableHabitId, daysPerWeek: number) => string | null;
  removeGoal: (habitId: TrackableHabitId) => void;
  saveCheckIn: (input: {
    date: string;
    habitId: TrackableHabitId;
    done: boolean;
    note: string;
  }) => string | null;
  removeCheckIn: (id: string) => void;
  clearUserData: () => void;
  setSample: (on: boolean) => void;
};

const SessionContext = createContext<SessionApi | null>(null);
const READ_ONLY = "Sample data is read-only. Turn off the sample to record your own answers.";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeBrowserStore,
    getBrowserStoreSnapshot,
    getBrowserStoreServerSnapshot,
  );
  const session = useMemo(
    () => (snapshot.sample ? createSampleSession(todayDate()) : snapshot.stored),
    [snapshot],
  );

  const api = useMemo<SessionApi>(() => {
    const stored = snapshot.stored;
    const sample = snapshot.sample;
    function commit(next: UserSession, sampleFlag = sample) {
      writeBrowserStore(next, sampleFlag);
    }
    return {
      ready: snapshot.ready,
      sample,
      session,
      setDraft: (draft) => {
        if (sample) return;
        commit({ ...stored, draft });
      },
      setDraftStep: (step) => {
        if (sample) return;
        commit({ ...stored, draftStep: step });
      },
      completeAssessment: () => {
        if (sample) return { ok: false, fields: { form: READ_ONLY } };
        const next = completeDraft(stored, crypto.randomUUID(), new Date().toISOString());
        if (!next.ok) return next;
        commit(next.session);
        return { ok: true };
      },
      saveScenario: (habitId, note) => {
        if (sample) return READ_ONLY;
        if (habitId === "custom" && !note.trim()) return "Describe the change before saving.";
        commit(
          saveScenario(stored, {
            id: crypto.randomUUID(),
            habitId,
            note: note.trim(),
            savedAt: new Date().toISOString(),
          }),
        );
        return null;
      },
      removeScenario: (id) => {
        if (sample) return;
        commit(removeScenario(stored, id));
      },
      setGoal: (habitId, daysPerWeek) => {
        if (sample) return READ_ONLY;
        const error = validateDaysPerWeek(daysPerWeek);
        if (error) return error;
        commit(upsertGoal(stored, { habitId, daysPerWeek }));
        return null;
      },
      removeGoal: (habitId) => {
        if (sample) return;
        commit(removeGoal(stored, habitId));
      },
      saveCheckIn: (input) => {
        if (sample) return READ_ONLY;
        const dateError = validateCheckInDate(input.date, todayDate());
        if (dateError) return dateError;
        const existing = stored.checkIns.find(
          (item) => item.date === input.date && item.habitId === input.habitId,
        );
        commit(
          upsertCheckIn(stored, {
            id: existing?.id ?? crypto.randomUUID(),
            date: input.date,
            habitId: input.habitId,
            done: input.done,
            note: input.note.trim().slice(0, 280),
          }),
        );
        return null;
      },
      removeCheckIn: (id) => {
        if (sample) return;
        commit(removeCheckIn(stored, id));
      },
      clearUserData: () => commit(emptySession(), false),
      setSample: (on) => commit(stored, on),
    };
  }, [snapshot, session]);

  return <SessionContext.Provider value={api}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("Session is unavailable.");
  return value;
}
