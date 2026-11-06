import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PracticeView } from "@/components/brain-quiz/practice-view";
import { activityById, isCategory } from "@/lib/brain-quiz/catalog";

export async function generateMetadata({ params }: PageProps<"/brain-quiz/[category]/[activity]">): Promise<Metadata> {
  const { activity } = await params;
  const item = activityById(activity);
  return { title: item?.title ?? "Puzzle", description: item?.prompt ?? "A Brain & Habit Quiz activity." };
}

export default async function BrainActivityPage({ params }: PageProps<"/brain-quiz/[category]/[activity]">) {
  const { category, activity } = await params;
  const item = activityById(activity);
  if (!isCategory(category) || !item || item.category !== category) notFound();
  return (
    <Suspense fallback={<p className="card">Loading the puzzle…</p>}>
      <PracticeView activityId={activity} />
    </Suspense>
  );
}
