/**
 * LifeZoi Training Academy: one data format for every course and lesson.
 *
 * A new course is a new file in `./courses/` that exports a `GrowthCourse`,
 * added to `GROWTH_COURSES` in `./catalog.ts`. The Academy home, course page,
 * lesson page, My Growth Journey, achievements, and tests all read that list,
 * so nothing else has to change.
 *
 * Text rules:
 * - Short UI-facing fields (course title, tagline, description, goal,
 *   objectives, lesson title, lesson skill) are wrapped in `msg()` so the
 *   catalog test requires a Ukrainian, Russian, and Greek translation.
 * - Lesson bodies are plain English strings for this release. The lesson page
 *   says so when the site is shown in another language.
 */

export type GrowthDifficulty = "beginner" | "intermediate" | "advanced";

/** Original cover art drawn in SVG by `CourseCover`. No photos, so no licences to track. */
export type CoverArt = "sunrise" | "ripples" | "bridge" | "heart" | "mountain" | "leaf" | "path";

/** One part of the Learning Content: a heading and a few short paragraphs, optionally a list. */
export type LessonSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

/** A box the person can type into. Saved only when they press Save. */
export type ExerciseField = {
  /** Unique inside the lesson, kebab-case, for example "strength-1". */
  id: string;
  label: string;
  /** "short" is one line, "long" is a few lines. */
  kind: "short" | "long";
  placeholder?: string;
};

export type LessonExercise = {
  title: string;
  /** What to do, one step per string. Read aloud as numbered steps. */
  steps: string[];
  fields: ExerciseField[];
  minutes: number;
  /** For timed practices (breathing, noticing): seconds for an optional on-screen timer. */
  timerSeconds?: number;
};

/** A word or phrase that, when found in the person's answer, earns a kind note. Never a criticism. */
export type FeedbackCue = {
  /** Lower-case words or short phrases. Any one of them is enough. */
  anyOf: string[];
  /** Positive, specific, one sentence. */
  say: string;
};

export type LessonPractice = {
  kind: "scenario" | "role-play" | "question" | "mindful";
  /** The situation or question, in the second person. */
  prompt: string;
  /** Two or three example responses the person can pick, each with why it works. */
  examples: { text: string; why: string }[];
  /** Things a helpful answer often includes. Shown as gentle "you might check" points. */
  lookFors: string[];
  /** Optional keyword cues for the built-in, non-AI feedback. */
  cues?: FeedbackCue[];
};

export type RealLifeExample = {
  title: string;
  story: string[];
  /** One or two sentences on what the story shows. */
  point: string;
};

export type GrowthLesson = {
  /** `<course id>-<two-digit number>`, for example "confidence-01". */
  id: string;
  number: number;
  title: string;
  /** One line: the specific skill this lesson teaches. */
  skill: string;
  /** Reading and practice time, 5 to 10. */
  minutes: number;
  /** 1. Lesson Introduction: what the person will learn. */
  intro: string[];
  /** 2. Learning Content: two to four short sections. */
  learn: LessonSection[];
  /** 3. Real-Life Example. */
  example: RealLifeExample;
  /** 4. Practical Exercise. */
  exercise: LessonExercise;
  /** 5. Interactive Practice. */
  practice: LessonPractice;
  /** 6. Reflection Questions, two or three. */
  reflection: string[];
  /** 7. Key Takeaways, three or four short lines. */
  takeaways: string[];
  /** Shown near the top for lessons about anger, anxiety, low mood, or strong emotions. */
  care?: string;
};

export type GrowthCourse = {
  /** Kebab-case, also the URL: /training-academy/<id>. */
  id: string;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  goal: string;
  objectives: string[];
  difficulty: GrowthDifficulty;
  cover: CoverArt;
  /** CSS colour pair for the cover and progress bar, for example ["#2f6f8f", "#d9eef5"]. */
  colors: [string, string];
  /** The achievement given when every required lesson is completed. */
  achievement: { id: string; title: string; text: string };
  /** Lessons that must be completed. Leave out to require every lesson. */
  requiredLessons?: number;
  lessons: GrowthLesson[];
};
