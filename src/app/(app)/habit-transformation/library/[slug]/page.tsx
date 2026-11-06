import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HabitFrame } from "@/components/habit-transformation/frame";
import { LibraryDetail } from "@/components/habit-transformation/library-views";
import { libraryBySlug } from "@/lib/habit-transformation/catalog";

export async function generateMetadata({
  params,
}: PageProps<"/habit-transformation/library/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const entry = libraryBySlug(slug);
  return {
    title: entry?.title ?? "Habit library",
    description: entry?.explanation ?? "A habit library topic.",
  };
}

export default async function LibraryEntryPage({
  params,
}: PageProps<"/habit-transformation/library/[slug]">) {
  const { slug } = await params;
  if (!libraryBySlug(slug)) notFound();
  return (
    <HabitFrame>
      <LibraryDetail slug={slug} />
    </HabitFrame>
  );
}
