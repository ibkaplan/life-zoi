import type { Metadata } from "next";
import { HealthAgeQuiz } from "@/components/health-age/health-age-quiz";

export const metadata: Metadata = {
  title: "What is your health age?",
  description: "A free 2-minute lifestyle health age estimate from seven everyday habits, checked against public health guidance. Nothing is sent or saved. Not a medical test or a prediction.",
};

export default function HealthAgePage() {
  return <HealthAgeQuiz />;
}
