import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NatureJournal, NatureModuleView, NatureRoutineView, NatureWeek } from "@/components/wellness/nature-views";
import { natureModule } from "@/lib/wellness/nature";

export const metadata: Metadata = {
  title: "Nature",
  description: "One nature topic. Optional, adaptable, and not a treatment.",
};

export default async function NatureModulePage({ params }: PageProps<"/nature/[module]">) {
  const { module } = await params;
  if (module === "week") return <NatureWeek />;
  if (module === "routine") return <NatureRoutineView />;
  if (module === "journal") return <NatureJournal />;
  if (!natureModule(module)) notFound();
  return <NatureModuleView slug={module} />;
}
