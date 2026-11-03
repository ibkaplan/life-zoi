import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UrgeLessonView } from "@/components/wellness/urge-views";
import { urgeLesson } from "@/lib/wellness/urges";

export const metadata: Metadata = {
  title: "Urge lesson",
  description: "One lesson about urges, with sources and a small action.",
};

export default async function UrgeLessonPage({ params }: PageProps<"/urges/lessons/[slug]">) {
  const { slug } = await params;
  if (!urgeLesson(slug)) notFound();
  return <UrgeLessonView slug={slug} />;
}
