import type { Metadata } from "next";
import { AchievementsView } from "@/components/achievements/achievements-view";

export const metadata: Metadata = {
  title: "My Streaks & Achievements",
  description: "Days in a row and calm badges across LifeZoi: health diary, movement, breathing, quizzes, meals, learning, and check-ins.",
};

export default function AchievementsPage() {
  return <AchievementsView />;
}
