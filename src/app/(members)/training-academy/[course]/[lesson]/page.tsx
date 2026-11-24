import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonView } from "@/components/growth-academy/lesson-view";
import { growthCourse, growthLesson } from "@/lib/growth-academy/catalog";

/** `lesson-3` → 3. Anything else is not a lesson. */
function lessonNumber(slug: string): number | null {
  const match = /^lesson-(\d{1,3})$/.exec(slug);
  return match ? Number(match[1]) : null;
}

export async function generateMetadata({ params }: PageProps<"/training-academy/[course]/[lesson]">): Promise<Metadata> {
  const { course, lesson } = await params;
  const found = growthCourse(course);
  const number = lessonNumber(lesson);
  const item = found && number ? growthLesson(found, number) : undefined;
  return item ? { title: item.title, description: item.skill } : { title: "Training Academy" };
}

export default async function GrowthLessonPage({ params }: PageProps<"/training-academy/[course]/[lesson]">) {
  const { course, lesson } = await params;
  const found = growthCourse(course);
  const number = lessonNumber(lesson);
  if (!found || !number || !growthLesson(found, number)) notFound();
  return <LessonView courseId={course} number={number} />;
}
