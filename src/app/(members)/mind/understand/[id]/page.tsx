import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MindShell } from "@/components/mind/shared";
import { MindAssessment } from "@/components/mind/mind-assessment";
import { instrumentById } from "@/lib/mind/assessments";
import { reflectionById } from "@/lib/mind/reflections";


function titleFor(id: string): string | null {
  const instrument = instrumentById(id);
  if (instrument) return instrument.name;
  const reflection = reflectionById(id);
  return reflection ? reflection.title : null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: titleFor(id) ?? "Understand yourself" };
}

export default async function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const title = titleFor(id);
  if (!title) notFound();
  return (
    <MindShell translated title={title}>
      <MindAssessment id={id} />
    </MindShell>
  );
}
