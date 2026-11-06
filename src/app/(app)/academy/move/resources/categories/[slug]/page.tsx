import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryPage } from "@/components/wellness/free-exercise-views";
import { categoryBySlug } from "@/lib/wellness/exercise-resources/categories";

export async function generateMetadata({ params }: PageProps<"/academy/move/resources/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) return { title: "Free exercise resources" };
  return { title: category.title, description: category.intro };
}

export default async function ExerciseCategoryPage({ params }: PageProps<"/academy/move/resources/categories/[slug]">) {
  const { slug } = await params;
  if (!categoryBySlug(slug)) notFound();
  return <CategoryPage slug={slug} />;
}
