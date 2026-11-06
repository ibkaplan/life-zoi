import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudioLessonPage } from "@/components/wellness/movement-studio-views";
import { lessonById } from "@/lib/wellness/movement-studio/catalog";

export async function generateMetadata({ params }: PageProps<"/academy/move/studio/lessons/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const lesson = lessonById(slug);
  if (!lesson) return { title: "Movement Studio" };
  return { title: lesson.title, description: lesson.summary };
}

export default async function MovementLessonPage({ params }: PageProps<"/academy/move/studio/lessons/[slug]">) {
  const { slug } = await params;
  if (!lessonById(slug)) notFound();
  return <StudioLessonPage slug={slug} />;
}
