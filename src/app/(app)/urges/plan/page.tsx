import type { Metadata } from "next";
import { HabitDashboard } from "@/components/wellness/urge-plans";

export const metadata: Metadata = {
  title: "Habit dashboard",
  description: "Several habits with separate targets. History stays if you pause.",
};

export default function UrgePlanPage() {
  return <HabitDashboard />;
}
