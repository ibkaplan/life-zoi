import type { Metadata } from "next";
import { WeeklyCheckInView } from "@/components/companion/weekly-view";

export const metadata: Metadata = {
  title: "Weekly check-in",
  description: "Look back at your week, compare it with the week before, and choose next week's plan. Your own answers, not a medical assessment.",
};

export default function WeeklyCheckInPage() {
  return <WeeklyCheckInView />;
}
