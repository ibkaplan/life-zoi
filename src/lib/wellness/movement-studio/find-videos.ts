import { msg } from "@/lib/i18n/translate";
import { STUDIO_VERIFIED_ON, STUDIO_VIDEO_SEEDS, type StudioVideoSeed } from "@/lib/wellness-library/chair-yoga-videos";
import { ASK_FIRST, FALL_SUPPORT, LINK_CHECKED, NIA_CHANNEL, SAFETY_LINE, studioLessons, type VideoLesson } from "@/lib/wellness/movement-studio/catalog";

/**
 * Find My Movement video catalog.
 *
 * It joins two lists that are already in the repository, so no video here is
 * new or typed from memory:
 * - National Institute on Aging films from Movement Studio (`studioLessons`).
 *   Player lengths were read from the YouTube IFrame API on 2026-11-06.
 * - Chair Yoga Studio classes (`STUDIO_VIDEO_SEEDS`). Each one was confirmed
 *   public and embeddable through YouTube oEmbed on 2026-11-10. Their length is
 *   the minutes written in the title, or unknown.
 *
 * Talks that are only for watching and the NHS example (never checked) are left
 * out. Positions, goals, and levels below are LifeZoi's reading of each title
 * and channel. Nobody has watched every class.
 *
 * To add a video, add it to one of the two lists above. It appears here with
 * its tags. Add an entry to TAGS when the rules below read it wrongly.
 */

export const FIND_DURATIONS = [5, 10, 15, 20, 25, 30] as const;
export type FindDuration = (typeof FIND_DURATIONS)[number];

export const FIND_POSITIONS = ["sitting", "standing", "mat", "chair"] as const;
export type FindPosition = (typeof FIND_POSITIONS)[number];

export const FIND_GOALS = [
  "strength",
  "balance",
  "mobility",
  "calm",
  "walking",
  "chair-yoga",
  "flexibility",
  "stretching",
  "coordination",
] as const;
export type FindGoal = (typeof FIND_GOALS)[number];

export const FIND_LEVELS = ["beginner", "gentle", "intermediate"] as const;
export type FindLevel = (typeof FIND_LEVELS)[number];

export type FindFilters = {
  minutes: FindDuration | "any";
  position: FindPosition | "any";
  goal: FindGoal | "any";
  level: FindLevel | "any";
};

export const ANY_FILTERS: FindFilters = { minutes: "any", position: "any", goal: "any", level: "any" };

/** player: read from the YouTube player. title: written in the video title. unknown: shown in the player only. */
export type LengthSource = "player" | "title" | "unknown";

export type FindLicense = {
  /** Who made and owns the video. */
  creator: string;
  creatorUrl: string;
  /** The video page on YouTube. */
  sourceUrl: string;
  /** How LifeZoi may use it. */
  terms: string;
  embedAllowed: true;
  rehostAllowed: false;
  /** How embedding was checked, and when. */
  checkedBy: string;
  checkedOn: string;
};

export type FindVideo = {
  id: string;
  youtubeId: string;
  /** The creator's own title, in the creator's language. Not translated. */
  title: string;
  embedUrl: string;
  thumbnailUrl: string;
  durationSeconds: number | null;
  lengthSource: LengthSource;
  positions: FindPosition[];
  goals: FindGoal[];
  levels: FindLevel[];
  /** LifeZoi's short description. Translated. */
  description: string;
  /** Balance work: shown with the hold-a-support line. */
  balance: boolean;
  /** May get down to the floor. */
  floor: boolean;
  license: FindLicense;
};

const NIA_TERMS = msg(
  "U.S. Government work from the National Institute on Aging. Played in YouTube's player from the NIA channel. LifeZoi does not copy the file.",
);
const YOUTUBE_TERMS = msg(
  "The creator keeps all rights. The creator allows embedding, so LifeZoi plays it in YouTube's own player under YouTube's Terms of Service. LifeZoi does not copy or download the file.",
);

function embedUrl(youtubeId: string): string {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}`;
}

function thumbnailUrl(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

// ---------- National Institute on Aging films ----------

type NiaTags = { positions: FindPosition[]; goals: FindGoal[]; levels?: FindLevel[]; description: string };

/** Written from the film titles and the Movement Studio notes. */
const NIA_TAGS: Record<string, NiaTags> = {
  "video-hands": {
    positions: ["sitting", "chair"],
    goals: ["strength"],
    description: msg("A short seated hand grip exercise with a small ball. Good for a quick break."),
  },
  "video-balance": {
    positions: ["standing"],
    goals: ["balance"],
    description: msg("A one-minute standing balance exercise. Keep a sturdy chair or counter within reach."),
  },
  "video-heel": {
    positions: ["standing"],
    goals: ["balance", "walking", "coordination"],
    description: msg("Heel-to-toe walking in a straight line, one foot in front of the other. Hold a stable support."),
  },
  "video-wall": {
    positions: ["standing"],
    goals: ["strength"],
    description: msg("Push-ups against a wall to work the arms and shoulders while standing."),
  },
  "video-workout-10": {
    positions: ["standing", "chair"],
    goals: ["strength"],
    description: msg("A 10-minute sample workout for older adults, with a chair nearby for support."),
  },
  "video-workout-15": {
    positions: ["standing", "sitting"],
    goals: ["strength"],
    description: msg("A 15-minute sample workout for older adults. Some people stand and one person is seated."),
  },
  "video-strength": {
    positions: ["standing"],
    goals: ["strength"],
    description: msg("A longer strength training workout for older adults, about 27 minutes."),
  },
  "video-ankle": {
    positions: ["sitting", "chair"],
    goals: ["mobility", "stretching"],
    description: msg("A seated ankle stretch, lifting and moving the feet."),
  },
  "video-shoulder": {
    positions: ["sitting", "standing"],
    goals: ["mobility", "stretching"],
    description: msg("A short shoulder and arm stretch. Sit or stand, whichever is steadier for you."),
  },
  "video-flexibility-4": {
    positions: ["mat"],
    goals: ["flexibility", "stretching", "calm"],
    levels: ["gentle"],
    description: msg("Four flexibility and cool-down stretches on a mat on the floor."),
  },
  "video-flexibility-6": {
    positions: ["sitting", "standing"],
    goals: ["flexibility", "stretching"],
    levels: ["gentle"],
    description: msg("Six flexibility exercises for older adults, about 18 minutes."),
  },
};

function niaVideo(lesson: VideoLesson): FindVideo | null {
  const tags = NIA_TAGS[lesson.id];
  if (!tags) return null;
  return {
    id: `nia-${lesson.youtubeId}`,
    youtubeId: lesson.youtubeId,
    title: lesson.title,
    embedUrl: embedUrl(lesson.youtubeId),
    thumbnailUrl: thumbnailUrl(lesson.youtubeId),
    durationSeconds: lesson.durationSeconds,
    lengthSource: "player",
    positions: tags.positions,
    goals: tags.goals,
    levels: tags.levels ?? [lesson.level],
    description: tags.description,
    balance: tags.goals.includes("balance"),
    floor: tags.positions.includes("mat"),
    license: {
      creator: "National Institute on Aging",
      creatorUrl: NIA_CHANNEL,
      sourceUrl: lesson.license.sourceUrl,
      terms: NIA_TERMS,
      embedAllowed: true,
      rehostAllowed: false,
      checkedBy: "YouTube IFrame API player length and oEmbed",
      checkedOn: LINK_CHECKED,
    },
  };
}

// ---------- Chair Yoga Studio classes ----------

const has = (seed: StudioVideoSeed, ...words: string[]) =>
  words.some((word) => seed.topics.includes(word) || seed.title.toLowerCase().includes(word));

function seedPositions(seed: StudioVideoSeed): FindPosition[] {
  const onChair = seed.section !== "gentle" || /chair|desk/i.test(seed.title);
  const chair: FindPosition[] = onChair ? ["chair"] : [];
  switch (seed.position) {
    case "seated":
      return ["sitting", ...chair];
    case "standing":
      return ["standing", ...chair];
    case "mat":
      return ["mat"];
    case "mixed":
      return ["sitting", "standing", ...chair];
  }
}

function seedGoals(seed: StudioVideoSeed): FindGoal[] {
  const goals: FindGoal[] = [];
  if (seed.section !== "gentle" || /chair yoga/i.test(seed.title)) goals.push("chair-yoga");
  if (has(seed, "strength", "strong", "core", "legs", "sit to stand", "workout")) goals.push("strength");
  if (seed.balance || has(seed, "balance", "stability")) goals.push("balance");
  if (has(seed, "mobility", "limited mobility", "hips", "back", "spine", "neck", "shoulders", "wrists", "posture", "warm-up", "morning"))
    goals.push("mobility");
  if (has(seed, "flexibility", "flexib")) goals.push("flexibility");
  if (has(seed, "stretching", "stretch")) goals.push("stretching");
  if (has(seed, "relaxation", "stress relief", "breathing", "evening", "recovery", "restorative", "bedtime")) goals.push("calm");
  return goals;
}

function seedLevels(seed: StudioVideoSeed): FindLevel[] {
  const levels: FindLevel[] = [seed.level];
  if (/gentle|restorative|slow|relax|bedtime|stress|easy/i.test(seed.title)) levels.push("gentle");
  return levels;
}

/** Corrections where the title rules above read a class wrongly. */
const TAGS: Record<string, { goals?: FindGoal[]; positions?: FindPosition[] }> = {
  // "Better Balance Program" is the series name. This class is neck and shoulders.
  A5ir5MOjlpM: { goals: ["chair-yoga", "mobility", "stretching"] },
  // Basic yoga poses for beginners.
  pWobp3phsEU: { goals: ["flexibility", "mobility"] },
  // Slow, gentle yoga for older adults.
  "kFhG-ZzLNN4": { goals: ["mobility", "flexibility", "calm"] },
  "0Dw41EHvqew": { goals: ["mobility", "stretching"] },
  // A short stretch done from a couch or chair.
  QzhGqjlYU14: { goals: ["stretching", "mobility"], positions: ["sitting"] },
  // Total body deep stretch.
  GLy2rYHwUqY: { goals: ["flexibility", "stretching", "calm"] },
  // A sit-to-stand how-to: from sitting to standing.
  L3EJ6R5CrOg: { goals: ["strength", "balance"] },
};

function seedVideo(seed: StudioVideoSeed): FindVideo {
  const fix = TAGS[seed.youtubeId] ?? {};
  const goals = fix.goals ?? seedGoals(seed);
  return {
    id: `yt-${seed.youtubeId}`,
    youtubeId: seed.youtubeId,
    title: seed.title,
    embedUrl: embedUrl(seed.youtubeId),
    thumbnailUrl: thumbnailUrl(seed.youtubeId),
    durationSeconds: seed.minutes === null ? null : seed.minutes * 60,
    lengthSource: seed.minutes === null ? "unknown" : "title",
    positions: fix.positions ?? seedPositions(seed),
    goals,
    levels: seedLevels(seed),
    // The owner's note is for the team, not for members.
    description: seed.note.replace(" Named by the LifeZoi owner as a starting video.", ""),
    balance: seed.balance || goals.includes("balance"),
    floor: seed.position === "mat",
    license: {
      creator: seed.channel,
      creatorUrl: seed.channelUrl,
      sourceUrl: `https://www.youtube.com/watch?v=${seed.youtubeId}`,
      terms: YOUTUBE_TERMS,
      embedAllowed: true,
      rehostAllowed: false,
      checkedBy: "YouTube oEmbed (public and embeddable)",
      checkedOn: STUDIO_VERIFIED_ON,
    },
  };
}

export const FIND_VIDEOS: FindVideo[] = [
  ...studioLessons.flatMap((lesson) => {
    if (lesson.kind !== "video") return [];
    const item = niaVideo(lesson);
    return item ? [item] : [];
  }),
  ...STUDIO_VIDEO_SEEDS.map(seedVideo),
];

// ---------- filters ----------

/**
 * Each length belongs to the nearest minute choice, within two and a half
 * minutes. "5" also holds every film shorter than that, because a person with
 * five minutes can do a one-minute film. Longer than 32.5 minutes, or no known
 * length: only under Any.
 */
export function durationBucket(seconds: number | null): FindDuration | null {
  if (seconds === null) return null;
  const minutes = seconds / 60;
  if (minutes < 7.5) return 5;
  for (const choice of FIND_DURATIONS) if (minutes >= choice - 2.5 && minutes < choice + 2.5) return choice;
  return minutes <= 32.5 ? 30 : null;
}

export function matchesFind(video: FindVideo, filters: FindFilters): boolean {
  return (
    (filters.minutes === "any" || durationBucket(video.durationSeconds) === filters.minutes) &&
    (filters.position === "any" || video.positions.includes(filters.position)) &&
    (filters.goal === "any" || video.goals.includes(filters.goal)) &&
    (filters.level === "any" || video.levels.includes(filters.level))
  );
}

/** All four filters together. Shorter films first, unknown lengths last. */
export function findVideos(filters: FindFilters, videos: readonly FindVideo[] = FIND_VIDEOS): FindVideo[] {
  return videos
    .filter((video) => matchesFind(video, filters))
    .sort((a, b) => (a.durationSeconds ?? Infinity) - (b.durationSeconds ?? Infinity));
}

export type FilterKey = keyof FindFilters;

/**
 * When nothing matches: which single filter, set back to Any, gives results,
 * and how many. Used for the "try changing one filter" suggestion.
 */
export function relaxSuggestions(filters: FindFilters, videos: readonly FindVideo[] = FIND_VIDEOS): { key: FilterKey; count: number }[] {
  const keys: FilterKey[] = ["minutes", "position", "goal", "level"];
  return keys
    .filter((key) => filters[key] !== "any")
    .map((key) => ({ key, count: findVideos({ ...filters, [key]: "any" }, videos).length }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function findVideoById(id: string): FindVideo | undefined {
  return FIND_VIDEOS.find((video) => video.id === id);
}

// ---------- words ----------

export const FIND_POSITION_TEXT: Record<FindPosition, string> = {
  sitting: msg("Sitting"),
  standing: msg("Standing"),
  mat: msg("Mat"),
  chair: msg("Chair exercises"),
};

export const FIND_GOAL_TEXT: Record<FindGoal, string> = {
  strength: msg("Strength"),
  balance: msg("Balance"),
  mobility: msg("Mobility"),
  calm: msg("Calm and relaxation"),
  walking: msg("Walking"),
  "chair-yoga": msg("Chair yoga"),
  flexibility: msg("Flexibility"),
  stretching: msg("Stretching"),
  coordination: msg("Brain and body coordination"),
};

export const FIND_LEVEL_TEXT: Record<FindLevel, string> = {
  beginner: msg("Beginner"),
  gentle: msg("Gentle"),
  intermediate: msg("Intermediate"),
};

export const FILTER_KEY_TEXT: Record<FilterKey, string> = {
  minutes: msg("Minutes"),
  position: msg("Position"),
  goal: msg("Goal"),
  level: msg("Level"),
};

/** Translated text that comes from data, checked by the catalog test. */
export const FIND_TEXT_SOURCES: unknown[] = [
  FIND_VIDEOS.map((video) => video.description),
  FIND_POSITION_TEXT,
  FIND_GOAL_TEXT,
  FIND_LEVEL_TEXT,
  FILTER_KEY_TEXT,
  NIA_TERMS,
  YOUTUBE_TERMS,
  SAFETY_LINE,
  FALL_SUPPORT,
  ASK_FIRST,
];
