import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SummaryView } from "@/components/growth-academy/summary-view";
import { growthCourse } from "@/lib/growth-academy/catalog";

export const metadata: Metadata = {
  title: "Course completion summary",
  description: "A printable summary of a completed Training Academy course.",
};

export default async function GrowthSummaryPage({ params }: PageProps<"/training-academy/[course]/summary">) {
  const { course } = await params;
  if (!growthCourse(course)) notFound();
  return <SummaryView courseId={course} />;
}
