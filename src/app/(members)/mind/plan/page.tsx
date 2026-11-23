import type { Metadata } from "next";
import { MindShell } from "@/components/mind/shared";
import { MindPlan } from "@/components/mind/mind-plan";

export const metadata: Metadata = {
  title: "7-day wellness plan",
  description: "An optional, flexible seven-day educational wellness plan in LifeZoi Mind. Not a treatment program.",
};

export default function PlanPage() {
  return (
    <MindShell translated title="Your 7-day wellness plan" intro="Small daily practices you choose. Skip, repeat, or change anything.">
      <MindPlan />
    </MindShell>
  );
}
