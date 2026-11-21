"use client";

import { msg } from "@/lib/i18n/translate";
import { createContext, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { clearAccountRecords, useAccount, writeAccountSession } from "@/lib/account-store";
import {
  getBrowserStoreServerSnapshot,
  getBrowserStoreSnapshot,
  subscribeBrowserStore,
  todayDate,
  writeBrowserStore,
} from "@/lib/browser-store";
import { clearAssistantThread } from "@/lib/assistant";
import { bindCompanionOwner, clearCompanionAccount, clearCompanionLocal } from "@/lib/companion/store";
import { clearLiveSession } from "@/lib/wellness-assistant/live-session";
import { clearRecentQuestions } from "@/lib/wellness-assistant/recent";
import { clearChangeLab } from "@/lib/change-lab";
import {
  BRAIN_STORAGE_KEY,
  clearBrainLocal,
  isEmptyBrain,
  readBrainLocal,
  sanitizeBrain,
  writeBrainLocal,
  type BrainProgress,
} from "@/lib/brain-quiz/progress";
import { sanitizeFoodPlan } from "@/lib/food-plan/plan";
import type { FoodPlanState } from "@/lib/food-plan/types";
import {
  clearHabitLocal,
  isEmptyHabitJourney,
  readHabitLocal,
  sanitizeHabitJourney,
  writeHabitLocal,
  type HabitJourney,
} from "@/lib/habit-transformation/model";
import { HABIT_STORAGE_KEY } from "@/lib/habit-transformation/catalog";
import { EMOTIONAL_STORAGE_KEY } from "@/lib/emotional-wellness/storage";
import { bindEmotionalOwner, clearEmotionalStore } from "@/lib/emotional-wellness/store";
import { bindCalorieOwner, clearCalorieStore } from "@/lib/calories/store";
import { CALORIE_STORAGE_KEY } from "@/lib/calories/storage";
import { clearPurpose } from "@/lib/purpose";
import { reloadGuestMyDay } from "@/lib/my-day/client";
import { isEmptyMyDay, loadMyDay, MY_DAY_STORAGE_KEY, sanitizeMyDay, saveMyDay as writeMyDayFile } from "@/lib/my-day/storage";
import { clearOwnedCopies, guestStorageKey, takeForAccount, userStorageKey } from "@/lib/owned-local";
import { bindWellnessOwner, resetWellnessClient } from "@/lib/wellness/client-store";
import { MOVEMENT_STUDIO_KEY } from "@/lib/wellness/movement-studio/progress";
import { bindStudioOwner } from "@/lib/wellness/movement-studio/studio-store";
import { WELLNESS_STORAGE_KEY } from "@/lib/wellness/storage";
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
  saveMyDay: (myDay: UserSession["myDay"]) => void;
  setSample: (on: boolean) => void;
  setReassessment: (days: ReassessDays) => string | null;
};

const SessionContext = createContext<SessionApi | null>(null);
const READ_ONLY = msg("Sample data is read-only. Turn off the sample to record your own answers.");

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeBrowserStore,
    getBrowserStoreSnapshot,
    getBrowserStoreServerSnapshot,
  );
  const account = useAccount();
  const signedIn = account.phase === "ready";
  const adoptedFor = useRef<string | null>(null);
  const sessionRef = useRef(account.session);
  const storedRef = useRef(snapshot.stored);
  const userId = signedIn ? account.userId : null;

  useEffect(() => {
    sessionRef.current = account.session;
    storedRef.current = snapshot.stored;
  });

  useEffect(() => {
    if (account.phase === "loading") return;
    bindEmotionalOwner(userId, account.phase === "off");
    bindStudioOwner(userId);
    bindCalorieOwner(userId);
    bindWellnessOwner(userId);
    bindCompanionOwner(userId, { sample: snapshot.sample });
    if (!userId) {
      adoptedFor.current = null;
      reloadGuestMyDay();
      if (!snapshot.sample && isEmptyMyDay(storedRef.current.myDay)) {
        const storage = window.localStorage;
        const guest = loadMyDay(storage, guestStorageKey(MY_DAY_STORAGE_KEY));
        const legacy = loadMyDay(storage, MY_DAY_STORAGE_KEY);
        const found = !isEmptyMyDay(guest) ? guest : legacy;
        if (!isEmptyMyDay(found)) writeBrowserStore({ ...storedRef.current, myDay: found }, false);
      }
      return;
    }
    if (snapshot.sample || adoptedFor.current === userId) return;
    adoptedFor.current = userId;
    const storage = window.localStorage;
    let next = sessionRef.current;
    const brainKey = userStorageKey(BRAIN_STORAGE_KEY, userId);
    const brainRaw = takeForAccount(storage, BRAIN_STORAGE_KEY, userId, !isEmptyBrain(next.brainQuiz));
    if (isEmptyBrain(next.brainQuiz) && brainRaw) {
      const parsed = readBrainLocal(storage, brainKey);
      if (parsed && !isEmptyBrain(parsed)) next = { ...next, brainQuiz: parsed };
    }
    const habitKey = userStorageKey(HABIT_STORAGE_KEY, userId);
    const habitRaw = takeForAccount(storage, HABIT_STORAGE_KEY, userId, !isEmptyHabitJourney(next.habitJourney));
    if (isEmptyHabitJourney(next.habitJourney) && habitRaw) {
      const parsed = readHabitLocal(storage, habitKey);
      if (parsed && !isEmptyHabitJourney(parsed)) next = { ...next, habitJourney: parsed };
    }
    const dayKey = userStorageKey(MY_DAY_STORAGE_KEY, userId);
    const dayRaw = takeForAccount(storage, MY_DAY_STORAGE_KEY, userId, !isEmptyMyDay(next.myDay));
    if (isEmptyMyDay(next.myDay) && dayRaw) {
      const parsed = loadMyDay(storage, dayKey);
      if (!isEmptyMyDay(parsed)) next = { ...next, myDay: parsed };
    }
    if (next !== sessionRef.current) writeAccountSession(next);
  }, [account.phase, snapshot.sample, userId]);
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
        if (habitId === "custom" && !note.trim()) return msg("Describe the change before saving.");
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
        if (!weekStart) return msg("This week could not be saved.");
        const energy =
          input.energy === null ||
          (Number.isInteger(input.energy) && input.energy >= 1 && input.energy <= 5)
            ? input.energy
            : null;
        if (input.energy !== null && energy === null) return msg("Choose an energy from 1 to 5, or leave it unset.");
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
        if (input.unit !== "lb" && input.unit !== "kg") return msg("Choose pounds or kilograms.");
        if (typeof input.value !== "number" || !Number.isFinite(input.value)) return msg("Enter a weight greater than 0.");
        const value = Math.round(input.value * 100) / 100;
        if (value <= 0 || value > 1000) return msg("Enter a weight greater than 0 and up to 1000.");
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
        const storage = typeof window === "undefined" ? null : window.localStorage;
        const key = userId ? userStorageKey(BRAIN_STORAGE_KEY, userId) : guestStorageKey(BRAIN_STORAGE_KEY);
        writeBrainLocal(storage, clean, key);
        commit({ ...stored, brainQuiz: clean });
      },
      saveHabit: (habitJourney) => {
        if (sample) return;
        const clean = sanitizeHabitJourney(habitJourney);
        const storage = typeof window === "undefined" ? null : window.localStorage;
        const key = userId ? userStorageKey(HABIT_STORAGE_KEY, userId) : guestStorageKey(HABIT_STORAGE_KEY);
        writeHabitLocal(storage, clean, key);
        commit({ ...stored, habitJourney: clean });
      },
      saveFoodPlan: (foodPlan) => {
        if (sample) return;
        commit({ ...stored, foodPlan: sanitizeFoodPlan(foodPlan) });
      },
      saveMyDay: (myDay) => {
        if (sample) return;
        const clean = sanitizeMyDay(myDay);
        const storage = typeof window === "undefined" ? null : window.localStorage;
        const key = userId ? userStorageKey(MY_DAY_STORAGE_KEY, userId) : guestStorageKey(MY_DAY_STORAGE_KEY);
        writeMyDayFile(storage, clean, key);
        commit({ ...stored, myDay: clean });
      },
      clearUserData: () => {
        const storage = typeof window === "undefined" ? null : window.localStorage;
        clearAssistantThread(typeof window === "undefined" ? null : window.sessionStorage);
        clearRecentQuestions(typeof window === "undefined" ? null : window.sessionStorage);
        clearLiveSession(typeof window === "undefined" ? null : window.sessionStorage);
        clearChangeLab(typeof window === "undefined" ? null : window.sessionStorage);
        clearPurpose(typeof window === "undefined" ? null : window.sessionStorage);
        clearOwnedCopies(storage, BRAIN_STORAGE_KEY, userId);
        clearOwnedCopies(storage, HABIT_STORAGE_KEY, userId);
        clearOwnedCopies(storage, MY_DAY_STORAGE_KEY, userId);
        clearOwnedCopies(storage, EMOTIONAL_STORAGE_KEY, userId);
        clearOwnedCopies(storage, CALORIE_STORAGE_KEY, userId);
        const tab = typeof window === "undefined" ? null : window.sessionStorage;
        clearOwnedCopies(tab, WELLNESS_STORAGE_KEY, userId);
        clearOwnedCopies(tab, MOVEMENT_STUDIO_KEY, userId);
        clearBrainLocal(storage);
        clearHabitLocal(storage);
        clearEmotionalStore();
        clearCalorieStore();
        resetWellnessClient();
        reloadGuestMyDay();
        if (signedIn) {
          void clearAccountRecords();
          void clearCompanionAccount();
        } else {
          clearCompanionLocal();
        }
        writeBrowserStore(emptySession(), false);
      },
      setSample: (on) => writeBrowserStore(snapshot.stored, on),
    };
  }, [account.phase, account.session, session, signedIn, snapshot, userId]);

  return <SessionContext.Provider value={api}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("Session is unavailable.");
  return value;
}
