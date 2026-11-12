/**
 * Explore Breathing Practices: ten guided YouTube videos shown on /breathe/practice.
 *
 * How these were checked (2026-11-11):
 * - Each ID was found through a web search limited to youtube.com.
 * - YouTube's free oEmbed endpoint (https://www.youtube.com/oembed) returned HTTP 200 for
 *   every ID below, which means the video is public and the owner allows embedding.
 *   Titles and channel names are copied from that response.
 * - The build machine itself cannot reach youtube.com, i.ytimg.com, or the oEmbed endpoint
 *   (the network proxy refuses them), so the check went through a separate web fetch, and
 *   nobody has yet watched the videos end to end or played them inside lifeZoi.
 * - Lengths: `minutes` is set only when the watch page showed the length (`lengthFrom: "page"`)
 *   or the published title states it (`lengthFrom: "title"`). Otherwise it is null and the
 *   card says the player shows the length. No length is guessed.
 *
 * Content is in English on purpose (the owner asked for English). The text here is not passed
 * through t(), so it is not part of the translation catalogs. The page tells people using
 * another language that this section is in English.
 *
 * Safety: none of these practices needs a breath hold. Where a published version adds one,
 * the card says to skip it and keep breathing gently. This is relaxation practice, not treatment.
 */

export const PRACTICE_VIDEOS_CHECKED_ON = "2026-11-11";

export type PracticeVideo = {
  /** Stable lifeZoi id, for React keys and tests. */
  id: string;
  technique: string;
  /** Short plain-English explanation for the card. */
  summary: string;
  youtubeId: string;
  /** As published on YouTube (from oEmbed). */
  title: string;
  channel: string;
  minutes: number | null;
  lengthFrom: "page" | "title" | null;
  beginner: boolean;
  /** How to sit for it, in a chair or on a mat. */
  sitting: string;
  /** Steps for closing one nostril, for the alternate-nostril practices. */
  hands: string[] | null;
  /** The gentler option, and what to skip. */
  gentle: string;
  /** Accent colour group for the card. */
  tone: "lavender" | "teal" | "gold" | "rose";
};

const CHAIR = "Sit in a sturdy chair with both feet flat on the floor and your back supported, or sit on a yoga mat with a cushion under your hips. No other movement is needed.";

/** How to close one nostril, used by Nadi Shodhana and Anulom Vilom. */
export const NOSTRIL_HANDS: string[] = [
  "Rest your left hand in your lap. Lift your right hand to your face. Let your elbow rest against your body or on a table, so your arm does not get tired.",
  "Use your right thumb to close your right nostril with a light touch. Press on the soft side of the nose, not the bony bridge.",
  "Use your right ring finger (or ring and little finger together) to close your left nostril the same way.",
  "Fold your index and middle fingers down toward your palm, or rest them lightly between your eyebrows. Either is fine.",
  "If your hand or shoulder gets tired, lower it and breathe normally for a few breaths. You can switch to your left hand, or use just one finger of either hand to close one side and then the other.",
  "If closing a nostril is uncomfortable, or your nose is blocked, do not close it. Breathe through both nostrils and simply imagine the breath moving up one side and down the other.",
];

const SKIP_HOLDS = "If the instructor asks you to hold your breath, skip the hold and keep breathing gently.";

export const PRACTICE_VIDEOS: PracticeVideo[] = [
  {
    id: "diaphragmatic",
    technique: "Diaphragmatic Breathing",
    summary: "Deep belly breathing. Your belly rises softly as you breathe in and falls as you breathe out. A calm place to start.",
    youtubeId: "mGbTU9IGpOk",
    title: "Diaphragmatic Belly Breathing Tutorial | 10 MIN Breathwork For Relaxation",
    channel: "PranaFlo",
    minutes: 13,
    lengthFrom: "page",
    beginner: true,
    sitting: `${CHAIR} Rest one hand on your belly and one on your chest.`,
    hands: null,
    gentle: `Breathe in only as deeply as feels easy. ${SKIP_HOLDS}`,
    tone: "lavender",
  },
  {
    id: "full-yogic",
    technique: "Full Yogic Breathing (Dirgha)",
    summary: "Complete three-part breathing. Breathe in gently into the belly, then the ribs, then the upper chest, and let it all go slowly.",
    youtubeId: "QhKbi2Je_i8",
    title: "Dirgha Pranayama - Full Yogic Breathing Technique",
    channel: "Vish Chatterji",
    minutes: null,
    lengthFrom: null,
    beginner: true,
    sitting: `${CHAIR} Sit tall but relaxed, with your shoulders soft.`,
    hands: null,
    gentle: `If three parts feel like too much, breathe into the belly and ribs only. ${SKIP_HOLDS}`,
    tone: "teal",
  },
  {
    id: "nadi-shodhana",
    technique: "Nadi Shodhana",
    summary: "Alternate nostril breathing. Close one nostril at a time with your fingers and breathe slowly through the other side.",
    youtubeId: "AoddBNKxLRc",
    title: "Feeling Restless? Try This 10-Minute Alternate Nostril Breathing Practice",
    channel: "Bharatha Yoga Shala",
    minutes: 10,
    lengthFrom: "title",
    beginner: true,
    sitting: `${CHAIR} See the hand steps below.`,
    hands: NOSTRIL_HANDS,
    gentle: `Keep each breath slow and quiet, never forced. ${SKIP_HOLDS}`,
    tone: "lavender",
  },
  {
    id: "anulom-vilom",
    technique: "Anulom Vilom",
    summary: "A steady rhythm of breathing in through one nostril and out through the other, back and forth, with no pauses.",
    youtubeId: "UWzuq0EmJPE",
    title: "Anuloma viloma pranayama | pranayama alternate nostril breathing English",
    channel: "Premanand Yoga",
    minutes: null,
    lengthFrom: null,
    beginner: true,
    sitting: `${CHAIR} See the hand steps below.`,
    hands: NOSTRIL_HANDS,
    gentle: `Some traditions add a pause after breathing in. Leave it out: breathe in, then breathe out, with no holding.`,
    tone: "teal",
  },
  {
    id: "bhramari",
    technique: "Bhramari",
    summary: "Humming bee breath. Breathe in through the nose, then make a soft, low hum like a bee as you breathe out.",
    youtubeId: "KkurfEQrg94",
    title: "Learn the Humming Bee Breath Technique - Bhramari Pranayama | Yoga",
    channel: "SIKANA English",
    minutes: null,
    lengthFrom: null,
    beginner: true,
    sitting: `${CHAIR} You can rest your hands in your lap. Covering your ears is optional.`,
    hands: null,
    gentle: `Hum quietly and stop the hum when your breath runs out. There is no need to hum loudly or for long. ${SKIP_HOLDS}`,
    tone: "gold",
  },
  {
    id: "ujjayi",
    technique: "Ujjayi Breathing",
    summary: "Gentle ocean breath. Slightly narrow the back of your throat so the breath makes a soft sound, like waves.",
    youtubeId: "xElhwrANteQ",
    title: "How to Do Ujjayi Pranayama (Ocean Breath) | Arhanta Yoga",
    channel: "Arhanta Yoga",
    minutes: null,
    lengthFrom: null,
    beginner: true,
    sitting: CHAIR,
    hands: null,
    gentle: `Keep the sound soft, never a strain in the throat. If it feels tight, breathe normally through the nose. ${SKIP_HOLDS}`,
    tone: "teal",
  },
  {
    id: "sitali",
    technique: "Sitali Pranayama",
    summary: "Cooling breath. Breathe in slowly through a curled tongue, then close your mouth and breathe out through the nose.",
    youtubeId: "j5HD9LGsZhk",
    title: "Learn the Cooling Breath Technique - Sitali Pranayama | Yoga",
    channel: "SIKANA English",
    minutes: null,
    lengthFrom: null,
    beginner: true,
    sitting: CHAIR,
    hands: null,
    gentle: `Not everyone can curl the tongue. That is normal: breathe in through softly pursed lips instead. Skip this one if the air feels too cold or you have asthma that cold air can trigger. ${SKIP_HOLDS}`,
    tone: "rose",
  },
  {
    id: "sitkari",
    technique: "Sitkari Breathing",
    summary: "Another cooling breath. Breathe in gently through lightly closed teeth with a soft hiss, then breathe out through the nose.",
    youtubeId: "q4ZRenlZxCM",
    title: "Hissing Cools - How To Do Sitkari | Yoga with Louise",
    channel: "Yoga With Louise",
    minutes: null,
    lengthFrom: null,
    beginner: true,
    sitting: CHAIR,
    hands: null,
    gentle: `If your teeth are sensitive to cold air, keep your lips slightly closed or choose another practice. ${SKIP_HOLDS}`,
    tone: "rose",
  },
  {
    id: "sama-vritti",
    technique: "Sama Vritti",
    summary: "Equal, balanced breathing. Breathe in and out for the same easy count, for example four in and four out.",
    youtubeId: "ea61cyyGYbU",
    title: "5 Minute Equal Breathing Technique // Sama Vritti Pranayama",
    channel: "Antara Yoga",
    minutes: 5,
    lengthFrom: "title",
    beginner: true,
    sitting: CHAIR,
    hands: null,
    gentle: `Choose a count that feels easy, even two or three. Some versions add pauses ("box breathing"). Leave them out and keep the breath flowing. ${SKIP_HOLDS}`,
    tone: "lavender",
  },
  {
    id: "extended-exhale",
    technique: "Extended Exhale Breathing",
    summary: "Breathe in gently, then breathe out slowly for a little longer. This video uses three counts in and six counts out, with no holds.",
    youtubeId: "hRWjCWaKK1A",
    title: "10-Minute 3-6 Breathing | Guided 3-0-6-0 Practice for Calm and HRV",
    channel: "The Breathwork Channel",
    minutes: 10,
    lengthFrom: "title",
    beginner: true,
    sitting: CHAIR,
    hands: null,
    gentle: "If six counts out feels long, breathe out for four or five. The out-breath only needs to be a little longer than the in-breath.",
    tone: "gold",
  },
];

/** Safety lines shown above the cards and inside the player. */
export const PRACTICE_SAFETY: string[] = [
  "You never need to hold your breath. Breathe gently through every practice.",
  "Stop at once if you feel dizzy, light-headed, short of breath, or uncomfortable. Breathe normally and rest sitting down.",
  "Keep every breath soft. Nothing here should feel forceful or strained.",
  "These videos are relaxation practices, not medical treatment. If you have a heart or lung condition, are pregnant, or have had recent surgery, check with your clinician first.",
];

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export function isYoutubeId(id: string): boolean {
  return YOUTUBE_ID.test(id);
}

/** Privacy-enhanced embed address. Only IDs listed above are accepted. */
export function practiceEmbedSrc(youtubeId: string): string | null {
  if (!isYoutubeId(youtubeId) || !PRACTICE_VIDEOS.some((video) => video.youtubeId === youtubeId)) return null;
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`;
}

export function practiceThumbnail(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

export function practiceWatchUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

export function lengthText(video: PracticeVideo): string {
  if (video.minutes === null) return "Length shown in the player";
  return video.lengthFrom === "title" ? `${video.minutes} min (from the video title)` : `About ${video.minutes} min`;
}
