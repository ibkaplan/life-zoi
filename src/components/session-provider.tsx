"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { clearAccountRecords, useAccount, writeAccountSession } from "@/lib/account-store";
import {
  getBrowserStoreServerSnapshot,
  getBrowserStoreSnapshot,
  subscribeBrowserStore,
  todayDate,
  writeBrowserStore,
} from "@/lib/browser-store";
import { clearAssistantThread } from "@/lib/assistant";
import { clearRecentQuestions } from "@/lib/wellness-assistant/recent";
import { clearChangeLab } from "@/lib/change-lab";
import { clearBrainLocal, sanitizeBrain, writeBrainLocal, type BrainProgress } from "@/lib/brain-quiz/progress";
import { sanitizeFoodPlan } from "@/lib/food-plan/plan";
import type { FoodPlanState } from "@/lib/food-plan/types";
import { clearHabitLocal, sanitizeHabitJourney, writeHabitLocal, type HabitJourney } from "@/lib/habit-transformation/model";
import { clearPurpose } from "@/lib/purpose";
import { resetWellnessClient } from "@/lib/wellness/client-store";
import { createSampleSession } from "@/lib/sample";
import { mondayOf } from "@/lib/dates";
import {
  completeDraft,
  removeCheckIn,
  removeGoal,
  removeScenario,
  removeWeightEntry,
  chooseReassessment,
  saveScenario,
  upsertCheckIn,
  upsertGoal,
  upsertWeeklyCheckIn,
  upsertWeightEntry,
} from "@/lib/session";
import { selectedAccomplishments } from "@/lib/weekly-progress";
import {
  emptySession,
  WEEKLY_ACCOMPLISHMENT_IDS,
  type Assessment,
  type EnergyLevel,
  type HabitId,
  type ReassessDays,
  type TrackableHabitId,
  type UserSession,
  type WeeklyAccomplishmentId,
  type WeightUnit,
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
  saveWeeklyCheckIn: (input: {
    energy: EnergyLevel | null;
    accomplishments: WeeklyAccomplishmentId[];
    proudOf: string;
  }) => string | null;
  saveWeight: (input: { date: string; value: number; unit: WeightUnit }) => string | null;
  removeWeight: (id: string) => void;
  clearUserData: () => void;
  saveBrain: (brainQuiz: BrainProgress) => void;
  saveHabit: (habitJourney: HabitJourney) => void;
  saveFoodPlan: (foodPlan: FoodPlanState) => void;
  setSample: (on: boolean) => void;
  setReassessment: (days: ReassessDays) => string | null;
};

const SessionContext = createContext<SessionApi | null>(null);
const READ_ONLY = "Sample data is read-only. Turn off the sample to record your own answers.";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeBrowserStore,
    getBrowserStoreSnapshot,
    getBrowserStoreServerSnapshot,
  );
  const account = useAccount();
  const signedIn = account.phase === "ready";
  const session = useMemo(
    () => (snapshot.sample ? createSampleSession(todayDate()) : signedIn ? account.session : snapshot.stored),
    [account.session, signedIn, snapshot],
  );

  const api = useMemo<SessionApi>(() => {
    const stored = signedIn ? account.session : snapshot.stored;
    const sample = snapshot.sample;
    function commit(next: UserSession, mode: "soon" | "now" = "now") {
      if (sample) return;
      if (signedIn) writeAccountSession(next, mode);
      else writeBrowserStore(next, false);
    }
    return {
      ready: snapshot.ready && account.phase !== "loading",
      sample,
      session,
      setDraft: (draft) => {
        if (sample) return;
        commit({ ...stored, draft }, "soon");
      },
      setDraftStep: (step) => {
        if (sample) return;
        commit({ ...stored, draftStep: step }, "soon");
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
      saveWeeklyCheckIn: (input) => {
        if (sample) return READ_ONLY;
        const weekStart = mondayOf(todayDate());
        if (!weekStart) return "This week could not be saved.";
        const energy =
          input.energy === null ||
          (Number.isInteger(input.energy) && input.energy >= 1 && input.energy <= 5)
            ? input.energy
            : null;
        if (input.energy !== null && energy === null) return "Choose an energy from 1 to 5, or leave it unset.";
        const accomplishments = selectedAccomplishments(
          Object.fromEntries(WEEKLY_ACCOMPLISHMENT_IDS.map((id) => [id, input.accomplishments.includes(id)])),
        );
        const existing = stored.weeklyCheckIns.find((item) => item.weekStart === weekStart);
        commit(
          upsertWeeklyCheckIn(stored, {
            id: existing?.id ?? crypto.randomUUID(),
            weekStart,
            savedAt: new Date().toISOString(),
            energy,
            accomplishments,
            proudOf: input.proudOf.trim().slice(0, 280),
          }),
        );
        return null;
      },
      saveWeight: (input) => {
        if (sample) return READ_ONLY;
        const dateError = validateCheckInDate(input.date, todayDate());
        if (dateError) return dateError;
        if (input.unit !== "lb" && input.unit !== "kg") return "Choose pounds or kilograms.";
        if (typeof input.value !== "number" || !Number.isFinite(input.value)) return "Enter a weight greater than 0.";
        const value = Math.round(input.value * 100) / 100;
        if (value <= 0 || value > 1000) return "Enter a weight greater than 0 and up to 1000.";
        const existing = stored.weightEntries.find((item) => item.date === input.date && item.unit === input.unit);
        commit(
          upsertWeightEntry(stored, {
            id: existing?.id ?? crypto.randomUUID(),
            date: input.date,
            value,
            unit: input.unit,
          }),
        );
        return null;
      },
      removeWeight: (id) => {
        if (sample) return;
        commit(removeWeightEntry(stored, id));
      },
      setReassessment: (days) => {
        if (sample) return READ_ONLY;
        commit(chooseReassessment(stored, days, todayDate()));
        return null;
      },
      saveBrain: (brainQuiz) => {
        if (sample) return;
        const clean = sanitizeBrain(brainQuiz);
        writeBrainLocal(typeof window === "undefined" ? null : window.localStorage, clean);
        commit({ ...stored, brainQuiz: clean });
      },
      saveHabit: (habitJourney) => {
        if (sample) return;
        const clean = sanitizeHabitJourney(habitJourney);
        writeHabitLocal(typeof window === "undefined" ? null : window.localStorage, clean);
        commit({ ...stored, habitJourney: clean });
      },
      saveFoodPlan: (foodPlan) => {
        if (sample) return;
        commit({ ...stored, foodPlan: sanitizeFoodPlan(foodPlan) });
      },
      clearUserData: () => {
        clearAssistantThread(typeof window === "undefined" ? null : window.sessionStorage);
        clearRecentQuestions(typeof window === "undefined" ? null : window.sessionStorage);
        clearChangeLab(typeof window === "undefined" ? null : window.sessionStorage);
        clearPurpose(typeof window === "undefined" ? null : window.sessionStorage);
        clearBrainLocal(typeof window === "undefined" ? null : window.localStorage);
        clearHabitLocal(typeof window === "undefined" ? null : window.localStorage);
        resetWellnessClient();
        if (signedIn) void clearAccountRecords();
        writeBrowserStore(emptySession(), false);
      },
      setSample: (on) => writeBrowserStore(snapshot.stored, on),
    };
  }, [account.phase, account.session, session, signedIn, snapshot]);

  return <SessionContext.Provider value={api}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("Session is unavailable.");
  return value;
}
