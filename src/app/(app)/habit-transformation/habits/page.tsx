import type { Metadata } from "next";
import { HabitsView } from "@/components/habit-transformation/practice-views";

export const metadata: Metadata = {
  title: "My Current Habits",
  description: "The habits you chose to look at in LifeZoi Habit Transformation.",
};

export default function HabitsPage() {
  return <HabitsView />;
}
