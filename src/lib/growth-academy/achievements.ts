import { msg } from "@/lib/i18n/translate";
import { isCourseComplete, type AcademyState } from "@/lib/growth-academy/progress";
import type { GrowthCourse } from "@/lib/growth-academy/types";

/**
 * Achievements: a few calm milestones. Each is earned once, keeps the date it
 * was earned, and is never taken away. Nothing counts missed days or asks the
 * person to keep a streak.
 */
export type Achievement = {
  id: string;
  title: string;
  text: string;
  /** Course achievements name their course. */
  course?: string;
  earned: (state: AcademyState, courses: readonly GrowthCourse[]) => boolean;
};

const completedLessons = (state: AcademyState) => Object.values(state.lessons).filter((lesson) => lesson.status === "completed").length;
const completedCourses = (state: AcademyState, courses: readonly GrowthCourse[]) => courses.filter((course) => isCourseComplete(state, course)).length;

const GENERAL: Achievement[] = [
  { id: "first-lesson", title: msg("First Lesson Completed"), text: msg("You completed your first Academy lesson."), earned: (s) => completedLessons(s) >= 1 },
  { id: "three-lessons", title: msg("Three Lessons Completed"), text: msg("Three lessons completed, at your own pace."), earned: (s) => completedLessons(s) >= 3 },
  { id: "ten-lessons", title: msg("Ten Lessons Completed"), text: msg("Ten lessons of practical skills behind you."), earned: (s) => completedLessons(s) >= 10 },
  { id: "first-reflection", title: msg("First Reflection Saved"), text: msg("You saved a private reflection to your journey."), earned: (s) => Object.values(s.lessons).some((l) => l.reflections.some(Boolean) || Object.keys(l.answers).length > 0 || l.practice.length > 0) },
  { id: "first-challenge", title: msg("First Daily Challenge"), text: msg("You tried your first Daily Growth Challenge."), earned: (s) => Object.keys(s.challenges).length >= 1 },
  { id: "seven-challenges", title: msg("Seven Daily Challenges"), text: msg("Seven Daily Growth Challenges, on any days you chose."), earned: (s) => Object.keys(s.challenges).length >= 7 },
  { id: "first-course", title: msg("First Course Completed"), text: msg("You completed every lesson of a course."), earned: (s, c) => completedCourses(s, c) >= 1 },
  { id: "five-courses", title: msg("Five Courses Completed"), text: msg("Five complete courses. A real commitment to your growth."), earned: (s, c) => completedCourses(s, c) >= 5 },
];

/** Every achievement, general ones first, then one per course in catalog order. */
export function allAchievements(courses: readonly GrowthCourse[]): Achievement[] {
  return [
    ...GENERAL,
    ...courses.map((course) => ({
      id: course.achievement.id,
      title: course.achievement.title,
      text: course.achievement.text,
      course: course.id,
      earned: (state: AcademyState) => isCourseComplete(state, course),
    })),
  ];
}

/** Adds any achievement whose rule is now met and that was not earned before. */
export function awardAchievements(state: AcademyState, courses: readonly GrowthCourse[], today: string): { state: AcademyState; earned: string[] } {
  const earned = allAchievements(courses)
    .filter((item) => !state.achievements[item.id] && item.earned(state, courses))
    .map((item) => item.id);
  if (earned.length === 0) return { state, earned };
  const achievements = { ...state.achievements };
  for (const id of earned) achievements[id] = today;
  const history = [...earned.map((ref) => ({ date: today, kind: "achievement" as const, course: "", lesson: "", ref })), ...state.history].slice(0, 300);
  return { state: { ...state, achievements, history }, earned };
}
