import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardDetail } from "@/components/library/cards-view";
import { cardBySlug } from "@/lib/library/catalog";

export async function generateMetadata({ params }: PageProps<"/library/cards/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const card = cardBySlug(slug);
  return { title: card?.title ?? "Health card", description: card?.text ?? "A shareable health idea." };
}

export default async function CardPage({ params }: PageProps<"/library/cards/[slug]">) {
  const { slug } = await params;
  if (!cardBySlug(slug)) notFound();
  return <CardDetail slug={slug} />;
}
