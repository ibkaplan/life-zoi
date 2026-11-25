import type { Metadata } from "next";
import { HealthAgeQuiz } from "@/components/health-age/health-age-quiz";

export const metadata: Metadata = {
  title: "How young are your habits?",
  description: "A free 2-minute check of seven everyday habits against public health guidance. Nothing is sent or saved. Not a medical test.",
};

export default function HealthAgePage() {
  return <HealthAgeQuiz />;
}
