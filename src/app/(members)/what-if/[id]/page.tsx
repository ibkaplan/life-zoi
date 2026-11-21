import type { Metadata } from "next";
import { WhatIfView } from "@/components/what-if-view";

export const metadata: Metadata = {
  title: "Saved scenario",
  description: "Revisit a WHAT IF? illustration saved in this browser tab.",
};

export default async function SavedScenarioPage({
  params,
}: PageProps<"/what-if/[id]">) {
  const { id } = await params;
  return <WhatIfView scenarioId={id} />;
}
