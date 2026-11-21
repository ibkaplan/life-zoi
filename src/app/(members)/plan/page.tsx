import type { Metadata } from "next";
import { PlanView } from "@/components/plan-view";

export const metadata: Metadata = {
  title: "My Life Improvement Plan",
  description: "A few weekly priorities and a reassessment reminder. Not a claim about years or illness.",
};

export default function PlanPage() {
  return <PlanView />;
}
