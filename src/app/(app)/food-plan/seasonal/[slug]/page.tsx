import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeasonalDetail } from "@/components/food-plan/library";
import { seasonalById } from "@/lib/food-plan/seasonal";

export async function generateMetadata({ params }: PageProps<"/food-plan/seasonal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const food = seasonalById(slug);
  return { title: food?.name ?? "Seasonal food", description: food?.summary };
}

export default async function SeasonalFoodPage({ params }: PageProps<"/food-plan/seasonal/[slug]">) {
  const { slug } = await params;
  if (!seasonalById(slug)) notFound();
  return <SeasonalDetail slug={slug} />;
}
