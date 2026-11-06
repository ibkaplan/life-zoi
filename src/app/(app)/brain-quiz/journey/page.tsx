import type { Metadata } from "next";
import { JourneyView } from "@/components/brain-quiz/journey-view";

export const metadata: Metadata = {
  title: "My Brain Journey",
  description: "Saved Brain & Habit Quiz points, streaks, and category charts.",
};

export default function JourneyPage() {
  return <JourneyView />;
}
