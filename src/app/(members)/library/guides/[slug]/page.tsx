import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideView } from "@/components/library/guide-view";
import { guideBySlug } from "@/lib/library/guides";

export async function generateMetadata({ params }: PageProps<"/library/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  return {
    title: guide?.title ?? "Guide",
    description: guide?.summary ?? "A lifeZoi health guide.",
  };
}

export default async function GuidePage({ params }: PageProps<"/library/guides/[slug]">) {
  const { slug } = await params;
  if (!guideBySlug(slug)) notFound();
  return <GuideView slug={slug} />;
}
