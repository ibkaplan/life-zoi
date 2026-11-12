import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MomentView } from "@/components/library/moments-view";
import { momentBySlug } from "@/lib/library/lessons";

export async function generateMetadata({ params }: PageProps<"/library/moments/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const moment = momentBySlug(slug);
  return { title: moment?.title ?? "A hard moment", description: moment?.next ?? "A short nonjudgmental note." };
}

export default async function MomentPage({ params }: PageProps<"/library/moments/[slug]">) {
  const { slug } = await params;
  if (!momentBySlug(slug)) notFound();
  return <MomentView slug={slug} />;
}
