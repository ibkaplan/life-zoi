import type { Technique } from "@/lib/breathe/content";

/**
 * Breathing videos for the "What is nitric oxide?" article. Each one plays in
 * YouTube's own embedded player (youtube-nocookie.com), which is how YouTube
 * lets other sites show a public video. LifeZoi does not download or copy any
 * video, and it loads the player only after the person presses play.
 *
 * Checked on BREATHE_VIDEOS_CHECKED_ON through YouTube's public oEmbed
 * endpoint: every video answered 200, so it was public and its owner allowed
 * embedding that day. Titles and channels are copied from that answer.
 * Nobody has watched every video in full. Lengths are not in the titles, so
 * the player shows them.
 *
 * Facebook videos were looked at and not used: the ones found made claims
 * LifeZoi does not repeat (for example, NO "in your blood", or a fast
 * breathing "NO dump"), and their embedding could not be checked.
 */

export const BREATHE_VIDEOS_CHECKED_ON = "2026-11-12";

export type BreatheVideoSeed = {
  youtubeId: string;
  /** Copied exactly from YouTube. */
  title: string;
  /** Copied exactly from YouTube. */
  channel: string;
  channelUrl: string;
  technique: Technique["id"];
  /** LifeZoi's own short description, in plain language. */
  note: string;
};

export const BREATHE_VIDEO_SEEDS: BreatheVideoSeed[] = [
  {
    youtubeId: "jHAa1B0XctU",
    title: "Bee Breath | Bhramari Pranayama",
    channel: "Yoga With Adriene",
    channelUrl: "https://www.youtube.com/@yogawithadriene",
    technique: "bhramari",
    note: "The humming bee breath from Yoga With Adriene.",
  },
  {
    youtubeId: "Qve8pvadOLg",
    title: "Humming Bee Breath | Bhramari Pranayama Practice to Increase Nitric Oxide",
    channel: "The School of Breath",
    channelUrl: "https://www.youtube.com/@TheSchoolofBreath",
    technique: "bhramari",
    note: "A humming bee breath practice. The title speaks of nitric oxide; the studies measured nasal NO only.",
  },
  {
    youtubeId: "8vN08IuParo",
    title: "15x More Nasal Nitric Oxide with Humming (Brahmari Pranayama)",
    channel: "Mike Maher | TAKE A DEEP BREATH",
    channelUrl: "https://www.youtube.com/@TAKEADEEPBREATH",
    technique: "bhramari",
    note: "About humming and nasal nitric oxide. The 15 times figure is about air leaving the nose, not the whole body.",
  },
  {
    youtubeId: "mJ2xn-VGp0Y",
    title: "How To Do  Bhramari  Pranayama | Learn Humming Bee Breath In 3 Important Steps | Bharath Shetty",
    channel: "Bharatha Yoga Shala",
    channelUrl: "https://www.youtube.com/@BharathaYogaShala",
    technique: "bhramari",
    note: "A yoga teacher's lesson on the humming bee breath, in three steps.",
  },
  {
    youtubeId: "J2e2zIM4Exk",
    title: "SIMPLE Nose, Slow & Low Breathing Exercise For Stress  | Buteyko Clinic International",
    channel: "Buteyko Clinic International",
    channelUrl: "https://www.youtube.com/@ButeykoClinicInternational",
    technique: "nasal",
    note: "Slow, low breathing through the nose. The title says it is for stress.",
  },
  {
    youtubeId: "8GfIp5pZLvo",
    title: "Breathing Exercise to Breathe Nose, Slow & Low",
    channel: "Oxygen Advantage®",
    channelUrl: "https://www.youtube.com/@OxygenAdvantage",
    technique: "nasal",
    note: "An exercise for slow, low breathing through the nose.",
  },
  {
    youtubeId: "_9nijNQik0s",
    title: "Diaphragmatic Breathing Exercise",
    channel: "UC San Francisco (UCSF)",
    channelUrl: "https://www.youtube.com/@ucsf",
    technique: "diaphragm",
    note: "Diaphragmatic (belly) breathing from a university health system.",
  },
  {
    youtubeId: "7Ep5mKuRmAA",
    title: "Belly breathing exercise: Calming the body and mind",
    channel: "Indiana University School of Medicine",
    channelUrl: "https://www.youtube.com/@IUMedSchool",
    technique: "diaphragm",
    note: "Belly breathing for calm, from a medical school.",
  },
  {
    youtubeId: "kmHXr4jjmVc",
    title: "Northwestern Medicine Diaphragmatic Breathing for GI Health",
    channel: "Northwestern Medicine",
    channelUrl: "https://www.youtube.com/@NorthwesternMedicine",
    technique: "diaphragm",
    note: "Diaphragmatic breathing from a hospital. The title says it was made for digestive health.",
  },
  {
    youtubeId: "JwRaIrAT4Bo",
    title: "Alternate nostril breathing",
    channel: "UT MD Anderson Cancer Center",
    channelUrl: "https://www.youtube.com/@mdanderson",
    technique: "alternate",
    note: "Alternate nostril breathing from a cancer center.",
  },
  {
    youtubeId: "RH3n55NnJg8",
    title: "Alternate Nostril Breathing Technique Tutorial | Nadi Shodhana Pranayama - Yoga Breathing",
    channel: "BrettLarkinYoga",
    channelUrl: "https://www.youtube.com/@BrettLarkinYoga",
    technique: "alternate",
    note: "A yoga teacher's tutorial on alternate nostril breathing.",
  },
];

export type BreatheVideo = BreatheVideoSeed & {
  id: string;
  originalUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
};

export const breatheVideos: BreatheVideo[] = BREATHE_VIDEO_SEEDS.map((seed) => ({
  ...seed,
  id: `bf-${seed.youtubeId}`,
  originalUrl: `https://www.youtube.com/watch?v=${seed.youtubeId}`,
  embedUrl: `https://www.youtube-nocookie.com/embed/${seed.youtubeId}`,
  thumbnailUrl: `https://i.ytimg.com/vi/${seed.youtubeId}/hqdefault.jpg`,
}));

export function videosForTechnique(technique: Technique["id"], videos: BreatheVideo[] = breatheVideos): BreatheVideo[] {
  return videos.filter((video) => video.technique === technique);
}

export const BREATHE_VIDEO_TEXT = {
  heading: "Breathing videos for nitric oxide",
  intro: "Humming and soft nose breathing are the two practices linked with more nasal nitric oxide. Slow belly breathing and alternate nostril breathing are here for calm. Press play and follow along.",
  play: "PLAY VIDEO",
  close: "Close video",
  openOnYoutube: "OPEN ON YOUTUBE",
  noHold: "Some teachers add breath holding or fast breathing. lifeZoi never asks for that: skip those parts and keep breathing gently.",
  playerNote: "Each video plays in YouTube's player and stays on YouTube. lifeZoi does not copy it, and the player loads only when you press play. If it shows an error, use OPEN ON YOUTUBE.",
  checked: "Checked on {date}: each video was public and its owner allowed it to be shown on other websites. Titles and channels come from YouTube. lifeZoi has not watched every video in full.",
  titleNote: "Video titles are the creators' own words. Some promise more nitric oxide. The studies measured nitric oxide in air leaving the nose, not in the blood, and did not show a health result.",
} as const;
