/**
 * Daily Movement video list: standing and mat classes for adults who move
 * without mobility limits. Chair classes stay in Chair Yoga Studio
 * (chair-yoga-videos.ts), which this file does not change.
 *
 * Every entry below was confirmed on 2026-11-11 through YouTube's public
 * oEmbed endpoint (https://www.youtube.com/oembed), which answers only for a
 * public video whose owner allows embedding. The title and channel are copied
 * from that answer. Video ids were taken from YouTube search results, never
 * from memory.
 *
 * What oEmbed does not give, and what was therefore NOT verified:
 * - Player length. `minutes` is the length written in the video's own title,
 *   or null when the title does not say. Cards say "from the title".
 * - Spoken instruction. `talking` is "no" only when the title says the class
 *   has no talking. Otherwise it is "unchecked": nobody from LifeZoi has
 *   listened to every class. LifeZoi's own written steps can be read aloud.
 * - Level, position, and suitability. These are LifeZoi's reading of the
 *   title and channel.
 * - Whether a video is free of any membership. Public YouTube videos play
 *   without a subscription, but `cost` stays "free-unverified".
 *
 * To add a video, run `npm run video:add -- <YouTube URL>` on a computer with
 * internet, then copy the title and channel it prints into an entry here.
 */

export const DAILY_VERIFIED_ON = "2026-11-11";

export const DAILY_CATEGORIES = [
  "morning-aerobics",
  "morning-stretch",
  "full-body",
  "balance",
  "flexibility",
  "low-impact",
  "evening",
  "back-neck",
  "strength",
] as const;
export type DailyCategory = (typeof DAILY_CATEGORIES)[number];

/** standing: on your feet the whole time. mat: some or all of it on a mat or the floor. */
export type DailyPosition = "standing" | "mat";
export type DailyLevel = "beginner" | "intermediate";
/** 50+: the title or channel addresses people over 50 or seniors. all: no age in the title. */
export type DailyAudience = "50+" | "all";
/** "no": the title says there is no talking. "unchecked": not listened to by LifeZoi. */
export type DailyTalking = "unchecked" | "no";

export type DailyVideoSeed = {
  youtubeId: string;
  /** Exact title from YouTube oEmbed. */
  title: string;
  /** Exact channel name from YouTube oEmbed. */
  channel: string;
  channelUrl: string;
  category: DailyCategory;
  position: DailyPosition;
  /** Minutes written in the title, or null. Not the player length. */
  minutes: number | null;
  level: DailyLevel;
  audience: DailyAudience;
  /** Moves the heart rate up. Not suggested first to people who mentioned breathlessness. */
  cardio: boolean;
  /** Includes standing on one leg or similar. Shown with the support reminder. */
  balance: boolean;
  talking: DailyTalking;
  /** LifeZoi's short note, written from the title only. */
  note: string;
};

type Options = { cardio?: boolean; balance?: boolean; talking?: DailyTalking; level?: DailyLevel };

function d(
  youtubeId: string,
  title: string,
  channel: string,
  handle: string,
  category: DailyCategory,
  position: DailyPosition,
  minutes: number | null,
  audience: DailyAudience,
  note: string,
  options: Options = {},
): DailyVideoSeed {
  return {
    youtubeId,
    title,
    channel,
    channelUrl: `https://www.youtube.com/@${handle}`,
    category,
    position,
    minutes,
    level: options.level ?? "beginner",
    audience,
    cardio: options.cardio ?? false,
    balance: options.balance ?? false,
    talking: options.talking ?? "unchecked",
    note,
  };
}

const LUCY = ["Lucy Wyndham-Read", "lucywyndhamread"] as const;
const IMPROVED = ["Improved Health", "ImprovedHealth"] as const;
const FAB50 = ["fabulous50s", "fabulous50s"] as const;
const SENIORSHAPE = ["SeniorShape Fitness", "SeniorShapeFitness"] as const;
const YES2NEXT = ["Yes2Next", "yes2next"] as const;
const SARAHBETH = ["SarahBethYoga", "sarahbethyoga"] as const;
const KASSANDRA = ["Yoga with Kassandra", "yogawithkassandra"] as const;

export const DAILY_VIDEO_SEEDS: DailyVideoSeed[] = [
  // ---------- Morning Aerobics ----------
  d("ljGmP14zvC0", "Low Impact Fat Burning Cardio |15 Min Full Body Workout Over 50", "Get Fit With Deborah • 50+ Fitness", "GetFitWithDeborah", "morning-aerobics", "standing", 15, "50+",
    "Low-impact standing cardio from a channel for people over 50. LifeZoi makes no weight-loss claim.", { cardio: true }),
  d("IqsxyLWsoIU", "15 Min Low Impact Cardio Workout For Women Over 50 | Lively Ladies", "Lively Ladies - Fitness In Your 50s", "LivelyLadiesFitness", "morning-aerobics", "standing", 15, "50+",
    "Low-impact standing cardio planned for women in their 50s.", { cardio: true }),
  d("Uci74Cq5Q9A", "15 MIN CARDIO AEROBICS - Move To The Beat (All Standing, Low Impact)", "MadFit", "MadFit", "morning-aerobics", "standing", 15, "all",
    "Upbeat standing aerobics to music, low impact. A lively start for people who already move often.", { cardio: true, level: "intermediate" }),
  d("jPc0O3sKNYY", "🔥 15 Min Aerobic Cardio Workout 🔥 For WEIGHT LOSS 🔥 No Jumping & All Standing", ...LUCY, "morning-aerobics", "standing", 15, "all",
    "Standing aerobics with no jumping. LifeZoi makes no weight-loss claim.", { cardio: true }),

  // ---------- Morning Stretching ----------
  d("iSYzI7Fh65w", "10 Min Feel Good Morning Stretch with Balance | All Standing Morning Routine", ...IMPROVED, "morning-stretch", "standing", 10, "all",
    "A standing morning stretch with some balance practice.", { balance: true }),
  d("npNod6rVZrs", "10 Minute Standing Stretch Routine // Stretching Exercises for Seniors & Beginners", ...SENIORSHAPE, "morning-stretch", "standing", 10, "50+",
    "A gentle 10-minute standing stretch for beginners and older adults."),
  d("N4-SqO2IRfQ", "10 minute Standing Stretches // Mobility Exercises, Osteoporosis Friendly!", ...SENIORSHAPE, "morning-stretch", "standing", 10, "50+",
    "Standing mobility stretches. The channel describes them as osteoporosis friendly; LifeZoi has not reviewed that claim."),

  // ---------- Gentle Full-Body Workout ----------
  d("3cb7YAsiLHI", "15 Min FULL BODY Workout Over 50 | Beginner Friendly, No Jumping!", ...FAB50, "full-body", "standing", 15, "50+",
    "A beginner full-body workout with no jumping, from a channel for people over 50."),
  d("HHUuUVnBipQ", "15 Minute Full Body Workout For Women Over 50: Improve Balance And Strength!", "Annie Pilates Physical Therapist", "AnniePilatesPhysicalTherapist", "full-body", "standing", 15, "50+",
    "A full-body session with balance and strength work, from a physical therapist's channel.", { balance: true }),

  // ---------- Balance & Coordination ----------
  d("y0kLu8_csmQ", "Standing Balance Exercises - 15 Minute Balance Workout At Home!", "Jessica Valant", "Jessicasvalant", "balance", "standing", 15, "all",
    "Standing balance practice at home, from a physical therapist's channel.", { balance: true }),
  d("MfJX0Dcz74k", "Seniors: Daily 15 minute  Workout for  Balance.", "Balance Builders by Doug Weiss", "balancebuilderz", "balance", "standing", 15, "50+",
    "A daily 15-minute balance routine for older adults.", { balance: true }),
  d("kpfI17sEdj8", "15 Min Brain + Body Workout for Seniors", ...YES2NEXT, "balance", "standing", 15, "50+",
    "Coordination moves that ask the brain and body to work together."),
  d("a4ev7q33yBg", "Improve Coordination for Seniors & Beginners, Brain Body Exercises", ...YES2NEXT, "balance", "standing", null, "50+",
    "Coordination exercises for beginners. The title does not give a length."),

  // ---------- Flexibility ----------
  d("oY2jk_a3k9U", "15 Min Full Body Stretch for Stiffness & Flexibility | Gentle Mobility Routine", "Dr. Melissa Oleson", "DrMelissaOleson", "flexibility", "mat", 15, "all",
    "A gentle full-body stretch for stiffness and flexibility. Parts may be on the floor."),
  d("i6TzP2COtow", "15 MIN FULL BODY STRETCH - Improve Mobility and Flexibility", "growingannanas", "growingannanas", "flexibility", "mat", 15, "all",
    "A 15-minute full-body stretch on a mat."),
  d("GsQJ-KsBKsU", "15 Min DAILY FULL BODY STRETCHING ROUTINE | Improve Flexibility, Mobility & Reduce Stress", "Eleni Fit", "EleniFit", "flexibility", "mat", 15, "all",
    "A daily full-body stretch on a mat."),

  // ---------- Low-Impact Aerobics ----------
  d("PqLEST2TWss", "15-Minute Walk at Home🚶‍♀️Gentle Low-Impact Exercise for Seniors and Beginners", ...IMPROVED, "low-impact", "standing", 15, "50+",
    "Gentle walking in place for beginners and older adults.", { cardio: true }),
  d("wLMDPAjnE6E", "15 Minute LOW IMPACT WALK | Walk at Home Exercises for Beginners | Heart Health💗", ...IMPROVED, "low-impact", "standing", 15, "all",
    "Low-impact walking at home for beginners.", { cardio: true }),
  d("icSm9cLTSDw", "15 Minute Indoor Walking Workout | Low Impact!", ...FAB50, "low-impact", "standing", 15, "50+",
    "Low-impact indoor walking from a channel for people over 50.", { cardio: true }),
  d("Xr3cX4TSCqk", "15 Minute Low Impact Cardio |  Fat Burning | All Standing, No Jumping, Knee Friendly", ...LUCY, "low-impact", "standing", 15, "all",
    "Standing cardio with no jumping, described as knee friendly. LifeZoi makes no fat-burning claim.", { cardio: true }),
  d("PFfnL3r30Zs", "Walking Exercise for Weight Loss - 15 Minute Walk at Home Low Impact!", ...FAB50, "low-impact", "standing", 15, "50+",
    "A 15-minute walk at home. LifeZoi makes no weight-loss claim.", { cardio: true }),

  // ---------- Evening Relaxation & Stretching ----------
  d("2xJ2Iip2SR0", "15 min Evening Yoga Stretch - NO PROPS Bedtime Yoga Stretches", ...KASSANDRA, "evening", "mat", 15, "all",
    "A slow evening stretch on a mat with no props."),
  d("xOcehOtyymY", "15 min Evening Yoga Stretch - Full Body Bedtime Yoga", ...KASSANDRA, "evening", "mat", 15, "all",
    "A full-body evening stretch before bed."),
  d("NG9kNAPXF48", "15 Min. Evening Stretch & Mobility Session | Gentle, Full Body | Follow Along - No Talking", "mobility by julia reppel", "julia.reppel", "evening", "mat", 15, "all",
    "A gentle follow-along evening stretch with no talking. Use LifeZoi's read-aloud steps if you want spoken guidance.", { talking: "no" }),

  // ---------- Back, Neck & Shoulders ----------
  d("RUS50iYq8-8", "10 minute Yoga for NECK & SHOULDER Tension Relief (all standing, no mat needed)", ...SARAHBETH, "back-neck", "standing", 10, "all",
    "Standing neck and shoulder stretches with no mat."),
  d("g6LjX16ejNY", "10-Minute UPPER BODY Stretch | Release Tight Neck, Shoulders, Chest + Back", "nourishmovelove", "nourishmovelove", "back-neck", "standing", 10, "all",
    "A 10-minute stretch for the neck, shoulders, chest, and upper back."),
  d("fDzJbizG0cQ", "10 min Yoga Stretch for Neck, Shoulder & Upper Back Pain", ...SARAHBETH, "back-neck", "mat", 10, "all",
    "Gentle neck, shoulder, and upper back stretches. LifeZoi does not claim it treats pain."),

  // ---------- Strength & Toning ----------
  d("CqgSJz2U9oE", "Full Body Strength Training for Women Over 50 — 15-Minute Beginner Workout at Home", "Donna Rouse Meier", "FitnessbyDonna", "strength", "standing", 15, "50+",
    "Beginner strength training at home for women over 50."),
  d("suillnsChQE", "15-Min Achievable Anti-Aging Toning Workout | Low Impact & Cognitive Boost (Women 50+)", "Ultimate Fit Life", "UltimateFitLife", "strength", "standing", 15, "50+",
    "Low-impact toning for women over 50. LifeZoi makes no anti-aging claim."),
  d("vv2dgElAg_o", "Total Body TONE UP for Women Over 50 | 5PD #55", "PBF Workouts", "PBFWorkouts", "strength", "standing", null, "50+",
    "Total-body toning for women over 50. The title does not give a length.", { level: "intermediate" }),
];
