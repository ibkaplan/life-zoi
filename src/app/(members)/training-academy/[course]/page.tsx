import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseView } from "@/components/growth-academy/course-view";
import { growthCourse } from "@/lib/growth-academy/catalog";

export async function generateMetadata({ params }: PageProps<"/training-academy/[course]">): Promise<Metadata> {
  const { course } = await params;
  const found = growthCourse(course);
  return found ? { title: found.title, description: found.description } : { title: "Training Academy" };
}

export default async function GrowthCoursePage({ params }: PageProps<"/training-academy/[course]">) {
  const { course } = await params;
  if (!growthCourse(course)) notFound();
  return <CourseView courseId={course} />;
}
