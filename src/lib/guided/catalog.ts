import { msg } from "@/lib/i18n/translate";
import { MEDITATION_SESSIONS } from "@/lib/guided/meditation";
import { MOVEMENT_SESSIONS } from "@/lib/guided/movement";
import type { DayPart, GuidedKind, GuidedSession } from "@/lib/guided/types";

export const GUIDED_SESSIONS: GuidedSession[] = [...MOVEMENT_SESSIONS, ...MEDITATION_SESSIONS];

export function guidedById(id: string): GuidedSession | null {
  return GUIDED_SESSIONS.find((session) => session.id === id) ?? null;
}

export const KIND_LABEL: Record<GuidedKind, string> = {
  pilates: msg("Pilates"),
  yoga: msg("Yoga"),
  stretching: msg("Stretching"),
  mobility: msg("Mobility"),
  breathing: msg("Breathing"),
  relaxation: msg("Relaxation"),
  meditation: msg("Meditation"),
};

export const KIND_ICON: Record<GuidedKind, string> = {
  pilates: "🧘‍♀️",
  yoga: "🌅",
  stretching: "🤸",
  mobility: "🔄",
  breathing: "🌬️",
  relaxation: "🛋️",
  meditation: "🪷",
};

/** Shown with every session. */
export const NOT_MEDICAL = msg("General wellness guidance, not medical advice. Go at a gentle pace, and stop if anything hurts.");

/** What My Day suggests for each part of the day, in order. Ids must exist (checked by tests). */
export const DAY_PICKS: Record<DayPart, { id: string; label: string }[]> = {
  morning: [
    { id: "meditation-morning-5", label: msg("Morning meditation") },
    { id: "pilates-gentle", label: msg("Gentle Pilates") },
    { id: "yoga-morning", label: msg("Morning yoga") },
  ],
  afternoon: [
    { id: "stretch-full-body", label: msg("Stretching") },
    { id: "breathing-calm", label: msg("Breathing exercise") },
    { id: "meditation-stress-5", label: msg("Stress relief") },
  ],
  evening: [
    { id: "relax-muscles", label: msg("Relaxation") },
    { id: "meditation-evening-10", label: msg("Evening meditation") },
    { id: "yoga-gentle", label: msg("Gentle stretching and yoga") },
    { id: "meditation-sleep-10", label: msg("Sleep preparation") },
  ],
};

export const DAY_PART_LABEL: Record<DayPart, string> = {
  morning: msg("Morning"),
  afternoon: msg("Afternoon"),
  evening: msg("Evening"),
};

/** Morning until noon, afternoon until 18:00, then evening. The same rule as My Health Day. */
export function dayPartFor(hour: number): DayPart {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}
