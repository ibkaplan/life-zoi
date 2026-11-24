import { msg } from "@/lib/i18n/translate";
import { communicationCourse } from "@/lib/growth-academy/courses/communication";
import { confidenceCourse } from "@/lib/growth-academy/courses/confidence";
import { emotionalIntelligenceCourse } from "@/lib/growth-academy/courses/emotional-intelligence";
import { mindfulnessCourse } from "@/lib/growth-academy/courses/mindfulness";
import { resilienceCourse } from "@/lib/growth-academy/courses/resilience";
import type { GrowthCourse, GrowthDifficulty, GrowthLesson } from "@/lib/growth-academy/types";

/**
 * Every Training Academy course, in the order the Academy shows them.
 * To add a course, write a file in ./courses/ and add it here. The home page,
 * course pages, lesson pages, My Growth Journey, and achievements pick it up.
 */
export const GROWTH_COURSES: readonly GrowthCourse[] = [
  confidenceCourse,
  mindfulnessCourse,
  communicationCourse,
  emotionalIntelligenceCourse,
  resilienceCourse,
];

export const ACADEMY_BASE = "/training-academy";

export const ACADEMY_NOTE = msg("The Training Academy teaches everyday personal-growth skills. It is educational and is not mental health treatment, therapy, or medical advice.");

export const DIFFICULTY_LABEL: Record<GrowthDifficulty, string> = {
  beginner: msg("Beginner"),
  intermediate: msg("Intermediate"),
  advanced: msg("Advanced"),
};

export function growthCourse(id: string): GrowthCourse | undefined {
  return GROWTH_COURSES.find((course) => course.id === id);
}

export function growthLesson(course: GrowthCourse, number: number): GrowthLesson | undefined {
  return course.lessons.find((lesson) => lesson.number === number);
}

export function lessonById(id: string): { course: GrowthCourse; lesson: GrowthLesson } | undefined {
  for (const course of GROWTH_COURSES) {
    const lesson = course.lessons.find((item) => item.id === id);
    if (lesson) return { course, lesson };
  }
  return undefined;
}

export const coursePath = (course: GrowthCourse) => `${ACADEMY_BASE}/${course.id}`;
export const lessonPath = (course: GrowthCourse, lesson: GrowthLesson) => `${ACADEMY_BASE}/${course.id}/lesson-${lesson.number}`;
export const summaryPath = (course: GrowthCourse) => `${ACADEMY_BASE}/${course.id}/summary`;
export const JOURNEY_PATH = `${ACADEMY_BASE}/journey`;

/** Total minutes of a course, from its lessons. */
export function courseMinutes(course: GrowthCourse): number {
  return course.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
}
