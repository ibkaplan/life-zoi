import type { CalorieLog } from "@/lib/calories/types";
import { totals } from "@/lib/calories/math";
import type { CompanionState, DailyFeeling } from "@/lib/companion/state";
import { factOfTheDay, type HealthFact } from "@/lib/encyclopedia/facts";
import { msg } from "@/lib/i18n/translate";
import type { LibraryCategory } from "@/lib/music-library/catalog";
import { isTracked, TRACK_ITEMS } from "@/lib/movement-breaks/personal";

/**
 * My Health Day: one look at today, built only from what the person already
 * recorded in this browser (the movement tracker, Breathe for Life sessions,
 * and the calorie counter) plus the Encyclopedia's Fact of the Day.
 * Nothing is inferred, scored, or sent anywhere. An empty day stays empty.
 */

export type PartOfDay = "morning" | "afternoon" | "evening";

export function partOfDay(hour: number): PartOfDay {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export type HealthDaySummary = {
  habits: { done: number; total: number };
  movement: { minutes: number; breaks: number };
  breathing: { sessions: number; minutes: number };
  /** `null` when nothing is in the calorie counter for today. */
  food: { items: number; meals: number; kcal: number } | null;
  fact: HealthFact;
};

export function healthDaySummary(companion: CompanionState, calories: CalorieLog, today: string): HealthDaySummary {
  const day = companion.days[today] ?? null;
  const done = TRACK_ITEMS.filter((item) => isTracked(day, item.id)).length;
  const sessions = companion.breathe.sessions.filter((session) => session.date === today);
  const seconds = sessions.reduce((sum, session) => sum + Math.max(0, session.seconds), 0);
  const items = calories.days[today] ?? [];
  const food = items.length > 0 ? { items: items.length, meals: new Set(items.map((item) => item.meal)).size, kcal: Math.round(totals(items).kcal) } : null;
  return {
    habits: { done, total: TRACK_ITEMS.length },
    movement: {
      minutes: Math.max(0, (day?.walkingMinutes ?? 0) + (day?.exerciseMinutes ?? 0)),
      breaks: Math.max(0, day?.movementBreaks ?? 0),
    },
    breathing: { sessions: sessions.length, minutes: Math.round(seconds / 60) },
    food,
    fact: factOfTheDay(today),
  };
}

/**
 * At most one gentle nudge, chosen by the time of day and what is still open.
 * Never a warning, never a streak, never a target.
 */
export function gentleReminder(summary: HealthDaySummary, part: PartOfDay): string | null {
  const moved = summary.movement.minutes > 0 || summary.movement.breaks > 0;
  const breathed = summary.breathing.sessions > 0;
  if (part === "morning" && summary.habits.done === 0) return msg("A glass of water and a gentle stretch are a kind way to start, if you feel like it.");
  if (part === "afternoon" && !moved) return msg("If you have been sitting for a while, a few minutes of walking or a short movement break may feel good.");
  if (part === "evening" && !breathed) return msg("A few slow, comfortable breaths can help you wind down this evening, if you like.");
  if (part !== "morning" && !moved) return msg("Any movement counts, even a few steps around the room.");
  return null;
}

// ---------- matching a practice to how the person feels ----------

export type FeelingMatch = {
  breathing: { title: string; note: string; href: string };
  music: { category: LibraryCategory; note: string };
  movement: { title: string; note: string; href: string };
};

const BREATHE_GENTLE = { title: msg("Diaphragmatic breathing"), href: "/breathe/practice" };
const BREATHE_NASAL = { title: msg("Nasal breathing"), href: "/breathe/practice" };
const BREATHE_HUM = { title: msg("Bhramari – humming breath"), href: "/breathe/practice" };
const BREATHE_SLOW = { title: msg("Breathe in 4, out 6"), href: "/breathe/practice" };

const MOVE_WALK = { title: msg("Easy walk"), href: "/academy/move/easy-walk" };
const MOVE_BREAK = { title: msg("A short movement break"), href: "/academy/move/breaks" };
const MOVE_REACH = { title: msg("Easy seated reach"), href: "/academy/move/easy-reach" };
const MOVE_CIRCLES = { title: msg("Ankle and shoulder circles"), href: "/academy/move/ankle-circles" };
const MOVE_CHAIR = { title: msg("Stand from a chair"), href: "/academy/move/chair-stand" };

/**
 * Simple fixed rules, no AI: the feeling the person tapped and the time of day
 * pick one breathing practice, one music category, and one movement from the
 * libraries that already exist. Low energy always gets the gentlest choices.
 */
export function matchFeeling(feeling: DailyFeeling, part: PartOfDay): FeelingMatch {
  if (feeling === "low") {
    return {
      breathing: { ...(part === "evening" ? BREATHE_SLOW : BREATHE_GENTLE), note: msg("Slow and easy. Stop whenever you like.") },
      music: { category: part === "evening" ? "sleep" : "nature", note: msg("Soft sounds to rest with.") },
      movement: { ...(part === "evening" ? MOVE_CIRCLES : MOVE_REACH), note: msg("Done sitting down. A minute or two is plenty.") },
    };
  }
  if (feeling === "okay") {
    return {
      breathing: { ...(part === "evening" ? BREATHE_SLOW : BREATHE_NASAL), note: msg("A few quiet minutes to settle.") },
      music: { category: part === "morning" ? "morning" : part === "afternoon" ? "meditation" : "sleep", note: msg("Calm music for a steady day.") },
      movement: { ...(part === "evening" ? MOVE_REACH : MOVE_BREAK), note: msg("A small, steady bit of movement.") },
    };
  }
  return {
    breathing: { ...(part === "evening" ? BREATHE_SLOW : BREATHE_HUM), note: msg("A gentle hum on the out-breath. Many people enjoy it.") },
    music: { category: part === "morning" ? "morning" : part === "afternoon" ? "classical" : "yoga", note: msg("Music to enjoy your good mood.") },
    movement: { ...(part === "evening" ? MOVE_WALK : part === "afternoon" ? MOVE_CHAIR : MOVE_WALK), note: msg("You could make it a little longer today, if it feels right.") },
  };
}
