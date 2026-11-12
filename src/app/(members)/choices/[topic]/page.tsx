import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChoiceDetail } from "@/components/wellness/choices-views";
import { choiceTopic } from "@/lib/wellness/choices";

export const metadata: Metadata = {
  title: "Daily choice",
  description: "Why a daily habit matters, what is known, and a small action.",
};

export default async function ChoicePage({ params }: PageProps<"/choices/[topic]">) {
  const { topic: slug } = await params;
  const topic = choiceTopic(slug);
  if (!topic) notFound();
  return <ChoiceDetail topic={topic} />;
}
