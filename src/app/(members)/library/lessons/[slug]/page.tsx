import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonView } from "@/components/library/lessons-view";
import { lessonBySlug } from "@/lib/library/lessons";

export async function generateMetadata({ params }: PageProps<"/library/lessons/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const lesson = lessonBySlug(slug);
  return { title: lesson?.title ?? "Lesson", description: lesson?.action ?? "A short health lesson." };
}

export default async function LessonPage({ params }: PageProps<"/library/lessons/[slug]">) {
  const { slug } = await params;
  if (!lessonBySlug(slug)) notFound();
  return <LessonView slug={slug} />;
}
