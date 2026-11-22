import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView } from "@/components/encyclopedia/pages-view";
import { categoryFor } from "@/lib/encyclopedia/categories";

export async function generateMetadata({ params }: PageProps<"/encyclopedia/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: categoryFor(slug)?.title ?? "Health Encyclopedia" };
}

export default async function EncyclopediaCategoryPage({ params }: PageProps<"/encyclopedia/categories/[slug]">) {
  const { slug } = await params;
  if (!categoryFor(slug)) notFound();
  return <CategoryView slug={slug} />;
}
