import { isRealISODate } from "@/lib/dates";
import { msg } from "@/lib/i18n/translate";

/**
 * Invite a Friend: the 7-day Together challenge and the friend badges.
 *
 * Each person keeps their own steps. Friends are linked only by a Share the
 * Care invitation, and the shared part is a count (supabase function
 * friend_circle_summary). No step asks for or stores health information.
 */

export const CHALLENGE_LENGTH = 7;

export type ChallengeStep = {
  day: number;
  title: string;
  text: string;
  href: string;
  linkLabel: string;
};

/** Seven small, everyday steps. They link to pages that already exist. */
export const TOGETHER_STEPS: readonly ChallengeStep[] = [
  {
    day: 1,
    title: msg("Take a short walk"),
    text: msg("Walk at an easy pace for about ten minutes, outside or at home. Then tell your friend you did it."),
    href: "/academy/move/studio/daily-movement",
    linkLabel: msg("Open Daily Movement"),
  },
  {
    day: 2,
    title: msg("Water with each meal"),
    text: msg("Have a glass of water with each meal today. A small habit that is easy to share."),
    href: "/food-plan/today",
    linkLabel: msg("Open Today's meals"),
  },
  {
    day: 3,
    title: msg("Two minutes of slow breathing"),
    text: msg("Sit comfortably and breathe slowly for two minutes. You can follow the breathing balloon."),
    href: "/breathe",
    linkLabel: msg("Open Breathe for Life"),
  },
  {
    day: 4,
    title: msg("Add one vegetable"),
    text: msg("Add one vegetable or one piece of fruit to a meal. Send your friend a photo if you like."),
    href: "/academy/meals",
    linkLabel: msg("Open Nutrition"),
  },
  {
    day: 5,
    title: msg("Gentle stretch before bed"),
    text: msg("Stretch gently for five minutes in the evening. Stop if anything hurts."),
    href: "/guided",
    linkLabel: msg("Open Guided sessions"),
  },
  {
    day: 6,
    title: msg("A calm half hour"),
    text: msg("Put your phone away for half an hour before sleep. Listen to calm music or read instead."),
    href: "/library/music",
    linkLabel: msg("Open My Music"),
  },
  {
    day: 7,
    title: msg("Share one thing that helped"),
    text: msg("Tell your friend one small thing from this week that helped you. Celebrate the week together."),
    href: "/share-the-care",
    linkLabel: msg("Open Share the Care"),
  },
];

export type FriendChallenge = {
  /** Local date the person started, YYYY-MM-DD, or null before they start. */
  startedOn: string | null;
  /** Ticked steps, 1 to 7, in order. */
  doneDays: number[];
  /** True only when the person chose to add their ticked days to the shared total. */
  shareWithFriends: boolean;
};

export function emptyChallenge(): FriendChallenge {
  return { startedOn: null, doneDays: [], shareWithFriends: false };
}

/** Keeps only what the table allows. Anything else becomes the empty challenge. */
export function sanitizeChallenge(raw: unknown): FriendChallenge {
  if (!raw || typeof raw !== "object") return emptyChallenge();
  const value = raw as Record<string, unknown>;
  const started = typeof value.startedOn === "string" && isRealISODate(value.startedOn) ? value.startedOn : null;
  if (!started) return emptyChallenge();
  const days = Array.isArray(value.doneDays) ? value.doneDays : [];
  const doneDays = [...new Set(days.filter((day): day is number => Number.isInteger(day) && day >= 1 && day <= CHALLENGE_LENGTH))].sort(
    (a, b) => a - b,
  );
  return { startedOn: started, doneDays, shareWithFriends: value.shareWithFriends === true };
}

function dayIndex(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

/** Which challenge day it is: 1 on the start day, 2 the next day, and so on. 0 before the start. */
export function challengeDay(state: FriendChallenge, today: string): number {
  if (!state.startedOn || !isRealISODate(today)) return 0;
  return Math.max(0, dayIndex(today) - dayIndex(state.startedOn) + 1);
}

/** A step opens on its own day and stays open, so a missed day can be caught up. */
export function isStepOpen(state: FriendChallenge, day: number, today: string): boolean {
  return day >= 1 && day <= CHALLENGE_LENGTH && day <= challengeDay(state, today);
}

export function startChallenge(state: FriendChallenge, today: string): FriendChallenge {
  if (state.startedOn || !isRealISODate(today)) return state;
  return { ...state, startedOn: today, doneDays: [] };
}

export function toggleStep(state: FriendChallenge, day: number, today: string): FriendChallenge {
  if (!isStepOpen(state, day, today)) return state;
  const done = state.doneDays.includes(day)
    ? state.doneDays.filter((item) => item !== day)
    : [...state.doneDays, day].sort((a, b) => a - b);
  return { ...state, doneDays: done };
}

export function isComplete(state: FriendChallenge): boolean {
  return state.doneDays.length === CHALLENGE_LENGTH;
}

/** Starts again from today. Sharing stays as the person set it. */
export function restartChallenge(state: FriendChallenge, today: string): FriendChallenge {
  if (!isRealISODate(today)) return state;
  return { ...state, startedOn: today, doneDays: [] };
}

/** The step to show first: the earliest open step that is not ticked yet. */
export function nextStep(state: FriendChallenge, today: string): ChallengeStep | null {
  return TOGETHER_STEPS.find((step) => isStepOpen(state, step.day, today) && !state.doneDays.includes(step.day)) ?? null;
}

/** Counts from friend_circle_summary(). It never carries a name, email, or id. */
export type CircleSummary = {
  friendsJoined: number;
  joinedThroughFriend: boolean;
  friendsSharing: number;
  togetherDays: number;
};

function count(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : 0;
}

export function parseSummary(raw: unknown): CircleSummary | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const value = raw as Record<string, unknown>;
  return {
    friendsJoined: count(value.friends_joined),
    joinedThroughFriend: value.joined_through_friend === true,
    friendsSharing: count(value.friends_sharing),
    togetherDays: count(value.together_days),
  };
}

export type BadgeId = "care-sharer" | "warm-welcome" | "circle-of-three" | "first-step" | "seven-days" | "stronger-together";

export type Badge = { id: BadgeId; icon: string; title: string; text: string };

export const STRONGER_TOGETHER_DAYS = 14;

export const FRIEND_BADGES: readonly Badge[] = [
  { id: "care-sharer", icon: "💌", title: msg("Care Sharer"), text: msg("A friend joined LifeZoi through your invitation.") },
  { id: "warm-welcome", icon: "🤝", title: msg("Warm Welcome"), text: msg("You joined LifeZoi through a friend's invitation.") },
  { id: "circle-of-three", icon: "🌸", title: msg("Circle of Three"), text: msg("Three friends joined through your invitations.") },
  { id: "first-step", icon: "👣", title: msg("First Step Together"), text: msg("You ticked your first step of the Together challenge.") },
  { id: "seven-days", icon: "🏅", title: msg("Seven Days Together"), text: msg("You ticked all seven steps of the Together challenge.") },
  {
    id: "stronger-together",
    icon: "🌟",
    title: msg("Stronger Together"),
    text: msg("You and the friends who share their days ticked 14 steps between you."),
  },
];

/**
 * Badges come from what is already saved, so nothing extra is stored. When a
 * friend joins through a link, the inviter earns Care Sharer and the friend
 * earns Warm Welcome at the same moment.
 */
export function earnedBadges(summary: CircleSummary | null, state: FriendChallenge): Set<BadgeId> {
  const earned = new Set<BadgeId>();
  if (summary && summary.friendsJoined >= 1) earned.add("care-sharer");
  if (summary?.joinedThroughFriend) earned.add("warm-welcome");
  if (summary && summary.friendsJoined >= 3) earned.add("circle-of-three");
  if (state.doneDays.length >= 1) earned.add("first-step");
  if (isComplete(state)) earned.add("seven-days");
  if (summary && summary.friendsSharing >= 1 && summary.togetherDays >= STRONGER_TOGETHER_DAYS) earned.add("stronger-together");
  return earned;
}

/** The row written to friend_challenge. */
export function toRow(state: FriendChallenge, userId: string) {
  return {
    user_id: userId,
    started_on: state.startedOn,
    done_days: state.doneDays,
    share_with_friends: state.shareWithFriends,
    updated_at: new Date().toISOString(),
  };
}

export function fromRow(row: unknown): FriendChallenge {
  if (!row || typeof row !== "object") return emptyChallenge();
  const value = row as Record<string, unknown>;
  return sanitizeChallenge({ startedOn: value.started_on, doneDays: value.done_days, shareWithFriends: value.share_with_friends });
}
