import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MoveDetail } from "@/components/wellness/academy-views";
import { activityBySlug } from "@/lib/wellness/academy";

export const metadata: Metadata = {
  title: "Movement",
  description: "One movement idea with a gentler option.",
};

export default async function MoveDetailPage({ params }: PageProps<"/academy/move/[slug]">) {
  const { slug } = await params;
  if (!activityBySlug(slug)) notFound();
  return <MoveDetail slug={slug} />;
}
