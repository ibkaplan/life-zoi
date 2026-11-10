import { addIsoDays, mondayOf } from "@/lib/dates";
import type { CompanionState } from "@/lib/companion/state";
import { isVisible, studioVideos, type VideoItem } from "@/lib/wellness-library/catalog";
import { effectiveLevel, type MoverProfile } from "@/lib/wellness-library/discover";
import type { StudioAudience, StudioSection } from "@/lib/wellness-library/chair-yoga-videos";
import type { LibraryCategory } from "@/lib/wellness-library/moves";
import { makeTranslate, type Translate } from "@/lib/i18n/translate";

/** English with placeholders filled. Pages pass their own `t` to get the chosen language. */
const ENGLISH: Translate = makeTranslate(null);

/**
 * Chair Yoga Studio: sections, filters, search, today's recommendation, and
 * weekly practice. Pure functions, so they can be tested without a browser.
 *
 * All member-facing words for the studio are in CHAIR_YOGA_TEXT and
 * SECTION_INFO, so they can move to translation keys when the four-language
 * work lands on main.
 */

export const STUDIO_PATH = "/academy/move/studio/chair-yoga";

export const CHAIR_YOGA_TEXT = {
  kicker: "Movement · Chair Yoga Studio",
  title: "Chair Yoga Studio",
  intro: "Choose seated or standing chair yoga, press PLAY VIDEO, and start. Classes are free videos from YouTube teachers, played with YouTube's own player.",
  play: "PLAY VIDEO",
  openOnYoutube: "OPEN ON YOUTUBE",
  back: "Back to Chair Yoga Studio",
  today: "TODAY'S RECOMMENDED PRACTICE",
  chooseToday: "Choose as today's class",
  todayChosen: "Today's class",
  changeToday: "Choose a different class",
  markDone: "Mark completed",
  seatedAlt: "Seated alternative",
  standingAlt: "Standing alternative",
  favorites: "My favorite classes",
  week: "My practice this week",
  search: "Search by topic",
  searchHint: "For example: neck, hips, balance, morning, desk, relaxation",
  noMatch: "No class matches all of these choices yet.",
  noMatchHelp: "Remove a filter, or use the written LifeZoi practice below. It needs no video and follows the same safety rules.",
  lengthFromTitle: "from the title",
  lengthUnknown: "Length shown on YouTube",
  labelsNote: "Length, level, and seated or standing come from each video's title and channel. LifeZoi has not watched every class, so check the first minutes and adjust.",
  playerNote: "The video plays in YouTube's player and stays on YouTube. LifeZoi does not copy it. If the player shows an error, use OPEN ON YOUTUBE.",
  notTreatment: "These classes are general exercise. They do not treat or cure any condition.",
  sturdyChair: "Use a sturdy chair without wheels, placed against a wall or on a non-slip floor.",
  stopIf: "Stop if you feel pain, dizziness, chest discomfort, unusual shortness of breath, or anything unusual.",
  balanceCare: "If balance is hard for you, keep both hands on the chair back for standing moves, never let go to balance, and choose the seated alternative whenever you want.",
  seatedOnlyCare: "You said standing for long is hard, so today's suggestions are seated. Standing classes stay available if a professional has said they suit you.",
  balanceVideo: "Balance practice: hold the back of a sturdy chair with both hands. Do not practice balance without support if you are at risk of falling.",
  verified: "Public and embeddable on YouTube, checked",
  addVideos: "How videos are added",
} as const;

export const SECTION_INFO: Record<StudioSection, { title: string; summary: string; includes: string[]; fallbackCategory: LibraryCategory }> = {
  seated: {
    title: "Chair Yoga – Seated",
    summary: "Sitting the whole time. For beginners, older adults, people with limited mobility, and office workers.",
    includes: ["Full-body chair yoga", "Neck and shoulders", "Back and spine", "Hands, fingers, and wrists", "Legs and ankles", "Seated stretching", "Breathing and relaxation"],
    fallbackCategory: "chair",
  },
  standing: {
    title: "Standing Chair Yoga",
    summary: "Standing while holding the back of a sturdy chair. A way to spend some sessions on your feet, with support.",
    includes: ["Standing stretches", "Supported warrior poses", "Heel raises and calves", "Supported balance", "Gentle squats and sit-to-stand", "Leg lifts", "Hip mobility", "Side stretches and posture"],
    fallbackCategory: "balance",
  },
  gentle: {
    title: "Gentle Yoga & Mobility",
    summary: "For younger adults, adults over 50, and anyone who wants more flexibility and mobility. Many classes use a mat.",
    includes: ["Beginner yoga basics", "Gentle morning yoga", "Full-body stretching", "Back and hips", "Stress relief", "Desk yoga", "Relaxation and recovery"],
    fallbackCategory: "stretching",
  },
};

export const POSITION_TEXT = {
  seated: "Seated",
  standing: "Standing",
  mixed: "Seated and standing (check)",
  mat: "Mat or floor",
} as const;

export const AUDIENCE_TEXT: Record<StudioAudience, string> = {
  "60+": "Seniors 60+",
  "50+": "Adults 50+",
  all: "All ages",
};

export const LEVEL_TEXT = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" } as const;

export const DURATION_BANDS = [
  { id: "5-10", label: "5–10 minutes", min: 5, max: 12 },
  { id: "15-20", label: "15–20 minutes", min: 13, max: 24 },
  { id: "30", label: "30 minutes", min: 25, max: 37 },
  { id: "45-60", label: "45–60 minutes", min: 38, max: 60 },
] as const;
export type DurationBand = (typeof DURATION_BANDS)[number]["id"];

export type StudioFilter = {
  section: StudioSection | "all";
  position: "seated" | "standing" | null;
  level: "beginner" | "intermediate" | null;
  audience: StudioAudience | null;
  duration: DurationBand | null;
  query: string;
};

export const EMPTY_FILTER: StudioFilter = { section: "all", position: null, level: null, audience: null, duration: null, query: "" };

export type StudioVideo = VideoItem & { studio: NonNullable<VideoItem["studio"]> };

export function libraryVideos(videos: VideoItem[] = studioVideos): StudioVideo[] {
  return videos.filter((video): video is StudioVideo => Boolean(video.studio) && isVisible(video));
}

export function videoByYoutubeId(id: string, videos: StudioVideo[] = libraryVideos()): StudioVideo | null {
  return videos.find((video) => video.studio.youtubeId === id) ?? null;
}

/** Standing filter includes classes that mix standing and seated work. */
function positionMatches(video: StudioVideo, position: StudioFilter["position"]): boolean {
  if (!position) return true;
  if (position === "seated") return video.studio.position === "seated";
  return video.studio.position === "standing" || video.studio.position === "mixed";
}

export function inBand(minutes: number | null, band: DurationBand | null): boolean {
  if (!band) return true;
  if (minutes === null) return false;
  const found = DURATION_BANDS.find((item) => item.id === band);
  return Boolean(found && minutes >= found.min && minutes <= found.max);
}

/** Lower case with accents removed, so "ώμοι" matches "ωμοι" and "café" matches "cafe". */
function normalize(text: string): string {
  return text.toLowerCase().normalize("NFKD").replace(/\p{M}/gu, "").replace(/[^\p{L}\p{N}+ ]/gu, " ");
}

/** With `t`, the search also matches the description, topics, section, and position in the chosen language. */
export function matchesQuery(video: StudioVideo, query: string, t?: Translate): boolean {
  const words = normalize(query).split(/\s+/).filter((word) => word.length > 1);
  if (words.length === 0) return true;
  const english = [video.title, video.instructor, video.description, video.studio.topics.join(" "), SECTION_INFO[video.studio.section].title, POSITION_TEXT[video.studio.position]];
  const translated = t
    ? [t(video.description), video.studio.topics.map((topic) => t(topic)).join(" "), t(SECTION_INFO[video.studio.section].title), t(POSITION_TEXT[video.studio.position])]
    : [];
  const haystack = normalize([...english, ...translated].join(" "));
  return words.every((word) => haystack.includes(word) || haystack.includes(word.replace(/s$/, "")));
}

export function filterVideos(filter: StudioFilter, videos: StudioVideo[] = libraryVideos(), t?: Translate): StudioVideo[] {
  return videos.filter(
    (video) =>
      (filter.section === "all" || video.studio.section === filter.section) &&
      positionMatches(video, filter.position) &&
      (!filter.level || video.level === filter.level) &&
      (!filter.audience || video.studio.audience === filter.audience) &&
      inBand(video.studio.minutes, filter.duration) &&
      matchesQuery(video, filter.query, t),
  );
}

/** Classes this person should not be steered to by default. Shown, but never recommended. */
export function unsafeForProfile(video: StudioVideo, profile: MoverProfile, t: Translate = ENGLISH): string | null {
  if (profile.seatedFirst && video.studio.position !== "seated") return t("Not seated.");
  if (profile.fallRisk && video.studio.position === "mat") return t("Uses the floor.");
  if ((profile.kneeLimit || profile.jointLimit) && video.kneeLoad) return t("May include kneeling.");
  return null;
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const ACTIVITY_PREFIX = "cy-";
export const TODAY_PICK_SUFFIX = ":chair-yoga";

export function activityIdFor(video: StudioVideo): string {
  return `${ACTIVITY_PREFIX}${video.studio.youtubeId}`;
}

export function todayPickKey(date: string): string {
  return `${date}${TODAY_PICK_SUFFIX}`;
}

export type PracticeDay = { date: string; sessions: number; minutes: number };
export type WeekPractice = { weekStart: string; days: PracticeDay[]; sessions: number; minutes: number; seated: number; standing: number; activeDays: number };

/** Completed and partly completed studio classes from Monday to Sunday of this week. */
export function weekPractice(state: CompanionState, today: string, videos: StudioVideo[] = libraryVideos()): WeekPractice {
  const weekStart = mondayOf(today);
  const byActivity = new Map(videos.map((video) => [activityIdFor(video), video]));
  const days: PracticeDay[] = [];
  let seated = 0;
  let standing = 0;
  for (let i = 0; i < 7; i += 1) {
    const date = addIsoDays(weekStart, i);
    const entries = Object.entries(state.days[date]?.entries ?? {}).filter(([id, entry]) => id.startsWith(ACTIVITY_PREFIX) && entry.status !== "skipped");
    for (const [id] of entries) {
      const video = byActivity.get(id);
      if (!video) continue;
      if (video.studio.position === "seated") seated += 1;
      else if (video.studio.position !== "mat") standing += 1;
    }
    days.push({ date, sessions: entries.length, minutes: entries.reduce((sum, [, entry]) => sum + entry.minutes, 0) });
  }
  return {
    weekStart,
    days,
    sessions: days.reduce((sum, day) => sum + day.sessions, 0),
    minutes: days.reduce((sum, day) => sum + day.minutes, 0),
    seated,
    standing,
    activeDays: days.filter((day) => day.sessions > 0).length,
  };
}

export type TodayPlan = {
  main: StudioVideo | null;
  seatedAlternative: StudioVideo | null;
  standingAlternative: StudioVideo | null;
  reasons: string[];
  cautions: string[];
};

function preferredAudience(age: number | null): StudioAudience[] {
  if (age === null) return [];
  if (age >= 60) return ["60+", "50+"];
  if (age >= 50) return ["50+", "60+", "all"];
  return ["all"];
}

function score(video: StudioVideo, profile: MoverProfile, minutes: number, level: number, favorites: string[]): number {
  let points = 0;
  if (video.level === "intermediate" && level < 1) points -= 50;
  const audiences = preferredAudience(profile.age);
  const rank = audiences.indexOf(video.studio.audience);
  if (rank >= 0) points += 12 - rank * 4;
  if (video.studio.minutes !== null) points += Math.max(0, 15 - Math.abs(video.studio.minutes - minutes));
  if (favorites.includes(`video:${video.id}`)) points += 6;
  return points;
}

function best(list: StudioVideo[], profile: MoverProfile, minutes: number, level: number, favorites: string[], seed: string, exclude: string[] = []): StudioVideo | null {
  const pool = list.filter((video) => !exclude.includes(video.id));
  if (pool.length === 0) return null;
  const scored = pool.map((video) => ({ video, points: score(video, profile, minutes, level, favorites) })).sort((a, b) => b.points - a.points);
  const top = scored.filter((item) => item.points >= (scored[0]?.points ?? 0) - 6).slice(0, 5);
  return (top[hash(seed) % top.length] ?? scored[0])?.video ?? null;
}

/**
 * Today's suggestion. Uses age, mobility answers, preferences, and this week's
 * practice. People who report balance difficulty or limited standing get a
 * seated class first. Others are moved between seated and standing so the
 * week is not spent only sitting down.
 */
export function recommendToday(profile: MoverProfile, state: CompanionState, today: string, videos: StudioVideo[] = libraryVideos(), t: Translate = ENGLISH): TodayPlan {
  const { level } = effectiveLevel(profile, false, t);
  const minutes = state.movement.minutes;
  const favorites = state.media.favorites;
  const safe = videos.filter((video) => unsafeForProfile(video, profile) === null);
  const seated = safe.filter((video) => video.studio.position === "seated");
  // Standing suggestions come only from Standing Chair Yoga, where a chair is used for support.
  const standing = safe.filter((video) => video.studio.section === "standing");
  const week = weekPractice(state, today, videos);
  const reasons: string[] = [];
  const cautions: string[] = [t(CHAIR_YOGA_TEXT.sturdyChair), t(CHAIR_YOGA_TEXT.stopIf)];
  const seed = `chair-yoga:${today}`;

  const seatedPick = best(seated, profile, minutes, level, favorites, seed);
  const standingPick = profile.seatedFirst ? null : best(standing, profile, minutes, level, favorites, `${seed}:standing`);

  let main: StudioVideo | null;
  if (profile.seatedFirst) {
    main = seatedPick;
    reasons.push(t(CHAIR_YOGA_TEXT.seatedOnlyCare));
  } else if (profile.fallRisk) {
    main = seatedPick;
    reasons.push(t("You mentioned balance concerns or a walking aid, so today starts seated. A standing class with chair support is offered as the alternative."));
    cautions.push(t(CHAIR_YOGA_TEXT.balanceCare));
  } else {
    const needsStanding = week.seated > week.standing || (week.sessions === 0 && hash(seed) % 2 === 0);
    main = needsStanding ? (standingPick ?? seatedPick) : (seatedPick ?? standingPick);
    if (needsStanding && week.seated > week.standing) reasons.push(t("Most of your classes this week were seated, so today is a standing class with a chair for support."));
    else if (main?.studio.position === "seated" && week.standing > 0) reasons.push(t("You practised standing this week, so today is seated."));
    else reasons.push(t("Today alternates between seated and standing practice so the week includes time on your feet."));
  }
  if (main && main.studio.minutes !== null && Math.abs(main.studio.minutes - minutes) <= 5) reasons.push(t("It is close to the {minutes} minutes in your preferences.", { minutes }));
  if (profile.age !== null && profile.age >= 60) reasons.push(t("It is chosen from classes made for older adults where possible."));
  if (level < 1) reasons.push(t("Beginner level, because no higher level is saved in your preferences."));
  if (main?.studio.balance) cautions.push(t(CHAIR_YOGA_TEXT.balanceVideo));

  return {
    main,
    seatedAlternative: main?.studio.position === "seated" ? best(seated, profile, minutes, level, favorites, `${seed}:alt`, [main.id]) : seatedPick,
    standingAlternative: profile.seatedFirst ? null : main && main.studio.position !== "seated" ? best(standing, profile, minutes, level, favorites, `${seed}:alt`, [main.id]) : standingPick,
    reasons,
    cautions,
  };
}

/** A seated class for a standing one and the other way round, close in topic and length. */
export function alternativeFor(video: StudioVideo, want: "seated" | "standing", videos: StudioVideo[] = libraryVideos()): StudioVideo | null {
  const pool = videos.filter((item) => item.id !== video.id && (want === "seated" ? item.studio.position === "seated" : item.studio.section === "standing"));
  if (pool.length === 0) return null;
  const shared = (item: StudioVideo) => item.studio.topics.filter((topic) => video.studio.topics.includes(topic)).length;
  const gap = (item: StudioVideo) => (item.studio.minutes === null || video.studio.minutes === null ? 10 : Math.abs(item.studio.minutes - video.studio.minutes));
  return [...pool].sort((a, b) => shared(b) * 10 - gap(b) - (shared(a) * 10 - gap(a)))[0] ?? null;
}

export function lengthLabel(video: StudioVideo, t: Translate = ENGLISH): string {
  return video.studio.minutes === null ? t(CHAIR_YOGA_TEXT.lengthUnknown) : t("{minutes} min (from the title)", { minutes: video.studio.minutes });
}

export function sectionCounts(videos: StudioVideo[] = libraryVideos()): Record<StudioSection, number> {
  return {
    seated: videos.filter((video) => video.studio.section === "seated").length,
    standing: videos.filter((video) => video.studio.section === "standing").length,
    gentle: videos.filter((video) => video.studio.section === "gentle").length,
  };
}
