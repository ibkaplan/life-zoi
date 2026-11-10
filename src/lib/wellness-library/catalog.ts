import { studioLessons } from "@/lib/wellness/movement-studio/catalog";
import { LINK_CHECKED, SAFETY_LINE, ASK_FIRST, FALL_SUPPORT } from "@/lib/wellness/movement-studio/catalog";
import { CATEGORY_INFO, type Intensity, type LibraryCategory } from "@/lib/wellness-library/moves";
import {
  STUDIO_VERIFIED_ON,
  STUDIO_VIDEO_SEEDS,
  type StudioAudience,
  type StudioPosition,
  type StudioSection,
  type StudioVideoSeed,
} from "@/lib/wellness-library/chair-yoga-videos";
import { makeTranslate, type Translate } from "@/lib/i18n/translate";

/** English with placeholders filled. Pages pass their own `t` to get the chosen language. */
const ENGLISH: Translate = makeTranslate(null);

/**
 * Wellness Library content catalog.
 *
 * Adding content: add a source to SOURCES (approval "pending"), then add
 * items with that source id. Items from a source that is not "approved",
 * and items that are not "approved" themselves, are never shown to members.
 * An administrator approves by changing the status in a reviewed pull request.
 *
 * Nothing here is fetched from the web at run time. `npm run check:library (src/lib/wellness-library/link-check.ts)`
 * checks availability and embedding through YouTube oEmbed when a person runs it.
 */

export type Approval = "approved" | "pending" | "rejected";
/** "verified" only after a person or the link check confirmed it is free without a subscription. */
export type CostStatus = "free-verified" | "free-unverified" | "paid" | "original";

export type ContentSource = {
  id: string;
  name: string;
  homepage: string;
  platform: "LifeZoi" | "YouTube" | "Website";
  approval: Approval;
  cost: CostStatus;
  notes: string;
  /** ISO date of the last availability check, or "" when never checked. */
  lastChecked: string;
};

export const SOURCES: ContentSource[] = [
  {
    id: "lifezoi",
    name: "LifeZoi guided sessions",
    homepage: "/wellness-library",
    platform: "LifeZoi",
    approval: "approved",
    cost: "original",
    notes: "Original step-by-step sessions written for LifeZoi. Built from the move lists in this repository.",
    lastChecked: "",
  },
  {
    id: "nia",
    name: "National Institute on Aging",
    homepage: "https://www.youtube.com/@NIHAging",
    platform: "YouTube",
    approval: "approved",
    cost: "free-verified",
    notes: "U.S. Government films on the NIA YouTube channel. Embed allowed; never re-hosted. Durations read from the YouTube player.",
    lastChecked: LINK_CHECKED,
  },
  {
    id: "nhs",
    name: "NHS",
    homepage: "https://www.nhs.uk/live-well/exercise/pilates-and-yoga/",
    platform: "Website",
    approval: "approved",
    cost: "free-unverified",
    notes:
      "Named by the product owner as an initial source. Pages: pilates-and-yoga, aerobic-exercises, and the Better Health home workout videos. Availability, embedding, and free status were not checked from the build environment.",
    lastChecked: "",
  },
  {
    id: "youtube-studio",
    name: "Free YouTube yoga classes (Chair Yoga Studio)",
    homepage: "https://www.youtube.com/",
    platform: "YouTube",
    approval: "approved",
    cost: "free-unverified",
    notes:
      "Public classes from independent teachers. Each card names the channel. Public and embeddable confirmed through YouTube oEmbed; player length, level, and membership status were not checked. Embedded, never re-hosted.",
    lastChecked: STUDIO_VERIFIED_ON,
  },
  {
    id: "yoga-org",
    name: "Yoga.org schedule",
    homepage: "https://schedule.yoga.org/",
    platform: "Website",
    approval: "pending",
    cost: "free-unverified",
    notes: "Live class schedule. Needs a check that classes are free and whether any can be embedded.",
    lastChecked: "",
  },
  {
    id: "notbroken",
    name: "Notbroken",
    homepage: "https://www.notbroken.io/videos/index.html",
    platform: "Website",
    approval: "pending",
    cost: "free-unverified",
    notes: "Needs a check of terms, free status, and embedding before any video is listed.",
    lastChecked: "",
  },
  {
    id: "jessica-smith",
    name: "Jessica Smith TV",
    homepage: "https://jessicasmithtv.com/exercise-videos/",
    platform: "Website",
    approval: "pending",
    cost: "free-unverified",
    notes: "The site also sells a membership. Only individual videos that are free on YouTube may be listed, after a check.",
    lastChecked: "",
  },
];

export type Equipment = "none" | "chair" | "mat" | "light-weights" | "wall" | "counter" | "stairs";
export type Mobility = "seated-ok" | "standing" | "floor";
export type AgeGuidance = "all-adults" | "older-adults" | "younger-active";

export type VideoItem = {
  id: string;
  kind: "video";
  title: string;
  description: string;
  sourceId: string;
  platform: "YouTube";
  originalUrl: string;
  /** Approved embed address. Null means link-only. */
  embedUrl: string | null;
  instructor: string;
  durationSeconds: number | null;
  category: LibraryCategory;
  level: "beginner" | "intermediate" | "advanced";
  ageGuidance: AgeGuidance;
  intensity: Intensity;
  equipment: Equipment[];
  mobility: Mobility;
  highImpact: boolean;
  kneeLoad: boolean;
  safety: string;
  language: "en";
  cost: CostStatus;
  lastChecked: string;
  approval: Approval;
  /** Chair Yoga Studio details. Present only for studio videos. */
  studio?: StudioMeta;
};

export type StudioMeta = {
  youtubeId: string;
  section: StudioSection;
  position: StudioPosition;
  /** Minutes written in the video title, or null. Not the player length. */
  minutes: number | null;
  audience: StudioAudience;
  balance: boolean;
  topics: string[];
  channelUrl: string;
  thumbnailUrl: string;
};

function youtubeId(url: string): string | null {
  const match = /(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/.exec(url);
  return match ? match[1] ?? null : null;
}

export function embedFor(url: string): string | null {
  const id = youtubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

const NIA_CATEGORY: Record<string, LibraryCategory> = {
  chair: "chair",
  balance: "balance",
  strength: "strength",
  flexibility: "stretching",
  mobility: "stretching",
};

/** NIA films already verified for Movement Studio. Reused, not copied. */
const niaVideos: VideoItem[] = studioLessons.flatMap((lesson): VideoItem[] => {
  if (lesson.kind !== "video" || lesson.position === "watch") return [];
  const category = NIA_CATEGORY[lesson.categorySlug];
  if (!category) return [];
  return [
    {
      id: `nia-${lesson.id}`,
      kind: "video",
      title: lesson.title,
      description: lesson.summary,
      sourceId: "nia",
      platform: "YouTube",
      originalUrl: lesson.license.sourceUrl,
      embedUrl: `https://www.youtube.com/embed/${lesson.youtubeId}`,
      instructor: "National Institute on Aging",
      durationSeconds: lesson.durationSeconds,
      category,
      level: lesson.level === "intermediate" ? "intermediate" : "beginner",
      ageGuidance: "older-adults",
      intensity: lesson.goal === "strength" ? "moderate" : "light",
      equipment: lesson.position === "sitting" ? ["chair"] : lesson.position === "mat" ? ["mat"] : ["counter"],
      mobility: lesson.position === "sitting" ? "seated-ok" : lesson.position === "mat" ? "floor" : "standing",
      highImpact: false,
      kneeLoad: false,
      safety: lesson.safety,
      language: "en",
      cost: "free-verified",
      lastChecked: LINK_CHECKED,
      approval: "approved",
    },
  ];
});

/** Videos named by the product owner. Not checked from the build environment. */
const ownerNamed: VideoItem[] = [
  {
    id: "nhs-pilates-beginner",
    kind: "video",
    title: "Beginner Pilates (NHS example)",
    description: "Beginner Pilates video named in the LifeZoi brief as an NHS starting resource. Check that it plays before relying on it.",
    sourceId: "nhs",
    platform: "YouTube",
    originalUrl: "https://www.youtube.com/watch?v=WS9Yzh-XiIs",
    embedUrl: embedFor("https://www.youtube.com/watch?v=WS9Yzh-XiIs"),
    instructor: "NHS (attribution to be confirmed)",
    durationSeconds: null,
    category: "pilates",
    level: "beginner",
    ageGuidance: "all-adults",
    intensity: "light",
    equipment: ["mat"],
    mobility: "floor",
    highImpact: false,
    kneeLoad: true,
    safety: `${SAFETY_LINE} ${ASK_FIRST}`,
    language: "en",
    cost: "free-unverified",
    lastChecked: "",
    approval: "approved",
  },
];

function studioCategory(seed: StudioVideoSeed): LibraryCategory {
  if (seed.section === "gentle") return seed.topics.includes("desk") ? "stretching" : "yoga";
  return seed.balance ? "balance" : "chair";
}

/** Chair Yoga Studio videos. Title and channel come from YouTube oEmbed; see chair-yoga-videos.ts. */
export const studioVideos: VideoItem[] = STUDIO_VIDEO_SEEDS.map((seed) => ({
  id: `yt-${seed.youtubeId}`,
  kind: "video",
  title: seed.title,
  description: seed.note,
  sourceId: "youtube-studio",
  platform: "YouTube",
  originalUrl: `https://www.youtube.com/watch?v=${seed.youtubeId}`,
  embedUrl: `https://www.youtube-nocookie.com/embed/${seed.youtubeId}`,
  instructor: seed.channel,
  durationSeconds: null,
  category: studioCategory(seed),
  level: seed.level,
  ageGuidance: seed.audience === "all" ? "all-adults" : "older-adults",
  intensity: seed.level === "intermediate" ? "moderate" : "light",
  equipment: seed.position === "mat" ? ["mat"] : seed.topics.includes("desk") && seed.position === "standing" ? ["none"] : ["chair"],
  mobility: seed.position === "seated" ? "seated-ok" : seed.position === "mat" ? "floor" : "standing",
  highImpact: false,
  kneeLoad: seed.position === "mat",
  // Balance videos get the fall-support line from videoSafety().
  safety: `${SAFETY_LINE}${!seed.balance && (seed.position === "standing" || seed.position === "mixed") ? ` ${FALL_SUPPORT}` : ""}`,
  language: "en",
  cost: "free-unverified",
  lastChecked: STUDIO_VERIFIED_ON,
  approval: "approved",
  studio: {
    youtubeId: seed.youtubeId,
    section: seed.section,
    position: seed.position,
    minutes: seed.minutes,
    audience: seed.audience,
    balance: seed.balance,
    topics: seed.topics,
    channelUrl: seed.channelUrl,
    thumbnailUrl: `https://i.ytimg.com/vi/${seed.youtubeId}/hqdefault.jpg`,
  },
}));

export const VIDEOS: VideoItem[] = [...niaVideos, ...ownerNamed, ...studioVideos];

export function sourceById(id: string): ContentSource | null {
  return SOURCES.find((source) => source.id === id) ?? null;
}

/** Visible to members only when both the item and its source are approved. */
export function isVisible(item: Pick<VideoItem, "approval" | "sourceId">): boolean {
  return item.approval === "approved" && sourceById(item.sourceId)?.approval === "approved";
}

export function visibleVideos(): VideoItem[] {
  return VIDEOS.filter(isVisible);
}

export const COST_TEXT: Record<CostStatus, string> = {
  "free-verified": "Free (checked)",
  "free-unverified": "Free status not yet checked",
  paid: "Paid",
  original: "LifeZoi original",
};

export function categoryTitle(category: LibraryCategory): string {
  return CATEGORY_INFO[category].title;
}

export function videoSafety(item: VideoItem): string {
  if (item.category === "balance") return `${item.safety} ${FALL_SUPPORT}`;
  return item.safety;
}

// ---------- library management checks ----------

export type CatalogIssue = { id: string; problem: string };

function normalizeUrl(url: string): string {
  const id = youtubeId(url);
  if (id) return `yt:${id}`;
  return url.toLowerCase().replace(/\/+$/, "").replace(/^https?:\/\/(www\.)?/, "");
}

/** Duplicate detection: two items with the same underlying video or address. */
export function findDuplicates(items: VideoItem[] = VIDEOS, t: Translate = ENGLISH): CatalogIssue[] {
  const seen = new Map<string, string>();
  const issues: CatalogIssue[] = [];
  for (const item of items) {
    const key = normalizeUrl(item.originalUrl);
    const first = seen.get(key);
    if (first) issues.push({ id: item.id, problem: t("Same video as {id}.", { id: first }) });
    else seen.set(key, item.id);
  }
  return issues;
}

/** Items that need a person before members rely on them. */
export function reviewQueue(items: VideoItem[] = VIDEOS, sources: ContentSource[] = SOURCES, t: Translate = ENGLISH): CatalogIssue[] {
  const issues: CatalogIssue[] = [];
  for (const source of sources) {
    if (source.approval === "pending") issues.push({ id: source.id, problem: t("Source waiting for administrator approval.") });
    if (source.approval === "approved" && source.platform !== "LifeZoi" && !source.lastChecked) {
      issues.push({ id: source.id, problem: t("Approved source has never had an availability check.") });
    }
  }
  for (const item of items) {
    if (item.approval === "pending") issues.push({ id: item.id, problem: t("Video waiting for approval.") });
    if (item.cost === "free-unverified") issues.push({ id: item.id, problem: t("Free status not verified.") });
    if (!item.lastChecked) issues.push({ id: item.id, problem: t("Availability and embedding not checked yet.") });
    if (item.embedUrl && !/^https:\/\/www\.youtube(-nocookie)?\.com\/embed\/[A-Za-z0-9_-]{11}$/.test(item.embedUrl)) {
      issues.push({ id: item.id, problem: t("Embed address is not an official YouTube player address.") });
    }
    if (!sourceById(item.sourceId)) issues.push({ id: item.id, problem: t("Unknown source.") });
  }
  return [...issues, ...findDuplicates(items, t)];
}
