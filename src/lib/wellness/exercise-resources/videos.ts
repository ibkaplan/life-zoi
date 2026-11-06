import type { ResourceTier } from "@/lib/wellness/exercise-resources/copy";
import { linkById, type ExternalLinkId } from "@/lib/wellness/exercise-resources/links";

export const videoGroups = [
  { id: "chair", title: "Chair" },
  { id: "balance", title: "Balance" },
  { id: "strength", title: "Strength" },
  { id: "stretching", title: "Stretching" },
  { id: "walking", title: "Walking" },
  { id: "gentle-yoga", title: "Gentle yoga" },
  { id: "healthy-aging", title: "Healthy aging" },
] as const;

export type VideoGroupId = (typeof videoGroups)[number]["id"];

/**
 * YouTube oEmbed returned a player for these National Institute on Aging videos
 * on 2026-11-06, and the NIA toolkit page already embeds the two healthy-aging films.
 * No other provider is embedded.
 */
export const PERMITTED_EMBEDS = ["MjMkBaqimFo", "n5kWf0pvEkc", "kCQ6irSQwYA", "JejTelL05Qw"] as const;

const permitted = new Set<string>(PERMITTED_EMBEDS);

export function youtubeEmbedSrc(id: string | null): string | null {
  if (!id || !permitted.has(id)) return null;
  return `https://www.youtube.com/embed/${id}`;
}

export type VideoEntry = {
  id: string;
  linkId: ExternalLinkId;
  group: VideoGroupId;
  duration: string | null;
  description: string;
  embedId: string | null;
  tier: ResourceTier;
};

const free = "free" as const;

export const videos: VideoEntry[] = [
  {
    id: "chair-toolkit",
    linkId: "nia-toolkit",
    group: "chair",
    duration: null,
    description: "National Institute on Aging toolkit page. The exercise-toolkit address opens this page. lifeZoi links to it and does not copy the toolkit.",
    embedId: null,
    tier: free,
  },
  {
    id: "chair-medline",
    linkId: "medlineplus-older",
    group: "chair",
    duration: null,
    description: "MedlinePlus topic page for exercise and older adults. lifeZoi does not copy the page.",
    embedId: null,
    tier: free,
  },
  {
    id: "chair-nutrition-gov",
    linkId: "nutrition-gov-videos",
    group: "chair",
    duration: null,
    description: "Nutrition.gov lists official exercise videos, including National Institute on Aging sample workouts.",
    embedId: null,
    tier: free,
  },
  {
    id: "chair-sample",
    linkId: "nia-10-min-video",
    group: "chair",
    duration: "10 minutes",
    description: "National Institute on Aging sample workout. The title says 10 minutes. It is not the lifeZoi chair routine. Stay seated for any part that does not feel steady.",
    embedId: null,
    tier: free,
  },
  {
    id: "balance-cdc",
    linkId: "cdc-older",
    group: "balance",
    duration: null,
    description: "CDC page on activity for older adults, including balance examples. lifeZoi does not copy the page.",
    embedId: null,
    tier: free,
  },
  {
    id: "balance-video",
    linkId: "nia-balance-video",
    group: "balance",
    duration: null,
    description: "Official National Institute on Aging balance video. Do not practice balance without support if you are at risk of falling. lifeZoi links to the original and does not host the file.",
    embedId: null,
    tier: free,
  },
  {
    id: "balance-heel",
    linkId: "nia-heel-video",
    group: "balance",
    duration: null,
    description: "Official National Institute on Aging heel-to-toe video. Hold a stable support if you try anything like it. lifeZoi does not host the file.",
    embedId: null,
    tier: free,
  },
  {
    id: "balance-one-foot",
    linkId: "nia-one-foot-video",
    group: "balance",
    duration: null,
    description: "Official National Institute on Aging one-foot balance video. Do not practice balance without support if you are at risk of falling.",
    embedId: null,
    tier: free,
  },
  {
    id: "balance-liveup",
    linkId: "liveup",
    group: "balance",
    duration: null,
    description: "LiveUp publishes a free online strength and balance class for older adults. lifeZoi links to the class page and does not copy the class.",
    embedId: null,
    tier: free,
  },
  {
    id: "strength-workout",
    linkId: "nia-strength-video",
    group: "strength",
    duration: null,
    description: "Official National Institute on Aging strength workout for older adults. The player is the YouTube embed YouTube allows for this film. Stop any move that does not feel safe.",
    embedId: "JejTelL05Qw",
    tier: free,
  },
  {
    id: "strength-wall",
    linkId: "nia-wall-pushup-video",
    group: "strength",
    duration: null,
    description: "Official National Institute on Aging wall push-up video. Use it only if standing at a wall feels steady. lifeZoi does not host the file.",
    embedId: null,
    tier: free,
  },
  {
    id: "strength-hand",
    linkId: "nia-hand-grip-video",
    group: "strength",
    duration: null,
    description: "Official National Institute on Aging hand-grip video. lifeZoi links to the original.",
    embedId: null,
    tier: free,
  },
  {
    id: "strength-fifteen",
    linkId: "nia-15-min-video",
    group: "strength",
    duration: "15 minutes",
    description: "National Institute on Aging sample workout. The title says 15 minutes. It is not a lifeZoi routine.",
    embedId: null,
    tier: free,
  },
  {
    id: "stretch-flex",
    linkId: "nia-flexibility-video",
    group: "stretching",
    duration: "10 minutes",
    description: "Official National Institute on Aging flexibility and cool-down video. Nutrition.gov lists the running time as 10 minutes. lifeZoi embeds the permitted YouTube player and does not host the file.",
    embedId: "kCQ6irSQwYA",
    tier: free,
  },
  {
    id: "stretch-six",
    linkId: "nia-flex6-video",
    group: "stretching",
    duration: null,
    description: "Official National Institute on Aging flexibility video. lifeZoi links to the original.",
    embedId: null,
    tier: free,
  },
  {
    id: "stretch-shoulder",
    linkId: "nia-shoulder-video",
    group: "stretching",
    duration: null,
    description: "Official National Institute on Aging shoulder and arm stretch video. Stop if a reach hurts.",
    embedId: null,
    tier: free,
  },
  {
    id: "stretch-ankle",
    linkId: "nia-ankle-video",
    group: "stretching",
    duration: null,
    description: "Official National Institute on Aging ankle stretch video. lifeZoi links to the original.",
    embedId: null,
    tier: free,
  },
  {
    id: "walk-outdoor",
    linkId: "nia-outdoor",
    group: "walking",
    duration: null,
    description: "National Institute on Aging page of outdoor safety tips for older adults. lifeZoi does not copy the page.",
    embedId: null,
    tier: free,
  },
  {
    id: "walk-cdc",
    linkId: "cdc-older",
    group: "walking",
    duration: null,
    description: "CDC older-adult activity page. It describes aerobic activity such as walking, plus muscle-strengthening and balance. lifeZoi does not copy the page.",
    embedId: null,
    tier: free,
  },
  {
    id: "walk-how-much",
    linkId: "medlineplus-how-much",
    group: "walking",
    duration: null,
    description: "MedlinePlus page about how much activity people ask about. lifeZoi does not turn it into a personal target.",
    embedId: null,
    tier: free,
  },
  {
    id: "walk-tips",
    linkId: "nia-tips",
    group: "walking",
    duration: null,
    description: "National Institute on Aging tips for getting and staying active. lifeZoi links to the page.",
    embedId: null,
    tier: free,
  },
  {
    id: "yoga-nccih",
    linkId: "nccih-yoga",
    group: "gentle-yoga",
    duration: null,
    description: "NCCIH page on yoga effectiveness and safety. lifeZoi does not copy it and does not offer a yoga certification.",
    embedId: null,
    tier: free,
  },
  {
    id: "yoga-app",
    linkId: "chair-yoga-fit",
    group: "gentle-yoga",
    duration: null,
    description: "Optional outside app. A free download is not the same as fully free functionality. Check the app for optional paid features. lifeZoi does not depend on the app.",
    embedId: null,
    tier: free,
  },
  {
    id: "aging-qa",
    linkId: "nia-aging-video",
    group: "healthy-aging",
    duration: null,
    description: "Official National Institute on Aging conversation about exercise and healthy aging. NIA embeds this film on the exercise toolkit. lifeZoi uses that same YouTube player.",
    embedId: "n5kWf0pvEkc",
    tier: free,
  },
  {
    id: "aging-emotional",
    linkId: "nia-emotional-video",
    group: "healthy-aging",
    duration: null,
    description: "Official National Institute on Aging video about feelings and exercise, also embedded on the NIA toolkit page. lifeZoi does not host the file.",
    embedId: "MjMkBaqimFo",
    tier: free,
  },
  {
    id: "aging-benefits",
    linkId: "nia-benefits",
    group: "healthy-aging",
    duration: null,
    description: "National Institute on Aging page about activity and health. lifeZoi does not copy the page and does not promise a personal result.",
    embedId: null,
    tier: free,
  },
  {
    id: "aging-chronic",
    linkId: "nia-chronic",
    group: "healthy-aging",
    duration: null,
    description: "National Institute on Aging page about activity when a person already has a chronic condition. Ask a qualified professional about your own situation.",
    embedId: null,
    tier: free,
  },
  {
    id: "aging-hub",
    linkId: "nia-exercise-hub",
    group: "healthy-aging",
    duration: null,
    description: "National Institute on Aging hub for exercise and physical activity.",
    embedId: null,
    tier: free,
  },
  {
    id: "aging-playlist",
    linkId: "nia-playlist",
    group: "healthy-aging",
    duration: null,
    description: "National Institute on Aging YouTube playlist, Exercises for Older Adults. lifeZoi links to the playlist and does not rehost the films.",
    embedId: null,
    tier: free,
  },
  {
    id: "aging-medline",
    linkId: "medlineplus-benefits",
    group: "healthy-aging",
    duration: null,
    description: "MedlinePlus page on benefits of exercise. lifeZoi does not copy it.",
    embedId: null,
    tier: free,
  },
];

export type ResolvedVideo = VideoEntry & {
  title: string;
  source: string;
  url: string;
  embedSrc: string | null;
};

export function resolvedVideos(): ResolvedVideo[] {
  return videos.map((video) => {
    const link = linkById(video.linkId);
    return {
      ...video,
      title: link.title,
      source: link.source,
      url: link.url,
      embedSrc: youtubeEmbedSrc(video.embedId),
    };
  });
}
