import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoachModuleView, PracticeList } from "@/components/wellness/coach-views";
import { coachModule } from "@/lib/wellness/coach";

export const metadata: Metadata = {
  title: "Wellness coach topic",
  description: "One educational coaching topic, with sources and a practical alternative.",
};

export default async function WellnessCoachModulePage({
  params,
}: PageProps<"/wellness-coach/[module]">) {
  const { module } = await params;
  if (module === "practice") return <PracticeList />;
  if (!coachModule(module)) notFound();
  return <CoachModuleView slug={module} />;
}
