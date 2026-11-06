import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CategoryView } from "@/components/brain-quiz/category-view";
import { categoryMeta, isCategory } from "@/lib/brain-quiz/catalog";

export async function generateMetadata({ params }: PageProps<"/brain-quiz/[category]">): Promise<Metadata> {
  const { category } = await params;
  if (!isCategory(category)) return { title: "Brain & Habit Quiz" };
  return { title: categoryMeta(category).title, description: categoryMeta(category).blurb };
}

export default async function BrainCategoryPage({ params }: PageProps<"/brain-quiz/[category]">) {
  const { category } = await params;
  if (!isCategory(category)) notFound();
  return (
    <Suspense fallback={<p className="card">Loading puzzles…</p>}>
      <CategoryView category={category} />
    </Suspense>
  );
}
