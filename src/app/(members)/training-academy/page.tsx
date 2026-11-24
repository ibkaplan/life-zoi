import type { Metadata } from "next";
import { AcademyHome } from "@/components/growth-academy/academy-home";

export const metadata: Metadata = {
  title: "Training Academy",
  description: "LifeZoi Personal Growth & Training Academy: five courses and fifty practical lessons in confidence, mindfulness, communication, emotional intelligence, and resilience. Educational, not therapy.",
};

export default function TrainingAcademyPage() {
  return <AcademyHome />;
}
