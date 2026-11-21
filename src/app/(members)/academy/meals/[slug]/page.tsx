import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MealDetail } from "@/components/wellness/academy-views";
import { breadRecipe } from "@/lib/nutrition/education";
import { mealModule } from "@/lib/wellness/academy";

export async function generateMetadata({ params }: PageProps<"/academy/meals/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const recipe = breadRecipe(slug);
  if (recipe) return { title: recipe.name, description: recipe.description };
  const lesson = mealModule(slug);
  if (lesson) return { title: lesson.title, description: lesson.summary };
  return { title: "Meal lesson", description: "One meal education topic with sources." };
}

export default async function MealPage({ params }: PageProps<"/academy/meals/[slug]">) {
  const { slug } = await params;
  if (!mealModule(slug) && !breadRecipe(slug)) notFound();
  return <MealDetail slug={slug} />;
}
