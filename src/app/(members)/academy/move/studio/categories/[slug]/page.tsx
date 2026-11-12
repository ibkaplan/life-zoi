import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudioCategory } from "@/components/wellness/movement-studio-views";
import { categoryBySlug } from "@/lib/wellness/movement-studio/catalog";

export async function generateMetadata({ params }: PageProps<"/academy/move/studio/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  if (!category || category.kind !== "lessons") return { title: "Movement Studio" };
  return { title: category.title, description: category.summary };
}

export default async function StudioCategoryPage({ params }: PageProps<"/academy/move/studio/categories/[slug]">) {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  if (!category || category.kind !== "lessons") notFound();
  return <StudioCategory slug={slug} />;
}
