import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExerciseView } from "@/components/library/movement-view";
import { exerciseBySlug } from "@/lib/library/movement";

export async function generateMetadata({ params }: PageProps<"/library/move/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = exerciseBySlug(slug);
  return { title: item?.title ?? "Movement", description: item?.duration ?? "A text-guided movement." };
}

export default async function ExercisePage({ params }: PageProps<"/library/move/[slug]">) {
  const { slug } = await params;
  if (!exerciseBySlug(slug)) notFound();
  return <ExerciseView slug={slug} />;
}
