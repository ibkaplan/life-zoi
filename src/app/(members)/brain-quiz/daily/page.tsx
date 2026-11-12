import type { Metadata } from "next";
import { DailyChallenge } from "@/components/brain-quiz/daily-view";

export const metadata: Metadata = {
  title: "Daily challenge",
  description: "Five short Brain & Habit Quiz parts chosen for the date.",
};

export default function DailyQuizPage() {
  return <DailyChallenge />;
}
