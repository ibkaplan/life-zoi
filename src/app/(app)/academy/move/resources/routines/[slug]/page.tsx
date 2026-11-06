import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoutinePage } from "@/components/wellness/free-exercise-views";
import { routineBySlug } from "@/lib/wellness/exercise-resources/routines";

export async function generateMetadata({ params }: PageProps<"/academy/move/resources/routines/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const routine = routineBySlug(slug);
  if (!routine) return { title: "Free exercise resources" };
  return { title: routine.title, description: routine.summary };
}

export default async function ExerciseRoutinePage({ params }: PageProps<"/academy/move/resources/routines/[slug]">) {
  const { slug } = await params;
  if (!routineBySlug(slug)) notFound();
  return <RoutinePage slug={slug} />;
}
