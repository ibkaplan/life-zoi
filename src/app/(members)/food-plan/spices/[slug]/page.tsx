import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SpiceDetail } from "@/components/food-plan/learn";
import { spiceById } from "@/lib/food-plan/spices";

export async function generateMetadata({ params }: PageProps<"/food-plan/spices/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const spice = spiceById(slug);
  return { title: spice?.name ?? "Spice", description: spice?.flavor };
}

export default async function SpicePage({ params }: PageProps<"/food-plan/spices/[slug]">) {
  const { slug } = await params;
  if (!spiceById(slug)) notFound();
  return <SpiceDetail slug={slug} />;
}
