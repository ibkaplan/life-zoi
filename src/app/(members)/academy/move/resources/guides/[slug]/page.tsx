import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuidePreview } from "@/components/wellness/free-exercise-views";
import { guideBySlug } from "@/lib/wellness/exercise-resources/guides";

export async function generateMetadata({ params }: PageProps<"/academy/move/resources/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return { title: "Printable guide" };
  return { title: guide.title, description: guide.summary };
}

export default async function ExerciseGuidePage({ params }: PageProps<"/academy/move/resources/guides/[slug]">) {
  const { slug } = await params;
  if (!guideBySlug(slug)) notFound();
  return <GuidePreview slug={slug} />;
}
