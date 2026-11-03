import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MealDetail } from "@/components/wellness/academy-views";
import { mealModule } from "@/lib/wellness/academy";

export const metadata: Metadata = {
  title: "Meal lesson",
  description: "One meal education topic with sources.",
};

export default async function MealPage({ params }: PageProps<"/academy/meals/[slug]">) {
  const { slug } = await params;
  if (!mealModule(slug)) notFound();
  return <MealDetail slug={slug} />;
}
