import type { HealthProfileFields, WellnessGoal } from "@/lib/health-profile";
import type { MovementPrefs } from "@/lib/companion/state";
import {
  DAILY_CATEGORIES,
  DAILY_VIDEO_SEEDS,
  type DailyCategory,
  type DailyVideoSeed,
} from "@/lib/wellness-library/daily-movement-videos";

/**
 * Daily Movement: standing and active classes for people without mobility
 * limits, with a morning and an evening suggestion. Pure functions, so they
 * can be tested without a browser.
 *
 * Personalization reads only the questionnaire's mobility answers, wellness
 * goals, daily setting, and the saved movement level. Age is not an input:
 * nobody is moved to chair exercises because of their age. People who say
 * standing for long is hard, or who prefer chair exercises, are pointed to
 * Chair Yoga Studio, which stays as it is.
 */

export const DAILY_PATH = "/academy/move/studio/daily-movement";
export const CHAIR_STUDIO_PATH = "/academy/move/studio/chair-yoga";

export const DAILY_TEXT = {
  kicker: "Movement · Daily Movement",
  title: "Daily Movement",
  intro: "Standing aerobics, stretching, balance, and light strength for adults who move without limits. Press PLAY VIDEO and follow the instructor.",
  play: "PLAY VIDEO",
  openOnYoutube: "OPEN ON YOUTUBE",
  back: "Back to Daily Movement",
  morning: "YOUR MORNING",
  evening: "YOUR EVENING",
  extra: "Also good for today",
  another: "Show another class",
  markDone: "Mark completed",
  readSteps: "Read the movements aloud",
  movements: "How to do each movement",
  then: "Then",
  total: "About {minutes} minutes in total",
  lengthFromTitle: "from the title",
  lengthUnknown: "Length shown on YouTube",
  labelsNote: "Length, level, and position come from each video's title and channel. LifeZoi has not watched every class, so check the first minutes and adjust.",
  playerNote: "The video plays in YouTube's player and stays on YouTube. LifeZoi does not copy it. If the player shows an error, use OPEN ON YOUTUBE.",
  talkingNote: "Most instructors talk you through the class. LifeZoi has not listened to every video, so the written movements below can also be read aloud in your language.",
  noTalking: "No talking in this video",
  notTreatment: "These classes are general exercise. They do not treat or cure any condition.",
  stopIf: "Stop if you feel pain, dizziness, chest discomfort, unusual shortness of breath, or anything unusual.",
  space: "Clear a space, wear supportive shoes or go barefoot on a non-slip floor, and keep water nearby.",
  balanceCare: "For balance moves, stand next to a counter or a sturdy chair back and hold on whenever you want.",
  chairInstead: "Prefer chair exercises today",
  chairInsteadHelp: "Chair Yoga Studio has seated and standing chair classes. Choose it whenever you like; Daily Movement stays here for other days.",
  openChair: "Open Chair Yoga Studio",
  library: "All Daily Movement classes",
  verified: "How these videos were checked",
} as const;

export const CATEGORY_INFO: Record<DailyCategory, { title: string; summary: string; length: string }> = {
  "morning-aerobics": {
    title: "Morning Aerobics",
    summary: "Low-impact standing cardio to wake the body up. No jumping.",
    length: "10–15 minutes",
  },
  "morning-stretch": {
    title: "Morning Stretching",
    summary: "Standing stretches that loosen the neck, shoulders, back, hips, and legs after sleep.",
    length: "10–15 minutes",
  },
  "full-body": {
    title: "Gentle Full-Body Workout",
    summary: "A steady standing workout that uses the arms, legs, and core together.",
    length: "15 minutes",
  },
  balance: {
    title: "Balance & Coordination",
    summary: "Standing balance and brain–body coordination moves, with a counter nearby for support.",
    length: "10–15 minutes",
  },
  flexibility: {
    title: "Flexibility Exercises",
    summary: "Longer full-body stretches for flexibility and mobility. Some use a mat.",
    length: "15 minutes",
  },
  "low-impact": {
    title: "Low-Impact Aerobics",
    summary: "Walking in place and step patterns that raise the heart rate gently.",
    length: "15 minutes",
  },
  evening: {
    title: "Evening Relaxation & Stretching",
    summary: "Slow stretches and calm breathing to wind down before bed. Usually on a mat.",
    length: "15 minutes",
  },
  "back-neck": {
    title: "Back, Neck & Shoulder Exercises",
    summary: "Stretches and gentle strength for the upper back, neck, and shoulders. Good after sitting.",
    length: "10 minutes",
  },
  strength: {
    title: "Strength & Toning Exercises",
    summary: "Light strength work with body weight or light dumbbells, mostly standing.",
    length: "15 minutes",
  },
};

export const POSITION_TEXT = { standing: "Standing", mat: "Mat or floor" } as const;
export const LEVEL_TEXT = { beginner: "Beginner", intermediate: "Intermediate" } as const;
export const AUDIENCE_TEXT = { "50+": "Adults 50+", all: "All ages" } as const;

/** A short written routine LifeZoi adds to a video. Each step explains one movement and can be read aloud. */
export type Routine = { id: string; title: string; minutes: number; steps: string[] };

export const ROUTINES: Record<"morning-stretch" | "balance" | "back-neck" | "evening-relax", Routine> = {
  "morning-stretch": {
    id: "morning-stretch-5",
    title: "5-minute standing stretch",
    minutes: 5,
    steps: [
      "Reach up: stand tall with feet hip-width apart. Breathe in and lift both arms overhead, breathe out and lower them. Repeat 5 times.",
      "Side bend: lift your right arm and lean gently to the left, keeping both feet on the floor. Hold for 3 breaths, then change sides.",
      "Shoulder rolls: roll both shoulders up, back, and down 8 times, then 8 times the other way.",
      "Chest opener: clasp your hands behind your back, or hold a towel, and lift your chest gently. Hold for 3 breaths.",
      "Calf stretch: step your right foot back and press the heel toward the floor, front knee soft, hands on a wall if you like. Hold for 3 breaths, then change legs.",
      "Finish: stand tall, breathe in through your nose, and breathe out slowly three times.",
    ],
  },
  balance: {
    id: "balance-5",
    title: "5-minute balance practice",
    minutes: 5,
    steps: [
      "Stand next to a counter or the back of a sturdy chair, close enough to hold on at any time.",
      "Heel raises: rise onto your toes and lower slowly. Repeat 10 times.",
      "Weight shifts: move your weight slowly onto the right foot, then the left. Repeat 10 times.",
      "Heel-to-toe stand: place one foot directly in front of the other. Hold for 10 seconds, then change feet.",
      "One-leg stand: lift one foot a little off the floor and hold for up to 10 seconds, holding on if needed. Change legs. Repeat twice on each side.",
    ],
  },
  "back-neck": {
    id: "back-neck-5",
    title: "5-minute back, neck, and shoulder release",
    minutes: 5,
    steps: [
      "Chin tucks: stand or sit tall and slide your chin straight back, as if making a double chin. Hold for 3 seconds. Repeat 8 times.",
      "Neck side stretch: tip your right ear toward your right shoulder without lifting the shoulder. Hold for 3 breaths, then change sides.",
      "Shoulder blade squeeze: draw your shoulder blades back and down. Hold for 5 seconds. Repeat 8 times.",
      "Upper back stretch: hold your hands in front of you at chest height and round your upper back, pushing your hands away. Hold for 3 breaths.",
      "Gentle twist: with hips facing forward, turn your chest to the right, then to the left, slowly. Repeat 5 times each way.",
    ],
  },
  "evening-relax": {
    id: "evening-relax-5",
    title: "5-minute evening relaxation",
    minutes: 5,
    steps: [
      "Sit or lie down comfortably. Rest one hand on your belly.",
      "Slow breathing: breathe in through your nose for a count of 4 and out for a count of 6. Repeat 6 times.",
      "Let go of tension: tighten your shoulders toward your ears for 3 seconds, then let them drop. Repeat 3 times.",
      "Gentle knee rocking: lying on your back with knees bent, let both knees fall slowly to one side, then the other. Repeat 6 times. Skip this if lying down is not comfortable.",
      "Rest: let your breathing return to normal and notice how your body feels for one minute.",
    ],
  },
};

export type DailyVideo = DailyVideoSeed & {
  id: string;
  originalUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
};

export const dailyVideos: DailyVideo[] = DAILY_VIDEO_SEEDS.map((seed) => ({
  ...seed,
  id: `dm-${seed.youtubeId}`,
  originalUrl: `https://www.youtube.com/watch?v=${seed.youtubeId}`,
  embedUrl: `https://www.youtube-nocookie.com/embed/${seed.youtubeId}`,
  thumbnailUrl: `https://i.ytimg.com/vi/${seed.youtubeId}/hqdefault.jpg`,
}));

export function videosIn(category: DailyCategory, videos: DailyVideo[] = dailyVideos): DailyVideo[] {
  return videos.filter((video) => video.category === category);
}

export function categoryCounts(videos: DailyVideo[] = dailyVideos): Record<DailyCategory, number> {
  return Object.fromEntries(DAILY_CATEGORIES.map((category) => [category, videosIn(category, videos).length])) as Record<DailyCategory, number>;
}

export function dailyVideoById(id: string, videos: DailyVideo[] = dailyVideos): DailyVideo | null {
  return videos.find((video) => video.id === id || video.youtubeId === id) ?? null;
}

/**
 * free: answered, standing is fine (for example "No mobility limitations", or joint pain only).
 * unanswered: no mobility answer yet, or "prefer not to say".
 * support: balance concerns or a walking aid. seated: standing for long is hard, or a wheelchair.
 */
export type DailyMobility = "free" | "unanswered" | "support" | "seated";

export type DailyProfile = {
  mobility: DailyMobility;
  jointCare: boolean;
  breathless: boolean;
  goals: WellnessGoal[];
  sitsLong: boolean;
  /** Saved movement level. Intermediate classes are suggested only at 1 or above. */
  level: 0 | 1 | 2;
  prefersChair: boolean;
};

type ProfileAnswers = Partial<Pick<HealthProfileFields, "mobilityLimits" | "wellnessGoals" | "primaryGoal" | "dailySetting">>;

/** Build the Daily Movement profile. Age is deliberately not read. */
export function dailyProfile(answers: ProfileAnswers | null, prefs?: Pick<MovementPrefs, "level" | "experience"> | null, prefersChair = false): DailyProfile {
  const limits = answers?.mobilityLimits ?? [];
  const mobility: DailyMobility =
    limits.includes("wheelchair") || limits.includes("limited-standing")
      ? "seated"
      : limits.includes("balance-concerns") || limits.includes("walking-aid")
        ? "support"
        : limits.length === 0 || limits.includes("prefer-not")
          ? "unanswered"
          : "free";
  const goals = [...new Set([...(answers?.primaryGoal ? [answers.primaryGoal] : []), ...(answers?.wellnessGoals ?? [])])];
  const setting = answers?.dailySetting ?? [];
  const level = prefs?.level === "advanced" ? 2 : prefs?.level === "intermediate" || prefs?.experience === "regular" ? 1 : 0;
  return {
    mobility,
    jointCare: limits.includes("joint-pain"),
    breathless: limits.includes("breathlessness"),
    goals,
    sitsLong: setting.some((item) => item === "office" || item === "computer" || item === "long-sitting" || item === "driving" || item === "television"),
    level,
    prefersChair,
  };
}

const ACTIVE_GOALS: WellnessGoal[] = ["energy", "fitness", "lose-weight", "maintain-weight", "blood-sugar", "cholesterol", "well-being"];
const CALM_GOALS: WellnessGoal[] = ["sleep", "stress"];

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Classes LifeZoi would not suggest first for this profile. They stay in the library. */
export function notFirstFor(video: DailyVideo, profile: DailyProfile): boolean {
  if (video.level === "intermediate" && profile.level < 1) return true;
  if (profile.breathless && video.cardio && video.category !== "low-impact") return true;
  if (profile.mobility === "support" && video.position === "mat") return true;
  return false;
}

/**
 * One class from a category for a date. Classes with spoken instruction and a
 * known length come first; `offset` moves to the next one ("Show another").
 */
export function pickVideo(category: DailyCategory, profile: DailyProfile, seed: string, offset = 0, videos: DailyVideo[] = dailyVideos): DailyVideo | null {
  const all = videosIn(category, videos);
  const suitable = all.filter((video) => !notFirstFor(video, profile));
  const pool = suitable.length > 0 ? suitable : all;
  const ranked = [...pool].sort((a, b) => rank(a) - rank(b));
  const best = ranked.filter((video) => rank(video) === rank(ranked[0]!));
  const ordered = [...best, ...ranked.filter((video) => !best.includes(video))];
  if (ordered.length === 0) return null;
  const start = hash(seed) % best.length;
  return ordered[(start + offset) % ordered.length] ?? null;
}

function rank(video: DailyVideo): number {
  return (video.talking === "no" ? 2 : 0) + (video.minutes === null ? 1 : 0);
}

export type PlanItem = { kind: "video"; category: DailyCategory; video: DailyVideo } | { kind: "routine"; routine: Routine };
export type SessionPlan = { slot: "morning" | "evening"; items: PlanItem[]; minutes: number | null };
export type DailyPlan = {
  /** True when the answers or the person's choice point to Chair Yoga Studio first. */
  chairFirst: boolean;
  morning: SessionPlan | null;
  evening: SessionPlan | null;
  extra: { category: DailyCategory; video: DailyVideo } | null;
  reasons: string[];
  cautions: string[];
};

function total(items: PlanItem[]): number | null {
  let sum = 0;
  for (const item of items) {
    const minutes = item.kind === "routine" ? item.routine.minutes : item.video.minutes;
    if (minutes === null) return null;
    sum += minutes;
  }
  return sum;
}

function morningCategory(profile: DailyProfile): DailyCategory {
  if (profile.mobility === "support" || profile.breathless) return "morning-stretch";
  if (profile.jointCare) return "low-impact";
  const active = profile.goals.some((goal) => ACTIVE_GOALS.includes(goal));
  const calmOnly = profile.goals.length > 0 && !active && profile.goals.every((goal) => CALM_GOALS.includes(goal) || goal === "flexibility-balance");
  return calmOnly ? "morning-stretch" : "morning-aerobics";
}

function extraChoices(profile: DailyProfile): DailyCategory[] {
  const out: DailyCategory[] = [];
  const goals = profile.goals;
  if (goals.includes("flexibility-balance")) out.push("balance", "flexibility");
  if (goals.some((goal) => ["fitness", "lose-weight", "maintain-weight", "blood-sugar", "cholesterol"].includes(goal))) out.push("strength", "full-body");
  if (goals.includes("energy")) out.push("full-body", "strength");
  if (profile.sitsLong) out.push("back-neck");
  if (out.length === 0) out.push("strength", "balance", "flexibility", "back-neck");
  const unique = [...new Set(out)];
  // Flexibility classes use the floor, so people who mentioned balance get the standing upper-body class instead.
  return profile.mobility === "support" ? [...new Set([...unique.filter((category) => category !== "flexibility"), "back-neck" as const])] : unique;
}

/**
 * Today's morning and evening suggestion.
 *
 * - "No mobility limitations": active standing classes, for example Morning
 *   Aerobics plus a 5-minute stretch, and an evening stretch with relaxation.
 * - Balance concerns or a walking aid: standing stretches with support, no
 *   floor classes first, and Chair Yoga Studio offered.
 * - Standing for long is hard, a wheelchair, or a chosen preference: Chair
 *   Yoga Studio first.
 * Age is never used.
 */
export function planDay(profile: DailyProfile, today: string, offsets: Partial<Record<"morning" | "evening" | "extra", number>> = {}, videos: DailyVideo[] = dailyVideos): DailyPlan {
  const reasons: string[] = [];
  const cautions: string[] = [DAILY_TEXT.space, DAILY_TEXT.stopIf];
  if (profile.mobility === "seated" || profile.prefersChair) {
    reasons.push(
      profile.mobility === "seated"
        ? "You said standing for long is hard or you use a wheelchair, so Chair Yoga Studio comes first. Daily Movement classes are mostly standing."
        : "You chose chair exercises, so Chair Yoga Studio comes first today.",
    );
    return { chairFirst: true, morning: null, evening: null, extra: null, reasons, cautions };
  }

  const seed = `daily-movement:${today}`;
  const mainCategory = morningCategory(profile);
  const morningVideo = pickVideo(mainCategory, profile, `${seed}:morning`, offsets.morning ?? 0, videos);
  const addOn = mainCategory === "morning-stretch" ? (profile.mobility === "support" ? ROUTINES["back-neck"] : ROUTINES.balance) : ROUTINES["morning-stretch"];
  const morningItems: PlanItem[] = [...(morningVideo ? [{ kind: "video" as const, category: mainCategory, video: morningVideo }] : []), { kind: "routine", routine: addOn }];

  // People who mentioned balance or a walking aid get a standing evening class instead of a floor one.
  const eveningCategory: DailyCategory = profile.mobility === "support" ? "back-neck" : "evening";
  const eveningVideo = pickVideo(eveningCategory, profile, `${seed}:evening`, offsets.evening ?? 0, videos);
  const eveningItems: PlanItem[] = [...(eveningVideo ? [{ kind: "video" as const, category: eveningCategory, video: eveningVideo }] : []), { kind: "routine", routine: ROUTINES["evening-relax"] }];

  const choices = extraChoices(profile).filter((category) => category !== mainCategory && category !== eveningCategory);
  const extraCategory = choices[(hash(`${seed}:extra`) + (offsets.extra ?? 0)) % Math.max(1, choices.length)];
  const extraVideo = extraCategory ? pickVideo(extraCategory, profile, `${seed}:extra`, 0, videos) : null;

  if (profile.mobility === "free" && !profile.jointCare && !profile.breathless) reasons.push("You said you have no mobility limitations, so today's classes are active and standing.");
  if (profile.mobility === "unanswered") reasons.push("Your questionnaire has no mobility answer yet, so these are beginner standing classes. Answer it to make the suggestions fit you better.");
  if (profile.mobility === "support") {
    reasons.push("You mentioned balance concerns or a walking aid, so today uses standing stretches with something to hold, and no floor classes first.");
    cautions.push(DAILY_TEXT.balanceCare);
  }
  if (mainCategory === "morning-aerobics")
    reasons.push(
      profile.goals.some((goal) => ACTIVE_GOALS.includes(goal))
        ? "Your goals include energy or fitness, so the morning starts with low-impact aerobics, then a short stretch."
        : "The morning starts with low-impact aerobics, then a short stretch, to raise your energy for the day.",
    );
  if (mainCategory === "low-impact") reasons.push("You mentioned joint pain, so the morning uses low-impact walking moves instead of faster aerobics.");
  if (mainCategory === "morning-stretch" && profile.breathless) reasons.push("You mentioned breathlessness, so the morning starts with stretching. Move at a pace where you can still talk.");
  if (profile.goals.some((goal) => goal === "sleep" || goal === "stress")) reasons.push("Your goals include sleep or stress, so the evening keeps a slow stretch and relaxation.");
  if (profile.goals.includes("flexibility-balance")) reasons.push("Your goals include flexibility and balance, so stretching and balance classes are suggested.");
  if (profile.level < 1) reasons.push("Beginner level, because no higher level is saved in your preferences.");
  reasons.push("Age is not used to choose these classes. Chair Yoga Studio stays available whenever you prefer it.");

  if ([morningVideo, eveningVideo, extraVideo].some((video) => video?.balance)) cautions.push(DAILY_TEXT.balanceCare);
  return {
    chairFirst: false,
    morning: { slot: "morning", items: morningItems, minutes: total(morningItems) },
    evening: { slot: "evening", items: eveningItems, minutes: total(eveningItems) },
    extra: extraCategory && extraVideo ? { category: extraCategory, video: extraVideo } : null,
    reasons,
    cautions: [...new Set(cautions)],
  };
}

export const ACTIVITY_PREFIX = "dm-";
export const PREFER_CHAIR_KEY = "daily-movement:prefer-chair";

export function activityIdFor(item: DailyVideo | Routine): string {
  return "youtubeId" in item ? item.id : `${ACTIVITY_PREFIX}${item.id}`;
}
