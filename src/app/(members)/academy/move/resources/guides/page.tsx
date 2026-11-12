import type { Metadata } from "next";
import { GuideIndex } from "@/components/wellness/free-exercise-views";

export const metadata: Metadata = {
  title: "Printable movement guides",
  description: "Free lifeZoi PDFs for movement, walking notes, and simple food checklists.",
};

export default function ExerciseGuidesPage() {
  return <GuideIndex />;
}
