import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MindShell } from "@/components/mind/shared";
import { MindExercisePlayer } from "@/components/mind/mind-exercises";
import { exerciseById } from "@/lib/mind/exercises";


export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: exerciseById(id)?.title ?? "Guided exercises" };
}

export default async function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exercise = exerciseById(id);
  if (!exercise) notFound();
  return (
    <MindShell title={exercise.title} translated>
      <MindExercisePlayer exercise={exercise} />
    </MindShell>
  );
}
