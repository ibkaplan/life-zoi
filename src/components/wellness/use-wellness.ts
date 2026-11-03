"use client";

import { useSyncExternalStore } from "react";
import { useSession } from "@/components/session-provider";
import {
  commitWellness,
  getWellnessServerSnapshot,
  getWellnessSnapshot,
  subscribeWellness,
} from "@/lib/wellness/client-store";
import { findCheck, newRecordId, uniqueHabitSlug, upsertCheck } from "@/lib/wellness/storage";
import { LIFE_HABITS } from "@/lib/wellness/life-plan";
import type {
  HabitMark,
  IfThenPlan,
  LifeHabit,
  MomentPlan,
  NatureActivityId,
  NatureEntry,
  NatureRoutine,
  ReminderSlot,
  UrgeEntry,
  WellnessLog,
  WellnessMotivation,
} from "@/lib/wellness/types";
import { localISODate } from "@/lib/dates";

const READ_ONLY = "Sample data is read-only. Turn off the sample to record your own notes.";

export function useWellness() {
  const { sample } = useSession();
  const log = useSyncExternalStore(subscribeWellness, getWellnessSnapshot, getWellnessServerSnapshot);
  const today = localISODate();

  function save(next: WellnessLog): string | null {
    if (sample) return READ_ONLY;
    commitWellness(next);
    return null;
  }

  return {
    log,
    sample,
    today,
    readOnlyMessage: sample ? READ_ONLY : null,
    toggleCheck(id: string, reflection = "") {
      const existing = findCheck(log, id, today);
      return save(
        upsertCheck(log, {
          id,
          date: today,
          done: existing ? !existing.done : true,
          reflection: reflection || existing?.reflection || "",
        }),
      );
    },
    saveReflection(id: string, reflection: string) {
      const existing = findCheck(log, id, today);
      return save(
        upsertCheck(log, {
          id,
          date: today,
          done: existing?.done ?? false,
          reflection,
        }),
      );
    },
    checked(id: string) {
      return findCheck(log, id, today)?.done ?? false;
    },
    reflection(id: string) {
      return findCheck(log, id, today)?.reflection ?? "";
    },
    startChallenge(challengeId: string) {
      if (log.challengeStarts.some((item) => item.challengeId === challengeId)) return null;
      return save({
        ...log,
        challengeStarts: [...log.challengeStarts, { challengeId, startedOn: today }],
      });
    },
    setMotivation(motivation: WellnessMotivation) {
      return save({ ...log, motivation });
    },
    toggleReminder(slot: ReminderSlot) {
      const reminders = log.reminders.includes(slot)
        ? log.reminders.filter((item) => item !== slot)
        : [...log.reminders, slot];
      return save({ ...log, reminders });
    },
    dismissReminder() {
      return save({ ...log, reminderSeenOn: today });
    },
    saveUrge(entry: Omit<UrgeEntry, "id" | "date"> & { id?: string }) {
      const next: UrgeEntry = { ...entry, id: entry.id && entry.id.length > 0 ? entry.id : newRecordId(), date: today };
      const urges = [next, ...log.urges.filter((item) => item.id !== next.id)];
      return save({ ...log, urges });
    },
    saveMoment(entry: Omit<MomentPlan, "id" | "date"> & { id?: string }) {
      const next: MomentPlan = {
        ...entry,
        id: entry.id && entry.id.length > 0 ? entry.id : newRecordId(),
        date: entry.id ? log.moments.find((item) => item.id === entry.id)?.date ?? today : today,
      };
      const moments = [next, ...log.moments.filter((item) => item.id !== next.id)];
      return save({ ...log, moments });
    },
    addHabit(input: { slug?: string; title: string; cadence: LifeHabit["cadence"]; target: number; note?: string }) {
      if (input.slug && log.habits.some((item) => item.slug === input.slug)) {
        return "That habit is already in the plan.";
      }
      const slug = input.slug ?? uniqueHabitSlug(log, input.title);
      if (log.habits.some((item) => item.slug === slug)) return "That habit is already in the plan.";
      const habit: LifeHabit = {
        id: newRecordId(),
        slug,
        title: input.title,
        cadence: input.cadence,
        target: input.target,
        paused: false,
        createdOn: today,
        note: input.note ?? "",
      };
      return save({ ...log, habits: [...log.habits, habit] });
    },
    updateHabit(id: string, patch: Partial<Pick<LifeHabit, "title" | "cadence" | "target" | "note" | "paused">>) {
      return save({
        ...log,
        habits: log.habits.map((habit) => (habit.id === id ? { ...habit, ...patch, id: habit.id, slug: habit.slug, createdOn: habit.createdOn } : habit)),
      });
    },
    removeHabit(id: string) {
      return save({ ...log, habits: log.habits.filter((habit) => habit.id !== id) });
    },
    addHabitMark(slug: string) {
      const mark: HabitMark = { id: newRecordId(), slug, date: today };
      return save({ ...log, habitMarks: [mark, ...log.habitMarks] });
    },
    removeHabitMark(slug: string) {
      const index = log.habitMarks.findIndex((mark) => mark.slug === slug && mark.date === today);
      if (index < 0) return null;
      const habitMarks = log.habitMarks.filter((_, itemIndex) => itemIndex !== index);
      return save({ ...log, habitMarks });
    },
    saveIfThen(plan: Omit<IfThenPlan, "id"> & { id?: string }) {
      const next: IfThenPlan = { id: plan.id && plan.id.length > 0 ? plan.id : newRecordId(), cue: plan.cue, action: plan.action };
      const ifThen = [next, ...log.ifThen.filter((item) => item.id !== next.id)];
      return save({ ...log, ifThen });
    },
    removeIfThen(id: string) {
      return save({ ...log, ifThen: log.ifThen.filter((item) => item.id !== id) });
    },
    catalogHabit(slug: string) {
      return LIFE_HABITS.find((item) => item.slug === slug) ?? null;
    },
    saveNatureEntry(entry: Omit<NatureEntry, "id" | "date">) {
      const scales = [entry.moodBefore, entry.moodAfter, entry.energy, entry.sleep];
      if (scales.some((value) => value !== null && (!Number.isInteger(value) || value < 1 || value > 5))) {
        return "Mood, energy, and sleep use whole numbers from 1 to 5, or stay blank.";
      }
      if (
        entry.outdoorMinutes !== null &&
        (!Number.isInteger(entry.outdoorMinutes) || entry.outdoorMinutes < 0 || entry.outdoorMinutes > 600)
      ) {
        return "Outdoor minutes are a whole number from 0 to 600, or stay blank.";
      }
      const next: NatureEntry = { ...entry, id: newRecordId(), date: today };
      return save({ ...log, natureEntries: [next, ...log.natureEntries] });
    },
    setNatureRoutine(natureRoutine: NatureRoutine) {
      return save({ ...log, natureRoutine });
    },
    toggleNaturePick(id: NatureActivityId) {
      const naturePicks = log.naturePicks.includes(id)
        ? log.naturePicks.filter((item) => item !== id)
        : [...log.naturePicks, id];
      return save({ ...log, naturePicks });
    },
  };
}
