import type { Metadata } from "next";
import { StoryPage } from "@/components/encyclopedia/stories-view";
import { findStory } from "@/lib/encyclopedia/stories";

export async function generateMetadata({ params }: PageProps<"/encyclopedia/stories/[id]">): Promise<Metadata> {
  const { id } = await params;
  const story = findStory(id);
  return { title: story?.title ?? "Real People. Real Stories.", description: story?.teaser ?? "A LifeZoi health story." };
}

export default async function Page({ params }: PageProps<"/encyclopedia/stories/[id]">) {
  const { id } = await params;
  return <StoryPage id={id} />;
}
