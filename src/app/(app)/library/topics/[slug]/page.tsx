import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopicView } from "@/components/library/topic-view";
import { categoryBySlug } from "@/lib/library/catalog";

export async function generateMetadata({ params }: PageProps<"/library/topics/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  return {
    title: category?.title ?? "Library topic",
    description: category?.description ?? "A health library category.",
  };
}

export default async function TopicPage({ params }: PageProps<"/library/topics/[slug]">) {
  const { slug } = await params;
  if (!categoryBySlug(slug)) notFound();
  return <TopicView slug={slug} />;
}
