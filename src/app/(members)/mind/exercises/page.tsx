import type { Metadata } from "next";
import { MindShell } from "@/components/mind/shared";
import { MindExerciseList } from "@/components/mind/mind-exercises";

export const metadata: Metadata = {
  title: "Guided exercises",
  description: "LifeZoi Mind guided exercises with step-by-step voice guidance: breathing, relaxation, mindfulness, grounding, CBT-inspired reframing, boundaries, and sleep.",
};

export default function ExercisesPage() {
  return (
    <MindShell translated title="Guided exercises" intro="Practical, evidence-informed exercises you can do in a few minutes. Choose the type and length, and listen step by step.">
      <MindExerciseList />
    </MindShell>
  );
}
