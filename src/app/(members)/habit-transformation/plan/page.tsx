import type { Metadata } from "next";
import { PlanView } from "@/components/habit-transformation/practice-views";

export const metadata: Metadata = {
  title: "My Personal Action Plan",
  description: "A small COM-B plan with one action, a routine, a prompt, and a hard-day alternative.",
};

export default function PlanPage() {
  return <PlanView />;
}
