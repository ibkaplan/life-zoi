import type { Metadata } from "next";
import { ActionPlan } from "@/components/wellness/urge-plans";

export const metadata: Metadata = {
  title: "Personal action plan",
  description: "Editable if-then plans and optional shared journeys.",
};

export default function ActionsPage() {
  return <ActionPlan />;
}
