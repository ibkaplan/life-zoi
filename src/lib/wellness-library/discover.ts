import type { HealthProfileFields } from "@/lib/health-profile";
import { safetyFlags } from "@/lib/health-profile";
import type { ActivityKind, MovementPrefs } from "@/lib/companion/state";
import { ASK_FIRST, FALL_SUPPORT, SAFETY_LINE } from "@/lib/wellness/movement-studio/catalog";
import {
  COST_TEXT,
  sourceById,
  visibleVideos,
  videoSafety,
  type VideoItem,
} from "@/lib/wellness-library/catalog";
import {
  CATEGORY_INFO,
  COOL_DOWN,
  MOVES,
  WARM_UP,
  type LibraryCategory,
  type Move,
} from "@/lib/wellness-library/moves";

export const DURATION_OPTIONS = [10, 15, 20, 30, 45, 60] as const;

/** Indoor choices offered when the person does not want to walk outside. */
export const INDOOR_CHOICES: LibraryCategory[] = ["pilates", "yoga", "aerobics", "dance", "chair", "strength", "stretching"];

/** The wider home list from the brief. */
export const HOME_CHOICES: LibraryCategory[] = [
  "pilates",
  "yoga",
  "chair",
  "tai-chi",
  "qigong",
  "dance",
  "aerobics",
  "home-cardio",
  "stretching",
  "strength",
  "balance",
  "breathing",
  "meditation",
];

export type MoverProfile = {
  age: number | null;
  level: 0 | 1 | 2 | null;
  experience: MovementPrefs["experience"];
  wantsChallenge: boolean;
  seatedFirst: boolean;
  fallRisk: boolean;
  kneeLimit: boolean;
  jointLimit: boolean;
  injury: boolean;
  disliked: ActivityKind[];
};

export type LibraryRequest = {
  category: LibraryCategory;
  minutes: number;
  /** The person asked for a harder session this time. */
  harder?: boolean;
};

export type SessionStep = {
  moveId: string;
  name: string;
  cue: string;
  easier: string;
  seconds: number;
  phase: "warm-up" | "main" | "cool-down";
};

export type GuidedSession = {
  id: string;
  kind: "session";
  title: string;
  category: LibraryCategory;
  minutes: number;
  level: "beginner" | "intermediate" | "advanced";
  intensity: string;
  equipment: string[];
  steps: SessionStep[];
  safety: string;
  modifications: string[];
  sourceName: string;
  costText: string;
};

export type Recommendation = {
  headline: string;
  main: { kind: "video"; video: VideoItem; reasons: string[] } | { kind: "session"; session: GuidedSession; reasons: string[] };
  alternatives: Array<{ kind: "video"; video: VideoItem; note: string } | { kind: "session"; session: GuidedSession; note: string }>;
  notes: string[];
};

const LEVEL_NAMES = ["beginner", "intermediate", "advanced"] as const;
const KNEE = /\bknees?\b/i;

function ageFromRange(range: string): number | null {
  const match = /^(\d{2})/.exec(range);
  return match ? Number(match[1]) : null;
}

/** Build the movement profile from the assessment and saved preferences. */
export function moverProfile(
  answers: (HealthProfileFields & { exactAge?: string; ageRange?: string }) | null,
  prefs: MovementPrefs,
): MoverProfile {
  const flags = answers ? safetyFlags(answers) : null;
  const exact = answers?.exactAge && /^\d+$/.test(answers.exactAge) ? Number(answers.exactAge) : null;
  const age = exact ?? (answers?.ageRange ? ageFromRange(answers.ageRange) : null);
  const level = prefs.level === "advanced" ? 2 : prefs.level === "intermediate" ? 1 : prefs.level === "beginner" ? 0 : null;
  return {
    age,
    level,
    experience: prefs.experience,
    wantsChallenge: prefs.wantsChallenge,
    seatedFirst: flags?.seatedFirst ?? false,
    fallRisk: flags?.fallRisk ?? false,
    kneeLimit: Boolean(answers && KNEE.test(answers.exerciseRestrictions)),
    jointLimit: Boolean(answers?.mobilityLimits.includes("joint-pain")),
    injury: flags?.injuryNote ?? false,
    disliked: prefs.disliked,
  };
}

/**
 * Level comes from what the person said about their fitness and experience.
 * Age never raises it. With no stated level, age 65 or older keeps the
 * low-impact default, which is one factor among several, not a cap.
 */
export function effectiveLevel(profile: MoverProfile, harder = false): { level: 0 | 1 | 2; lowImpact: boolean; why: string[] } {
  const why: string[] = [];
  let level: 0 | 1 | 2 = profile.level ?? (profile.experience === "regular" ? 1 : 0);
  why.push(
    profile.level !== null
      ? `You chose ${LEVEL_NAMES[profile.level]} level.`
      : profile.experience === "regular"
        ? "You said you exercise regularly."
        : "No fitness level is saved, so this starts at beginner.",
  );
  const limited = profile.kneeLimit || profile.jointLimit || profile.fallRisk || profile.seatedFirst || profile.injury;
  if (harder || profile.wantsChallenge) {
    const next = Math.min(2, level + 1) as 0 | 1 | 2;
    const capped = limited ? (Math.min(next, 1) as 0 | 1) : next;
    if (capped > level) why.push("You asked for something more challenging, so this is one step harder.");
    else if (limited) why.push("You asked for more challenge, but your reported limits keep this at the same level.");
    level = capped;
  }
  const olderDefault = profile.level === null && profile.age !== null && profile.age >= 65;
  if (olderDefault) why.push("You have not chosen a level, so this stays low impact. Choose a level in your preferences to change it.");
  const lowImpact = level < 2 || limited || olderDefault;
  if (profile.kneeLimit) why.push("You mentioned your knee, so kneeling, deep knee bends, and jumping are left out.");
  if (profile.seatedFirst) why.push("Everything is seated because you said standing for long is hard or you use a wheelchair.");
  if (profile.fallRisk) why.push("Hold a sturdy chair or counter for standing moves.");
  return { level, lowImpact, why };
}

export function moveAllowed(move: Move, profile: MoverProfile, level: number, lowImpact: boolean): boolean {
  if (move.level > level) return false;
  if (move.highImpact && lowImpact) return false;
  if ((profile.kneeLimit || profile.jointLimit) && (move.kneeLoad || move.highImpact)) return false;
  if (profile.seatedFirst && move.position !== "seated") return false;
  if (profile.fallRisk && move.position === "floor" && profile.age !== null && profile.age >= 75) return false;
  return true;
}

function pickMoves(category: LibraryCategory, profile: MoverProfile, level: number, lowImpact: boolean): Move[] {
  const all = MOVES[category];
  const allowed = all.filter((move) => moveAllowed(move, profile, level, lowImpact));
  if (allowed.length > 0) return allowed;
  // Nothing fits: fall back to seated chair moves rather than an unsuitable move.
  return MOVES.chair.filter((move) => moveAllowed(move, profile, level, true));
}

/** Compose an original LifeZoi session that adds up exactly to the requested minutes. */
export function buildSession(request: LibraryRequest, profile: MoverProfile): GuidedSession {
  const { category } = request;
  const minutes = Math.max(5, Math.min(90, Math.round(request.minutes)));
  const total = minutes * 60;
  const { level, lowImpact } = effectiveLevel(profile, request.harder);
  const moves = pickMoves(category, profile, level, lowImpact);
  const calm = category === "breathing" || category === "meditation";
  const warmMoves = (calm ? [] : WARM_UP).filter((move) => moveAllowed(move, profile, 0, true));
  const coolMoves = COOL_DOWN.filter((move) => moveAllowed(move, profile, 0, true));
  const warmSeconds = calm ? 0 : Math.max(120, Math.round(total * 0.12 / 30) * 30);
  const coolSeconds = Math.max(120, Math.round(total * 0.1 / 30) * 30);
  const mainSeconds = total - warmSeconds - coolSeconds;
  const block = level === 0 ? 60 : level === 1 ? 90 : 120;
  const steps: SessionStep[] = [];
  const add = (move: Move, seconds: number, phase: SessionStep["phase"]) => {
    if (seconds <= 0) return;
    const previous = steps[steps.length - 1];
    if (previous && previous.moveId === move.id && previous.phase === phase) {
      previous.seconds += seconds;
      return;
    }
    steps.push({ moveId: move.id, name: move.name, cue: move.cue, easier: move.easier, seconds, phase });
  };
  if (warmSeconds > 0 && warmMoves.length > 0) {
    const each = Math.floor(warmSeconds / warmMoves.length);
    warmMoves.forEach((move, index) => add(move, index === warmMoves.length - 1 ? warmSeconds - each * (warmMoves.length - 1) : each, "warm-up"));
  }
  let left = mainSeconds + (warmMoves.length === 0 ? warmSeconds : 0);
  let index = 0;
  while (left > 0 && moves.length > 0) {
    const seconds = Math.min(block, left);
    add(moves[index % moves.length] as Move, seconds, "main");
    // Short recovery between harder blocks for beginners.
    left -= seconds;
    index += 1;
  }
  const coolEach = Math.floor(coolSeconds / coolMoves.length);
  coolMoves.forEach((move, i) => add(move, i === coolMoves.length - 1 ? coolSeconds - coolEach * (coolMoves.length - 1) : coolEach, "cool-down"));

  const usedPositions = new Set(moves.map((move) => move.position));
  const equipment = [
    ...(usedPositions.has("seated") || profile.fallRisk ? ["A sturdy chair without wheels"] : []),
    ...(usedPositions.has("floor") ? ["A mat or carpet"] : []),
    ...(category === "strength" ? ["Optional: two water bottles"] : []),
  ];
  const modifications = [...new Set(moves.map((move) => `${move.name}: ${move.easier}`))].slice(0, 6);
  const safetyParts = [SAFETY_LINE];
  if (category === "balance" || profile.fallRisk) safetyParts.push(FALL_SUPPORT);
  if (profile.injury || profile.kneeLimit) safetyParts.push("Skip any move that hurts your injury.");
  safetyParts.push(ASK_FIRST);
  const info = CATEGORY_INFO[category];
  return {
    id: `lz-${category}-${minutes}-${level}${profile.seatedFirst ? "-seated" : ""}${profile.kneeLimit ? "-knee" : ""}`,
    kind: "session",
    title: `${info.title}${profile.seatedFirst && category !== "chair" ? " (seated)" : ""}`,
    category,
    minutes,
    level: LEVEL_NAMES[level],
    intensity: lowImpact ? "Low impact" : "Includes higher-impact options",
    equipment: equipment.length ? equipment : ["No equipment"],
    steps,
    safety: safetyParts.join(" "),
    modifications,
    sourceName: "LifeZoi guided session",
    costText: COST_TEXT.original,
  };
}

const LEVEL_ORDER = { beginner: 0, intermediate: 1, advanced: 2 } as const;

/** Whether an approved catalog video suits this person and request. */
export function videoFits(video: VideoItem, request: LibraryRequest, profile: MoverProfile, level: number, lowImpact: boolean): string | null {
  if (video.category !== request.category) return "Different category.";
  if (LEVEL_ORDER[video.level] > level) return "Harder than your level.";
  if (video.highImpact && lowImpact) return "High impact.";
  if ((profile.kneeLimit || profile.jointLimit) && (video.kneeLoad || video.highImpact)) return "Not suitable for a knee or joint limit.";
  if (profile.seatedFirst && video.mobility !== "seated-ok") return "Not seated.";
  return null;
}

function durationMatches(video: VideoItem, minutes: number): boolean {
  if (video.durationSeconds === null) return false;
  const target = minutes * 60;
  return Math.abs(video.durationSeconds - target) <= Math.max(90, target * 0.15);
}

export function recommend(request: LibraryRequest, profile: MoverProfile, videos: VideoItem[] = visibleVideos()): Recommendation {
  const { level, lowImpact, why } = effectiveLevel(profile, request.harder);
  const session = buildSession(request, profile);
  const suitable = videos.filter((video) => videoFits(video, request, profile, level, lowImpact) === null);
  const timed = suitable.filter((video) => durationMatches(video, request.minutes));
  const title = CATEGORY_INFO[request.category].title;
  const notes = [...why];
  const alternatives: Recommendation["alternatives"] = [];
  let main: Recommendation["main"];
  const playable = timed.find((video) => video.embedUrl && video.cost === "free-verified");
  if (playable) {
    main = { kind: "video", video: playable, reasons: [`${sourceById(playable.sourceId)?.name ?? "Approved source"} video that matches your time and level.`] };
    alternatives.push({ kind: "session", session, note: "LifeZoi guided session with the same length." });
  } else {
    main = { kind: "session", session, reasons: ["Built from LifeZoi's own guided moves to fit your exact time and level."] };
  }
  for (const video of suitable) {
    if (main.kind === "video" && main.video.id === video.id) continue;
    const length = video.durationSeconds === null ? "length not checked yet" : `${Math.round(video.durationSeconds / 60)} min`;
    alternatives.push({ kind: "video", video, note: `${length}. ${COST_TEXT[video.cost]}.` });
  }
  if (profile.disliked.includes(request.category as ActivityKind)) {
    notes.push(`You said you do not enjoy ${title.toLowerCase()}. You can pick another activity below.`);
  }
  return {
    headline: `Your ${request.minutes}-minute ${title} session is ready!`,
    main,
    alternatives: alternatives.slice(0, 6),
    notes,
  };
}

export function stepsTotal(session: GuidedSession): number {
  return session.steps.reduce((sum, step) => sum + step.seconds, 0);
}

export { videoSafety };
