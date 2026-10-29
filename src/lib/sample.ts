import { monthKey } from "@/lib/dates";
import type { Assessment, UserSession } from "@/lib/types";

const sampleAnswers: Assessment = {
  displayName: "Sample visitor",
  ageRange: "40-49",
  sleepHours: "6.5",
  sleepQuality: "fair",
  activityDays: "2",
  activityMinutes: "20",
  sedentaryHours: "8",
  vegetables: "some-days",
  hydration: "some",
  smoking: "never",
  alcohol: "occasional",
  stress: "moderate",
  mood: "mixed",
  social: "some",
  goals: ["sleep", "walk"],
  habitNote: "Sample note: a shorter evening wind-down.",
};

export function createSampleSession(today: string): UserSession {
  const month = monthKey(today);
  return {
    draft: { ...sampleAnswers, goals: [...sampleAnswers.goals] },
    draftStep: 7,
    history: [
      {
        id: "sample-assessment",
        completedAt: `${today}T15:00:00.000Z`,
        answers: { ...sampleAnswers, goals: [...sampleAnswers.goals] },
      },
    ],
    scenarios: [
      {
        id: "sample-scenario-walk",
        habitId: "walk",
        note: "Sample note: walks after lunch.",
        savedAt: `${today}T15:04:00.000Z`,
      },
    ],
    goals: [
      { habitId: "walk", daysPerWeek: 3 },
      { habitId: "sleep", daysPerWeek: 5 },
    ],
    checkIns: [
      {
        id: "sample-check-1",
        date: `${month}-01`,
        habitId: "walk",
        done: true,
        note: "Sample check-in",
      },
      {
        id: "sample-check-2",
        date: `${month}-02`,
        habitId: "walk",
        done: true,
        note: "Sample check-in",
      },
      {
        id: "sample-check-3",
        date: `${month}-03`,
        habitId: "walk",
        done: false,
        note: "Sample check-in",
      },
    ],
  };
}

export const SAMPLE_LABEL =
  "Sample data. These answers are an example, not your information, and they are not saved as your record.";
