import type { Metadata } from "next";
import { AchievementsView } from "@/components/habit-transformation/reflect-views";

export const metadata: Metadata = {
  title: "My Achievements",
  description: "Milestones that stay put when a day is quiet.",
};

export default function AchievementsPage() {
  return <AchievementsView />;
}
