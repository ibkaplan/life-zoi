import type { Metadata } from "next";
import { FactQuizView } from "@/components/encyclopedia/fact-quiz-view";

export const metadata: Metadata = {
  title: "Health Facts Quiz",
  description: "Short questions built on the Did You Know? health facts, with the fact and its source after every answer. Not a medical test.",
};

export default function HealthFactsQuizPage() {
  return <FactQuizView />;
}
