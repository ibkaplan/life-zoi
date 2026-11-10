/**
 * Chair Yoga Studio video list.
 *
 * Every entry below was confirmed on 2026-11-10 through YouTube's public
 * oEmbed endpoint (https://www.youtube.com/oembed), which answers only for a
 * public video whose owner allows embedding. The title and channel are copied
 * from that answer. Nothing here was invented.
 *
 * What oEmbed does not give, and what was therefore NOT verified:
 * - Player length. `minutes` is the length written in the video's own title,
 *   or null when the title does not say. Cards say "from the title".
 * - Level, audience, and seated or standing. These are LifeZoi's reading of
 *   the title and channel. Nobody from LifeZoi has watched every class.
 * - Whether a video is free of any membership. Public YouTube videos play
 *   without a subscription, but `cost` stays "free-unverified" until a person
 *   checks it.
 *
 * To add a video, run `npm run video:add -- <YouTube URL>` on a computer with
 * internet. It reads oEmbed and prints an entry to paste here. See
 * docs/claude-migration/CHAIR_YOGA_LIBRARY.md.
 */

export const STUDIO_VERIFIED_ON = "2026-11-10";

export const STUDIO_SECTIONS = ["seated", "standing", "gentle"] as const;
export type StudioSection = (typeof STUDIO_SECTIONS)[number];

/** seated: sitting the whole time. standing: standing with a chair for support. mixed: both, or the title does not say. mat: usually on a mat or the floor. */
export type StudioPosition = "seated" | "standing" | "mixed" | "mat";
export type StudioLevel = "beginner" | "intermediate";
/** 60+: the title or channel addresses seniors. 50+: the title says 50+. all: no age in the title. */
export type StudioAudience = "60+" | "50+" | "all";

export type StudioVideoSeed = {
  youtubeId: string;
  /** Exact title from YouTube oEmbed. */
  title: string;
  /** Exact channel name from YouTube oEmbed. */
  channel: string;
  channelUrl: string;
  section: StudioSection;
  position: StudioPosition;
  /** Minutes written in the title, or null. Not the player length. */
  minutes: number | null;
  level: StudioLevel;
  audience: StudioAudience;
  /** Includes balance practice. Shown with the sturdy chair warning. */
  balance: boolean;
  topics: string[];
  /** LifeZoi's short note, written from the title only. */
  note: string;
};

function v(
  youtubeId: string,
  title: string,
  channel: string,
  handle: string,
  section: StudioSection,
  position: StudioPosition,
  minutes: number | null,
  level: StudioLevel,
  audience: StudioAudience,
  topics: string[],
  note: string,
  balance = false,
): StudioVideoSeed {
  return {
    youtubeId,
    title,
    channel,
    channelUrl: `https://www.youtube.com/@${handle}`,
    section,
    position,
    minutes,
    level,
    audience,
    balance,
    topics,
    note,
  };
}

const TINA = ["Yoga ETC with Tina", "yogaetctina"] as const;
const ADRIENE = ["Yoga With Adriene", "yogawithadriene"] as const;
const YES2NEXT = ["Yes2Next", "yes2next"] as const;
const SENIORSHAPE = ["SeniorShape Fitness", "SeniorShapeFitness"] as const;
const KIERSTIE = ["Yoga by Kierstie Payge", "YogabyKierstiePayge"] as const;

export const STUDIO_VIDEO_SEEDS: StudioVideoSeed[] = [
  // ---------- A. Chair Yoga – Seated ----------
  v("RjqME9aAOpA", "The Best 20-Minute Chair Yoga for Seniors: Strength & Balance", ...TINA, "seated", "seated", 20, "beginner", "60+",
    ["full body", "strength", "balance"], "A full-body chair class for seniors with strength and balance work. Named by the LifeZoi owner as a starting video."),
  v("2ej34NqjnLc", "Chair Yoga for Seniors | Safe & Gentle 20 Minute Full Body Warm-Up Routine", "Yoga & You", "VentunoYoga", "seated", "seated", 20, "beginner", "60+",
    ["full body", "warm-up", "gentle"], "A gentle full-body warm-up on a chair. Named by the LifeZoi owner as a starting video."),
  v("IR1QvpFSO74", "Beginner Chair Yoga for Mornings (15-Min Class) | Senior-Friendly & Great for Flexibility", ...TINA, "seated", "seated", 15, "beginner", "60+",
    ["morning", "flexibility", "full body"], "A short morning chair class for beginners."),
  v("pAbVFNl6zR8", "Chair Yoga for Restricted Mobility: 25-Min Full Body Relief", ...TINA, "seated", "seated", 25, "beginner", "60+",
    ["limited mobility", "full body", "gentle"], "A full-body chair class planned for people with restricted mobility."),
  v("V5gTV5DCVoQ", "Gentle Chair Yoga for Hips | 15-Min Hip Opening Flow for Seniors & Beginners", ...TINA, "seated", "seated", 15, "beginner", "60+",
    ["hips", "legs", "stretching"], "Seated hip movements for seniors and beginners."),
  v("e6QHRS7DR3k", "Chair Yoga for restricted mobility & Seniors 65 and up - 20 Minutes", ...KIERSTIE, "seated", "seated", 20, "beginner", "60+",
    ["limited mobility", "full body", "gentle"], "A 20-minute chair class for people 65 and up or with restricted mobility."),
  v("i21JaPr-f2c", "Chair Yoga for Hips & Lower Back Release - Seniors & Limited Mobility", ...KIERSTIE, "seated", "seated", null, "beginner", "60+",
    ["hips", "back", "spine", "limited mobility"], "Seated hip and lower back movements for seniors and limited mobility."),
  v("Dmu7L0jBvKs", "Chair Yoga for Core Strength - for seniors", ...KIERSTIE, "seated", "seated", null, "intermediate", "60+",
    ["core", "strength", "posture"], "Core work on a chair for seniors. Marked intermediate because it focuses on strength."),
  v("A5ir5MOjlpM", "15-Min Chair Yoga for Seniors | Relieve Neck & Shoulder Pain | Day 7 Better Balance Program", ...YES2NEXT, "seated", "seated", 15, "beginner", "60+",
    ["neck", "shoulders", "upper body"], "Neck and shoulder movements on a chair. Part of a channel program. LifeZoi does not claim it treats pain."),
  v("uTkntqIsBmI", "10-minute Chair Workout", ...YES2NEXT, "seated", "seated", 10, "beginner", "50+",
    ["full body", "strength", "short"], "A short chair workout from a channel for people over 50."),
  v("WkYz1g47Hj0", "Senior & Beginner Workout - 15 minute Gentle Chair Yoga", ...SENIORSHAPE, "seated", "seated", 15, "beginner", "60+",
    ["gentle", "full body"], "A gentle 15-minute chair class for seniors and beginners."),
  v("cgaDPZ8UdZY", "Chair Yoga for Seniors & Beginners // Energizing Seated Stretches", ...SENIORSHAPE, "seated", "seated", null, "beginner", "60+",
    ["stretching", "energy", "full body"], "Energizing seated stretches for seniors and beginners."),
  v("-rBDxFKJtlE", "Energizing Chair Yoga for Seniors & Beginners // 25 minute Dynamic Flow", ...SENIORSHAPE, "seated", "seated", 25, "intermediate", "60+",
    ["flow", "energy", "full body"], "A more active 25-minute chair flow. Marked intermediate because it is described as dynamic."),
  v("UIjobb8K1gQ", "Chair Yoga for Strength & Flexibility // Strength & Stretch Seated Exercises for Seniors & Beginners", ...SENIORSHAPE, "seated", "seated", null, "intermediate", "60+",
    ["strength", "flexibility", "stretching"], "Seated strength and stretch exercises for seniors and beginners."),
  v("gXB3NhOAalk", "Chair Yoga Stretch & Strength // Seated Exercises for Seniors & Beginners", ...SENIORSHAPE, "seated", "seated", null, "beginner", "60+",
    ["stretching", "strength", "hands", "wrists"], "Seated stretch and strength exercises for seniors and beginners."),
  v("pciXaO4wtug", "Chair Yoga Stretch for Beginners, Seniors & Everyone || 30 minutes", ...SENIORSHAPE, "seated", "seated", 30, "beginner", "all",
    ["stretching", "full body", "relaxation"], "A 30-minute seated stretch class for everyone."),
  v("P0YosDn-ExM", "15 min Chair Yoga Class for Seniors & Beginners", "Yoga with Kassandra", "yogawithkassandra", "seated", "seated", 15, "beginner", "60+",
    ["full body", "gentle"], "A 15-minute chair class for seniors and beginners."),
  v("wEw9ZViomTI", "Chair Yoga for Wrist and Hand Relief", "Sarah Starr (HappyYogaTV)", "HappyYogatv", "seated", "seated", null, "beginner", "all",
    ["hands", "wrists", "fingers"], "Hand and wrist movements on a chair."),
  v("OfR1GGVhZMc", "Restorative Chair Yoga - Wrist Exercises - Seated", "Bottoms Down", "BottomsDown", "seated", "seated", null, "beginner", "all",
    ["wrists", "hands", "relaxation"], "Slow seated wrist exercises."),
  v("-Ts01MC2mIo", "Chair Yoga | Yoga With Adriene", ...ADRIENE, "seated", "seated", null, "beginner", "all",
    ["full body", "desk", "breathing"], "A chair yoga practice from Yoga With Adriene."),
  v("Aj6pPn30bfo", "CHAIR YOGA - 10 Minute Easy Stretch Break from the Desk", "High Desert Yogi", "highdesertyogi", "seated", "seated", 10, "beginner", "all",
    ["desk", "stretching", "neck", "shoulders"], "A 10-minute seated stretch break for desk workers."),
  v("Nw342yMizjc", "Instant Posture Reset- 10 Minute Chair Yoga Stretches for Desk Workers", "Yoga with Jenna", "JennaManders", "seated", "seated", 10, "beginner", "all",
    ["posture", "desk", "back", "spine"], "Chair stretches for posture, aimed at desk workers."),

  // ---------- B. Standing Chair Yoga ----------
  v("_c5ZMJrwais", "Standing Chair Yoga (Beginner Friendly) | Gentle Exercises", ...YES2NEXT, "standing", "standing", null, "beginner", "50+",
    ["standing", "legs", "balance", "posture"], "Gentle standing exercises holding a chair. Described as beginner friendly.", true),
  v("c9Uyor1RTQc", "Standing Chair Yoga", "Yoga and Meditation with Chris", "yogaandmeditationwithchris3325", "standing", "standing", null, "beginner", "all",
    ["standing", "stretching", "balance"], "Standing yoga with a chair for support.", true),
  v("XlI_DOBDYsk", "15 Minutes Chair Yoga for Strong Legs and Improve Balance / Standing Exercises with a Chair", "Abstract Fitness", "AbstractFitness", "standing", "standing", 15, "beginner", "all",
    ["legs", "balance", "heel raises", "squats", "standing"], "Standing leg and balance exercises using a chair.", true),
  v("u34924N7B-o", "Standing Chair Yoga for Posture, balance, 50+, senior women, anti aging, grace and health.", "Cathy Roe", "CathyRoe", "standing", "standing", null, "beginner", "50+",
    ["posture", "balance", "standing"], "Standing chair yoga for posture and balance, aimed at people over 50. LifeZoi makes no anti-aging claim.", true),
  v("-V87Fni2Q_g", "35-Min Chair Yoga: Feel More Confident on Your Feet", ...YES2NEXT, "standing", "mixed", 35, "intermediate", "50+",
    ["balance", "legs", "confidence", "standing"], "A longer class about feeling steadier on your feet. The title does not say how much is standing.", true),
  v("vJKt86ayWxk", "Chair Yoga for Seniors | 45 Minute Stretch & Balance | Standing & Seated Exercises Only", "Paradigm Yoga", "ParadigmYoga", "standing", "mixed", 45, "beginner", "60+",
    ["balance", "stretching", "standing", "seated"], "A 45-minute class with both standing and seated chair exercises.", true),
  v("dHxDJquk2M8", "Better Balance & Stronger Legs | 15-Minute Chair Yoga for Seniors", ...TINA, "standing", "mixed", 15, "beginner", "60+",
    ["balance", "legs", "strength"], "Balance and leg work with a chair. The title does not say whether it is standing or seated.", true),
  v("uoP5Pr3vkPM", "Chair Yoga for Balance - Improve your Strength & Mobility", ...KIERSTIE, "standing", "mixed", null, "beginner", "all",
    ["balance", "strength", "mobility"], "Balance practice with a chair. The title does not say whether it is standing or seated.", true),
  v("CmJZRKqv_sY", "15-Minute Chair Balance Yoga | Beginner-Friendly Stability & Strength Practice", "SARVJANA YOGA", "SARVJANAYOGA", "standing", "mixed", 15, "beginner", "all",
    ["balance", "stability", "strength"], "A beginner balance practice with a chair.", true),
  v("L3EJ6R5CrOg", "How to do the Chair Standup for Seniors, Beginner Exercisers", ...YES2NEXT, "standing", "mixed", null, "beginner", "60+",
    ["sit to stand", "legs", "squats"], "A short how-to for standing up from a chair, a gentle squat pattern."),

  // ---------- C. Gentle Yoga & Mobility ----------
  v("pWobp3phsEU", "Yoga For Beginners - The Basics - Yoga With Adriene", ...ADRIENE, "gentle", "mat", null, "beginner", "all",
    ["beginner", "hatha", "basics"], "An introduction to basic yoga poses."),
  v("v7AYKMP6rOE", "Yoga For Complete Beginners - 20 Minute Home Yoga Workout!", ...ADRIENE, "gentle", "mat", 20, "beginner", "all",
    ["beginner", "hatha", "full body"], "A 20-minute home class for complete beginners."),
  v("GnHTeHAZQhM", "Morning Yoga for Beginners  -  Gentle Morning Yoga  -  Yoga With Adriene", ...ADRIENE, "gentle", "mat", null, "beginner", "all",
    ["morning", "gentle", "beginner"], "A gentle morning practice for beginners."),
  v("jsLAc-2y0bE", "Gentle Yoga - 25 Minute Morning Yoga Sequence   -  Yoga With Adriene", ...ADRIENE, "gentle", "mat", 25, "beginner", "all",
    ["morning", "gentle"], "A 25-minute gentle morning sequence."),
  v("r7xsYgTeM2Q", "Sunrise Yoga  |  15-Minute Morning Yoga Practice", ...ADRIENE, "gentle", "mat", 15, "beginner", "all",
    ["morning", "gentle"], "A 15-minute morning practice."),
  v("4C-gxOE0j7s", "5-Minute Morning Yoga", ...ADRIENE, "gentle", "mat", 5, "beginner", "all",
    ["morning", "short"], "A five-minute start to the day."),
  v("kFhG-ZzLNN4", "Yoga For Seniors |  Slow and Gentle Yoga", ...ADRIENE, "gentle", "mixed", null, "beginner", "60+",
    ["seniors", "gentle", "slow"], "A slow, gentle practice for seniors."),
  v("0Dw41EHvqew", "Easy Yoga for Senior Citizens | 10-Minute Daily Feel-Good Routine", ...TINA, "gentle", "mixed", 10, "beginner", "60+",
    ["seniors", "daily", "gentle"], "A short daily routine for older adults."),
  v("GLy2rYHwUqY", "Total Body Yoga | Deep Stretch | 45-Minute Yoga Practice", ...ADRIENE, "gentle", "mat", 45, "intermediate", "all",
    ["full body", "stretching", "flexibility"], "A 45-minute full-body stretch. Marked intermediate because of its length."),
  v("Ho9em79_0qg", "Yoga For Hips & Lower Back Release  |  Yoga With Adriene", ...ADRIENE, "gentle", "mat", null, "beginner", "all",
    ["hips", "back", "spine"], "A practice for the hips and lower back."),
  v("J-05m7bboK0", "Lower Back Love  |  Yoga For Back Pain", ...ADRIENE, "gentle", "mat", null, "beginner", "all",
    ["back", "spine", "gentle"], "Gentle movements for the lower back. LifeZoi does not claim it treats back pain."),
  v("jsOqcwcy2mI", "Yoga For Stress Relief", ...ADRIENE, "gentle", "mat", null, "beginner", "all",
    ["stress relief", "breathing", "relaxation"], "A calming practice with slow breathing."),
  v("WtGE0Uz9zSE", "Yoga For Relaxation", ...ADRIENE, "gentle", "mat", null, "beginner", "all",
    ["relaxation", "recovery", "breathing"], "A slow practice for relaxation and recovery."),
  v("v7SN-d4qXx0", "Bedtime Yoga | 20 Minute Bedtime Yoga Practice | Yoga With Adriene", ...ADRIENE, "gentle", "mat", 20, "beginner", "all",
    ["relaxation", "evening", "recovery"], "A 20-minute evening practice before bed."),
  v("QzhGqjlYU14", "Yoga For Couch Potatoes | 7 Minute Yoga | Yoga with Adriene", ...ADRIENE, "gentle", "mixed", 7, "beginner", "all",
    ["short", "gentle", "stretching"], "A seven-minute stretch for an easy start."),
  v("RWn2EDWkmFA", "10 Minute DESK YOGA Stretch | Office Yoga Break | Mat Free Yoga | Chair Yoga", "Francesca Ricci Yoga En", "Francescaricciyoga1", "gentle", "seated", 10, "beginner", "all",
    ["desk", "office", "stretching"], "A 10-minute desk stretch that needs no mat."),
  v("NXX8T0QyT24", "10 Minute Standing Stretch for the Classroom or Office | Yoga for the Classroom | Office Break Yoga", "New School Yoga", "NewSchoolYoga", "gentle", "standing", 10, "beginner", "all",
    ["desk", "office", "standing", "stretching"], "A 10-minute standing stretch break for an office or classroom."),
];

/**
 * Channels to search for more videos. Candidates only: add a video after
 * `npm run video:add` confirms it, never from memory.
 */
export const CANDIDATE_CHANNELS: { name: string; url: string; lookFor: string }[] = [
  { name: "Yoga With Adriene", url: "https://www.youtube.com/@yogawithadriene", lookFor: "Gentle, beginner, desk, and chair practices" },
  { name: "Yoga ETC with Tina", url: "https://www.youtube.com/@yogaetctina", lookFor: "Chair yoga for seniors, 10 to 30 minutes" },
  { name: "Yoga & You", url: "https://www.youtube.com/@VentunoYoga", lookFor: "Chair yoga warm-ups and standing chair classes" },
  { name: "Yoga by Kierstie Payge", url: "https://www.youtube.com/@YogabyKierstiePayge", lookFor: "Chair yoga levels 1 to 3, limited mobility" },
  { name: "Yes2Next", url: "https://www.youtube.com/@yes2next", lookFor: "Standing chair yoga, balance, 50+ workouts" },
  { name: "SeniorShape Fitness", url: "https://www.youtube.com/@SeniorShapeFitness", lookFor: "Chair yoga and standing balance for seniors" },
];
