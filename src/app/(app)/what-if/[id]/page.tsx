import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ScenarioExplorer } from "@/components/what-if-view";
import { getScenario, scenarios } from "@/lib/scenarios";

export const metadata: Metadata = { title: "WHAT IF?" };

export function generateStaticParams() {
  return scenarios.map((scenario) => ({ id: scenario.id }));
}

export default function ScenarioPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p role="status">Loading this scenario…</p>}>
      <ScenarioContent params={params} />
    </Suspense>
  );
}

async function ScenarioContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scenario = getScenario(id);
  if (!scenario) notFound();
  return <ScenarioExplorer scenarioId={scenario.id} />;
}
