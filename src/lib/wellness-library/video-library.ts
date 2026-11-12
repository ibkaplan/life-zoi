import { msg } from "@/lib/i18n/translate";
import { LIBRARY_CATEGORIES, type LibraryCategory } from "@/lib/wellness-library/moves";

/**
 * Wellness Library video collection: 14 activities × 6 lengths.
 *
 * Each entry is one YouTube class played through YouTube's official embedded
 * player. Nothing is downloaded or re-hosted. Every entry below was confirmed
 * public and embeddable through YouTube's public oEmbed endpoint
 * (https://www.youtube.com/oembed) on the date in `verifiedOn`. Title and
 * channel are copied from that answer.
 *
 * What oEmbed does not give, and what was therefore NOT verified:
 * - Player length. `minutes` is the length written in the video's own title.
 *   The page labels it "from the title".
 * - Level, position, and equipment. These are LifeZoi's reading of the title.
 *   Nobody from LifeZoi has watched every class.
 * - Whether an instructor is on screen the whole time. The search asked for
 *   follow-along classes, but this is unchecked.
 *
 * License: standard YouTube license. LifeZoi may embed the video with the
 * official player (YouTube Terms of Service) and must not download it. The
 * channel owner can remove or block embedding at any time. For a paid LifeZoi
 * subscription, embedding public videos is allowed by YouTube's terms, but a
 * person should re-read YouTube's API and embed policies before launch.
 *
 * Adding a video: run `npm run video:add -- <YouTube URL> --library <category>`
 * on a computer with internet. It checks oEmbed and prints an entry for
 * LIBRARY_VIDEO_SEEDS. A slot with no entry is listed as missing; the page
 * never fills it with a text routine. See
 * docs/claude-migration/WELLNESS_VIDEO_LIBRARY.md.
 */

export const LIBRARY_DURATIONS = [10, 15, 20, 30, 45, 60] as const;
export type LibraryDuration = (typeof LIBRARY_DURATIONS)[number];

export const VIDEO_LEVELS = ["beginner", "gentle", "intermediate", "advanced"] as const;
export type VideoLevel = (typeof VIDEO_LEVELS)[number];

export type VideoPosition = "seated" | "standing" | "mat" | "mixed";
export type VideoEquipment = "chair" | "dumbbells" | "dumbbells-optional";

export type LibraryVideoSeed = {
  youtubeId: string;
  category: LibraryCategory;
  minutes: LibraryDuration;
  /** Exact title from YouTube oEmbed. */
  title: string;
  /** Exact channel name from YouTube oEmbed. Shown as the instructor. */
  channel: string;
  /** Channel handle from oEmbed author_url, without "@". */
  handle: string;
  level: VideoLevel;
  position: VideoPosition;
  /** Equipment named in the title. Empty means none named. */
  equipment: VideoEquipment[];
  /** ISO date of the oEmbed check. */
  verifiedOn: string;
};

export type LibraryVideo = LibraryVideoSeed & {
  id: string;
  source: "YouTube";
  instructor: string;
  channelUrl: string;
  originalUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
  language: "en";
  license: string;
  attribution: string;
};

export const YOUTUBE_LICENSE = "Standard YouTube License. Embedded with the official YouTube player; not downloaded or re-hosted.";

function s(
  youtubeId: string,
  category: LibraryCategory,
  minutes: LibraryDuration,
  title: string,
  channel: string,
  handle: string,
  level: VideoLevel,
  position: VideoPosition,
  verifiedOn: string,
  equipment: VideoEquipment[] = [],
): LibraryVideoSeed {
  return { youtubeId, category, minutes, title, channel, handle, level, position, equipment, verifiedOn };
}

const D12 = "2026-11-12";
/** Checked by the Daily Movement and Chair Yoga Studio work. */
const D11 = "2026-11-11";
const D10 = "2026-11-10";

/** First entry for a category and length is the one the page plays. Later ones are alternatives. */
export const LIBRARY_VIDEO_SEEDS: LibraryVideoSeed[] = [
  // Pilates
  s("aPe4HDT9trQ", "pilates", 15, "15 min Pilates Workout for Beginners (no equipment)", "Trifecta Pilates", "trifectapilates", "beginner", "mat", D12),
  s("x6tJflfdW9E", "pilates", 20, "20 MIN PILATES WORKOUT FOR BEGINNERS || FULL BODY", "IsaWelly Pilates", "Isawellypilates", "beginner", "mat", D12),
  s("xU3vDlJPrs4", "pilates", 20, "20 MIN BEGINNER'S PILATES WORKOUT | FULL-BODY | NO EQUIPMENT", "IsaWelly Pilates", "Isawellypilates", "beginner", "mat", D12),
  s("2mkR5LPhOC4", "pilates", 30, "30 MIN FULL BODY WORKOUT || At-Home Beginner Pilates (No Equipment)", "Move With Nicole", "MoveWithNicole", "beginner", "mat", D12),
  s("ckmmIr9Wp-8", "pilates", 45, "45-Min Live Pilates Class | Full Body Flow (Beginner Friendly, No Props)", "WE ARE AL!VE", "alive_wellness", "beginner", "mat", D12),
  s("ebq5vPWvvOc", "pilates", 10, "10 Minute Pilates Workout for Beginners", "Jessica Valant", "Jessicasvalant", "beginner", "mat", D12),
  s("bwkJ-Yr4hTE", "pilates", 60, "60 Min Full Body Pilates Workout | No Equipment | Burn Fat, Sculpt & Tone", "Keel Pilates", "keelpilates", "intermediate", "mat", D12),

  // Yoga
  s("RUS50iYq8-8", "yoga", 10, "10 minute Yoga for NECK & SHOULDER Tension Relief (all standing, no mat needed)", "SarahBethYoga", "sarahbethyoga", "gentle", "standing", D11),
  s("2xJ2Iip2SR0", "yoga", 15, "15 min Evening Yoga Stretch - NO PROPS Bedtime Yoga Stretches", "Yoga with Kassandra", "yogawithkassandra", "gentle", "mat", D11),
  s("v7AYKMP6rOE", "yoga", 20, "Yoga For Complete Beginners - 20 Minute Home Yoga Workout!", "Yoga With Adriene", "yogawithadriene", "beginner", "mat", D12),
  s("vJKt86ayWxk", "yoga", 45, "Chair Yoga for Seniors | 45 Minute Stretch & Balance | Standing & Seated Exercises Only", "Paradigm Yoga", "ParadigmYoga", "gentle", "mixed", D10, ["chair"]),
  s("TsVdAhENb_0", "yoga", 60, "60-minute Basic Yoga", "Kaitlyn D'Onofrio", "kaitlyndonofrio1345", "beginner", "mat", D12),
  s("GWg-siH2VEA", "yoga", 30, "Hatha Flow Yoga For Beginners (30-min) Discover the Hatha Yoga Style (All Levels) Full Class", "BrettLarkinYoga", "BrettLarkinYoga", "beginner", "mat", D12),

  // Aerobics
  s("62HkZd0y5sg", "aerobics", 10, "10 MIN AEROBICS CARDIO Workout | Low Impact, No Equipment, No Jumping | All Standing", "Natalia Siejka", "nataliasiejka", "beginner", "standing", D12),
  s("bcutDeOt5nk", "aerobics", 10, "10 Min Low Impact Cardio Workout for Beginners - Low Impact Workout & Aerobic Exercises", "HASfit", "HASfit", "beginner", "standing", D12),
  s("Uci74Cq5Q9A", "aerobics", 15, "15 MIN CARDIO AEROBICS - Move To The Beat (All Standing, Low Impact)", "MadFit", "MadFit", "beginner", "standing", D12),
  s("Zq8_bscMqac", "aerobics", 20, "Low Impact Aerobics Walking Workout for Beginners & Seniors // 20 minutes 2500 steps!", "SeniorShape Fitness", "SeniorShapeFitness", "gentle", "standing", D12),
  s("Yfmhx6UEC-Q", "aerobics", 60, "60 MIN LOW IMPACT CARDIO WORKOUT | All Standing, No Equipment", "Courtney Holland - Any Weight Fitness", "anyweightfitness", "intermediate", "standing", D12),
  s("oFON1wxbdjw", "aerobics", 30, "30 min CARDIO AEROBICS WORKOUT ♫ | No Jumping | No Squats | Challenge Your Coordination", "fitbymik", "fitbymik", "intermediate", "standing", D12),
  s("lL_tbxw_-z8", "aerobics", 45, "45 Minute Low Impact Cardio Workout | High or Low Impact Aerobics at Home", "CHRISTINA DORNER", "CDornerFitness", "intermediate", "standing", D12),

  // Dance Fitness
  s("bqVBMv_nqJ4", "dance", 10, "10 MINUTE DANCE WORKOUT | Full Body - No Equipment | (Cardio Workout at Home)", "DanceFit", "DanceFit1", "beginner", "standing", D12),
  s("89dm6fCSqKs", "dance", 10, "Fun 10 Minute Dance Cardio Workout! | No equipment needed! | Fitness at home", "Bizzy Boom", "BizzyBoom", "intermediate", "standing", D12),
  s("0xlBHBBFSik", "dance", 60, "1-Hour Full Body Dance Fitness Workout!", "Oula", "OulaFitness", "intermediate", "standing", D12),
  s("zQZit8vKt6Y", "dance", 60, "1 Hour Non Stop Dance Fitness With AJ | Burn Upto 800 Calories 🔥", "AJ DanceFit", "AJDanceFit", "advanced", "standing", D12),
  s("fBqoipuEOAU", "dance", 15, "15 Minute- Senior/Low Impact Dance Fitness", "Erin Blackburn Fitness", "ErinBlackburnFitness", "gentle", "standing", D12),
  s("DrlPz5p_xnc", "dance", 20, "20-min DANCE WORKOUT for Active Seniors and Beginners", "Improved Health", "ImprovedHealth", "gentle", "standing", D12),
  s("c4qRyt6pFdY", "dance", 30, "30 Minute Zumba Gold® Dance Workout #25 | Active Older Adults and Beginners Class I We Keep Moving", "We Keep Moving", "WeKeepMoving", "gentle", "standing", D12),
  s("CMMXByyv-Yw", "dance", 45, "45 Minute Zumba Gold® Class | Home Dance Workout #33 | Low-Impact | Over 50 Fitness I We Keep Moving", "We Keep Moving", "WeKeepMoving", "gentle", "standing", D12),

  // Home Cardio
  s("xVc3nSKWg74", "home-cardio", 15, "15 MIN BEGINNER CARDIO Workout (At Home No Equipment)", "MadFit", "MadFit", "beginner", "standing", D12),
  s("7AlXsljuzGM", "home-cardio", 15, "15 MIN CARDIO WORKOUT FOR BEGINNERS (At Home No Equipment)", "Fitness Forever", "fitnessforever3926", "beginner", "standing", D12),
  s("06FUs7cW-7Y", "home-cardio", 20, "20 Minute CARDIO WORKOUT at Home | Low Impact, No Repeat, No Equipment", "The Tori Method", "TheToriMethod", "beginner", "standing", D12),
  s("vnBXaCsoEPU", "home-cardio", 20, "20 Min BEGINNER CARDIO Workout For Fat Burn (No Equipment, At Home)", "Oliver Sjostrom", "OliverSjostrom", "beginner", "standing", D12),
  s("yXHgcYpUVD4", "home-cardio", 20, "20 MIN CARDIO HIIT WORKOUT - ALL STANDING - Full Body, No Equipment, Home Workout", "Nobadaddiction", "Nobadaddiction", "advanced", "standing", D12),
  s("pjn8OOC1b0Q", "home-cardio", 30, "30-Minute Cardio Workout at Home | Fat-Burning, All Standing, No Equipment (Apartment Friendly!)", "Improved Health", "ImprovedHealth", "beginner", "standing", D12),
  s("WLZagztHccc", "home-cardio", 30, "30 MIN At Home Fat Burning Cardio Workout (Beginner to Advanced - No Equipment)", "KatieMFitness", "KatieMFitness", "intermediate", "standing", D12),
  s("tYo0rWVEmYc", "home-cardio", 30, "30 Minute HIIT CARDIO Workout // At Home (No Equipment)", "Heather Robertson", "Heatherrobertsoncom", "advanced", "mixed", D12),
  s("0djMDrNIioI", "home-cardio", 45, "Over 5,000 Steps in 45 Minutes! | Low Impact Cardio Workout at Home", "Improved Health", "ImprovedHealth", "beginner", "standing", D12),
  s("gUWFmn8f3H4", "home-cardio", 10, "10-Minute No-Equipment, At-Home Cardio Workout", "PS Fit", "PS_Fit", "intermediate", "standing", D12),
  s("CGzRzkqShmE", "home-cardio", 60, "60 MIN Low Impact HIIT Workout (No Jumping) 🔥 Beginner Friendly Cardio At Home", "Christian Cruz Fitness", "ChristianCruzFitness", "intermediate", "standing", D12),

  // Strength Training
  s("x5y8jY6sKFQ", "strength", 10, "10-Minute Full Body Dumbbell Workout for Beginners", "Emily Daugherty", "EmilyDaugherty", "beginner", "standing", D12, ["dumbbells"]),
  s("UjwKKl157hw", "strength", 20, "20 Minute Bodyweight Strength Workout [FULL BODY // No Equipment]", "Juice & Toya", "JuiceandToya", "intermediate", "mixed", D12),
  s("7j8vW0rVS4Q", "strength", 20, "20 min DUMBBELL STRENGTH WORKOUT | Full Body | No Repeats | Warm Up + Cool Down Included", "fitbymik", "fitbymik", "intermediate", "mixed", D12, ["dumbbells"]),
  s("36BuhRO3zng", "strength", 30, "30 min FULL BODY STRENGTH WORKOUT | With Dumbbells (And Without) | No Repeats", "fitbymik", "fitbymik", "intermediate", "mixed", D12, ["dumbbells-optional"]),
  s("W6wwO_gbn-o", "strength", 45, "45 MIN FULL BODY STRENGTH Workout With Weights (Warm Up & Cool Down Included)", "MadFit", "MadFit", "intermediate", "mixed", D12, ["dumbbells"]),
  s("UXVW4ka97SU", "strength", 45, "45-Minute Full Body Bodyweight Workout (No Equipment) | Follow Along", "Gritty Soldier", "GrittySoldier", "advanced", "mixed", D12),
  s("UAw3YLDLMHo", "strength", 60, "60 Minute Full Body Dumbbell Workout [Strength Training]", "Juice & Toya", "JuiceandToya", "advanced", "mixed", D12, ["dumbbells"]),
  s("J-_Xoj7HVfs", "strength", 15, "15 Minute Total Body Beginner Strength Training Workout- No Equipment, No Jumping", "SimplyFit by Lauren", "simplyfit.bylauren", "beginner", "mixed", D12),

  // Chair Exercises
  s("6KiPatdnGEY", "chair", 10, "10-Minute Chair Workout for Seniors (All Seated, No Equipment)", "Move Well After 60", "MoveWellOver60", "gentle", "seated", D12, ["chair"]),
  s("rdihR3giOw4", "chair", 15, "15 minutes Gentle Chair Exercises for Seniors | No Equipment", "Improved Health", "ImprovedHealth", "gentle", "seated", D12, ["chair"]),
  s("yPm8tm61RNQ", "chair", 20, "20-Min Seated Exercise Routine for Seniors 60+ | Full Body Chair Workout", "Cerebromotion", "cerebromotion", "gentle", "seated", D12, ["chair"]),
  s("slBsNXH4GW8", "chair", 30, "AT HOME Chair Exercises for SENIORS or BEGINNERS / 30 minutes (no equipment needed)", "Improved Health", "ImprovedHealth", "beginner", "seated", D12, ["chair"]),
  s("sbZzR-L2Tw4", "chair", 45, "45-Min Chair Workout for Seniors | Cardio, Strength & Stretch", "Improved Health Chair Workouts", "ImprovedHealthChairWorkouts", "beginner", "seated", D12, ["chair"]),
  s("VwVpEQVl39g", "chair", 45, "45 Minute Chair Exercises for Seniors to BOOST Cardio, Strength, Balance & Flexibility", "Improved Health Chair Workouts", "ImprovedHealthChairWorkouts", "beginner", "mixed", D12, ["chair"]),
  s("V22m8fN3mmo", "chair", 60, "60 Minute Chair Exercises for SENIORS | 💪 Full Body Home Workout", "Improved Health Chair Workouts", "ImprovedHealthChairWorkouts", "beginner", "seated", D12, ["chair"]),

  // Stretching
  s("t_YEUWe6Yn8", "stretching", 10, "10 Min Full Body Stretch Routine for Beginners", "Jeffrey Peng MD", "JeffreyPengMD", "beginner", "mixed", D12),
  s("oY2jk_a3k9U", "stretching", 15, "15 Min Full Body Stretch for Stiffness & Flexibility | Gentle Mobility Routine", "Dr. Melissa Oleson", "DrMelissaOleson", "gentle", "mat", D12),
  s("u1M0wQ07COk", "stretching", 20, "20 Min. Full Body Stretch | Deep Stretching Routine to Level Up Your Flexibility | at Home", "Fitness Train 7", "FitnessTrain7", "intermediate", "mat", D12),
  s("puw9Oviv0fA", "stretching", 30, "30 Min Beginner Full Body Stretch | Gentle & Easy Routine", "Bendy Body", "bendybodymovement", "gentle", "mat", D12),
  s("aUm3qE2dvB8", "stretching", 60, "60 Minute Full Body Active Flexibility Routine (FOLLOW ALONG) *500k Subscriber Special*", "Tom Merrick", "BodyweightWarrior", "advanced", "mat", D12),
  s("9Xo0U1NRK7k", "stretching", 45, "45 Minute Full Body Stretch Routine | Follow Along, No Talking, No Music", "EDR Fitness", "edrfitness", "intermediate", "mat", D12),

  // Tai Chi
  s("aLRRYm6W4uw", "tai-chi", 10, "10 Min Daily Tai Chi Routine for Beginners (Follow Along)", "Begin with Breath Tai Chi | Dr. Adam Potts, PT", "beginwithbreathtaichi", "beginner", "standing", D12),
  s("6igZbhM3I_w", "tai-chi", 15, "15-Minute Morning Tai Chi for a New You - Increase Mobility", "Begin with Breath Tai Chi | Dr. Adam Potts, PT", "beginwithbreathtaichi", "beginner", "standing", D12),
  s("-6sM9_FSKqY", "tai-chi", 45, '45 Min "Tai Chi for Balance and Strength"', "Emory Goizueta Brain Health Institute", "EmoryGBHI", "gentle", "standing", D12),
  s("fARe1_Wxi-U", "tai-chi", 20, "20 Min Daily Tai Chi Routine for Beginners (Follow Along)", "Begin with Breath Tai Chi | Dr. Adam Potts, PT", "beginwithbreathtaichi", "beginner", "standing", D12),
  s("aYA3ANh2ghc", "tai-chi", 30, "30 Mins Tai Chi for Seniors, Beginners, Over 60+ - Improve Strength, Balance & Calm #taichi", "Freshfield Fitness TAI CHI ACTIVE", "FreshfieldFitnessTaiChiActive", "gentle", "standing", D12),
  s("ZjUhhYq_M6E", "tai-chi", 60, "EASY 1Hour Tai Chi Fitness for SENIORS at Home!", "Enjoy Taichi Workout", "Enjoy_TaichiWorkout", "gentle", "standing", D12),

  // Qigong
  s("y2RAEnWreoE", "qigong", 15, "Shaolin Qigong 15 Minute Daily Routine", "Qigong Meditation", "QigongMeditation", "beginner", "standing", D12),
  s("nLnT25Q9tSU", "qigong", 10, "10 Minute Qigong Routine to Start Your Day - Qigong for Beginners", "Qigong with Kseny", "qigongwithkseny", "beginner", "standing", D12),
  s("pj4qo2KL9f4", "qigong", 20, "20 Minute Morning Qi Gong Exercise by Lee Holden", "Tyler Trahan", "TylerTrahan", "beginner", "standing", D12),
  s("SkZRRmzO3h0", "qigong", 30, "Qigong 30 minutes daily routine for beginners", "Martin Ratté", "martinqigong", "beginner", "standing", D12),
  s("4sKhEpZEWQA", "qigong", 45, "Qigong, Tai Chi, & Meditation: Four Elements (45 mins) | Dana-Farber Zakim Center Remote Programming", "Dana-Farber Cancer Institute", "danafarber", "gentle", "standing", D12),
  s("1YHB38bQVVY", "qigong", 60, "Qigong Exercises with David J Coon FREE 60 Minute Qigong Class", "Qigong Awareness LLC", "QigongAwareness", "beginner", "standing", D12),

  // Balance Training
  s("1AaAWRvKj1k", "balance", 10, "10 Minute Balance Exercises for Seniors | Over 50 Fall Prevention Workout", "Improved Health", "ImprovedHealth", "gentle", "standing", D12, ["chair"]),
  s("y0kLu8_csmQ", "balance", 15, "Standing Balance Exercises - 15 Minute Balance Workout At Home!", "Jessica Valant", "Jessicasvalant", "beginner", "standing", D12),
  s("MfJX0Dcz74k", "balance", 15, "Seniors: Daily 15 minute  Workout for  Balance.", "Balance Builders by Doug Weiss", "balancebuilderz", "gentle", "standing", D11),
  s("thzxbC49EKw", "balance", 30, "Seniors: Regain Your Balance| 30 Minute Class", "Balance Builders by Doug Weiss", "balancebuilderz", "gentle", "standing", D12),
  s("r7TaElp-sLo", "balance", 60, "60-minute Senior Fitness Dynamic Balance & Cardio Workout to Prevent Falls & Improve Mobility", "Ageless Balance | Balance & Fall Prevention", "agelessbalance", "intermediate", "standing", D12),
  s("57eeOuZydWM", "balance", 20, "Seniors: 20-Minute Complete Balance Workout", "Balance Builders by Doug Weiss", "balancebuilderz", "gentle", "standing", D12),
  s("-aGlOqj6ttU", "balance", 45, "Ageless Balance Senior Exercise: 45-Minute Seated Stretches & Standing Mobility & Balance Exercises", "Ageless Balance | Balance & Fall Prevention", "agelessbalance", "gentle", "mixed", D12, ["chair"]),

  // Breathing & Relaxation
  s("zaeQvUZySxM", "breathing", 30, "30 Min Conscious Breathing Meditation | Access Your Higher Guidance", "Kris Kelly", "KrisKelly", "beginner", "seated", D12),
  s("w7TzSTnf8z8", "breathing", 60, "60 Minute Parasympathetic Breathwork -  By Sandy", "The Holistic Tapes", "theholistictapes4885", "beginner", "seated", D12),
  s("R5GbeubY558", "breathing", 10, "Guided Breathing Exercise: 10 Minutes", "GILD Coaching", "GILDCoaching", "beginner", "seated", D12),
  s("D_cx80_wQ8k", "breathing", 15, "Deep Breathing Meditation ~ 15 Minute Meditation for Stress", "Meditation Mountain", "meditation_mountain", "beginner", "seated", D12),
  s("twWFwCW4Z08", "breathing", 20, "Relaxation Practice: Breathing - 20 min", "LEAP Service", "LEAPService", "beginner", "seated", D12),
  s("5mnG_R_KtXQ", "breathing", 45, "Yoga Nidra 45 minutes Guided Meditation", "Mindfulness Movement Yoga", "mindfulnessmovementyoga2798", "gentle", "mat", D12),

  // Brain Training
  s("kpfI17sEdj8", "brain-training", 15, "15 Min Brain + Body Workout for Seniors", "Yes2Next", "yes2next", "gentle", "standing", D11),
  s("p8S0QFWzMG8", "brain-training", 20, "20 Minute Walking Workout That Burns Fat Like CRAZY + Brain Boost 🔥", "fabulous50s", "fabulous50s", "beginner", "standing", D12),
  s("7t6ZMca6WM8", "brain-training", 30, "30 Minute Fat Burning Walking Workout + Brain Training Foe Women Over 50!", "fabulous50s", "fabulous50s", "beginner", "standing", D12),
  s("RCfoMT7HCC4", "brain-training", 60, "The 1-Hour Neuroplasticity Workout to Rewire Focus, Processing & Memory", "Kris Safarova", "Kris.Safarova", "beginner", "seated", D12),

  // Meditation
  s("y6iTjoN407U", "meditation", 10, "Just Breathe ~ A 10 Minute Guided Meditation", "Great Meditation", "GreatMeditation", "beginner", "seated", D12),
  s("rj1sr3ospPI", "meditation", 15, "15 Minute Guided Meditation for Deep Relaxation | Calm Voice for Sleep & Stress Relief", "Lofi is everything", "lofiiseverything", "beginner", "seated", D12),
  s("z0GtmPnqAd8", "meditation", 15, "15 Minute Guided Meditation | Strength & Grounding In Stressful Times", "Boho Beautiful Yoga", "bohobeautiful", "beginner", "seated", D12),
  s("6-iJU06UugA", "meditation", 30, "30 Minute Guided Meditation - The Silent Mind", "OnlineMeditation", "OnlineMeditation", "beginner", "seated", D12),
  s("zKAdUQHdMZU", "meditation", 60, "60-Minute Mindfulness Meditation | Calm Your Mind & Body", "Auralin", "Auralin-s1", "beginner", "seated", D12),
  s("kuMOkcUD4xA", "meditation", 20, "20 Minute Guided Meditation for Focused Attention and Concentration (No Music, Voice Only)", "Declutter The Mind", "DeclutterTheMind", "beginner", "seated", D12),
  s("f7pKql-ZUSg", "meditation", 45, "45 Minute Guided Mindfulness Meditation (Voice Only, No Music)", "Declutter The Mind", "DeclutterTheMind", "beginner", "seated", D12),
];

export function toLibraryVideo(seed: LibraryVideoSeed): LibraryVideo {
  return {
    ...seed,
    id: `lib-${seed.category}-${seed.minutes}-${seed.youtubeId}`,
    source: "YouTube",
    instructor: seed.channel,
    channelUrl: `https://www.youtube.com/@${seed.handle}`,
    originalUrl: `https://www.youtube.com/watch?v=${seed.youtubeId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${seed.youtubeId}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${seed.youtubeId}/hqdefault.jpg`,
    language: "en",
    license: YOUTUBE_LICENSE,
    attribution: `${seed.title} by ${seed.channel} on YouTube`,
  };
}

export const LIBRARY_VIDEOS: LibraryVideo[] = LIBRARY_VIDEO_SEEDS.map(toLibraryVideo);

export type LibrarySlot = {
  category: LibraryCategory;
  minutes: LibraryDuration;
  /** The video that plays, or null when no verified video exists for this slot. */
  video: LibraryVideo | null;
  alternatives: LibraryVideo[];
};

export function slotsFor(category: LibraryCategory, videos: LibraryVideo[] = LIBRARY_VIDEOS): LibrarySlot[] {
  return LIBRARY_DURATIONS.map((minutes) => {
    const matching = videos.filter((video) => video.category === category && video.minutes === minutes);
    return { category, minutes, video: matching[0] ?? null, alternatives: matching.slice(1) };
  });
}

export function allSlots(videos: LibraryVideo[] = LIBRARY_VIDEOS): LibrarySlot[] {
  return LIBRARY_CATEGORIES.flatMap((category) => slotsFor(category, videos));
}

export function missingSlots(videos: LibraryVideo[] = LIBRARY_VIDEOS): LibrarySlot[] {
  return allSlots(videos).filter((slot) => slot.video === null);
}

export function videoCount(category: LibraryCategory, videos: LibraryVideo[] = LIBRARY_VIDEOS): number {
  return slotsFor(category, videos).filter((slot) => slot.video !== null).length;
}

export const LEVEL_LABEL: Record<VideoLevel, string> = {
  beginner: msg("Beginner"),
  gentle: msg("Gentle"),
  intermediate: msg("Intermediate"),
  advanced: msg("Advanced"),
};

export const POSITION_LABEL: Record<VideoPosition, string> = {
  seated: msg("Seated"),
  standing: msg("Standing"),
  mat: msg("On a mat"),
  mixed: msg("Standing and floor"),
};

export const EQUIPMENT_LABEL: Record<VideoEquipment, string> = {
  chair: msg("A sturdy chair"),
  dumbbells: msg("Light dumbbells"),
  "dumbbells-optional": msg("Light dumbbells (optional)"),
};

/** Lower-impact categories where gentle and beginner classes come first, whatever the person's age. */
export const LOW_IMPACT_FIRST: ReadonlySet<LibraryCategory> = new Set(["chair", "balance", "yoga"]);

/** Levels shown for a chosen experience level. Age is never read. */
export function levelsFor(choice: VideoLevel | "all"): VideoLevel[] {
  if (choice === "all") return [...VIDEO_LEVELS];
  return [choice];
}
