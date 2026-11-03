import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HabitDetail } from "@/components/wellness/library-views";
import { challengeById } from "@/lib/wellness/challenges";

export const metadata: Metadata = {
  title: "Challenge",
  description: "One shared challenge. A missed day is not a failure.",
};

export default async function HabitPage({ params }: PageProps<"/habits/[id]">) {
  const { id } = await params;
  if (!challengeById(id)) notFound();
  return <HabitDetail id={id} />;
}
