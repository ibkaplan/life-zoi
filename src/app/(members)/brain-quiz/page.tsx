import type { Metadata } from "next";
import { BrainQuizHub } from "@/components/brain-quiz/hub";

export const metadata: Metadata = {
  title: "Brain & Habit Quiz",
  description: "Challenge your mind, discover everyday habits, and keep learning with short LifeZoi games.",
};

export default function BrainQuizPage() {
  return <BrainQuizHub />;
}
