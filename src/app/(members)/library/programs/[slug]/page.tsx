import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgramView } from "@/components/library/movement-view";
import { programBySlug } from "@/lib/library/movement";

export async function generateMetadata({ params }: PageProps<"/library/programs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const program = programBySlug(slug);
  return { title: program?.title ?? "Movement program", description: program?.summary ?? "A text-guided session." };
}

export default async function ProgramPage({ params }: PageProps<"/library/programs/[slug]">) {
  const { slug } = await params;
  if (!programBySlug(slug)) notFound();
  return <ProgramView slug={slug} />;
}
