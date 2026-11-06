import { SCRIPT_LABEL, scriptById, type RoutineScript } from "@/lib/wellness/movement-studio/scripts";

export const STUDIO_HERO = "MOVE BETTER. FEEL STRONGER. LIVE FULLY.";
export const STUDIO_SECTION = "CHOOSE YOUR MOVEMENT";
export const LINK_CHECKED = "2026-11-06";

export const SAFETY_LINE =
  "Stop for chest pain, dizziness, unusual shortness of breath, or significant pain. Use a sturdy chair. Move only in a comfortable range, and use a seated option when you want one. This is not treatment, not a diagnosis, and not physical therapy.";

export const FALL_SUPPORT =
  "Do not practice balance without support if you are at risk of falling.";

export const ASK_FIRST =
  "If you have a health condition, a recent surgery, an injury, or major limits on mobility, ask a qualified professional before you try these movements.";

/**
 * A film matches an N-minute filter only when the player length is within
 * 90 seconds of N minutes. Written scripts match their planned minutes exactly.
 * Player lengths were read from the YouTube IFrame API on 2026-11-06.
 */
export const DURATION_TOLERANCE_SECONDS = 90;
export const DURATION_CHOICES = [5, 10, 15, 20, 25, 30] as const;
export type DurationChoice = (typeof DURATION_CHOICES)[number];

export const FILTER_POSITIONS = ["sitting", "standing", "mat"] as const;
export type FilterPosition = (typeof FILTER_POSITIONS)[number];
export type LessonPosition = FilterPosition | "mixed" | "watch";

export const FILTER_GOALS = ["strength", "balance", "mobility", "calm", "walking", "chair"] as const;
export type FilterGoal = (typeof FILTER_GOALS)[number];
export type LessonGoal = FilterGoal | "overview";

export const LEVELS = ["beginner", "gentle", "intermediate"] as const;
export type Level = (typeof LEVELS)[number];

export const NIA_CHANNEL = "https://www.youtube.com/@NIHAging";

export type VideoLicense = {
  creator: "National Institute on Aging";
  sourceUrl: string;
  channelUrl: typeof NIA_CHANNEL;
  license: "U.S. Government work. The film stays on the National Institute on Aging YouTube channel.";
  embedAllowed: true;
  rehostAllowed: false;
  attribution: "National Institute on Aging";
  checked: typeof LINK_CHECKED;
};

export type StudioCategory = {
  slug: string;
  title: string;
  kind: "lessons" | "tool";
  href: string;
  summary: string;
};

export const studioCategories: StudioCategory[] = [
  {
    slug: "chair",
    title: "Chair Movement Studio",
    kind: "lessons",
    href: "/academy/move/studio/categories/chair",
    summary: "Seated practice. A film gets a play button only when the player length is known.",
  },
  {
    slug: "balance",
    title: "Balance & Stability",
    kind: "lessons",
    href: "/academy/move/studio/categories/balance",
    summary: "Short official balance films, plus a written beginner practice. Keep a sturdy chair within reach.",
  },
  {
    slug: "strength",
    title: "Strong Body — Gentle Strength",
    kind: "lessons",
    href: "/academy/move/studio/categories/strength",
    summary: "Official strength films use their real player length. The gentle strength routine is still a script.",
  },
  {
    slug: "mindful",
    title: "Tai Chi, Qigong & Mindful Movement",
    kind: "lessons",
    href: "/academy/move/studio/categories/mindful",
    summary: "No tai chi or qigong film is embedded. Talks that passed the player check can play. The shift and chair yoga pieces are scripts.",
  },
  {
    slug: "walk",
    title: "Walk at Home",
    kind: "lessons",
    href: "/academy/move/studio/categories/walk",
    summary: "No walking film is embedded. The 10-minute walk is a written script.",
  },
  {
    slug: "mobility",
    title: "Morning Mobility & Evening Relaxation",
    kind: "lessons",
    href: "/academy/move/studio/categories/mobility",
    summary: "Stretch films show the player length. Morning, feet, breathing, and back pieces that are not films say Coming Soon.",
  },
  {
    slug: "find",
    title: "Find My Movement",
    kind: "tool",
    href: "/academy/move/studio/find",
    summary: "Filter by minutes, position, goal, and level. The list is fixed. Nothing is generated.",
  },
  {
    slug: "mission",
    title: "Daily Movement Mission",
    kind: "tool",
    href: "/academy/move/studio/mission",
    summary: "Monday hands, Tuesday balance, Wednesday legs, Thursday back, Friday a 10-minute walk, Saturday gentle yoga, Sunday breathe.",
  },
  {
    slug: "progress",
    title: "My Movement Progress",
    kind: "tool",
    href: "/academy/move/studio/progress",
    summary: "Lessons, video minutes, this week, categories, and missions. Saved in this browser tab.",
  },
];

type LessonBase = {
  id: string;
  title: string;
  categorySlug: string;
  position: LessonPosition;
  goal: LessonGoal;
  level: Level;
  summary: string;
  safety: string;
};

export type VideoLesson = LessonBase & {
  kind: "video";
  youtubeId: string;
  durationSeconds: number;
  license: VideoLicense;
  namedRoutine: false;
};

export type ScriptLesson = LessonBase & {
  kind: "script";
  practiceMinutes: 5 | 10;
  namedRoutine: boolean;
  script: RoutineScript;
};

export type StudioLesson = VideoLesson | ScriptLesson;

function niaLicense(youtubeId: string): VideoLicense {
  return {
    creator: "National Institute on Aging",
    sourceUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    channelUrl: NIA_CHANNEL,
    license: "U.S. Government work. The film stays on the National Institute on Aging YouTube channel.",
    embedAllowed: true,
    rehostAllowed: false,
    attribution: "National Institute on Aging",
    checked: LINK_CHECKED,
  };
}

function video(entry: Omit<VideoLesson, "kind" | "license" | "namedRoutine" | "safety"> & { safety?: string }): VideoLesson {
  return {
    ...entry,
    kind: "video",
    namedRoutine: false,
    license: niaLicense(entry.youtubeId),
    safety: entry.safety ?? `${SAFETY_LINE} ${ASK_FIRST}`,
  };
}

function scriptLesson(
  entry: Omit<ScriptLesson, "kind" | "script" | "practiceMinutes" | "title" | "safety"> & { scriptId: string; safety?: string },
): ScriptLesson {
  const script = scriptById(entry.scriptId);
  if (!script) throw new Error(`Missing script ${entry.scriptId}`);
  return {
    id: entry.id,
    title: script.title,
    categorySlug: entry.categorySlug,
    position: entry.position,
    goal: entry.goal,
    level: entry.level,
    summary: entry.summary,
    namedRoutine: entry.namedRoutine,
    kind: "script",
    practiceMinutes: script.practiceMinutes,
    script,
    safety: entry.safety ?? `${SAFETY_LINE} ${ASK_FIRST}`,
  };
}

export const studioLessons: StudioLesson[] = [
  video({
    id: "video-hands",
    youtubeId: "kgqIdCwVivE",
    durationSeconds: 190,
    title: "Hand Grip Strength Exercise for Older Adults",
    categorySlug: "chair",
    position: "sitting",
    goal: "chair",
    level: "beginner",
    summary: "Official film. Player length 3:10. You can stay seated. The picture on the source site shows a hand and a small ball, not a full-body routine.",
  }),
  scriptLesson({
    id: "script-chair",
    scriptId: "script-chair",
    categorySlug: "chair",
    position: "sitting",
    goal: "chair",
    level: "beginner",
    namedRoutine: true,
    summary: "A seated ten-minute script: march, shoulder rolls, arm raises, ankles, knee extensions, and easy breathing.",
  }),
  scriptLesson({
    id: "script-hands",
    scriptId: "script-hands",
    categorySlug: "chair",
    position: "sitting",
    goal: "chair",
    level: "beginner",
    namedRoutine: true,
    summary: "A seated hand and finger script. It is separate from the short hand-grip film.",
  }),
  video({
    id: "video-balance",
    youtubeId: "4YOBIEOobCE",
    durationSeconds: 56,
    title: "Balance Exercise for Older Adults",
    categorySlug: "balance",
    position: "standing",
    goal: "balance",
    level: "beginner",
    summary: "Official film. Player length 0:56. It is a short balance film, not a long class.",
    safety: `${SAFETY_LINE} ${FALL_SUPPORT} Keep a sturdy chair or counter within reach if you try the move. ${ASK_FIRST}`,
  }),
  video({
    id: "video-heel",
    youtubeId: "z_GKdFf3qv4",
    durationSeconds: 67,
    title: "Heel-to-Toe Walk Balance Exercise for Older Adults",
    categorySlug: "balance",
    position: "standing",
    goal: "balance",
    level: "beginner",
    summary: "Official film. Player length 1:07. Hold a stable support if you try it.",
    safety: `${SAFETY_LINE} ${FALL_SUPPORT} ${ASK_FIRST}`,
  }),
  scriptLesson({
    id: "script-balance",
    scriptId: "script-balance",
    categorySlug: "balance",
    position: "standing",
    goal: "balance",
    level: "beginner",
    namedRoutine: true,
    summary: "A ten-minute supported balance script with a seated march if standing is not a good fit.",
    safety: `${SAFETY_LINE} ${FALL_SUPPORT} ${ASK_FIRST}`,
  }),
  video({
    id: "video-wall",
    youtubeId: "751E9kAdkwg",
    durationSeconds: 86,
    title: "Wall Pushups Strength Exercise for Older Adults",
    categorySlug: "strength",
    position: "standing",
    goal: "strength",
    level: "beginner",
    summary: "Official film. Player length 1:26. The source picture shows a standing wall push.",
  }),
  video({
    id: "video-workout-10",
    youtubeId: "G1lwVhnnkoU",
    durationSeconds: 606,
    title: "10-minute Workout for Older Adults",
    categorySlug: "strength",
    position: "standing",
    goal: "strength",
    level: "gentle",
    summary: "Official sample workout. The title says 10-minute. The player length is 10:06. The source picture shows a standing move with a chair for support.",
  }),
  video({
    id: "video-workout-15",
    youtubeId: "Ev6yE55kYGw",
    durationSeconds: 930,
    title: "15-minute Workout for Older Adults",
    categorySlug: "strength",
    position: "mixed",
    goal: "strength",
    level: "gentle",
    summary: "Official sample workout. The title says 15-minute. The player length is 15:30. The source picture shows people standing and one person seated.",
  }),
  video({
    id: "video-strength",
    youtubeId: "JejTelL05Qw",
    durationSeconds: 1638,
    title: "Strength Training Workout for Older Adults",
    categorySlug: "strength",
    position: "standing",
    goal: "strength",
    level: "intermediate",
    summary: "Official strength workout. Player length 27:18. It is not labeled as a 25-minute or 30-minute lesson.",
  }),
  scriptLesson({
    id: "script-strength",
    scriptId: "script-strength",
    categorySlug: "strength",
    position: "sitting",
    goal: "strength",
    level: "gentle",
    namedRoutine: true,
    summary: "A ten-minute gentle strength script. Seated leg and arm moves come first. Wall, calf, and sit-to-stand parts are optional.",
  }),
  video({
    id: "video-emotional",
    youtubeId: "MjMkBaqimFo",
    durationSeconds: 40,
    title: "The Emotional Benefits of Exercise",
    categorySlug: "mindful",
    position: "watch",
    goal: "overview",
    level: "beginner",
    summary: "Official talk. Player length 0:40. It is a short film to watch, not a movement routine and not a longer lesson.",
  }),
  video({
    id: "video-qa",
    youtubeId: "n5kWf0pvEkc",
    durationSeconds: 1170,
    title: "Exercise and Healthy Aging: Expert Q&A",
    categorySlug: "mindful",
    position: "watch",
    goal: "overview",
    level: "beginner",
    summary: "Official talk. Player length 19:30. It is a conversation, not a yoga, walking, or tai chi session.",
  }),
  scriptLesson({
    id: "script-shift",
    scriptId: "script-shift",
    categorySlug: "mindful",
    position: "standing",
    goal: "balance",
    level: "gentle",
    namedRoutine: true,
    summary: "A supported shift script. It is not a tai chi course and not a video.",
    safety: `${SAFETY_LINE} ${FALL_SUPPORT} ${ASK_FIRST}`,
  }),
  scriptLesson({
    id: "script-yoga",
    scriptId: "script-yoga",
    categorySlug: "mindful",
    position: "sitting",
    goal: "calm",
    level: "gentle",
    namedRoutine: true,
    summary: "An original seated yoga-style script. No yoga film is embedded.",
  }),
  scriptLesson({
    id: "script-walk",
    scriptId: "script-walk",
    categorySlug: "walk",
    position: "standing",
    goal: "walking",
    level: "beginner",
    namedRoutine: true,
    summary: "A written 10-minute walk at home, in short pieces, with a seated march if needed. No walking film is embedded.",
  }),
  video({
    id: "video-ankle",
    youtubeId: "87BeiyTFZyU",
    durationSeconds: 147,
    title: "Ankle Stretch for Older Adults",
    categorySlug: "mobility",
    position: "sitting",
    goal: "mobility",
    level: "beginner",
    summary: "Official film. Player length 2:27. The source picture shows the feet lifted. Stay seated if you are already seated.",
  }),
  video({
    id: "video-shoulder",
    youtubeId: "CW0h60-PS4Y",
    durationSeconds: 122,
    title: "Shoulder and Arm Stretch for Older Adults",
    categorySlug: "mobility",
    position: "mixed",
    goal: "mobility",
    level: "beginner",
    summary: "Official film. Player length 2:02. Use the position shown in the film, or stay seated if you need to.",
  }),
  video({
    id: "video-flexibility-4",
    youtubeId: "kCQ6irSQwYA",
    durationSeconds: 675,
    title: "4 Flexibility and Cool Down Exercises for Older Adults",
    categorySlug: "mobility",
    position: "mat",
    goal: "mobility",
    level: "gentle",
    summary: "Official film. Player length 11:15. The source picture shows floor work on a mat. Skip it if getting to the floor is not a good fit.",
  }),
  video({
    id: "video-flexibility-6",
    youtubeId: "KcdkySvCRCc",
    durationSeconds: 1109,
    title: "6 Flexibility Exercises for Older Adults",
    categorySlug: "mobility",
    position: "mixed",
    goal: "mobility",
    level: "gentle",
    summary: "Official film. Player length 18:29. It is not labeled as a 15-minute or 20-minute lesson.",
  }),
  scriptLesson({
    id: "script-morning",
    scriptId: "script-morning",
    categorySlug: "mobility",
    position: "sitting",
    goal: "mobility",
    level: "beginner",
    namedRoutine: true,
    summary: "A seated ten-minute morning stretch script for the neck, shoulders, arms, back, and ankles.",
  }),
  scriptLesson({
    id: "script-feet",
    scriptId: "script-feet",
    categorySlug: "mobility",
    position: "sitting",
    goal: "mobility",
    level: "beginner",
    namedRoutine: true,
    summary: "A seated feet and ankle script. It is separate from the short ankle film.",
  }),
  scriptLesson({
    id: "script-breathe",
    scriptId: "script-breathe",
    categorySlug: "mobility",
    position: "sitting",
    goal: "calm",
    level: "beginner",
    namedRoutine: true,
    summary: "A ten-minute evening breathing script. No breathing film is embedded.",
  }),
  scriptLesson({
    id: "script-back",
    scriptId: "script-back",
    categorySlug: "mobility",
    position: "sitting",
    goal: "mobility",
    level: "beginner",
    namedRoutine: false,
    summary: "Thursday’s written back practice, about five minutes. It is not one of the ten recording scripts and it is not a video.",
  }),
];

export const NAMED_ROUTINE_TITLES = [
  "10-Minute Chair Movement",
  "10-Minute Morning Stretch",
  "Beginner Balance",
  "Hand and Finger",
  "Feet and Ankle",
  "Gentle Strength",
  "Walk at Home",
  "Gentle Chair Yoga",
  "Evening Breathing",
  "Supported weight shift",
] as const;

export function categoryBySlug(slug: string): StudioCategory | undefined {
  return studioCategories.find((category) => category.slug === slug);
}

export function lessonById(id: string): StudioLesson | undefined {
  return studioLessons.find((lesson) => lesson.id === id);
}

export function lessonsInCategory(slug: string): StudioLesson[] {
  return studioLessons.filter((lesson) => lesson.categorySlug === slug);
}

export function playableLessons(): VideoLesson[] {
  return studioLessons.filter((lesson): lesson is VideoLesson => lesson.kind === "video");
}

export function comingSoonLessons(): ScriptLesson[] {
  return studioLessons.filter((lesson): lesson is ScriptLesson => lesson.kind === "script");
}

export function embedSrc(lesson: StudioLesson): string | null {
  if (lesson.kind !== "video" || !lesson.license.embedAllowed) return null;
  return `https://www.youtube.com/embed/${lesson.youtubeId}`;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remain = seconds % 60;
  return `${minutes}:${String(remain).padStart(2, "0")}`;
}

export function lessonTimeLabel(lesson: StudioLesson): string {
  if (lesson.kind === "video") return formatDuration(lesson.durationSeconds);
  return `About ${lesson.practiceMinutes} minutes of written practice`;
}

export function matchesDuration(lesson: StudioLesson, minutes: DurationChoice | "any"): boolean {
  if (minutes === "any") return true;
  if (lesson.kind === "video") {
    return Math.abs(lesson.durationSeconds - minutes * 60) <= DURATION_TOLERANCE_SECONDS;
  }
  return lesson.practiceMinutes === minutes;
}

export function matchesPosition(lesson: StudioLesson, position: FilterPosition | "any"): boolean {
  if (position === "any") return true;
  return lesson.position === position;
}

export function matchesGoal(lesson: StudioLesson, goal: FilterGoal | "any"): boolean {
  if (goal === "any") return true;
  return lesson.goal === goal;
}

export function matchesLevel(lesson: StudioLesson, level: Level | "any"): boolean {
  if (level === "any") return true;
  return lesson.level === level;
}

export type LessonFilters = {
  minutes: DurationChoice | "any";
  position: FilterPosition | "any";
  goal: FilterGoal | "any";
  level: Level | "any";
};

export function filterLessons(lessons: readonly StudioLesson[], filters: LessonFilters): StudioLesson[] {
  return lessons.filter(
    (lesson) =>
      matchesDuration(lesson, filters.minutes) &&
      matchesPosition(lesson, filters.position) &&
      matchesGoal(lesson, filters.goal) &&
      matchesLevel(lesson, filters.level),
  );
}

export const positionLabel: Record<LessonPosition, string> = {
  sitting: "Sitting",
  standing: "Standing",
  mat: "Mat",
  mixed: "Mixed positions",
  watch: "Watching",
};

export const goalLabel: Record<LessonGoal, string> = {
  strength: "Strength",
  balance: "Balance",
  mobility: "Mobility",
  calm: "Calm",
  walking: "Walking",
  chair: "Chair",
  overview: "Overview",
};

export const levelLabel: Record<Level, string> = {
  beginner: "Beginner",
  gentle: "Gentle",
  intermediate: "Intermediate",
};

export function studioPlainText(): string {
  const chunks = [
    STUDIO_HERO,
    STUDIO_SECTION,
    SAFETY_LINE,
    FALL_SUPPORT,
    ASK_FIRST,
    SCRIPT_LABEL,
    ...studioCategories.flatMap((category) => [category.title, category.summary]),
    ...studioLessons.flatMap((lesson) => {
      const extra =
        lesson.kind === "script"
          ? [SCRIPT_LABEL, ...lesson.script.cues.flatMap((cue) => [cue.heading, cue.words])]
          : [lesson.license.creator, lesson.license.license, lesson.license.attribution, lesson.summary];
      return [lesson.title, lesson.summary, lesson.safety, lessonTimeLabel(lesson), ...extra];
    }),
  ];
  return chunks.join("\n");
}
